const express = require("express");
const path = require("path");
const createError = require("http-errors");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const bcrypt = require("bcryptjs");
const session = require("express-session");
const passport = require("passport");
const mongoose = require("mongoose");
const LocalStrategy = require("passport-local").Strategy;
const Schema = mongoose.Schema;
const config = require("./config");

mongoose
  .set("strictQuery", false)
  .connect(config.mongoURI) // Use the mongoURI from your config file
  .then(() => {
    console.log("Connected to MongoDB successfully!");
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
  });

const db = mongoose.connection; // Get the connection object
db.on("error", console.error.bind(console, "MongoDB connection error:")); // Error handling
const User = mongoose.model(
  "User",
  new Schema({
    username: { type: String, required: true },
    password: { type: String, required: true },
  })
);

// ----- ROUTE HANDLERS -----
const indexRouter = require("./routes/index");
const loginRouter = require("./routes/login");
const signupRouter = require("./routes/signup");
const joinRouter = require("./routes/join");

const app = express();

// ----- VIEW ENGINE -----
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");

// ----- MIDDLEWARE -----
app.use(logger("dev")); // Use the 'morgan' logger in development mode (colored, detailed logs)
app.use(express.json()); // Parses incoming requests with JSON payloads
app.use(express.urlencoded({ extended: false })); // Parses incoming requests with URL-encoded payloads
app.use(cookieParser()); // Parses cookies and populates `req.cookies`
app.use(express.static(path.join(__dirname, "public"))); // Serve static files (CSS, images, etc.) from the 'public' folder

// ----- ROUTING -----
app.use("/", indexRouter);
app.use("/login", loginRouter);
app.use("/signup", signupRouter);
app.use("/join", joinRouter);

// ----- 404 ERROR HANDLING -----
app.use(function (req, res, next) {
  next(createError(404));
});

// ----- GENERAL ERROR HANDLING -----
app.use(function (err, req, res, next) {
  // Set locals, only providing error in development environment
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // Render the error page
  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;
