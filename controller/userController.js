const User = require('../model/userModel');
const sendAuthOTP = require('../twilio/userAuth');

const handleRegisterUser = async (req, res) => {
  const { phone,name,email,location } = req.body;

  try {
    if (!phone) {
      return res.status(400).json({success: false, message: 'Phone number is required' });
    }
    const existingUser = await User.findOne({ phone });

    if (existingUser) {
      return res.status(400).json({ success: false,message: 'User already registered, please login' });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); 

    const newUser = new User({ phone, otp, otpExpires,name,email,location });

    await sendAuthOTP(newUser.phone, otp );

    await newUser.save();

    console.log(`OTP sent to ${phone}: ${otp}`);

    res.status(200).json({ success: true,newUser,message: 'OTP sent successfully' });
  } catch (err) {
    res.status(500).json({ success: false,message: err.message });
  }
};

const verifyOtp = async (req, res) => {
  const { otp } = req.body;
  try {
    const user = await User.findOne({ otp });

    if (!user || user.otp !== otp || user.otpExpires < new Date()) {
      return res.status(400).json({success: false, message: 'Invalid or expired OTP' });
    }

    user.isVerified = true;
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();

    res.status(200).json({success: true,user, message: 'OTP verified successfully' });
  } catch (err) {
    res.status(500).json({ success: false,message: err.message });
  }
};


const login = async (req, res) => {
  const { phone } = req.body;
  try {
    const user = await User.findOne({ phone });
    if (!user) {
      return res.status(401).json({ success: false,message: 'Invalid phone' });
    }
    res.status(200).json({ success: true,user, message: 'Login successful' });
  } catch (err) {
    res.status(500).json({success: false, message: err.message });
  }
};


const updateProfile = async (req, res) => {
  const { userId, name, email, location } = req.body;

  try {
    if (!userId) {
      return res.status(400).json({success: false, message: 'User ID is required' });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({success: false, message: 'User not found' });
    }
    if (name) user.name = name;
    if (email) user.email = email;
    if (location) user.location = location;

    await user.save();

    res.status(200).json({ success: true,user, message: 'Profile updated successfully' });
  } catch (err) {
    res.status(500).json({success: false, message: err.message });
  }
};


const getProfile = async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId ) {
      return res.status(400).json({ success: false,message: 'User ID  is required' });
    }

    const user = await User.findById(userId);
     

    if (!user) {
      return res.status(404).json({ success: false,message: 'User not found' });
    }
    const { otp, otpExpires, ...safeUserData } = user.toObject();

    res.status(200).json({ success: true,user: safeUserData });
  } catch (error) {
    res.status(500).json({ success: false,message: error.message });
  }
};


module.exports = {
  handleRegisterUser,
  verifyOtp,
  login,
  updateProfile,
  getProfile
};
