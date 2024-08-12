const mongoose = require("mongoose");

const choreSchema = new mongoose.Schema({
  child: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Child",
    required: true,
  },
  choreName: {
    type: String,
    required: true,
  },
  description: String,
  dueDate: Date,
  frequency: {
    type: String,
    enum: ["daily", "weekly", "monthly", "once"],
  },
  reminders: [Date],
  points: {
    type: Number,
    required: true,
    min: 1,
    max: 100,
  },
  category: String,
  completed: {
    type: Boolean,
    default: false,
  },
});

module.exports = mongoose.model("Chore", choreSchema);