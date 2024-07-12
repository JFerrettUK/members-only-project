// ----- CORE MODULES & SETUP -----
const createError = require("http-errors"); // Factory for creating HTTP error objects
const express = require("express"); // Fast, unopinionated web framework for Node.js
const path = require("path"); // Utilities for working with file and directory paths
const cookieParser = require("cookie-parser"); // Parses Cookie header and populates `req.cookies`
const logger = require("morgan"); // HTTP request logger middleware for development

// ----- ROUTE HANDLERS -----
const indexRouter = require("./routes/index"); // Import routes for the root path ('/')
const loginRouter = require("./routes/login"); // Import routes for user-related actions ('/users')
const signupRouter = require("./routes/signup"); // Import routes for user-related actions ('/users')

const app = express(); // Create the Express application
const config = require("./config");

// ----- VIEW ENGINE -----
app.set("views", path.join(__dirname, "views")); // Specify the directory containing view templates
app.set("view engine", "pug"); // Register the Pug view engine

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
