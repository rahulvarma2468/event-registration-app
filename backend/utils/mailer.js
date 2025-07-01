// backend/utils/mailer.js

async function sendQRCodeEmail(email, qrDataUrl) {
  console.log(`Sending QR code email to ${email}`);
  // You could integrate with Nodemailer or another service here
}

module.exports = { sendQRCodeEmail };