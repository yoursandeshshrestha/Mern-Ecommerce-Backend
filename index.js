const express = require("express");
const app = express();
require("dotenv").config();
const cors = require("cors");
const cookieParser = require("cookie-parser");
const PORT = process.env.PORT || 5000;
require("./config/database.js");
const userRoutes = require("./Routes/userRoutes");
const productRoutes = require("./Routes/productRoutes");
const verifyRoutes = require("./Routes/verifyRoutes");
const {
  notFoundRoutes,
  errorHandler,
} = require("./middleware/erroMiddleware.js");

app.use(cors());
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static("uploads"));

app.use("/api/users", userRoutes);
app.use("/api/products", productRoutes);
app.use("/api", verifyRoutes);

app.use(notFoundRoutes);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server is running on PORT: ${PORT}`);
});
