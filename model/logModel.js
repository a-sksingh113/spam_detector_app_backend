// models/LogModel.js
const mongoose = require("mongoose");

const logSchema = new mongoose.Schema({
  userId: String,
  userName: String,
  amount: Number,
  merchantID: String,
  merchantName: String,
  type: String, 
  message: String,
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Log", logSchema);
