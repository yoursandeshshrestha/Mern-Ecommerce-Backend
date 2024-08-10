const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  buyer: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
    required: true,
  },
  shippingData: {
    address: {
      type: String,
    },
    city: {
      type: String,
    },
    state: {
      type: String,
    },
    country: {
      type: String,
    },
    pinCode: {
      type: Number,
    },
    phoneNo: {
      type: Number,
    },
  },
  orderedProducts: [
    {
      productName: {
        type: String,
      },
      price: {
        type: Number,
      },
      image: {
        type: String,
      },
      size: {
        type: String,
      },
      description: {
        type: String,
      },
      category: {
        type: Array,
      },
      quantity: {
        type: Number,
      },
      seller: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      shopName: {
        type: String,
      },
    },
  ],
  paymentInfo: {
    id: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      required: true,
      default: "Completed",
    },
  },
  paidAt: {
    type: Date,
    required: true,
  },
  productsQuantity: {
    type: Number,
    required: true,
    default: 0,
  },
  shippingPrice: {
    type: Number,
    required: true,
    default: 0,
  },
  totalPrice: {
    type: Number,
    required: true,
    default: 0,
  },
  orderStatus: {
    type: String,
    required: true,
    enum: ["Processing", "Shipped", "Delivered", "Cancelled"],
    default: "Processing",
  },
  deliveredAt: Date,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Order", orderSchema);
