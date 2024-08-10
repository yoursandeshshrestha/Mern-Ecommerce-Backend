const express = require("express");
const router = express.Router();
const { Authenticate } = require("../middleware/authMiddleware");
const {
  newOrder,
  getOrderedProductsByCustomer,
} = require("../controllers/orderController");

router.post("/create", Authenticate, newOrder);
router.get("/", Authenticate, getOrderedProductsByCustomer);

module.exports = router;
