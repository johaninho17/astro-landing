// src/lib/firebase.js

import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc } from "firebase/firestore";

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
  // Ensure db is initialized before trying to use it
  if (!db) {
      const errorMsg = "Firestore database is not initialized. Cannot send form data.";
      console.error(errorMsg);
      // You might want to inform the user here via the UI as well
      throw new Error(errorMsg);
  }
  try {
    // Use the initialized db instance
    const docRef = await addDoc(collection(db, "contacts"), data);
    console.log("Document written with ID: ", docRef.id);
    return docRef.id;
  } catch (e) {
    console.error("Error adding document: ", e);
    throw e; // Re-throw the error so it can be caught in the form submission handler
  }
}

// You might want to export 'db' if you need it elsewhere,
// but ensure it's handled correctly if initialization failed.
// export { db };
