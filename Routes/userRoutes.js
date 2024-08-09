const express = require("express");
const router = express.Router();

const {
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
} = require("../controllers/userController");

const {
  Authenticate,
  AuthorizedSeller,
} = require("../middleware/authMiddleware");

// User routes
router.post("/register", registerUser);
router.post("/login", loginUser);

// Current User
router.post("/logout", logoutUser);
router.get("/profile", Authenticate, getCurrentUserProfile);
router.put("/profile", Authenticate, updateCurrentUserProfile);
router.delete("/profile", Authenticate, deleteCurrentUserProfile);
router.put("/profile/address", Authenticate, updateCurrentUserAddress);

// Admin
// router.get("/", Authenticate, AuthorizedAdmin, getAllUsers);
// router.delete("/:id", Authenticate, AuthorizedAdmin, deleteUserByAdmin);

//cart
router.post("/cart/add", addToCart);
router.post("/cart/update-quantity", updateCartQuantity);
router.post("/cart/remove", removeFromCart);
module.exports = router;
