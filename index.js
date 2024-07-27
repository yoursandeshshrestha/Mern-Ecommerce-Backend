const express = require("express");
const app = express();
require("dotenv").config();
const cors = require("cors");
const cookieParser = require("cookie-parser");
const PORT = process.env.PORT || 5000;
require("./config/database.js");
const userRoutes = require("./Routes/userRoutes");
const productRoutes = require("./Routes/productRoutes");
const {
  notFoundRoutes,
  errorHandler,
} = require("./middleware/erroMiddleware.js");

if (!process.env.PORT) {
  console.warn(
    "Warning: PORT environment variable is not set. Defaulting to 5000."
  );
}

app.use(cors());
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/users", userRoutes);
app.use("/api/products", productRoutes);

app.use(notFoundRoutes);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server is running on PORT: ${PORT}`);
});
