const express = require("express");
const router = express.Router();
const {
  AuthorizedSeller,
  Authenticate,
} = require("../middleware/authMiddleware");
const {
  createProduct,
  getProducts,
  getSingleProduct,
  getCategoryProduct,
} = require("../controllers/productController");

router.post("/", Authenticate, AuthorizedSeller, createProduct);
router.get("/", getProducts);
router.get("/:id", getSingleProduct);
router.get("/category/:category", getCategoryProduct);

module.exports = router;
