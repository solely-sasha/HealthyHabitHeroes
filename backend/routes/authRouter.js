const express = require("express");
const authRouter = express.Router();
const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Child = require("../models/Child");
const { body, validationResult } = require("express-validator");
const validator = require("validator");

// Parent Signup Route
authRouter.post(
  "/signup/parent",
  [
    body("username").notEmpty().withMessage("Username is required"),
    body("email").isEmail().withMessage("Invalid email"),
    body("password").custom((value) => {
      if (!validator.isStrongPassword(value)) {
        throw new Error(
          "Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character"
        );
      }
      return true;
    }),
  ],
  async (req, res, next) => {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { username, email, password } = req.body;

      // Check if user already exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ error: "Email already in use" });
      }

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      const newUser = new User({
        username,
        email,
        password: hashedPassword,
        role: "parent",
      });
      const savedUser = await newUser.save();

      // Generate JWT token upon successful signup
      const token = jwt.sign(
        { _id: savedUser._id, role: savedUser.role },
        process.env.SECRET,
        { expiresIn: "1h" }
      );

      const { password: _, ...info } = savedUser._doc;

      res.cookie("token", token).status(201).json({
        success: true,
        message: "Parent signed up successfully",
        user: info,
      });
    } catch (err) {
      next(err);
    }
  }
);

// Child Signup Route
authRouter.post(
  "/signup/child",
  [
    body("username").notEmpty().withMessage("Username is required"),
    body("email").isEmail().withMessage("Invalid email"),
    body("password").custom((value) => {
      if (!validator.isStrongPassword(value)) {
        throw new Error(
          "Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character"
        );
      }
      return true;
    }),
    body("parentEmail").isEmail().withMessage("Invalid parent email"),
  ],
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { username, email, password, parentEmail } = req.body;

      const parent = await User.findOne({ email: parentEmail });

      if (!parent) {
        return res.status(404).json({ error: "Parent not found" });
      }

      const existingChild = await Child.findOne({ email });
      if (existingChild) {
        return res.status(400).json({ error: "Email already in use" });
      }

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      const newChild = new Child({
        username,
        email,
        password: hashedPassword,
      });

      const savedChild = await newChild.save();

      parent.children.push(savedChild._id);
      await parent.save();

      res
        .status(200)
        .json({ success: true, message: "Child signed up successfully" });
    } catch (err) {
      next(err);
    }
  }
);

// Signin
authRouter.post(
  "/signin",
  [
    body("email").isEmail().withMessage("Invalid email"),
    body("password").notEmpty().withMessage("Password is required"),
  ],
  async (req, res, next) => {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { email, password, role } = req.body;
      let user;

      if (role === "child") {
        user = await Child.findOne({ email });
      } else {
        user = await User.findOne({ email });
      }

      if (!user) {
        return res.status(404).json({ error: "User not found!" });
      }

      const match = await bcrypt.compare(password, user.password);
      if (!match) {
        return res.status(401).json({ error: "Wrong credentials!" });
      }

      const token = jwt.sign(
        {
          _id: user._id,
          username: user.username,
          email: user.email,
          role: user.role,
        },
        process.env.SECRET,
        {
          expiresIn: "1h",
        }
      );

      const { password: _, ...info } = user._doc;

      res.cookie("token", token).status(200).json(info);
    } catch (err) {
      next(err);
    }
  }
);

// Signout
authRouter.get("/signout", async (req, res) => {
  try {
    res
      .clearCookie("token", { sameSite: "none", secure: true })
      .status(200)
      .send("user successfully signed out");
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = authRouter;