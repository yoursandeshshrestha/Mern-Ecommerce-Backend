const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Product name is required"],
    },
    description: {
      type: String,
      required: [true, "Product description is required"],
    },
    category: {
      type: Array,
      required: true,
    },
    gender: {
      type: String,
      required: true,
      enum: ["Men", "Women", "Unisex"],
      default: "Men",
    },
    price: {
      type: Number,
      required: [true, "Product price is required"],
      default: 0,
      min: [0, "Product price cannot be negative"],
    },
    oldPrice: {
      type: Number,
    },
    stock: {
      type: Number,
      required: [true, "Product stock is required"],
      default: 0,
      min: [0, "Product stock cannot be negative"],
    },
    image: {
      type: String,
      required: [true, "Product image is required"],
    },
    size: {
      type: Array,
      required: [true, "Product size is required"],
    },
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    shopName: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

const Product = mongoose.model("Product", productSchema);

module.exports = Product;
