const mongoose = require("mongoose");
const User = require("./models/user"); // Make sure the path is correct
const config = require("./config");

mongoose.set("strictQuery", false); // Address deprecation warning

mongoose
  .connect(config.mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(async () => {
    console.log("Connected to MongoDB!");

    try {
      const newUser = new User({
        fullName: { firstName: "Test2", lastName: "User2" },
        email: "test2@example.com",
        password: "password1234", // Hash in a real app
        username: "temporary_username", // Initial temporary username
      });

      const savedUser = await newUser.save();
      console.log("User saved:", savedUser);
    } catch (err) {
      console.error("Error saving user:", err);
    } finally {
      mongoose.disconnect(); // Close the connection when done
    }
  })
  .catch((err) => console.error("MongoDB connection error:", err));
