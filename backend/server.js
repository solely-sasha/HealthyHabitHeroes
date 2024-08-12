const mongoose = require("mongoose");
const express = require("express");
const morgan = require("morgan");
const colors = require("colors");
const app = express();
require("dotenv").config();

// middleware
app.use(express.json());
app.use(morgan("dev"));

// connection to database function
const connectToDb = async () => {
  try {
    await mongoose.connect(process.env.DB);
    console.log("Connected to the MongoDB".bgCyan);
  } catch (error) {
    console.log(error.bgRed);
  }
};

connectToDb();

// routes
app.use("/api/auth", require("./routes/authRouter"));
app.use("/api/chores", require("./routes/choreRouter"));
app.use("/api/rewards", require("./routes/rewardRouter"));
// app.use("/api/children", require("./routes/childRouter"));

app.use((err, req, res, next) => {
  console.error(err);
  return res.status(err.status || 500).send({ errMsg: err.message });
});

// verify that the server is up and running
app.listen(7000, () =>
  console.log("The server is running on Port 7000".bgMagenta)
);
