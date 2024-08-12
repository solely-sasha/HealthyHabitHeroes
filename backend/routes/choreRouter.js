const express = require("express");
const choreRouter = express.Router();
const Chore = require("../models/Chores");
const { body, validationResult } = require("express-validator");
const Child = require("../models/Child");
const {authenticateParent} = require("../middleware/authMiddleware");

// middleware to check if chores exist
const checkChoreExists = async (req, res, next) => {
  try {
    const chore = await Chore.findById(req.params.id);
    if (!chore) {
      return res.status(404).json({ error: "chore not found" });
    }
    req.chore = chore;
    next();
  } catch (err) {
    next(err);
  }
};

// Create a chore
choreRouter.post(
  "/",
  authenticateParent, // Apply authentication middleware
  [
    // body("child").isMongoId().withMessage("Invalid child id"),
    body("choreName").notEmpty().withMessage("Chore name is required"),
    body("points")
      .isInt({ min: 1, max: 100 })
      .withMessage("Points must be a number between 1 and 100"),
  ],
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const newChore = new Chore(req.body);
      const child = await Child.findById(req.body.child);
      if (!child) {
        return res.status(404).json({ error: "Child not found" });
      }

      const savedChore = await newChore.save();

      // Update: Push the savedChore's _id into the child.chores array
      child.chores.push(savedChore._id);
      await child.save();

      res.status(201).json({
        success: true,
        message: "Chore created successfully",
        chore: savedChore,
      });
    } catch (err) {
      next(err);
    }
  }
);


// get all chores
choreRouter.get("/", async (req, res, next) => {
  try {
    const chores = await Chore.find().populate("child");
    res
      .status(200)
      .json({ success: true, message: "all chores found!", chores: chores });
  } catch (err) {
    next(err);
  }
});

// get one chore by id
choreRouter.get("/:id", checkChoreExists, async (req, res, next) => {
  try {
    const chore = await Chore.populate(req.chore, { path: "child" });
    res.status(200).json(chore);
  } catch (err) {
    next(err);
  }
});

// update a chore
choreRouter.put("/:id", checkChoreExists, async (req, res, next) => {
  try {
    const updatedChore = await Chore.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.status(200).json(updatedChore);
  } catch (err) {
    next(err);
  }
});

// delete a chore
choreRouter.delete("/:id", checkChoreExists, async (req, res, next) => {
  try {
    await req.chore.deleteOne();
    res.status(200).json({ message: "chore deleted successfully" });
  } catch (err) {
    next(err);
  }
});

module.exports = choreRouter;
