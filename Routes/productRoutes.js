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
  deleteProductByID,
  editProductByID,
  searchProducts,
} = require("../controllers/productController");
const upload = require("../config/multerConfig");

router.post(
  "/",
  Authenticate,
  AuthorizedSeller,
  upload.single("image"),
  createProduct
);

// Advance Search
router.get("/search", searchProducts);

router.get("/", getProducts);
router.get("/:id", getSingleProduct);
router.get("/category/:category", getCategoryProduct);
router.get("/seller/:sellerID", productBySellerID);
router.delete("/:id", deleteProductByID);
router.put("/:id", upload.single("image"), editProductByID);

module.exports = router;
