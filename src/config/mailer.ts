import 'dotenv/config';
import nodemailer from 'nodemailer';

// Verify that required environment variables are set
if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
  console.warn('⚠️ Email configuration is incomplete. EMAIL_USER or EMAIL_PASS not set in environment variables.');
}

export const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  // Add timeout and connection pool settings
  connectionTimeout: 5000,
  socketTimeout: 5000,
  pool: {
    maxConnections: 1,
    maxMessages: 3,
  },
} as any);

// Verify transporter connection on startup (optional, for debugging)
transporter.verify((error, success) => {
  if (error) {
    console.warn('⚠️ Email transporter verification failed:', error.message);
    console.warn('💡 This may indicate incorrect EMAIL_USER/EMAIL_PASS or network issues.');
    console.warn('💡 The application will continue, but email notifications may fail.');
  } else {
    console.log('✅ Email transporter is ready to send messages');
  }
});

export async function sendEmail(to: string, subject: string, html: string) {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to,
    subject,
    html,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Email sent to ${to}`);
  } catch (error) {
    console.error(`Error sending email to ${to}:`, error);
  }
}