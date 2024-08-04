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
  productBySellerID,
} = require("../controllers/productController");
const upload = require("../config/multerConfig");

router.post(
  "/",
  Authenticate,
  AuthorizedSeller,
  upload.single("image"),
  createProduct
);
router.get("/", getProducts);
router.get("/:id", getSingleProduct);
router.get("/category/:category", getCategoryProduct);
router.get("/seller/:sellerID", productBySellerID);

module.exports = router;
