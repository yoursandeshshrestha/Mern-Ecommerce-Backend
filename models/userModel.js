const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    accountType: {
      type: String,
      required: true,
      enum: ["Customer", "Seller"],
      default: "Customer",
    },
    cartDetails: [
      {
        productName: {
          type: String,
        },
        price: {
          mrp: {
            type: Number,
          },
          cost: {
            type: Number,
          },
          discountPercent: {
            type: Number,
          },
        },
        subcategory: {
          type: String,
        },
        productImage: {
          type: String,
        },
        category: {
          type: String,
        },
        description: {
          type: String,
        },
        tagline: {
          type: String,
        },
        quantity: {
          type: Number,
        },
      },
    ],
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
    shopName: {
      type: String,
      required: function () {
        return this.accountType === "Seller";
      },
      unique: function () {
        return this.accountType === "Seller";
      },
    },
  },
  {
    timestamps: true,
  }
);

userSchema.pre("save", function (next) {
  if (this.accountType === "Seller") {
    this.cartDetails = undefined;
    this.shippingData = undefined;
  }
  next();
});

const userModel = mongoose.model("User", userSchema);

module.exports = userModel;
