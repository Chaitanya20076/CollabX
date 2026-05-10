import { firestore } from "../config/firebaseAdmin.js";

/**
 * Sends an email using the Firebase Trigger Email Extension.
 * The extension listens to the "mail" collection and processes any new documents added.
 * 
 * @param {Object} options
 * @param {string} options.to - Recipient email address
 * @param {string} options.subject - Email subject
 * @param {string} options.text - Plain text email content
 * @param {string} options.html - Optional HTML email content
 */
export const sendEmailNotification = async ({
  to,
  subject,
  text,
  html,
} = {}) => {
  try {
    if (!to) throw new Error("Recipient email address is required");

    console.log(`Adding email to Firebase 'mail' collection for: ${to}`);

    // The Trigger Email extension expects the document to have 'to' and 'message' fields
    const docRef = await firestore.collection("mail").add({
      to: to,
      message: {
        subject: subject,
        text: text,
        html: html || text,
      },
      createdAt: new Date()
    });

    console.log(`\n==========================================`);
    console.log(`✉️  EMAIL ADDED TO FIRESTORE MAIL QUEUE: ${to}`);
    console.log(`📄 DOCUMENT ID: ${docRef.id}`);
    console.log(`==========================================\n`);

    return {
      sent: true,
      docId: docRef.id
    };
  } catch (error) {
    console.error("FIREBASE EMAIL ERROR:", error.message);

    return {
      sent: false,
      reason: error.message,
    };
  }
};
