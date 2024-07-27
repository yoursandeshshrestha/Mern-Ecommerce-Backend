const productModel = require("../models/productModel");

// ======================== Create Product ==================== //
// ==== POST : api/products
// ==== PROTECTED

const createProduct = async (req, res) => {
  try {
    const { name, description, brand, category, price, stock, image } =
      req.body;
    const product = await productModel.create({
      name,
      description,
      brand,
      category,
      price,
      stock,
      image,
    });
    res.status(201).json({
      success: true,
      message: "Product Created Successfully",
      product,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error Creating Product, please try again later",
      error: error.message,
    });
  }
};

// ======================== GET ALL Product ==================== //
// ==== GET : api/products
// ==== UNPROTECTED

const getProducts = async (req, res) => {
  try {
    const products = await productModel.find();
    if (products.length === 0) {
      return res.status(404).json({ message: "No Products Found" });
    }
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({
      message: "Error Fetching Product, please try again later",
      error: error.message,
    });
  }
};

// ======================== GET Product by ID ==================== //
// ==== GET : api/products/:id
// ==== UNPROTECTED

const getSingleProduct = async (req, res) => {
  try {
    const id = req.params.id;
    const product = await productModel.findById(id);
    if (!product) {
      return res.status(402).json({ message: "Product Not Found" });
    }
    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({
      message: "Error Fetching Product, please try again later",
      error: error.message,
    });
  }
};

// ======================== GET Product by Category ==================== //
// ==== GET : api/products/category/:category
// ==== UNPROTECTED

const getCategoryProduct = async (req, res) => {
  try {
    const { category } = req.params;
    const products = await productModel.find({ category: { $in: [category] } });
    if (products.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No Products Found in this Category",
      });
    }
    res.status(200).json({
      success: true,
      message: "Fetch Successful",
      products,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error Fetching Product, please try again later",
      error: error.message,
    });
  }
};

module.exports = {
  createProduct,
  getProducts,
  getSingleProduct,
  getCategoryProduct,
};
