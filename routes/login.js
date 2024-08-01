// routes/login.js
const express = require("express");
const router = express.Router();
const passport = require("passport");

// GET login form
router.get("/", function (req, res, next) {
  // Pass any error query parameters to the template
  res.render("login", {
    title: "Login - Members Only",
    error: req.query.error, // This will be 'true' if login failed
  });
});

// POST login form data (using Passport.js)
router.post("/", (req, res, next) => {
  passport.authenticate("local", (err, user, info) => {
    if (err) {
      return next(err); // Handle unexpected errors
    }
    if (!user) {
      return res.redirect("/login?error=true"); // Redirect with error on failure
    }
    req.logIn(user, (err) => {
      if (err) {
        return next(err);
      }
      return res.redirect("/"); // Redirect to home page on success
    });
  })(req, res, next);
});

module.exports = router;
