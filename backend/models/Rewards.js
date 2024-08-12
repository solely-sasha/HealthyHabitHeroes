const mongoose = require("mongoose");

const rewardSchema = new mongoose.Schema({
  rewardName: {
    type: String,
    required: true,
  },
  description: {
    String,
    pointsRequired: {
      type: Number,
      required: true,
      min: 1,
    },
    image: String,
    redeemedBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Child",
      },
    ],
  },
});

module.exports = mongoose.model("Rewards", rewardSchema);
