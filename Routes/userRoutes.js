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
} = require("../controllers/userController");

const {
  Authenticate,
  AuthorizedAdmin,
} = require("../middleware/authMiddleware");

// User routes
router.post("/register", registerUser);
router.post("/login", loginUser);

// Current User
router.post("/logout", logoutUser);
router.get("/profile", Authenticate, getCurrentUserProfile);
router.put("/profile", Authenticate, updateCurrentUserProfile);
router.delete("/profile", Authenticate, deleteCurrentUserProfile);

// Admin
router.get("/", Authenticate, AuthorizedAdmin, getAllUsers);
router.delete("/:id", Authenticate, AuthorizedAdmin, deleteUserByAdmin);

module.exports = router;
