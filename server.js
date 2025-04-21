// /Users/johaninho/goeurope/astro-landing/server.js

import express from "express";
import bodyParser from "body-parser";
// Use default import assigned to 'pkg'
import pkg from '@getbrevo/brevo';
import cors from "cors";
import 'dotenv/config'; // Load .env variables

const app = express();
const PORT = process.env.PORT || 3001; // Use environment port or default

// --- Environment Variable Checks ---
// ... (rest of checks remain the same) ...

console.log('DEBUG: BREVO_API_KEY from process.env:', process.env.BREVO_API_KEY);


const brevoApiKey = process.env.BREVO_API_KEY;
const recipientEmail = process.env.ALERT_RECIPIENT_EMAIL;
const senderEmail = process.env.BREVO_SENDER_EMAIL;
const senderName = process.env.BREVO_SENDER_NAME || 'Website Contact';

if (!brevoApiKey || !recipientEmail || !senderEmail) {
    console.error("FATAL ERROR: Missing required Brevo environment variables (BREVO_API_KEY, ALERT_RECIPIENT_EMAIL, BREVO_SENDER_EMAIL)");
    // process.exit(1);
}

// --- Brevo API Client Initialization ---
let brevoApiInstance;
if (brevoApiKey) {
    try {
        // *** CHANGE HERE: Access ApiClient via pkg.default ***
        let defaultClient = pkg.default.ApiClient.instance;

        // Configure API key authorization: api-key
        let apiKey = defaultClient.authentications['api-key'];
        apiKey.apiKey = brevoApiKey;

        // *** CHANGE HERE: Access TransactionalEmailsApi via pkg.default ***
        brevoApiInstance = new pkg.default.TransactionalEmailsApi();
        console.log("Brevo API client initialized.");

    } catch (initError) {
         console.error("Error during Brevo client initialization:", initError);
         console.error("Check if '@getbrevo/brevo' is installed correctly and if the import style is compatible.");
         // Log the structure of 'pkg' to help debug
         console.log("Structure of imported 'pkg':", Object.keys(pkg || {}));
         if (pkg && pkg.default) {
            console.log("Structure of 'pkg.default':", Object.keys(pkg.default || {}));
         }
         brevoApiInstance = null; // Ensure it's null if init fails
    }
} else {
    console.error("Brevo API client could not be initialized due to missing API key.");
}

// --- Middleware ---
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


// --- API Endpoint to Send Emails via Brevo ---
app.post("/send-email", async (req, res) => {
    if (!brevoApiInstance || !recipientEmail || !senderEmail) {
        // Log the specific reason if instance is null
        if (!brevoApiInstance) console.error("Brevo API instance is not available (initialization failed or API key missing).");
        else console.error("Brevo configuration incomplete (recipient or sender email missing).");
        return res.status(500).send("Server configuration error.");
    }

    const { full_name, title, email, company_name, url, message } = req.body;

    if (!full_name || !title || !email || !company_name || !message) {
        return res.status(400).send("Missing required form fields.");
    }

    // --- Construct Brevo Email Payload ---
    let sendSmtpEmailPayload;
    try {
        // *** CHANGE HERE: Access SendSmtpEmail via pkg.default ***
        sendSmtpEmailPayload = new pkg.default.SendSmtpEmail();
    } catch (payloadError) {
        console.error("Error creating SendSmtpEmail payload object:", payloadError);
        return res.status(500).send("Server error creating email payload.");
    }


    sendSmtpEmailPayload.sender = { email: senderEmail, name: senderName };
    sendSmtpEmailPayload.to = [{ email: recipientEmail }];
    sendSmtpEmailPayload.subject = `🚀 New Contact Form: ${full_name} (${company_name})`;
    sendSmtpEmailPayload.htmlContent = `
        <p>New contact form submission received:</p>
        <hr>
        <p><strong>Name:</strong> ${full_name || 'N/A'}</p>
        <p><strong>Title:</strong> ${title || 'N/A'}</p>
        <p><strong>Submitter Email:</strong> ${email || 'N/A'}</p>
        <p><strong>Company Name:</strong> ${company_name || 'N/A'}</p>
        <p><strong>Website URL:</strong> ${url || 'N/A'}</p>
        <hr>
        <p><strong>Message:</strong></p>
        <div style="background-color:#f8f9fa; border:1px solid #e9ecef; padding:10px; border-radius:4px;">
            ${message ? message.replace(/\n/g, '<br>') : '(No message provided)'}
        </div>
        <hr>
        <p><em>Reply directly to this email to respond to ${email}.</em></p>
    `;
    sendSmtpEmailPayload.textContent = `
        New contact form submission received:
        ------------------------------------
        Name: ${full_name || 'N/A'}
        Title: ${title || 'N/A'}
        Submitter Email: ${email || 'N/A'}
        Company Name: ${company_name || 'N/A'}
        Website URL: ${url || 'N/A'}
        ------------------------------------
        Message:
        ${message || '(No message provided)'}
        ------------------------------------
        Reply directly to this email to respond to ${email}.
    `;
    sendSmtpEmailPayload.replyTo = { email: email, name: full_name };

    // --- Send Email via Brevo API ---
    try {
        console.log(`Attempting to send email via Brevo from ${senderEmail} to ${recipientEmail}`);
        // Pass the payload object to the sendTransacEmail method
        const data = await brevoApiInstance.sendTransacEmail(sendSmtpEmailPayload);
        console.log("Email sent successfully via Brevo:", JSON.stringify(data));
        res.status(200).send("Email sent successfully!");

    } catch (error) {
        console.error("Error sending email via Brevo:", error.response ? error.response.body : error);
        res.status(error.status || 500).send(`Failed to send email. Error: ${error.message || 'Unknown Brevo error'}`);
    }
});

// --- Start the Server ---
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
    if (!brevoApiInstance) {
        console.warn("WARNING: Server started but Brevo API client is not initialized. Emails will fail.");
    }
});
