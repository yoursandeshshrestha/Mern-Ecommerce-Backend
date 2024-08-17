const mongoose = require("mongoose");

const subscriberSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
});

const Subscribe = mongoose.model("Subscribe", subscriberSchema);

module.exports = Subscribe;
