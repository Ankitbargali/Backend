const Order = require("../Models/order.js");
const User = require("../Models/users.js");

const createOrderFromCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      firstName,
      lastName,
      email,
      phone,
      street,
      city,
      state,
      zip,
      country,
      paymentMethod,
    } = req.body;

    const user = await User.findById(userId).populate("cart.product");

    if (!user || user.cart.length === 0) {
      return res
        .status(400)
        .json({ message: "Cart is empty or user not found" });
    }

    const deliveryFee = 40;

    const items = user.cart.map((item) => ({
      product: item.product._id,
      variant: item.variant,
      quantity: item.quantity,
    }));

    const subtotal = user.cart.reduce(
      (acc, item) => acc + item.variant.newPrice * item.quantity,
      0
    );

    const totalAmount = subtotal + deliveryFee;

    const newOrder = new Order({
      user: userId,
      items,
      shippingAddress: {
        firstName,
        lastName,
        email,
        phone,
        street,
        city,
        state,
        zip,
        country,
      },
      paymentMethod,
      paymentStatus: paymentMethod === "cod" ? "pending" : "unpaid",
      totalAmount,
      deliveryFee,
    });

    await newOrder.save();

    //  Clear cart after order placed
    user.cart = [];
    await user.save();

    res.status(201).json({
      message: "Order placed successfully",
      order: newOrder,
    });
  } catch (error) {
    console.error("Order creation error:", error);
    res.status(500).json({ message: "Server error while placing order" });
  }
};

const getUserOrders = async (req, res) => {
  try {
    const userId = req.user.id;

    const orders = await Order.find({ user: userId })
      .populate("items.product") // Populate product details in each order
      .sort({ createdAt: -1 }); // Most recent first

    res.status(200).json({ orders });
  } catch (error) {
    console.error("Error fetching user orders:", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = { createOrderFromCart, getUserOrders };
