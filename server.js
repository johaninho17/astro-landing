import express from "express";
import bodyParser from "body-parser";
import nodemailer from "nodemailer";
import cors from "cors";
ç

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Email Configuration
const transporter = nodemailer.createTransport({
   service: "gmail", // Use your email service (e.g., Gmail, Outlook, etc.)
  auth: {
    user: process.env.EMAIL_USER, // Use environment variable for email
    pass: process.env.EMAIL_PASS, // Use environment variable for password
  },
});

// API Endpoint to Send Emails
app.post("/send-email", (req, res) => {
  const { full_name, title, email, contact_phone, url, message } = req.body;

  const mailOptions = {
    from: email,
    to: process.env.EMAIL_USER, // Replace with the recipient email
    subject: `New Contact Form Submission from ${full_name}`,
    text: `
      Name: ${full_name}
      Title: ${title}
      Email: ${email}
      Company Name: ${contact_phone}
      Website URL: ${url}
      Message: ${message}
    `,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error("Error sending email:", error);
      res.status(500).send("Failed to send email.");
    } else {
      console.log("Email sent:", info.response);
      res.status(200).send("Email sent successfully!");
    }
  });
});

// Start the Server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});