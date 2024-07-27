const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const userModel = require("../models/userModel");
const generateToken = require("../utils/generateToken");

// ======================== Register User ==================== //
// ==== POST : api/users/register
// ==== UNPROTECTED

const registerUser = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res
        .status(400)
        .json({ success: false, message: "Fill in all fields" });
    }

    const normalizedEmail = email.toLowerCase();
    const emailExist = await userModel.findOne({ email: normalizedEmail });

    if (emailExist) {
      return res
        .status(409)
        .json({ success: false, message: "Email already exists" });
    }

    if (password.trim().length < 6) {
      return res
        .status(400)
        .json({ success: false, message: "Password is too short" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(password, salt);

    const newUser = await userModel.create({
      username,
      email: normalizedEmail,
      password: hashPassword,
    });

    generateToken(res, newUser);
    res
      .status(201)
      .json({
        success: true,
        message: "Registration successful",
        id: newUser._id,
      });
  } catch (error) {
    console.error("Error registering user:", error);
    res
      .status(500)
      .json({
        success: false,
        message: "Registration failed, please try again later",
        error: error.message,
      });
  }
};

// ======================== Login User ==================== //
// ==== POST : api/users/login
// ==== UNPROTECTED

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ success: false, message: "Please fill in all fields" });
    }

    const normalizedEmail = email.toLowerCase();
    const user = await userModel.findOne({ email: normalizedEmail });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid credentials" });
    }

    generateToken(res, user);

    const { _id, username, email: userEmail } = user;
    res
      .status(200)
      .json({ success: true, id: _id, username, email: userEmail });
  } catch (error) {
    console.error("Error logging in:", error);
    res.status(500).json({
      success: false,
      message: "Login failed, please try again later",
      error: error.message,
    });
  }
};

// ======================== Logout User ==================== //
// ==== POST : api/users/logout
// ==== UNPROTECTED

const logoutUser = async (req, res) => {
  try {
    res.cookie("token", "", {
      httpOnly: true,
      expires: new Date(0),
    });

    res.status(200).json({ success: true, message: "Logout successful" });
  } catch (error) {
    console.error("Error logging out:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

// ======================== Get All User ==================== //
// ==== GET : api/users
// ==== PROTECTED

const getAllUsers = async (req, res) => {
  try {
    const users = await userModel.find().select("-password");
    res.status(200).json({ success: true, users });
  } catch (error) {
    console.error("Error retrieving users:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

// ======================== Get Current/Logined User ==================== //
// ==== GET : api/users/profile
// ==== PROTECTED

const getCurrentUserProfile = async (req, res) => {
  try {
    const user = await userModel.findById(req.user.id).select("-password");
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }
    res.status(200).json({ success: true, user });
  } catch (error) {
    console.error("Error retrieving user profile:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

// ======================== Update Current/Logined User ==================== //
// ==== PUT : api/users/profile
// ==== PROTECTED

const updateCurrentUserProfile = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const update = {};

    if (username) update.username = username;

    if (email) {
      update.email = email.toLowerCase();
      const existingEmail = await userModel.findOne({ email: update.email });
      if (existingEmail && existingEmail._id.toString() !== req.user.id) {
        return res
          .status(409)
          .json({ success: false, message: "Email already exists" });
      }
    }

    if (password) {
      if (password.trim().length < 6) {
        return res
          .status(400)
          .json({ success: false, message: "Password is too short" });
      }
      const salt = await bcrypt.genSalt(10);
      update.password = await bcrypt.hash(password, salt);
    }

    const user = await userModel.findByIdAndUpdate(req.user.id, update, {
      new: true,
      runValidators: true,
    });

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    res.status(200).json({
      success: true,
      id: user._id,
      username: user.username,
      email: user.email,
    });
  } catch (error) {
    console.error("Error updating user profile:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

// ======================== Delete Current/Logined User ==================== //
// ==== DELETE : api/users/profile
// ==== PROTECTED

const deleteCurrentUserProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await userModel.findById(userId);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }
    if (user.isAdmin) {
      return res
        .status(403)
        .json({ success: false, message: "Admin accounts cannot be deleted" });
    }
    await userModel.findByIdAndDelete(userId);
    res.status(204).json({ message: "Account Deleted Successfully" });
  } catch (error) {
    console.error("Error deleting user profile:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

// ======================== Delete Users by Admin ==================== //
// ==== DELETE : api/users/:id
// ==== PROTECTED - ADMIN

const deleteUserByAdmin = async (req, res) => {
  try {
    const id = req.params.id;
    const user = await userModel.findById(id);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }
    if (user.isAdmin) {
      return res
        .status(403)
        .json({ success: false, message: "Admin accounts cannot be deleted" });
    }
    await userModel.findByIdAndDelete(id);
    res.status(204).send();
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

module.exports = {
  registerUser,
  loginUser,
  logoutUser,
  getAllUsers,
  getCurrentUserProfile,
  updateCurrentUserProfile,
  deleteCurrentUserProfile,
  deleteUserByAdmin,
};
