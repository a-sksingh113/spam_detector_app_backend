const express = require('express');
const { getTransactionHistory, checkBalance, handlePay } = require('../controller/tranctionController');
const router = express.Router();


router.post('/pay', handlePay);
router.get('/check-balance', checkBalance);
router.get('/transactions-history', getTransactionHistory);


module.exports = router;
