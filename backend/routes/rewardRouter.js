const express = require("express");
const rewardRouter = express.Router();
const Rewards = require("../models/Rewards");
const Child = require("../models/Child");
const { body, validationResult } = require("express-validator");
const {
  authenticateParent,
  authenticateUser,
} = require("../middleware/authMiddleware");

// Create a reward - for parents only
rewardRouter.post("/", async (req, res, next) => {
  try {
    const newReward = new Rewards(req.body);
    const savedReward = await newReward.save();
    res.status(201).json({
      success: true,
      message: "Reward created successfully",
      reward: savedReward,
    });
  } catch (err) {
    next(err);
  }
});

// get all rewards
rewardRouter.get("/", async (req, res, next) => {
  try {
    const rewards = await Rewards.find();
    res.status(200).json({ success: true, rewards });
  } catch (err) {
    next(err);
  }
});

// redeem a reward
rewardRouter.post(
  "/redeem/:rewardId",
  authenticateUser,
  async (req, res, next) => {
    try {
      const rewardId = req.params.rewardId;
      const childId = req.body.childId;
      const reward = await Rewards.findById(rewardId);
      const child = await Child.findById(childId);

      if (!reward || !child) {
        return res.status(404).json({ error: "reward or child not found" });
      }
      if (child.points < reward.pointsRequired) {
        return res
          .status(400)
          .json({ error: "not enough points to redeem this reward" });
      }
      // deduct points from the child
      child.points -= reward.pointsRequired;

      // add teh child to the redeemedBy array of the reward
      reward.redeemedBy.push(childId);

      // save the updated child and reward
      await child.save();
      await reward.save();

      res.status(200).json({
        success: true,
        message: "reward redeemed successfully",
      });
    } catch (err) {
      next(err);
    }
  }
);

module.exports = rewardRouter;
