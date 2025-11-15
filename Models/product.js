const mongoose = require("mongoose");

const ProductSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  description: { type: String, trim: true },
  brand: { type: String },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category",
    required: true,
  },
  subCategory: { type: String }, // Subcategory dynamically fetched
  specifications: [{ key: String, value: String }], // Key-value pair for specifications
  images: [{ type: String }], // Array of image URLs
  variants: [
    {
      size: { type: String, required: true }, // Size must match the category's sizeOptions
      oldPrice: { type: Number, required: true },
      newPrice: { type: Number, required: true },
      stock: { type: Number, required: true, default: 0 },
    },
  ],
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Product", ProductSchema);
