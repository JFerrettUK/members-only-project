// signup.js
const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const { body, validationResult } = require("express-validator");
const User = require("../models/user");

// GET signup form
router.get("/", (req, res, next) => {
  res.render("signup", { title: "Sign Up - Members Only" });
});

// POST signup form data
router.post(
  "/",
  [
    // Validation rules
    body("email", "Email is not valid").isEmail().normalizeEmail(),
    body("password", "Password must be at least 5 characters long").isLength({
      min: 5,
    }),
    body("confirmPassword").custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error("Passwords do not match");
      }
      return true;
    }),
  ],
  async (req, res, next) => {
    try {
      console.log("Form data:", req.body); // Log the form data

      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.render("signup", {
          title: "Sign Up - Members Only",
          errors: errors.array(),
        });
      }

      const existingUser = await User.findOne({ email: req.body.email });
      if (existingUser) {
        console.error("Email already in use");
        return res.render("signup", {
          title: "Sign Up - Members Only",
          errors: [{ msg: "Email already in use" }],
        });
      }

      const hashedPassword = await bcrypt.hash(req.body.password, 10);
      await User.create({
        fullName: {
          firstName: req.body.firstName,
          lastName: req.body.lastName,
        },
        email: req.body.email,
        password: hashedPassword,
      })
        .then(() => {
          // Add .then() to handle successful user creation
          console.log("User created successfully!");
          res.redirect("/login");
        })
        .catch((err) => {
          // Add .catch() to handle promise rejections (e.g., validation errors)
          if (err.code === 11000) {
            // Check for duplicate key (email) error
            console.error("Email already in use:", err);
            return res.render("signup", {
              title: "Sign Up - Members Only",
              errors: [{ msg: "Email already in use" }],
            });
          } else {
            console.error("Error creating user:", err);
            return res.render("signup", {
              title: "Sign Up - Members Only",
              errors: [{ msg: "Error during signup. Please try again." }], // More generic error message
            });
          }
        });
    } catch (err) {
      // This catch block handles other unexpected errors
      console.error("Error in signup route:", err);
      res.status(500).send("Internal Server Error");
    }
  }
);

module.exports = router;
