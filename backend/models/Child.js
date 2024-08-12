const mongoose = require("mongoose");

const childSchema = new mongoose.Schema({
  name: String,
  age: Number,
  points: { type: Number, default: 0 },
  role: {
    type: String,
    default: "child",
  },
  parent: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  email: String,
  username: String,
  password: String,
});

module.exports = mongoose.model("Child", childSchema);