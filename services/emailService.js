const nodemailer = require('nodemailer');
const config = require('../config/default');

const transporter = nodemailer.createTransport({
  service: config.emailConfig.service,
  auth: {
    user: config.emailConfig.user,
    pass: config.emailConfig.pass
  }
});

const sendEmail = async (to, subject, text) => {
  const mailOptions = {
    from: config.emailConfig.user,
    to,
    subject,
    text
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Email sent to ${to}`);
  } catch (err) {
    console.error(`Error sending email: ${err}`);
  }
};

module.exports = sendEmail;
