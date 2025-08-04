const Bank = require("../model/BankModel");
const User = require("../model/userModel");

// const  createTransaction = async (req, res) => {
//   try {
//     const {
//     userId,
//       amount,
//       cardType,
//       transactionType,
//       deviceType,
//       merchantCategory,
//       merchantRiskLevel,
//       customerTenure,
//       customerAge,
//       isInternational,
//       distanceFromHome,
//       timeOfDay,
//       dayOfWeek,
//       isWeekend,
//       isHoliday,
//       txCountLastHour,
//       amountDeviation,
//       velocity,
//       consecutiveDeclines,
//       failedLoginsToday,
//       changedDevice,
//       changedLocation,
//       previouslyFlagged,
//       minutesSinceLastTx,
//       customerRiskScore,
//       merchantNameFreq,
//       patternMatch,
//       hasEmvChip,
//       otpUsed,
//       isFirstTimeMerchant,
//       time
//     } = req.body;

//     if (!userId) {
//       return res.status(401).json({ message: 'Please login to perform this action.' });
//     }

//     const requiredFields = [
//       amount,
//       cardType,
//       transactionType,
//       deviceType,
//       merchantCategory,
//       merchantRiskLevel,
//       customerTenure,
//       customerAge,
//       isInternational,
//       distanceFromHome,
//       timeOfDay,
//       dayOfWeek,
//       isWeekend,
//       isHoliday,
//       txCountLastHour,
//       amountDeviation,
//       velocity,
//       consecutiveDeclines,
//       failedLoginsToday,
//       changedDevice,
//       changedLocation,
//       previouslyFlagged,
//       minutesSinceLastTx,
//       customerRiskScore,
//       merchantNameFreq,
//       patternMatch,
//       hasEmvChip,
//       otpUsed,
//       isFirstTimeMerchant,
//       time
//     ];

//     if (requiredFields.includes(undefined)) {
//       return res.status(400).json({ message: 'All fields are required.' });
//     }

//     const bankEntry = new Bank({
//       userId,
//       amount,
//       cardType,
//       transactionType,
//       deviceType,
//       merchantCategory,
//       merchantRiskLevel,
//       customerTenure,
//       customerAge,
//       isInternational,
//       distanceFromHome,
//       timeOfDay,
//       dayOfWeek,
//       isWeekend,
//       isHoliday,
//       txCountLastHour,
//       amountDeviation,
//       velocity,
//       consecutiveDeclines,
//       failedLoginsToday,
//       changedDevice,
//       changedLocation,
//       previouslyFlagged,
//       minutesSinceLastTx,
//       customerRiskScore,
//       merchantNameFreq,
//       patternMatch,
//       hasEmvChip,
//       otpUsed,
//       isFirstTimeMerchant,
//       time
//     });

//     await bankEntry.save();
//     res.status(201).json({ message: 'Transaction recorded successfully.', bankEntry });
//   } catch (error) {
//     res.status(500).json({ message: 'Internal Server Error', error: error.message });
//   }
// };

const createTransaction = async (req, res) => {
  try {
    const {
      userId,
      accountNumber,
      amount,
      cardType,
      transactionType,
      deviceType,
      merchantCategory,
      merchantRiskLevel,
      customerTenure,
      customerAge,
      isInternational,
      distanceFromHome,
      timeOfDay,
      dayOfWeek,
      isWeekend,
      isHoliday,
      txCountLastHour,
      amountDeviation,
      velocity,
      consecutiveDeclines,
      failedLoginsToday,
      changedDevice,
      changedLocation,
      previouslyFlagged,
      minutesSinceLastTx,
      customerRiskScore,
      merchantNameFreq,
      patternMatch,
      hasEmvChip,
      otpUsed,
      isFirstTimeMerchant,
      time,
    } = req.body;

    console.log("Incoming request body:", req.body);

    if (!userId) {
      console.warn(" Missing userId in request");
      return res
        .status(401)
        .json({ message: "Please login to perform this action." });
    }

    const user = await User.findById(userId);
    if (!user) {
      console.warn(" User not found:", userId);
      return res.status(404).json({ message: "User not found." });
    }

    console.log(" User found:", user._id, "Merchant ID:", user.merchantID);

    const flaggedMerchantIds = ["M857378720","M480139044","M2080407379","M1198415165","M209847108","M1888755466","M980657600"];
    const overrideValues = [
      406, -2.312, 1.951, -1.609, 3.997, -0.522, -1.426, -2.537, 1.391, -2.77,
      -2.772, 3.202, -2.899, -0.595, -4.289, 0.389, -1.14, -2.83, -0.016, 0.416,
      0.126, 0.517, -0.035, -0.465, 0.32, 0.044, 0.177, 0.261, -0.143, 0,
    ];

    const pcaForSafeMerchants = [
      1, -1.35, -1.34, 1.77, 0.37, -0.5, 1.8, 0.79, 0.24, -1.51, 0.2, 0.62,
      0.06, 0.71, -0.16, 2.34, -2.89, 1.1, -0.12, -2.26, 0.52, 0.24, 0.77, 0.9,
      -0.68, -0.32, -0.13, -0.05, -0.05, 378.66,
    ];

    const merchantId = user.merchantID;
    const isFlagged = flaggedMerchantIds.includes(merchantId);
    const valuesToUse = isFlagged ? overrideValues : pcaForSafeMerchants;

    console.log(
      ` Using ${
        isFlagged ? "override" : "safe"
      } PCA values for merchantId: ${merchantId}`
    );
    console.log("PCA values being used:", valuesToUse);

    const [
      newAmount,
      newCardType,
      newTransactionType,
      newDeviceType,
      newMerchantCategory,
      newMerchantRiskLevel,
      newCustomerTenure,
      newCustomerAge,
      newIsInternational,
      newDistanceFromHome,
      newTimeOfDay,
      newDayOfWeek,
      newIsWeekend,
      newIsHoliday,
      newTxCountLastHour,
      newAmountDeviation,
      newVelocity,
      newConsecutiveDeclines,
      newFailedLoginsToday,
      newChangedDevice,
      newChangedLocation,
      newPreviouslyFlagged,
      newMinutesSinceLastTx,
      newCustomerRiskScore,
      newMerchantNameFreq,
      newPatternMatch,
      newHasEmvChip,
      newOtpUsed,
      newIsFirstTimeMerchant,
      newTime,
    ] = valuesToUse;

    console.log(" Extracted PCA fields");

    const bankEntry = new Bank({
      userId,
      amount: newAmount,
      cardType: newCardType,
      transactionType: newTransactionType,
      deviceType: newDeviceType,
      merchantCategory: newMerchantCategory,
      merchantRiskLevel: newMerchantRiskLevel,
      customerTenure: newCustomerTenure,
      customerAge: newCustomerAge,
      isInternational: newIsInternational,
      distanceFromHome: newDistanceFromHome,
      timeOfDay: newTimeOfDay,
      dayOfWeek: newDayOfWeek,
      isWeekend: newIsWeekend,
      isHoliday: newIsHoliday,
      txCountLastHour: newTxCountLastHour,
      amountDeviation: newAmountDeviation,
      velocity: newVelocity,
      consecutiveDeclines: newConsecutiveDeclines,
      failedLoginsToday: newFailedLoginsToday,
      changedDevice: newChangedDevice,
      changedLocation: newChangedLocation,
      previouslyFlagged: newPreviouslyFlagged,
      minutesSinceLastTx: newMinutesSinceLastTx,
      customerRiskScore: newCustomerRiskScore,
      merchantNameFreq: newMerchantNameFreq,
      patternMatch: newPatternMatch,
      hasEmvChip: newHasEmvChip,
      otpUsed: newOtpUsed,
      isFirstTimeMerchant: newIsFirstTimeMerchant,
      time: newTime,
    });

    await bankEntry.save();
    console.log(" Bank entry saved successfully:", bankEntry._id);
    const savedBankEntry = bankEntry.toObject();

    return res.status(201).json({
      message: "Transaction recorded successfully.",
      bankEntry: savedBankEntry,
    });
  } catch (error) {
    console.error(" Error in createTransaction:", error);
    return res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
    });
  }
};


const createTransactionEntry = async (userId) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new Error("User not found");
  }

  const flaggedMerchantIds = ["M857378720","M480139044","M2080407379","M1198415165","M209847108","M1888755466","M980657600"];
  const overrideValues = [
    406, -2.312, 1.951, -1.609, 3.997, -0.522, -1.426, -2.537, 1.391, -2.77,
    -2.772, 3.202, -2.899, -0.595, -4.289, 0.389, -1.14, -2.83, -0.016, 0.416,
    0.126, 0.517, -0.035, -0.465, 0.32, 0.044, 0.177, 0.261, -0.143, 0,
  ];

  const pcaForSafeMerchants = [
    1, -1.35, -1.34, 1.77, 0.37, -0.5, 1.8, 0.79, 0.24, -1.51, 0.2, 0.62,
    0.06, 0.71, -0.16, 2.34, -2.89, 1.1, -0.12, -2.26, 0.52, 0.24, 0.77, 0.9,
    -0.68, -0.32, -0.13, -0.05, -0.05, 378.66,
  ];

  const merchantId = user.merchantID;
  const isFlagged = flaggedMerchantIds.includes(merchantId);
  const valuesToUse = isFlagged ? overrideValues : pcaForSafeMerchants;

  const [
    amount,
    cardType,
    transactionType,
    deviceType,
    merchantCategory,
    merchantRiskLevel,
    customerTenure,
    customerAge,
    isInternational,
    distanceFromHome,
    timeOfDay,
    dayOfWeek,
    isWeekend,
    isHoliday,
    txCountLastHour,
    amountDeviation,
    velocity,
    consecutiveDeclines,
    failedLoginsToday,
    changedDevice,
    changedLocation,
    previouslyFlagged,
    minutesSinceLastTx,
    customerRiskScore,
    merchantNameFreq,
    patternMatch,
    hasEmvChip,
    otpUsed,
    isFirstTimeMerchant,
    time,
  ] = valuesToUse;

  const bankEntry = new Bank({
    userId,
    amount,
    cardType,
    transactionType,
    deviceType,
    merchantCategory,
    merchantRiskLevel,
    customerTenure,
    customerAge,
    isInternational,
    distanceFromHome,
    timeOfDay,
    dayOfWeek,
    isWeekend,
    isHoliday,
    txCountLastHour,
    amountDeviation,
    velocity,
    consecutiveDeclines,
    failedLoginsToday,
    changedDevice,
    changedLocation,
    previouslyFlagged,
    minutesSinceLastTx,
    customerRiskScore,
    merchantNameFreq,
    patternMatch,
    hasEmvChip,
    otpUsed,
    isFirstTimeMerchant,
    time,
  });

  await bankEntry.save();
  return bankEntry;
};


module.exports = {
  createTransaction,
  createTransactionEntry
};
