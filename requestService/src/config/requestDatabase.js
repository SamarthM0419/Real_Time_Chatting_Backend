const mongoose = require("mongoose");

const connectRequestDb = async () => {
  try {
    await mongoose.connect(process.env.MONGO_REQUEST_URI);
    console.log("Request Database Connected");
  } catch (err) {
    console.log("Could not connect to Request Database", err.message);
  }
};

module.exports = connectRequestDb;