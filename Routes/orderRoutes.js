const express = require("express");
const router = express.Router();
const { Authenticate } = require("../middleware/authMiddleware");
const { newOrder } = require("../controllers/orderController");

router.post("/create", Authenticate, newOrder);

module.exports = router;
