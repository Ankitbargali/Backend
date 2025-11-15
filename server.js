const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const productModel = require("./Models/product");
const user = require("./Models/users");
const upload = require("./multer");
const bcrypt = require("bcrypt");
var jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");

dotenv.config();
const allowedOrigins = ["http://localhost:5173", "http://localhost:5174"];
const app = express();
app.use(express.json());
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
app.use(cookieParser());

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("Mongo connected"))
  .catch((err) => console.error("mongoDB connection error:", err));

app.get("/", (req, res) => {
  res.send("API is running");
});

app.use("/images", express.static("public/images"));

app.post("/api/users/createUser", async (req, res) => {
  const { userName, email, password } = req.body;

  const existingUser = await user.findOne({ userName });
  if (existingUser) {
    return res.status(400).json({ errUsername: " Uername already exists! " });
  }
  const existingEmail = await user.findOne({ email });
  if (existingEmail) {
    return res.status(400).json({ errEmails: " Account already exists! " });
  }

  const salt = await bcrypt.genSalt(10);
  const encryptedPassword = await bcrypt.hash(password, salt);

  const createUser = await user.create({
    userName: userName,
    email: email,
    password: encryptedPassword,
  });
  res.send(createUser);
});

app.post("/api/users/login", async (req, res) => {
  const { loginId, password } = req.body;

  // checking the user through username or email
  const existingUser1 = await user.findOne({
    $or: [{ userName: loginId }, { email: loginId }],
  });

  if (!existingUser1) {
    return res.status(400).json({ errlogin: "Something went wrong!!" });
  }

  const isMatch = await bcrypt.compare(password, existingUser1.password); // used to compare the user send password and the password that is stored in the backend in encrypted form
  if (!isMatch) {
    return res.status(400).json({ errlogin: "Something went wrong!" });
  }

  var token = jwt.sign({ id: existingUser1._id }, process.env.JWT_SECRET);
  res.cookie("token", token);
  console.log(token);
  return res.json("Login Successful");
});

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

const port = process.env.port || 5000;
app.listen(port, () => {
  console.log(`server running on port ${port}`);
});
