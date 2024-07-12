const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  fullName: {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
  },
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  membershipStatus: {
    type: String,
    enum: ["member", "non-member"],
    default: "non-member",
  },
  isAdmin: { type: Boolean, default: false },
});

module.exports = mongoose.model("User", userSchema);
