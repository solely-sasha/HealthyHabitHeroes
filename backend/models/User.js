const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
    },
    children: [{ type: mongoose.Schema.Types.ObjectId, ref: "Child" }],
    role: {
      type: String,
      enum: ["parent", "child"],
      default: "parent",
    },

    profilePicture: String,
    badges: [String],
    points: Number,
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);