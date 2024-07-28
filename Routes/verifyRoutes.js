const express = require("express");
const jwt = require("jsonwebtoken");
const router = express.Router();

router.get("/verify-token", (req, res) => {
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).json({ message: "Not Authorized, No Token" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return res.status(200).json({ valid: true, decoded });
  } catch (error) {
    return res.status(401).json({ message: "Not Authorized, Token failed" });
  }
});

module.exports = router;
