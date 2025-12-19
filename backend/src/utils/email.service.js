const nodemailer = require('nodemailer');

const config = {
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.EMAIL_PORT || '587'),
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_HOST_USER || 'vctect@gmail.com',
    pass: process.env.EMAIL_HOST_PASSWORD || 'lyvl nrys qvwy zkcs'
  },
  tls: {
    rejectUnauthorized: false
  }
};

const transporter = nodemailer.createTransport(config);

const sendEmail = async ({ to, subject, html }) => {
  try {
    const info = await transporter.sendMail({
      from: process.env.DEFAULT_FROM_EMAIL || '"Medical Internship Platform" <library@example.com>',
      to,
      subject,
      html
    });
    console.log('Message sent: %s', info.messageId);
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
};

module.exports = { sendEmail };
