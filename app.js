const express = require("express");
const path = require("path");
const createError = require("http-errors");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const bcrypt = require("bcryptjs");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const mongoose = require("mongoose");
const config = require("./config");
const User = require("./models/user");

const app = express();

// Connect to MongoDB
mongoose.set("strictQuery", false);
mongoose
  .connect(config.mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("Connected to MongoDB successfully!"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Now require the routes after app is initialized
const indexRouter = require("./routes/index");
const signupRouter = require("./routes/signup");
const loginRouter = require("./routes/login");
const joinRouter = require("./routes/join");
const authRouter = require("./routes/auth");

// View engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");

// Session configuration with MongoDB session store
app.use(
  session({
    secret: config.secret,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: config.mongoURI,
      ttl: 14 * 24 * 60 * 60, // = 14 days. Default
      autoRemove: "interval",
      autoRemoveInterval: 10, // In minutes. Default
    }),
  })
);

// Middleware to log session data (for debugging)
app.use(
  (req, res, next) => {
    console.log("Request URL:", req.url); // Log the current URL
    console.log("Session Data (before):", req.session); // Log session data
    next(); // Continue to the next middleware or route handler
  },
  (req, res, next) => {
    console.log("Session Data (after):", req.session); // Log session data again
    next();
  }
);

app.use(passport.initialize());
app.use(passport.session());
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

// Passport configuration
passport.use(
  new LocalStrategy(
    { usernameField: "email" }, // Use 'email' instead of 'username'
    async (email, password, done) => {
      try {
        const user = await User.findOne({ email });
        if (!user) return done(null, false, { message: "Incorrect email" });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch)
          return done(null, false, { message: "Incorrect password" });
        return done(null, user);
      } catch (err) {
        return done(err);
      }
    }
  )
);

passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err);
  }
});

// Routes
app.use("/", indexRouter);
app.use("/signup", signupRouter);
app.use("/login", loginRouter);
app.use("/join", joinRouter);
app.use("/auth", authRouter);

// Error handling
app.use((req, res, next) => next(createError(404)));
app.use((err, req, res, next) => {
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};
  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;
