const express = require("express");
const { getAllLogs } = require("../controller/logController");
const router = express.Router();


router.get("/logs", getAllLogs);

module.exports = router;
