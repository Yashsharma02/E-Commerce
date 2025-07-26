const nodemailer = require('nodemailer');

// Create reusable transporter object using SMTP transport
const transporter = nodemailer.createTransport({
  service: 'gmail', // you can use other services or SMTP settings
  auth: {
    user: process.env.EMAIL_USER, // Your Gmail address or email service username
    pass: process.env.EMAIL_PASS, // Your Gmail password or app password
  },
});

const sendEmail = async (to, subject, html) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to,
    subject,
    html,
  };

  return transporter.sendMail(mailOptions);
};

module.exports = sendEmail;
