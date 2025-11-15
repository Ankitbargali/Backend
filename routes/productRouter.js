const express = require("express");
const Product = require("../Models/product");
const multer = require("multer");
const path = require("path");
const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const product = await Product.find();
    res.json({ product });
  } catch (error) {
    res.status(500).json({ message: error.messages });
  }
});

// Multer Storage Config
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/images/uploads"); // Ensure this folder exists
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + "-" + file.originalname);
  },
});

// Multer Upload Middleware
const upload = multer({ storage });

// Add Product Route
router.post("/add", upload.array("images", 5), async (req, res) => {
  try {
    const { name, description, brand, category, subcategory } = req.body;

    // Check for required fields
    if (!name || !description || !category) {
      return res.status(400).json({ message: "Missing required fields!!." });
    }

    // Handle Images
    const imagePaths = req.files.map(
      (file) => `http://localhost:5000/images/uploads/${file.filename}`
    );

    // Parse JSON fields
    const specifications = req.body.specifications
      ? JSON.parse(req.body.specifications)
      : [];
    const variants = req.body.variants ? JSON.parse(req.body.variants) : [];

    // Create Product
    const newProduct = new Product({
      name,
      description,
      brand: brand || "", // Default empty string if not provided
      category,
      subcategory: subcategory || "",
      images: imagePaths,
      specifications,
      variants,
    });

    await newProduct.save();
    res
      .status(201)
      .json({ message: "Product added successfully", product: newProduct });
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
