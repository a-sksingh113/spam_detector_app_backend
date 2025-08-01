const User        = require('../model/userModel');
const Transaction = require('../model/tranctionModel');


const handlePay = async (req, res) => {
  try {
    const { userId, merchantID, amount } = req.body;
    if (!userId || !merchantID || amount == null) {
      return res.status(400).json({
        success: false,
        message: 'merchantID and amount are required'
      });
    }


    const user = await User.findById( userId );
    const merchant = await User.findOne({ merchantID });
    if (!user || !merchant) {
      return res.status(404).json({
        success: false,
        message: 'User or Merchant not found'
      });
    }

   
    if (user.amount < amount) {
      return res.status(400).json({
        success: false,
        message: 'Insufficient balance'
      });
    }

    user.amount  -= amount;
    merchant.amount  += amount;
    await user.save();
    await merchant.save();

 
    await Transaction.create({
      sender:   user._id,
      receiver: merchant._id,
      amount
    });

    return res.status(200).json({
      success: true,
      message: `₹${amount} transferred successfully`,
      userBalance: user.amount,
    });

  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};


const checkBalance = async (req, res) => {
  try {
    const { userId } = req.body;
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'customerID is required'
      });
    }

    const customer = await User.findById(userId);
    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }

    return res.status(200).json({
      success: true,
      balance: customer.amount,
      message: `Current balance: ₹${customer.amount}`
    });

  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};


const getTransactionHistory = async (req, res) => {
  try {
    const { userId } = req.body;
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'customerID is required'
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const sent = await Transaction.find({ sender: user._id })
      .populate('receiver')
      .sort({ timestamp: -1 });

    const received = await Transaction.find({ receiver: user._id })
      .populate('sender')
      .sort({ timestamp: -1 });

    const sentTransactions = sent.map(tx => ({
      name:       tx.receiver.name,
      merchantID: tx.receiver.merchantID,
      amount:     tx.amount,
      date:       tx.timestamp
    }));

    const receivedTransactions = received.map(tx => ({
      name:       tx.sender.name,
      merchantID: tx.sender.merchantID,
      amount:     tx.amount,
      date:       tx.timestamp
    }));

    return res.status(200).json({
      success: true,
      sentTransactions,
      receivedTransactions
    });

  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};


module.exports = {
  handlePay,
  checkBalance,
  getTransactionHistory
};
