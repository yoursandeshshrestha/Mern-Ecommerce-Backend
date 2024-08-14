const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const userModel = require("../models/userModel");
const productModel = require("../models/productModel");
const generateToken = require("../utils/generateToken");
const mongoose = require("mongoose");

// ======================== Register User ==================== //
// ==== POST : api/users/register
// ==== UNPROTECTED

const registerUser = async (req, res) => {
  try {
    const { username, email, password, accountType, shopName } = req.body;

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

    if (accountType === "Seller") {
      if (!shopName || shopName.trim() === "") {
        return res.status(400).json({
          success: false,
          message: "Shop name is required for sellers",
        });
      }

      const shopExist = await userModel.findOne({ shopName });
      if (shopExist) {
        return res
          .status(409)
          .json({ success: false, message: "Shop name already exists" });
      }
    }

    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(password, salt);

    // Create the new user
    const newUser = await userModel.create({
      username,
      email: normalizedEmail,
      password: hashPassword,
      accountType,
      shopName: accountType === "Seller" ? shopName : undefined,
    });

    generateToken(res, newUser);
    res.status(201).json({
      success: true,
      message: "Registration successful",
      id: newUser._id,
    });
  } catch (error) {
    console.error("Error registering user:", error);
    res.status(500).json({
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

    const token = generateToken(res, user);

    const { _id, username, email: userEmail, accountType } = user;
    res.status(200).json({
      success: true,
      id: _id,
      username,
      email: userEmail,
      accountType,
      token,
    });
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
    const { username, shopName, email, password, currentPassword } = req.body;

    // Get user from the database
    const user = await userModel.findById(req.user.id);

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    // Check if the current password is correct
    if (!currentPassword) {
      return res
        .status(404)
        .json({ success: false, message: "Password is required" });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res
        .status(401)
        .json({ success: false, message: "Current password is incorrect" });
    }

    const update = {};

    if (username) update.username = username;
    if (shopName) update.shopName = shopName;

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

    const updatedUser = await userModel.findByIdAndUpdate(req.user.id, update, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      id: updatedUser._id,
      username: updatedUser.username,
      email: updatedUser.email,
    });
  } catch (error) {
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
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

const addToCart = async (req, res) => {
  const {
    userId,
    productID,
    productName,
    productPrice,
    productQuantity,
    productImage,
    productSize,
  } = req.body;

  try {
    if (
      !userId ||
      !productID ||
      !productName ||
      !productPrice ||
      !productQuantity ||
      !productImage ||
      !productSize
    ) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const user = await userModel.findById(userId);
    const product = await productModel.findById(productID);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if the product with the same ID and size exists in the cart
    const existingProduct = user.cartDetails.find(
      (item) => item.productID === productID && item.productSize === productSize
    );

    if (existingProduct) {
      existingProduct.productQuantity += productQuantity;
    } else {
      user.cartDetails.push({
        productID,
        productQuantity,
        productName,
        productPrice,
        productImage,
        productSize,
        seller: product.seller,
        shopName: product.shopName,
      });
    }

    await user.save();

    res.status(200).json({
      message: "Product added to cart successfully",
      cartDetails: user.cartDetails,
    });
  } catch (error) {
    console.error("Error adding product to cart:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const updateCartQuantity = async (req, res) => {
  const { userId, productID, quantityChange } = req.body;

  try {
    const user = await userModel.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const product = user.cartDetails.find(
      (item) => item.productID === productID
    );

    if (product) {
      product.productQuantity += quantityChange;

      if (product.productQuantity < 1) {
        product.productQuantity = 1;
      }

      await user.save();
      return res.status(200).json({
        message: "Product quantity updated successfully",
        cartDetails: user.cartDetails,
      });
    } else {
      return res.status(404).json({ message: "Product not found in cart" });
    }
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

const removeFromCart = async (req, res) => {
  const { userId, productID } = req.body;

  try {
    const user = await userModel.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.cartDetails = user.cartDetails.filter(
      (item) => item.productID.toString() !== productID.toString()
    );

    await user.save();
    res.status(200).json({
      message: "Product removed from cart successfully",
      cartDetails: user.cartDetails,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

const updateCurrentUserAddress = async (req, res) => {
  try {
    const { address, city, state, pinCode, phoneNo, country } = req.body;

    const user = await userModel.findById(req.user.id);

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    user.shippingData = {
      address,
      city,
      state,
      pinCode,
      phoneNo,
      country,
    };

    const updatedUser = await user.save();

    res.status(200).json({
      success: true,
      message: "Address updated successfully",
      user: updatedUser,
    });
  } catch (error) {
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
  addToCart,
  updateCartQuantity,
  removeFromCart,
  updateCurrentUserAddress,
};
