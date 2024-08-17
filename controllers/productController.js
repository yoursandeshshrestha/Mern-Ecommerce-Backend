const fs = require("fs");
const path = require("path");
const productModel = require("../models/productModel");
const notifySubscribers = require("../Utils/notifySubscribers");

// ======================== Create Product ==================== //
// ==== POST : api/products
// ==== PROTECTED

const createProduct = async (req, res) => {
  try {
    const {
      name,
      description,
      category,
      price,
      oldPrice,
      stock,
      size,
      gender,
    } = req.body;
    const image = req.file?.filename;

    if (
      !name ||
      !description ||
      !category ||
      !price ||
      !stock ||
      !image ||
      !size
    ) {
      return res.status(400).json({ message: "Fill in all fields" });
    }

    const validGenders = ["Men", "Women", "Unisex"];
    if (!validGenders.includes(gender)) {
      return res.status(400).json({ message: "Please select gender" });
    }

    // Parse JSON fields
    let parsedCategory;
    let parsedSize;
    try {
      parsedCategory = JSON.parse(category);
      parsedSize = JSON.parse(size);
    } catch (err) {
      return res
        .status(400)
        .json({ message: "Invalid format for category or size" });
    }

    const product = await productModel.create({
      name,
      description,
      category: parsedCategory,
      price,
      oldPrice,
      stock,
      image,
      size: parsedSize,
      seller: req.user._id,
      shopName: req.user.shopName,
      gender,
    });

    // await notifySubscribers(name); // Not Working thats why commented out
    res.status(201).json({
      success: true,
      message: "Product Created Successfully and subscribers notified!",
      product,
    });
  } catch (error) {
    console.error("Error creating product:", error);
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
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit);
  const skip = (page - 1) * limit;
  const discounted = req.query.discounted === "true";

  try {
    const query = discounted ? { oldPrice: { $ne: null } } : {};

    const products = await productModel
      .find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    if (products.length === 0) {
      return res.status(404).json({ message: "No Products Found" });
    }

    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({
      message: "Error Fetching Products, please try again later",
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
    const products = await productModel
      .find({ category: { $in: [category] } })
      .sort({ createdAt: -1 });
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

// ======================== GET Product by SellerID ==================== //
// ==== GET : api/products/:sellerID
// ==== UNPROTECTED

const productBySellerID = async (req, res) => {
  try {
    const { sellerID } = req.params;
    const product = await productModel
      .find({ seller: sellerID })
      .sort({ updatedAt: -1 });
    if (product.length === 0) {
      return res.status(404).json({ message: "No products found" });
    }

    res.status(200).json({ message: "success", product });
  } catch (error) {
    res.status(500).json({
      message: "Error Fetching Products, please try again later",
      error: error.message,
    });
  }
};

// ======================== Delete Product by ID ==================== //
// ==== GET : api/products/:id
// ==== UNPROTECTED

const deleteProductByID = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await productModel.findById({ _id: id });
    if (!product) {
      res.status(404).json({ message: "Product Not Found" });
    }
    const imagePath = path.join(__dirname, "..", "uploads", product.image);
    await productModel.findOneAndDelete({ _id: id });
    fs.unlink(imagePath, (err) => {
      if (err) {
        console.error("Error deleting image:", err);
      }
    });

    res.status(200).json({ message: "Product Removed Successfully" });
  } catch (error) {
    res.status(500).json({
      message: "Error Deleting Product, please try again later",
      error: error.message,
    });
  }
};

// ======================== Edit Product by ID ==================== //
// ==== PUT : api/products/:id
// ==== PROTECTED

const editProductByID = async (req, res) => {
  try {
    const productID = req.params.id;
    const {
      name,
      description,
      category,
      price,
      oldPrice,
      stock,
      size,
      gender,
    } = req.body;
    const image = req.file?.filename;

    if (
      !name ||
      !description ||
      !category ||
      !price ||
      !stock ||
      !size ||
      !gender
    ) {
      return res.status(402).json({ message: "Fill in all fields" });
    }

    // Find the product by ID
    const product = await productModel.findById(productID);
    if (!product) {
      return res.status(404).json({ message: "Product Not Found" });
    }

    // Handle image replacement
    if (image) {
      const oldImagePath = path.join(__dirname, "../uploads/", product.image);

      // Check if old image exists and delete it
      if (fs.existsSync(oldImagePath)) {
        fs.unlink(oldImagePath, (err) => {
          if (err) {
            console.error("Error deleting old image:", err);
          }
        });
      }

      // Update product image
      product.image = image;
    }

    // Parse category and size fields if they are JSON strings
    let parsedCategory, parsedSize;
    try {
      parsedCategory = category ? JSON.parse(category) : product.category;
      parsedSize = size ? JSON.parse(size) : product.size;
    } catch (err) {
      return res
        .status(400)
        .json({ message: "Invalid format for category or size" });
    }

    // Update product fields
    product.name = name || product.name;
    product.description = description || product.description;
    product.category = parsedCategory;
    product.price = price || product.price;
    if (!product.oldPrice === null) {
      product.oldPrice = oldPrice || product.oldPrice;
    }
    product.stock = stock || product.stock;
    product.size = parsedSize || product.size;
    product.gender = gender || product.gender;

    // Save the updated product
    await product.save();

    res.status(200).json({ message: "Product updated successfully", product });
  } catch (error) {
    res.status(500).json({
      message: "Error updating product, please try again later",
      error: error.message,
    });
  }
};

const searchProducts = async (req, res) => {
  try {
    const { query, limit } = req.query;

    // Build the base query
    let productQuery = productModel.find({
      $or: [
        { name: { $regex: query, $options: "i" } },
        { category: { $regex: query, $options: "i" } },
      ],
    });

    // Apply limit only if provided
    if (limit) {
      productQuery = productQuery.limit(parseInt(limit));
    }

    const products = await productQuery;

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

module.exports = {
  createProduct,
  getProducts,
  getSingleProduct,
  getCategoryProduct,
  productBySellerID,
  deleteProductByID,
  editProductByID,
  searchProducts,
};
