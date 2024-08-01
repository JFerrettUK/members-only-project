const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  fullName: {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
  },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  membershipStatus: {
    type: String,
    enum: ["member", "non-member"],
    default: "non-member",
  },
  isAdmin: { type: Boolean, default: false },
  username: { type: String, required: true, unique: true },
});

userSchema.pre("validate", async function (next) {
  // Changed hook to 'validate'
  if (!this.username) {
    let uniqueUsername = this.fullName.firstName + this.fullName.lastName;
    let counter = 1;

    while (await this.constructor.findOne({ username: uniqueUsername })) {
      uniqueUsername = `${this.fullName.firstName}${this.fullName.lastName}${counter}`;
      counter++;
    }

    this.username = uniqueUsername;
  }
  next();
});

module.exports = mongoose.model("User", userSchema);
