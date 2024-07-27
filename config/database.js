const mongoose = require("mongoose");

mongoose
  .connect(process.env.DATABASE_CONNECTION)
  .then(() => {
    console.log(`Database Connected`);
  })
  .catch((error) => {
    console.log("Database", error);
    process.exit(1);
  });

module.exports = mongoose.connection;
