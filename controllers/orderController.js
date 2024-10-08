const orderModel = require("../models/orderModel");
const userModel = require("../models/userModel");
const productModel = require("../models/productModel");

const newOrder = async (req, res) => {
  try {
    const {
      buyer,
      shippingData,
      orderedProducts,
      paymentInfo,
      productsQuantity,
      totalPrice,
    } = req.body;

    const order = await orderModel.create({
      buyer,
      shippingData,
      orderedProducts,
      paymentInfo,
      paidAt: Date.now(),
      productsQuantity,
      totalPrice,
    });

    for (const item of orderedProducts) {
      const product = await productModel.findById(item.productID);
      if (product) {
        product.stock = product.stock - item.quantity;
        await product.save();
      }
    }

    await userModel.findByIdAndUpdate(buyer, { cartDetails: [] });
    return res.status(200).json({ message: "Order Successful" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getOrderedProductsByCustomer = async (req, res) => {
  try {
    const product = await orderModel.find({ buyer: req.user.id });
    if (product) {
      res.status(200).json(product);
    } else {
      res.status(402).json({ message: "No Product Found" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getOrderedProductsBySeller = async (req, res) => {
  try {
    const sellerId = req.user.id;

    const orders = await orderModel.find({
      "orderedProducts.seller": sellerId,
    });

    const filteredOrders = [];
    for (const order of orders) {
      // Filtering products for each order in a single pass // using little DSA lol
      const filteredProducts = order.orderedProducts.filter(
        (product) => product.seller.toString() === sellerId.toString()
      );

      if (filteredProducts.length > 0) {
        filteredOrders.push({
          ...order._doc,
          orderedProducts: filteredProducts,
        });
      }
    }

    if (filteredOrders.length > 0) {
      res.status(200).json(filteredOrders);
    } else {
      res.status(404).json({ message: "No Product Found" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateOrderStatus = async (req, res) => {
  try {
    const { orderId, productId, newStatus } = req.body;

    const order = await orderModel.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    const product = order.orderedProducts.id(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found in order" });
    }

    product.orderStatus = newStatus;
    await order.save();

    res.status(200).json({ message: "Order status updated successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  newOrder,
  getOrderedProductsByCustomer,
  getOrderedProductsBySeller,
  updateOrderStatus,
};
