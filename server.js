const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const User = require("./Models/users");

dotenv.config();
const app = express();

app.use(express.json());
app.use(cookieParser());

// -------- CORS FIX --------
const allowedOrigins = [
  "http://localhost:5173",
  "https://e-comm-frontend-taupe.vercel.app",
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) callback(null, true);
      else {
        console.log("❌ CORS Blocked:", origin);
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

// -------- MONGO --------
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("Mongo connected"))
  .catch((err) => console.error("mongoDB connection error:", err));

app.get("/", (req, res) => res.send("API running"));

// -------- LOGIN FIX --------
app.post("/api/users/login", async (req, res) => {
  const { loginId, password } = req.body;

  const existingUser1 = await User.findOne({
    $or: [{ userName: loginId }, { email: loginId }],
  });

  if (!existingUser1)
    return res.status(400).json({ errlogin: "Invalid login credentials!" });

  const isMatch = await bcrypt.compare(password, existingUser1.password);
  if (!isMatch)
    return res.status(400).json({ errlogin: "Invalid login credentials!" });

  const token = jwt.sign({ id: existingUser1._id }, process.env.JWT_SECRET);

  res.cookie("token", token, {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    path: "/",
  });

  res.json({ message: "Login Successful" });
});

// -------- ROUTES --------
app.use("/api/products", require("./routes/productRouter"));
app.use("/api", require("./routes/userRouter"));
app.use("/api", require("./routes/cartRouter"));
app.use("/api", require("./routes/categoryRouter"));
app.use("/api", require("./routes/wishlistRouter"));
app.use("/api", require("./routes/orderRouter"));

// -------- SERVER --------
const port = process.env.PORT || 5000;
app.listen(port, () => console.log(`Server running on ${port}`));
