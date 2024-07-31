const express = require("express");
const router = express.Router();
const { sellerRegister } = require("../controllers/sellerController");

router.post("/register", sellerRegister);

module.exports = router;
