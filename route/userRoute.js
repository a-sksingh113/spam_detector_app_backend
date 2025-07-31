const express = require('express');
const { handleRegisterUser, verifyOtp, login, updateProfile, getProfile } = require('../controller/userController');
const router = express.Router();


router.post('/register', handleRegisterUser);
router.post('/verify-otp', verifyOtp);
router.post('/login', login);
router.get('/profile', getProfile);
router.put('/update-profile', updateProfile);

module.exports = router;
