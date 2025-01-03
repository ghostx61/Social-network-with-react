var express = require("express");
var router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { check, validationResult } = require("express-validator");
require("dotenv").config();

const auth = require("../middleware/auth");
var User = require("../models/user");
const expiresIn = process.env.ENVIRONMENT === "dev" ? "30d" : "1h";
// console.log(expiresIn);

// //signup
// router.get("/signup", function (req, res) {
//     res.render("signup");
// });

// //login
// router.get("/login", function (req, res) {
//     res.render("login");
// });

// //GET |   get auth middleware(test)  |  /api/auth/guard
// router.get('/guard', auth, (req, res) => {
//     console.log(req.user);
//     res.send('guard page');
// })

//JWT generator
function generateJTW(user) {
  return new Promise((resolve, reject) => {
    const payload = {
      user: {
        id: user.id,
        username: user.username,
        name: user.fname + " " + user.lname,
        role: user.role,
      },
    };
    // console.log(expiresIn);
    jwt.sign(payload, process.env.JWTSECRET, { expiresIn }, (err, token) => {
      if (err) {
        reject(err);
      }
      resolve({ token: "Bearer " + token, ...payload.user });
    });
  });
}

//POST |   user signup  |  /api/auth/signup
router.post(
  "/signup",
  [
    check("fname", "Full name is required").exists(),
    check("lname", "Last name is required").exists(),
    check("username", "Username is required").exists(),
    check("email", "Enter a valid email address").isEmail(),
    check("password", "Enter a password with 6 or more characters").isLength({
      min: 6,
    }),
  ],
  async function (req, res) {
    // Validate request body
    const errors = validationResult(req);
    // console.log(req.body);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    //create new user
    const { email, username, password } = req.body;
    req.body.fname = textCapitalization(req.body.fname);
    req.body.lname = textCapitalization(req.body.lname);
    let user = new User(req.body);

    //check if email and username are unique
    const isEmailMatch = (await User.findOne({ email }).count()) > 0;
    if (isEmailMatch) {
      return res
        .status(400)
        .json({ errors: [{ msg: "Email already exists" }] });
    }
    const isUsernameMatch = (await User.findOne({ username }).count()) > 0;
    // console.log(isUsernameMatch);
    if (isUsernameMatch) {
      return res
        .status(400)
        .json({ errors: [{ msg: "Username already exists" }] });
    }

    //Encrypt password
    const salt = await bcrypt.genSalt(10); // generate salt
    user.password = await bcrypt.hash(password, salt);

    try {
      //Save user to database
      await user.save();
      //Generate token
      const tokenResponse = await generateJTW(user);
      res.status(201).json(tokenResponse);
    } catch (err) {
      console.log(err.message);
      return res.status(500).json({ errors: [{ msg: "Server Error" }] });
    }
  }
);

//POST |   Login User  |  /api/auth/login
router.post(
  "/login",
  [
    check("username", "Username is required").exists(),
    check("password", "Password is required").exists(),
  ],
  async (req, res) => {
    try {
      // Validate request body
      const errors = validationResult(req);
      // console.log(req.body);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      const { username, password } = req.body;

      //Check if user exists
      const user = await User.findOne({ username }).select(
        "username password fname lname role"
      );
      if (!user) {
        return res
          .status(400)
          .json({ errors: [{ msg: "Invalid Credentials" }] });
      }

      //Validate password
      const isPasswordMatch = await bcrypt.compare(password, user.password);
      if (!isPasswordMatch) {
        res.status(400).json({ errors: [{ msg: "Invalid Credentials" }] });
      }
      const tokenResponse = await generateJTW(user);
      //   console.log(tokenResponse);
      res.status(200).json(tokenResponse);
    } catch (err) {
      console.error(err.message);
      res.status(500).json({ errors: [{ msg: "Server Error" }] });
    }
  }
);

//user logout
router.get("/logout", function (req, res) {
  req.logout();
  res.redirect("/login");
});

//POST |  Authenticate user |  /api/auth/verify
router.get("/verify", auth, function (req, res) {
  res.status(200).json({ success: true, ...req.user });
});

function textCapitalization(text) {
  let newText = text.slice(0, 1).toUpperCase() + text.slice(1).toLowerCase();
  return newText;
}

module.exports = router;
