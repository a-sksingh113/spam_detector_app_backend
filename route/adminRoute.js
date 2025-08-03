const express = require('express');
const { fetchAllUsersWithCount } = require('../controller/adminController');

const router = express.Router();

router.get("/users", fetchAllUsersWithCount);
module.exports = router;
