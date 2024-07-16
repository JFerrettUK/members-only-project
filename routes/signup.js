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
    console.log("Form data:", req.body); // Log the form data

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.render("signup", {
        title: "Sign Up - Members Only",
        errors: errors.array(),
      });
    }

    try {
      const hashedPassword = await bcrypt.hash(req.body.password, 10);
      await User.create({
        firstName: req.body.firstName, // Add fields as per your User model
        lastName: req.body.lastName,
        email: req.body.email,
        password: hashedPassword,
        // ... other fields as needed
      });
      res.redirect("/login"); // Redirect to login after successful signup
    } catch (err) {
      return next(err); // Handle potential errors (e.g., duplicate email)
    }
  }
);

module.exports = router;
