const orderModel = require("../models/orderModel");
const userModel = require("../models/userModel");

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

module.exports = {
  newOrder,
  getOrderedProductsByCustomer,
};
