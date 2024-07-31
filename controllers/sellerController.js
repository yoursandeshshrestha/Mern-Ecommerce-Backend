const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const sellerModel = require("../models/sellerModel");

const sellerRegister = async (req, res) => {
  try {
    const { username, email, password, shopName } = req.body;
    if (!username || !email || !password || !shopName) {
      res.status(402).json({ message: "Please Fill All Fields" });
    }
    const newEmail = email.toLowerCase();
    const existingUser = await sellerModel.findOne({ email: newEmail });
    if (existingUser) {
      res.status(402).json({ message: "Email Already Exist" });
    }
    if (password.length < 6) {
      res.status(402).json({ message: "Password should be longer" });
    }
    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(password, salt);
    const seller = await sellerModel.create({
      username,
      email: newEmail,
      password: hashPassword,
      shopName,
    });
    res.status(201).json(seller);
  } catch (error) {
    res.status(402).json({ error: error.message });
  }
};

const sellerLogin = async (req, res) => {};

module.exports = { sellerRegister, sellerLogin };
