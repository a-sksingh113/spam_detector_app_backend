require('dotenv').config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./dbConnections/db");


connectDB();

const PORT = process.env.PORT || 1000;
const app = express();

app.use(cors({ origin: '*', credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

const authRoutes = require("./route/userRoute");
const tranctionRoute = require('./route/tranctionRoute')

app.use("/api/user", authRoutes);
app.use("/api/tranction", tranctionRoute);



app.get("/", (req, res) => res.send("API is running..."));

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
