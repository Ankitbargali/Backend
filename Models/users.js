const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  userName: {
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
  address: {
    street: String,
    city: String,
    state: String,
    zip: String,
    country: String,
  },
  phone: {
    type: String,
  },
  role: {
    type: String,
    enum: ["customer", "admin"],
    default: "customer",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  cart: [
    {
      product: { type: mongoose.Schema.Types.ObjectId, ref: "Product" }, // Reference to the Product
      variant: {
        size: String, // Selected size (Example: "M" or "128GB")
        newPrice: Number, // Price of the selected variant
        oldPrice: Number,
      },
      quantity: { type: Number, default: 1 },
    },
  ],
  wishlist: [
    {
      product: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
      variant: {
        size: String,
        newPrice: Number,
        oldPrice: Number,
      },
    },
  ],
  address: {
    firstName: String,
    lastName: String,
    street: String,
    city: String,
    state: String,
    zip: String,
    country: String,
    phone: String,
  },
});

module.exports = mongoose.model("user", userSchema);
