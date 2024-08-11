const express = require("express");
const router = express.Router();
const { Authenticate } = require("../middleware/authMiddleware");
const {
  newOrder,
  getOrderedProductsByCustomer,
  getOrderedProductsBySeller,
} = require("../controllers/orderController");

router.post("/create", Authenticate, newOrder);
router.get("/", Authenticate, getOrderedProductsByCustomer);
router.get("/:id", Authenticate, getOrderedProductsBySeller);

module.exports = router;
