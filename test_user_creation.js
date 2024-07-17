const mongoose = require("mongoose");
const User = require("./models/user"); // Make sure the path is correct
const config = require("./config");

mongoose
  .connect(config.mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(async () => {
    console.log("Connected to MongoDB!");
    try {
      const newUser = new User({
        fullName: { firstName: "Test", lastName: "User" },
        email: "test@example.com",
        password: "password123", // You'll want to hash this in a real app
      });

      const savedUser = await newUser.save();
      console.log("User saved:", savedUser);
    } catch (err) {
      console.error("Error saving user:", err);
    }
  })
  .catch((err) => console.error("MongoDB connection error:", err));
