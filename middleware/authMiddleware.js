const jwt = require("jsonwebtoken");
const userModel = require("../models/userModel");

const Authenticate = async (req, res, next) => {
  const token = req.cookies.token;

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await userModel.findById(decoded.id).select("-password");
      next();
    } catch (error) {
      res.status(401).json({ message: "Not Authorized, Token failed" });
    }
  } else {
    res.status(401).json({ message: "Not Authorized, No Token" });
  }
};

const AuthorizedAdmin = (req, res, next) => {
  if (req.user && req.user.isAdmin) {
    next();
  } else {
    res.status(401).json({ message: "Not Authorized as an admin" });
  }
};

module.exports = { Authenticate, AuthorizedAdmin };
