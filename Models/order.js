const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    items: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        variant: {
          size: String,
          newPrice: Number,
          oldPrice: Number,
        },
        quantity: {
          type: Number,
          required: true,
          default: 1,
        },
      },
    ],
    shippingAddress: {
      firstName: String,
      lastName: String,
      street: String,
      city: String,
      state: String,
      zip: String,
      country: String,
      phone: String,
      email: String,
    },
    paymentMethod: {
      type: String,
      enum: ["cod", "stripe", "razorpay"],
      required: true,
      default: "cod",
    },
    paymentStatus: {
      type: String,
      default: "pending",
    },
    orderStatus: {
      type: String,
      enum: ["processing", "shipped", "delivered", "cancelled"],
      default: "processing",
    },
    totalAmount: {
      type: Number,
      required: true,
    },
    deliveryFee: {
      type: Number,
      default: 40,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", orderSchema);
