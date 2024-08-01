const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const { body, validationResult } = require("express-validator");
const User = require("../models/user");

// GET signup form
router.get("/", (req, res) => {
  // Initialize data object in the session if it doesn't exist
  req.session.signupData = req.session.signupData || {}; // <-- Add this line

  // Render the signup form with the data from the session
  delete req.session.signupErrors; // Clear errors here
  res.render("signup", {
    title: "Sign Up - Members Only",
    data: req.session.signupData || {},
    errors: req.session.signupErrors,
  });
  delete req.session.signupData; // Delete data AFTER rendering
});
// POST signup form data
router.post(
  "/",
  [
    // Validation rules
    body("firstName").trim().notEmpty().withMessage("First Name is required"),
    body("lastName").trim().notEmpty().withMessage("Last Name is required"),
    body("email")
      .isEmail()
      .normalizeEmail()
      .withMessage("Email is not valid")
      .custom(async (value) => {
        const existingUser = await User.findOne({ email: value.toLowerCase() });
        if (existingUser) {
          throw new Error("Email already in use");
        }
      }),
    body("password")
      .isLength({ min: 5 })
      .withMessage("Password must be at least 5 characters long"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);

      if (!errors.isEmpty()) {
        req.session.signupErrors = errors.array();
        req.session.signupData = req.body;
        return res.redirect("/signup");
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

      await newUser.save(); // Directly save, no manual connection check needed
      res.redirect("/login"); // Redirect after successful signup
    } catch (err) {
      // Unified error handling
      console.error("Error in signup:", err); // Log the error for debugging
      req.session.signupErrors = [
        { msg: "Error during signup. Please try again." },
      ];
      return res.redirect("/signup");
    }
  }
);

module.exports = router;
