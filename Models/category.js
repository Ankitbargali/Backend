const mongoose = require("mongoose");

const CategorySchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  subcategories: [{ type: String }], // Store subcategories as an array
  sizes: [{ type: String }], // Dynamic sizes (e.g., S/M/L for clothing, 128GB/256GB for phones)
});

module.exports = mongoose.model("Category", CategorySchema);
