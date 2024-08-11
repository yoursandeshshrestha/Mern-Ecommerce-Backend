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

const getOrderedProductsBySeller = async (req, res) => {
  try {
    const sellerId = req.params.id;

    // Finding all orders containing products sold by the seller //
    const orders = await orderModel.find({
      "orderedProducts.seller": sellerId,
    });

    const filteredOrders = [];
    for (const order of orders) {
      // Filtering products for each order in a single pass // using little DSA lol
      const filteredProducts = order.orderedProducts.filter(
        (product) => product.seller.toString() === sellerId.toString()
      );

      // If there are matching products then add the order to the results
      if (filteredProducts.length > 0) {
        filteredOrders.push({
          ...order._doc, // Copy all order fields
          orderedProducts: filteredProducts, // Replace orderedProducts with the filtered ones
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

module.exports = {
  newOrder,
  getOrderedProductsByCustomer,
  getOrderedProductsBySeller,
};
