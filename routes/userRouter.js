const express = require("express");
const users = require("../Models/users");
const router = express.Router();
const authMiddelware = require("../Middelware/authMiddelware");

router.get("/user", authMiddelware, async (req, res) => {
  try {
    const user = await users
      .findById(req.user.id)
      .populate("cart.product")
      .populate("wishlist.product");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ user });
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({ message: "Server error" });
  }
});

router.put("/user/address", authMiddelware, async (req, res) => {
  try {
    const userId = req.user.id;
    const { firstName, lastName, street, city, state, zip, country, phone } =
      req.body;

    const user = await users.findById(userId);

    const newAddress = {
      firstName,
      lastName,
      street,
      city,
      state,
      zip,
      country,
      phone,
    };

    const isSameAddress =
      JSON.stringify(user.address || {}) === JSON.stringify(newAddress);

    if (isSameAddress) {
      return res.status(200).json({
        message: "Same address already exists. No changes made.",
        user,
      });
    }

    // Update address if different
    user.address = newAddress;
    const updatedUser = await user.save();

    res.status(200).json({ message: "Address updated", user: updatedUser });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

module.exports = router;
