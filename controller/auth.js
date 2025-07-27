const User = require("../model/User");
const { check, validationResult } = require("express-validator");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const bcrypt = require("bcryptjs");
exports.postSignUp = [
  check("firstName")
    .trim()
    .isLength({ min: 2 })
    .withMessage("First name should be at least 2 characters long")
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage("First name should contain only letters and spaces"),

  check("lastName")
    .trim()
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage("Last name should contain only letters and spaces"),

  check("email")
    .isEmail()
    .withMessage("Please enter a valid email")
    .normalizeEmail(),

  check("password")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters")
    .matches(/[a-z]/)
    .withMessage("Password must include lowercase")
    .matches(/[A-Z]/)
    .withMessage("Password must include uppercase")
    .matches(/[0-9]/)
    .withMessage("Password must include number"),

  check("confirmPassword").custom((value, { req }) => {
    if (value !== req.body.password) {
      throw new Error("Passwords do not match");
    }
    return true;
  }),

  check("userType")
    .notEmpty()
    .isIn(["user", "host"])
    .withMessage("Invalid user type"),

  async (req, res, next) => {
    let cart = [];
    const { firstName, lastName, email, password, userType } = req.body;
    console.log(req.body);

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array().map((e) => e.msg) });
    }
    try {
      const hashedPassword = await bcrypt.hash(password, 12);
      console.log(req.body);
      const user = new User({
        firstName,
        lastName,
        email,
        password: hashedPassword,
        userType,
        cart,
      });
      req.session.isLoggedIn = false;
      const isLoggedIn = req.session.isLoggedIn;
      await user.save();
      res.status(201).json({ user, isLoggedIn: isLoggedIn });
    } catch (error) {
      res.status().json({ error });
    }
  },
];

exports.postLogin = async (req, res, next) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ errors: ["User does not exist."] });
    }
    const userCart = user.cart || [];
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ errors: ["Incorrect password."] });
    }

    // Set session data
    req.session.isLoggedIn = true;
    req.session.user = {
      _id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      userType: user.userType,
    };

    return res.status(200).json({
      user: req.session.user,
      isLoggedIn: req.session.isLoggedIn,
      redirectTo: user.userType === "user" ? "/products" : "/host/products",
      cart: userCart,
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ errors: ["Internal server error."] });
  }
};

// Respond with user info and redirect path

exports.postLogout = (req, res, next) => {
  req.session.destroy((err) => {
    if (err) {
      console.log("Error occured ", err);
    }
    console.log("logging out ");
    return res.status(200).json({ message: "Logout successfull !" });
  });
};
