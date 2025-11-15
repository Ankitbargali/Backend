const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");

dotenv.config();
const app = express();
app.use(express.json());
app.use(cookieParser());

// CORS FIX
const allowedOrigins = [
  "http://localhost:5173",
  // "https://your-frontend-url.vercel.app",
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

// MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("Mongo connected"))
  .catch((err) => console.error("mongoDB connection error:", err));

app.get("/", (req, res) => {
  res.send("API is running");
});

// LOGIN FIX — add cookie flags
app.post("/api/users/login", async (req, res) => {
  const { loginId, password } = req.body;

  const existingUser1 = await user.findOne({
    $or: [{ userName: loginId }, { email: loginId }],
  });

  if (!existingUser1) {
    return res.status(400).json({ errlogin: "Something went wrong!!" });
  }

  const isMatch = await bcrypt.compare(password, existingUser1.password);
  if (!isMatch) {
    return res.status(400).json({ errlogin: "Something went wrong!" });
  }

  const token = jwt.sign({ id: existingUser1._id }, process.env.JWT_SECRET);

  res.cookie("token", token, {
    httpOnly: true,
    secure: true,
    sameSite: "none",
  });

  return res.json("Login Successful");
});

// Routes
const productroute = require("./routes/productRouter");
app.use("/api/products", productroute);

const userroute = require("./routes/userRouter");
app.use("/api", userroute);

const cartRoutes = require("./routes/cartRouter");
app.use("/api", cartRoutes);

const categoryroute = require("./routes/categoryRouter");
app.use("/api", categoryroute);

const wishlistRoute = require("./routes/wishlistRouter");
app.use("/api", wishlistRoute);

const orderroute = require("./routes/orderRouter");
app.use("/api", orderroute);

// PORT FIX
const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`server running on port ${port}`);
});
