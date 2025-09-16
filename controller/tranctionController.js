const User = require("../model/userModel");
const Transaction = require("../model/tranctionModel");
const Bank = require("../model/BankModel");
const axios = require("axios");
const Log = require("../model/logModel");

const handlePay = async (req, res) => {
  try {
    console.log(" Payment Request Received:", req.body);
    const { userId, merchantID, amount } = req.body;

    if (!userId || !merchantID || amount == null) {
      console.log(" Missing required fields");
      return res.status(400).json({
        success: false,
        message: "userId, merchantID, and amount are required",
      });
    }

    const user = await User.findById(userId);
    const merchant = await User.findOne({ merchantID });

    if (!user || !merchant) {
      console.log(" User or Merchant not found", { user, merchant });
      return res.status(404).json({
        success: false,
        message: "User or Merchant not found",
      });
    }

    if (user.amount < amount) {
      console.log(
        ` Insufficient Balance: Available ₹${user.amount}, Required ₹${amount}`
      );
      return res.status(400).json({
        success: false,
        message: "Insufficient balance",
      });
    }

    console.log(" User and Merchant found", {
      user: user._id,
      merchant: merchant._id,
    });

    const latestBankRecord = await Bank.findOne({ userId: merchant._id });

    if (!latestBankRecord) {
      console.log(" No Bank record found for merchant:", merchant._id);
      return res.status(404).json({
        success: false,
        message: "No bank record found for this merchant",
      });
    }

    console.log(" Latest Bank Record Retrieved:", latestBankRecord);

    const merchantPCA = [
      latestBankRecord.amount,
      latestBankRecord.cardType,
      latestBankRecord.transactionType,
      latestBankRecord.deviceType,
      latestBankRecord.merchantCategory,
      latestBankRecord.merchantRiskLevel,
      latestBankRecord.customerTenure,
      latestBankRecord.customerAge,
      latestBankRecord.isInternational,
      latestBankRecord.distanceFromHome,
      latestBankRecord.timeOfDay,
      latestBankRecord.dayOfWeek,
      latestBankRecord.isWeekend,
      latestBankRecord.isHoliday,
      latestBankRecord.txCountLastHour,
      latestBankRecord.amountDeviation,
      latestBankRecord.velocity,
      latestBankRecord.consecutiveDeclines,
      latestBankRecord.failedLoginsToday,
      latestBankRecord.changedDevice,
      latestBankRecord.changedLocation,
      latestBankRecord.previouslyFlagged,
      latestBankRecord.minutesSinceLastTx,
      latestBankRecord.customerRiskScore,
      latestBankRecord.merchantNameFreq,
      latestBankRecord.patternMatch,
      latestBankRecord.hasEmvChip,
      latestBankRecord.otpUsed,
      latestBankRecord.isFirstTimeMerchant,
      latestBankRecord.time,
    ];

    console.log(" PCA Vector Prepared:", merchantPCA);

    const aiResponse = await axios.post(
      "https://model2.pixbit.me/predict2",
      {
        features: merchantPCA.map(Number),
      }
    );

    console.log(" AI Model Response:", aiResponse.data);

    const result = aiResponse.data?.prediction;
    if (result === "Fraud") {
      console.log(" AI Model flagged transaction as Fraud");
      await Log.create({
        userId: user._id,
        userName: user.name,
        amount,
        merchantID,
        merchantName: merchant.name,
        type: "fraud",
        message: "Transaction flagged by AI model. Transaction Blocked 🚫",
      });
      return res.status(403).json({
        success: false,
        message: "Transaction flagged by AI model.",
      });
    }


    user.amount -= amount;
    merchant.amount += amount;
    await user.save();
    await merchant.save();

    await Transaction.create({
      sender: user._id,
      receiver: merchant._id,
      amount,
    });

    console.log(` ₹${amount} transferred from ${user._id} to ${merchant._id}`);

    await Log.create({
      userId: user._id,
      userName: user.name,
      amount,
      merchantID,
      merchantName: merchant.name,
      type: "success",
      message: "Transaction completed successfully.",
    });

    return res.status(200).json({
      success: true,
      message: `₹${amount} transferred successfully`,
      userBalance: user.amount,
    });
  } catch (err) {
    console.error(" Payment Error:", err);
    return res.status(500).json({
      success: false,
      message: err.message || "Something went wrong",
    });
  }
};

const checkBalance = async (req, res) => {
  try {
    const { userId } = req.body;
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "customerID is required",
      });
    }

    const customer = await User.findById(userId);
    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found",
      });
    }

    return res.status(200).json({
      success: true,
      balance: customer.amount,
      message: `Current balance: ₹${customer.amount}`,
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
        message: "customerID is required",
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const sent = await Transaction.find({ sender: user._id })
      .populate("receiver")
      .sort({ timestamp: -1 });

    const received = await Transaction.find({ receiver: user._id })
      .populate("sender")
      .sort({ timestamp: -1 });

    const sentTransactions = sent.map((tx) => ({
      name: tx.receiver.name,
      merchantID: tx.receiver.merchantID,
      amount: tx.amount,
      date: tx.timestamp,
    }));

    const receivedTransactions = received.map((tx) => ({
      name: tx.sender.name,
      merchantID: tx.sender.merchantID,
      amount: tx.amount,
      date: tx.timestamp,
    }));

    return res.status(200).json({
      success: true,
      sentTransactions,
      receivedTransactions,
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  handlePay,
  checkBalance,
  getTransactionHistory,
};
