const express = require("express");
const router = express.Router();
const { Authenticate } = require("../middleware/authMiddleware");
const {
  newOrder,
  getOrderedProductsByCustomer,
  getOrderedProductsBySeller,
  updateOrderStatus,
} = require("../controllers/orderController");

router.post("/create", Authenticate, newOrder);
router.get("/", Authenticate, getOrderedProductsByCustomer);
router.get("/seller-orders", Authenticate, getOrderedProductsBySeller);
router.put("/update-status", Authenticate, updateOrderStatus);

module.exports = router;
