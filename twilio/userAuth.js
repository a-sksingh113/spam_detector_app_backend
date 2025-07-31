const client = require('../config/twilioConfig');
const sendAuthOTP = async (phone, otp) => {
  try {
    const formattedPhone = phone.startsWith('+') ? phone : `+91${phone}`;
    const message = await client.messages.create({
      body: `Your verification OTP for Spam detector app is ${otp}`,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: formattedPhone,
    });

    console.log("Message sent:", message.sid);
  } catch (err) {
    console.error("Error sending OTP:", err);
  }
};

module.exports = sendAuthOTP;
