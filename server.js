require('dotenv').config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const PORT = process.env.PORT || 8181;
const app = express();

app.use(cors({ origin: '*', credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

const authRoutes = require("./route/userRoute");
const tranctionRoute = require('./route/tranctionRoute');
const createTransaction = require('./route/bankRoute');
const userDetails = require('./route/adminRoute');
const userActivityLogRoute  = require('./route/logRoute')

app.use("/api/user", authRoutes);
app.use("/api/tranction", tranctionRoute,createTransaction);
app.use("/api/admin", userDetails,userActivityLogRoute);

app.get("/", (req, res) => res.send("API is running..."));

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected");
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => console.error(err));

