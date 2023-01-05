var express = require("express");
var router = express.Router();
var passport = require("passport");
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { check, validationResult } = require('express-validator');

const auth = require('../middleware/auth');
var User = require("../models/user");


//signup
router.get("/signup", function (req, res) {
    res.render("signup");
});

//login
router.get("/login", function (req, res) {
    res.render("login");
});


//GET |   get auth middleware(test)  |  /api/auth/guard
router.get('/guard', auth, (req, res) => {
    console.log(req.user);
    res.send('guard page');
})

//POST |   user signup  |  /api/auth/signup
router.post("/signup", [
    check('fname', 'Full name is required').exists(),
    check('lname', 'Last name is required').exists(),
    check('username', 'Username is required').exists(),
    check('email', 'Enter a valid email address').isEmail(),
    check('password', 'Enter a password with 6 or more characters').isLength({ min: 6 })
], async function (req, res) {
    //old version
    // var user = {
    //     fname: req.body.fname,
    //     lname: req.body.lname,
    //     email: req.body.email,
    //     username: req.body.username
    // }
    // User.register(user, req.body.password, function (err, user) {
    //     if (err) {
    //         console.log(err);
    //         req.flash("error", err.message);
    //         return res.redirect("/signup");
    //     }
    //     passport.authenticate("local")(req, res, function () {
    //         res.redirect("/profile/" + req.user.username);
    //     });
    // });]

    //NEW VERSION

    // Validate request body
    const errors = validationResult(req);
    // console.log(req.body);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    //create new user
    const { email, username, password } = req.body;
    let user = new User(req.body);

    //check if email and username are unique
    const isEmailMatch = await User.findOne({ email }).count() > 0;
    if (isEmailMatch) {
        return res.status(400).json({ errors: [{ msg: 'Email already exists' }] })
    }
    const isUsernameMatch = await User.findOne({ username }).count() > 0;
    console.log(isUsernameMatch);
    if (isUsernameMatch) {
        return res.status(400).json({ errors: [{ msg: 'Username already exists' }] })
    }

    //Encrypt password
    const salt = await bcrypt.genSalt(10); // generate salt
    user.password = await bcrypt.hash(password, salt);

    try {
        //Save user to database
        await user.save();
        //Generate token
        const payload = {
            user: {
                id: user.id
            }
        }
        const expiresIn = process.env.JWTSECRET === 'dev' ? '3600000' : '3600';
        jwt.sign(
            payload,
            process.env.JWTSECRET,
            { expiresIn },
            (err, token) => {
                if (err) throw err;
                return res.status(201).json({ token });
            }
        );
    } catch (err) {
        console.log(err.message)
        return res.status(500).json({ errors: [{ msg: 'Server Error' }] });
    }
});

//user login
// router.post("/login", passport.authenticate("local", {
//     successRedirect: "/signup",
//     failureRedirect: "/",
//     failureFlash: true
// }), function (req, res) {
//     res.send('login success');
// });

//POST |   Login User  |  /api/auth/login
router.post('/login', [
    check('username', 'Username is required').exists(),
    check('password', 'Password is required').exists()
], async (req, res) => {
    try {
        // Validate request body
        const errors = validationResult(req);
        console.log(req.body);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const { username, password } = req.body;

        //Check if user exists
        const user = await User.findOne({ username }).select('username password');
        if (!user) {
            return res.status(400).json({ errors: [{ msg: 'Invalid Credentials' }] });
        }

        //Validate password
        const isPasswordMatch = await bcrypt.compare(password, user.password);
        if (!isPasswordMatch) {
            res.status(400).json({ errors: [{ msg: 'Invalid Credentials' }] });
        }

        //Generate token
        const payload = {
            user: {
                id: user.id
            }
        }
        const expiresIn = process.env.ENVIRONMENT === 'dev' ? '10h' : '1h';
        console.log(expiresIn);
        jwt.sign(
            payload,
            process.env.JWTSECRET,
            { expiresIn },
            (err, token) => {
                if (err) throw err;
                return res.status(200).json({ token });
            }
        );
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ errors: [{ msg: 'Server Error' }] });
    }
})

//user logout
router.get("/logout", function (req, res) {
    req.logout();
    res.redirect("/login");
});

module.exports = router;