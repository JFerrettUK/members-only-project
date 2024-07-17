// auth.js
const express = require("express");
const router = express.Router();
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
    failureRedirect: "/login",
  })
);

module.exports = router; // Only export login routes
