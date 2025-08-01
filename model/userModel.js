const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  phone:        { type: String, required: true, unique: true },
  otp:          { type: String },
  amount:       { type: Number, default: 5000 },
  gender:       { type: String },
  age:          { type: String },
  merchantID:   { type: String, unique: true, required: true },
  name:         { type: String },
  location:     { type: String },
  email:        { type: String },
  otpExpires:   { type: Date },
  isVerified:   { type: Boolean, default: false },
});

module.exports = mongoose.model('User', userSchema);
