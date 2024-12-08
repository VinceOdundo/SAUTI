const { body } = require("express-validator");

exports.registerValidator = [
  body("name")
    .trim()
    .isLength({ min: 3 })
    .withMessage("Name must be at least 3 characters"),
  body("email").isEmail().withMessage("Please provide valid email"),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters"),
];

exports.loginValidator = [
  body("email").isEmail().withMessage("Please provide valid email"),
  body("password").notEmpty().withMessage("Password is required"),
];
