const express = require("express");
const router = express.Router();
const { subscribeUser } = require("../controllers/subscribeController");

router.post("/", subscribeUser);

module.exports = router;
