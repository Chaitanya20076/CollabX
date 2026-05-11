import nodemailer from "nodemailer";

let testAccount = null;
let transporterInstance = null;

const createTransporter = async () => {
  if (transporterInstance) return transporterInstance;

  // Use Real SMTP if credentials are provided in .env
  if (
    process.env.SMTP_HOST &&
    process.env.SMTP_USER &&
    process.env.SMTP_PASS
  ) {
    transporterInstance = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 587),
      secure: process.env.SMTP_SECURE === "true" || Number(process.env.SMTP_PORT) === 465,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
    return transporterInstance;
  }

  // Fallback to Ethereal Testing if no real SMTP is configured
  if (!testAccount) {
    console.log("No SMTP configured. Creating Ethereal test account...");
    testAccount = await nodemailer.createTestAccount();
  }

  transporterInstance = nodemailer.createTransport({
    host: "smtp.ethereal.email",
    port: 587,
    secure: false,
    auth: {
      user: testAccount.user,
      pass: testAccount.pass,
    },
  });

  return transporterInstance;
};

export const sendEmailNotification = async ({
  to,
  subject,
  text,
  html,
} = {}) => {
  try {
    const transporter = await createTransporter();

    const info = await transporter.sendMail({
      from:
        process.env.SMTP_FROM ||
        process.env.SMTP_USER ||
        '"CollabX" <no-reply@collabx.com>',
      to,
      subject,
      text,
      html,
    });

    if (testAccount) {
      console.log(`\n==========================================`);
      console.log(`✉️  EMAIL SENT TO: ${to}`);
      console.log(`📎 PREVIEW URL: ${nodemailer.getTestMessageUrl(info)}`);
      console.log(`==========================================\n`);
    } else {
      console.log(`✉️  REAL EMAIL SENT SUCCESSFULLY TO: ${to}`);
    }

    return {
      sent: true,
    };
  } catch (error) {
    console.log("EMAIL ERROR:", error.message);

    return {
      sent: false,
      reason: error.message,
    };
  }
};
