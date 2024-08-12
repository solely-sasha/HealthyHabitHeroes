const jwt = require("jsonwebtoken");
const User = require("../models/User");

const authenticateParent = async (req, res, next) => {
  try {
    let token;

    // Check for authorization header
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    } else if (req.cookies.token) {
      token = req.cookies.token;
    }

    // If token exists, verify and decode it
    if (token) {
      const decoded = jwt.verify(token, process.env.SECRET);

      // Find the user based on the token's user ID, but exclude the password field
      req.user = await User.findById(decoded._id).select("-password");

      // Check if the user exists and has the "parent" role
      if (!req.user || req.user.role !== "parent") {
        return res.status(401).json({ error: "Unauthorized access" });
      }
      next();
    } else {
      res.status(401).json({ error: "No token, authorization denied" });
    }
  } catch (err) {
    res.status(401).json({ error: "Invalid token" });
  }
};

const authenticateUser = async (req, res, next) => {
  try {
    let token;
    // Check for authorization header
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    } else if (req.cookies.token) {
      token = req.cookies.token

    }
    // If token exists, verify and decode it
    if (token) {
      const decoded = jwt.verify(token, process.env.SECRET);

      // Find the user based on the token's user ID, but exclude the password field
      req.user = await User.findById(decoded._id).select("-password");

      // Check if the user exists
      if (!req.user) {
        return res.status(401).json({ error: "unauthorized access" });
      }
      next(); // Move the else block after this line
    } else {
      res.status(401).json({ error: "No token, authorization denied" });
    } 
  } catch (err) {
    res.status(401).json({ error: "invalid token" });
  }
};

module.exports = {authenticateParent, authenticateUser}