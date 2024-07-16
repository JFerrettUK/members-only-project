const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const { body, validationResult } = require("express-validator");
const User = require("../models/user");
const passport = require("passport");

// Login (GET)
router.get("/login", (req, res, next) => {
  res.render("login", { title: "Login" });
});

// Login (POST)
router.post(
  "/login",
  passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/login", // Or display an error message
  })
);

// Signup (GET)
router.get("/signup", (req, res, next) => {
  res.render("signup", { title: "Sign Up" });
});

// Signup (POST)
router.post(
  "/signup",
  [
    // Validation rules
    body("username", "Email is not valid").isEmail().normalizeEmail(),
    body("password", "Password must be at least 5 characters long").isLength({
      min: 5,
    }),
    body("confirm_password").custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error("Passwords do not match");
      }
      return true;
    }),
  ],
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.render("signup", { title: "Sign Up", errors: errors.array() });
    }

    try {
      const hashedPassword = await bcrypt.hash(req.body.password, 10); // Hash password
      await User.create({
        username: req.body.username,
        password: hashedPassword,
      });
      res.redirect("/login");
    } catch (err) {
      return next(err); // Handle potential errors (e.g., duplicate usernames)
    }
  }
);

module.exports = router;
