const express = require("express");
const users = require("../Models/users");
const Product = require("../Models/product");
const authMiddelware = require("../Middelware/authMiddelware");
const router = express.Router();

router.post("/cart/add", authMiddelware, async (req, res) => {
  const { productId, variant, quantity } = req.body;
  try {
    const user = await users.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    if (!user.cart) {
      user.cart = [];
    } // Ensure cart is initialized

    const itemIndex = user.cart.findIndex(
      (item) =>
        item.product &&
        item.product.equals(productId) &&
        item.variant.size === variant.size
    );

    if (itemIndex > -1) {
      user.cart[itemIndex].quantity += quantity; // Increase quantity if variant already exists
    } else {
      user.cart.push({ product: productId, variant, quantity });
    }

    await user.save();
    res.status(200).json(user.cart);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/cart", authMiddelware, async (req, res) => {
  try {
    const userId = req.user.id; //  Extract the user ID properly

    if (!userId) {
      return res
        .status(401)
        .json({ message: "Unauthorized: No user ID found" });
    }

    const user = await users.findById(userId).populate({
      path: "cart.product",
      model: "Product", // Match the model name from `mongoose.model()`
    });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(user.cart);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.patch("/cart/update", authMiddelware, async (req, res) => {
  const { productId, quantity, size } = req.body;
  const userId = req.user.id;
  console.log(req.body);

  try {
    const user = await users.findById(userId).populate({
      path: "cart.product",
      model: "Product",
    });

    // Find the item in the cart
    const itemIndex = user.cart.findIndex(
      (item) =>
        item.product &&
        item.product._id.toString() === productId &&
        item.variant.size === size
    );

    if (itemIndex > -1) {
      if (quantity > 0) {
        user.cart[itemIndex].quantity = quantity; // Update quantity
      } else {
        user.cart.splice(itemIndex, 1); // Remove item if quantity is 0
      }
    } else {
      return res.status(404).json({ error: "Item not found in cart" });
    }

    await user.save();

    // Send updated cart
    const updatedUser = await users.findById(userId).populate({
      path: "cart.product",
      model: "Product",
    });

    res.status(200).json(updatedUser.cart);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete("/cart/remove", authMiddelware, async (req, res) => {
  const { productId, size } = req.body; // Receive product ID and size
  const userId = req.user.id;

  if (!productId || !size) {
    return res.status(400).json({ error: "Product ID and size are required" });
  }

  try {
    const user = await users.findById(userId).populate("cart.product");

    // Find index of the item in cart
    const itemIndex = user.cart.findIndex(
      (item) =>
        item.product &&
        item.product._id.toString() === productId &&
        item.variant.size === size
    );

    if (itemIndex > -1) {
      user.cart.splice(itemIndex, 1); // Remove item from cart
      await user.save();

      const updatedUser = await users.findById(userId).populate("cart.product");
      return res.status(200).json(updatedUser.cart);
    } else {
      return res.status(404).json({ error: "Item not found in cart" });
    }
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

module.exports = router;
