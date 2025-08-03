const User = require("../model/userModel");

const fetchAllUsersWithCount = async (req, res) => {
  try {
    const users = await User.find().select('-otp -otpExpires -__v'); 
    const totalUsers = await User.countDocuments();

    res.status(200).json({
      success: true,
      totalUsers,
      users,
    });
  } catch (err) {
    console.error(" Error fetching users:", err.message);
    res.status(500).json({
      success: false,
      message: "Server error while fetching users",
    });
  }
};

module.exports = {
  fetchAllUsersWithCount,
};
