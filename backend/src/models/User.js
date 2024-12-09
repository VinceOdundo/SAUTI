const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please provide name"],
      minlength: 3,
      maxlength: 50,
    },
    email: {
      type: String,
      required: [true, "Please provide email"],
      unique: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Please provide valid email"],
    },
    password: {
      type: String,
      required: [true, "Please provide password"],
      minlength: 6,
    },
    role: {
      type: String,
      enum: ["user", "admin", "representative"],
      default: "user",
    },
    county: {
      type: String,
      required: false,
    },
    constituency: {
      type: String,
      required: false,
    },
    ward: {
      type: String,
      required: false,
    },
    yob: {
      type: Number,
      required: false,
      min: 1900,
      max: new Date().getFullYear(),
    },
    phone: {
      type: String,
      required: false,
      match: [/^\+254\d{9}$/, "Please provide valid Kenyan phone number"],
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    verificationToken: String,
    avatar: {
      type: String,
      default: "default-avatar.png",
    },
    phoneVerified: {
      type: Boolean,
      default: false,
    },
    phoneOTP: {
      code: String,
      expiresAt: Date,
    },
  },
  { timestamps: true }
);

userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model("User", userSchema);
