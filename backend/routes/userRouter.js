const express = require("express");
const userRouter = express.Router();
const User = require("../models/User");
const { body, validationResult } = require("express-validator");
const authenticateUser = require("../middleware/authMiddleware");

// get user profile
userRouter.get("/:userId", authenticateUser, async (req, res, next) => {
  try {
    const user = await User.findById(req.params.userId).select("-password"); // Exclude password

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json({ success: true, user });
  } catch (err) {
    next(err);
  }
});

// update user profile
userRouter.put(
  "/:userId",
  authenticateUser,
  [
    body("username").notEmpty().withMessage("Username is required"),
    body("profilePicture")
      .optional()
      .isURL()
      .withMessage("Invalid profile picture URL"),
    body("badges").optional().isArray().withMessage("Badges must be an array"),
    body("points")
      .optional()
      .isInt({ gt: -1 })
      .withMessage("Points must be a positive integer"),
  ],
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    try {
      const updatedUser = await User.findByIdAndUpdate(
        req.params.userId,
        req.body,
        { new: true }
      ).select("-password");
      if (!updatedUser) {
        return res.status(404).json({ error: "User not found" });
      }
      res.status(200).json({ success: true, user: updatedUser });
    } catch (err) {
      next(err);
    }
  }
);

// get user's children
userRouter.get("/:userId/children", authenticatUser, async (req, res, next) => {
  try {
    const user = req.user;
    // check if the user is a parent
    if (user.role !== "parent") {
      return res.status(403).json({ error: "forbidden" });
    }
    // populate the children field
    const populatedUser = await User.findById(req.params.userId)
      .select("-password")
      .populate("children", "-password");
    if (!populatedUser) {
      return res.status(404).json({ error: "user not found" });
    }
    res.status(200).json({ success: true, children: populatedUser.children });
  } catch (error) {
    next(error);
  }
});

module.exports = userRouter;

