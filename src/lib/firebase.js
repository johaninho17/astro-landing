// src/lib/firebase.js

import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, writeBatch, doc } from "firebase/firestore";

// Remove the hardcoded config object
// const firebaseConfig = { ... };

// Access environment variables provided by Astro
// Note: These MUST be prefixed with PUBLIC_ in your .env file
// to be available on the client-side.
const firebaseConfig = {
  apiKey: import.meta.env.PUBLIC_FIREBASE_API_KEY,
  authDomain: import.meta.env.PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.PUBLIC_FIREBASE_APP_ID,
  measurementId: import.meta.env.PUBLIC_FIREBASE_MEASUREMENT_ID // Optional, but good practice if you use Analytics
};

// Optional: Add a check to ensure essential variables are loaded
if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
    console.error(
        "Firebase configuration is missing or incomplete. " +
        "Ensure PUBLIC_FIREBASE_API_KEY and PUBLIC_FIREBASE_PROJECT_ID are set in your .env file " +
        "and you have restarted the Astro development server."
    );
    // Depending on your app's needs, you might want to throw an error here
    // or handle the lack of Firebase gracefully.
}

// Initialize Firebase
let app;
let db;

try {
    // Check if config seems valid before initializing
    if (firebaseConfig.apiKey && firebaseConfig.projectId) {
        app = initializeApp(firebaseConfig);
        db = getFirestore(app);
        console.log("Firebase initialized successfully."); // Optional: for debugging during development
    } else {
         // Handle the case where config is invalid/missing more explicitly if needed
         console.warn("Firebase not initialized due to missing configuration.");
    }
} catch (error) {
    console.error("Error initializing Firebase:", error);
    // Handle initialization error (e.g., show a message to the user, disable features)
}


export async function sendFormData(data) {
  // Ensure db is initialized
  if (!db) {
      const errorMsg = "Firestore database is not initialized. Cannot process form data.";
      console.error(errorMsg);
      throw new Error(errorMsg);
  }

  // --- Prepare data for the email extension ---
  // Get the recipient email from environment variables (needs to be set for the function environment, see note below)
  // For now, let's hardcode it for simplicity, but ideally, configure this elsewhere.
  const alertRecipient = "team@goeuropeconsulting.com"; // ** REPLACE THIS ** with your actual recipient email
  const senderName = data.full_name || 'GoEurope Contact'; // Use submitter's name

  // --- Use a Write Batch for atomicity ---
  const batch = writeBatch(db);

  // 1. Reference and set data for the 'contacts' collection
  const contactsCol = collection(db, "contacts");
  const contactDocRef = doc(contactsCol); // Generate a new doc reference in 'contacts'
  batch.set(contactDocRef, data); // Add the original form data to 'contacts'

  // 2. Reference and set data for the 'mail' collection (monitored by the extension)
  const mailCol = collection(db, "mail");
  const mailDocRef = doc(mailCol); // Generate a new doc reference in 'mail'

  // Construct the payload for the Trigger Email extension
  // See extension docs for full options: https://firebase.google.com/products/extensions/firebase-email-trigger
  batch.set(mailDocRef, {
    to: [alertRecipient],
    replyTo: [data.email],
    message: {
      subject: `🚀 New Contact Form: ${data.full_name} (${data.company_name})`,
      text: `
      New contact form submission received (ID: ${contactDocRef.id}):

      ------------------------------------
      Name: ${data.full_name || 'N/A'}
      Title: ${data.title || 'N/A'}
      Submitter Email: ${data.email || 'N/A'}
      Company Name: ${data.company_name || 'N/A'}
      Website URL: ${data.url || 'N/A'}
      Submitted At: ${data.submittedAt ? new Date(data.submittedAt).toLocaleString() : 'N/A'}
      ------------------------------------

      Message:
      ${data.message || '(No message provided)'}

      ------------------------------------

      Reply directly to this email to respond to ${data.email}.
              `,
      // Optional: Add html version if needed, e.g.:
      // html: `<p>New contact form submission received (ID: ${contactDocRef.id}):</p>...`
    },
    // You can add headers, attachments etc. here if needed
});


  // --- Commit the batch ---
  try {
    await batch.commit();
    console.log(`Contact data (ID: ${contactDocRef.id}) and email trigger written successfully.`);
    return contactDocRef.id; // Return the ID of the contact document
  } catch (e) {
    console.error("Error committing batch write: ", e);
    throw e; // Re-throw the error
  }
}

