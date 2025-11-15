const express = require("express");
const Product = require("../Models/product");
const router = express.Router();

// USE MULTER FROM YOUR multer.js FILE
const upload = require("../multer");

// Get all products
router.get("/", async (req, res) => {
  try {
    const product = await Product.find();
    res.json({ product });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Add Product Route
router.post("/add", upload.array("images", 5), async (req, res) => {
  try {
    const { name, description, brand, category, subcategory } = req.body;

    if (!name || !description || !category) {
      return res.status(400).json({ message: "Missing required fields!!" });
    }

    // CLOUDINARY URLs (file.path)
    const imagePaths = req.files.map((file) => file.path);

    // Parse JSON fields
    const specifications = req.body.specifications
      ? JSON.parse(req.body.specifications)
      : [];

    const variants = req.body.variants ? JSON.parse(req.body.variants) : [];

    const newProduct = new Product({
      name,
      description,
      brand: brand || "",
      category,
      subcategory: subcategory || "",
      images: imagePaths, // Cloudinary URLs
      specifications,
      variants,
    });

    await newProduct.save();

    res.status(201).json({
      message: "Product added successfully",
      product: newProduct,
    });
  } catch (error) {
    console.error("Error adding product:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// Get 10 random products
router.get("/random", async (req, res) => {
  try {
    const products = await Product.aggregate([{ $sample: { size: 10 } }]);
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: "Error fetching random products" });
  }
});

module.exports = router;
