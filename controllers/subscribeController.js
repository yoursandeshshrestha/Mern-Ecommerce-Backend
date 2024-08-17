const mongoose = require("mongoose");
const subscribeModel = require("../models/subscribeModel");

const subscribeUser = async (req, res) => {
  try {
    const { email } = req.body;

    const subscribeEmail = await subscribeModel.create({
      email,
    });
    res.status(200).json(subscribeEmail);
  } catch (error) {
    res.status(500).send("Error subscribing, please try again.");
  }
};

module.exports = { subscribeUser };
