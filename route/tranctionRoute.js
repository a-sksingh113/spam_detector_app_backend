const express = require('express');
const { getTransactionHistory, checkBalance, handlePay } = require('../controller/tranctionController');
const router = express.Router();


router.post('/pay', handlePay);
router.post('/check-balance', checkBalance);
router.post('/transactions-history', getTransactionHistory);


module.exports = router;
