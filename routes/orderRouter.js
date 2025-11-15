const express = require("express");
const {
  createOrderFromCart,
  getUserOrders,
} = require("../controllers/orderController");
const authMiddelware = require("../Middelware/authMiddelware");

const router = express.Router();

router.post("/Checkout/place", authMiddelware, createOrderFromCart);
router.get("/orders", authMiddelware, getUserOrders);

module.exports = router;
