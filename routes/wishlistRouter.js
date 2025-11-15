const express = require("express");
const users = require("../Models/users");
const Product = require("../Models/product");
const authMiddelware = require("../Middelware/authMiddelware");
const router = express.Router();

router.post("/wishlist/update", authMiddelware, async (req, res) => {
  try {
    const { productId, variant } = req.body;

    const user = await users.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const index = user.wishlist.findIndex(
      (item) =>
        item.product.toString() === productId &&
        item.variant.size === variant.size
    );
    if (index > -1) {
      // If product exists in wishlist, remove it
      user.wishlist.splice(index, 1);
      await user.save();
      return res
        .status(200)
        .json({ message: "Removed from wishlist", wishlist: user.wishlist });
    } else {
      // Else, add to wishlist
      user.wishlist.push({ product: productId, variant });
      await user.save();
      return res
        .status(200)
        .json({ message: "Added to wishlist", wishlist: user.wishlist });
    }
  } catch (error) {
    console.error("Toggle Wishlist Error:", error);
    res.status(500).json({ message: "Server Error" });
  }
});

router.get("/wishlist", authMiddelware, async (req, res) => {
  try {
    const user = await users.findById(req.user.id).populate("wishlist.product");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ wishlist: user.wishlist });
  } catch (error) {
    console.error("Error fetching wishlist:", error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
