// signup.js
const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const { body, validationResult } = require("express-validator");
const User = require("../models/user");
const mongoose = require("mongoose"); // Import mongoose here

// GET signup form
router.get("/", (req, res, next) => {
  // Render the signup form with any previous input data (if available)
  res.render("signup", {
    title: "Sign Up - Members Only",
    data: req.session.signupData || {}, // Load data from session or use an empty object
    errors: req.session.signupErrors, // Load any stored errors
  });

  // Clear the signup data and errors from the session after rendering
  delete req.session.signupData;
  delete req.session.signupErrors;
});

// POST signup form data
router.post(
  "/",
  [
    // Validation rules
    body("firstName").trim().notEmpty().withMessage("First Name is required"),
    body("lastName").trim().notEmpty().withMessage("Last Name is required"),
    body("email").isEmail().normalizeEmail().withMessage("Email is not valid"),
    body("password")
      .isLength({ min: 5 })
      .withMessage("Password must be at least 5 characters long"),
  ],
  async (req, res, next) => {
    try {
      delete req.session.signupErrors;
      req.session.signupErrors = [];

      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        // Store the form data and errors in the session for re-rendering
        req.session.signupData = req.body;
        req.session.signupErrors = errors.array();
        return res.redirect("/signup");
      }

      const existingUser = await User.findOne({
        email: req.body.email.toLowerCase(),
      });
      if (existingUser) {
        req.session.signupData = req.body;
        req.session.signupErrors = [{ msg: "Email already in use" }]; // Only set this error message
        return res.redirect("/signup"); // Redirect with error
      }

      const hashedPassword = await bcrypt.hash(req.body.password, 10);

      const newUser = new User({
        fullName: {
          firstName: req.body.firstName,
          lastName: req.body.lastName,
        },
        email: req.body.email,
        password: hashedPassword,
      });

      try {
        // Check if Mongoose connection is ready
        if (mongoose.connection.readyState !== 1) {
          throw new Error("MongoDB connection not ready");
        }

        // Save the new user
        await newUser.save();
        res.redirect("/login");
      } catch (err) {
        // Handle errors during user creation
        if (err.name === "ValidationError") {
          // Store form data and validation errors in the session
          req.session.signupData = req.body;
          req.session.signupErrors = Object.values(err.errors).map((error) => ({
            msg: error.message,
          }));
        } else if (err.code === 11000) {
          // Check for duplicate key error
          req.session.signupErrors = [{ msg: "Email already in use" }];
        } else {
          console.error("Error saving user:", err);
          req.session.signupErrors = [
            { msg: "Error during signup. Please try again." },
          ];
        }

        return res.redirect("/signup");
      }
    } catch (err) {
      // Handle other unexpected errors
      console.error("Unexpected error in signup route:", err);
      res.status(500).send("Internal Server Error");
    }
  }
);

module.exports = router;
