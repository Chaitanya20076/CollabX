import nodemailer from "nodemailer";

const createTransporter = () => {
  if (
    !process.env.SMTP_HOST ||
    !process.env.SMTP_USER ||
    !process.env.SMTP_PASS
  ) {
    return null;
  }

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: process.env.SMTP_SECURE === "true",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
};

export const sendEmailNotification = async ({
  to,
  subject,
  text,
  html,
} = {}) => {
  const transporter = createTransporter();

  if (!transporter) {
    return {
      sent: false,
      reason: "SMTP is not configured",
    };
  }

  try {
    await transporter.sendMail({
      from:
        process.env.SMTP_FROM ||
        process.env.SMTP_USER,
      to,
      subject,
      text,
      html,
    });

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
