const express = require('express');
const { createTransaction } = require('../controller/bankController');

const router = express.Router();


router.post('/add-bank-transaction', createTransaction);

module.exports = router;
