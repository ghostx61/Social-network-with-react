var express = require("express");
var router = express.Router();
var passport = require("passport");
var User = require("../models/user");


//signup
router.get("/signup", function (req, res) {
    res.render("signup");
});

//login
router.get("/login", function (req, res) {
    res.render("login");
});


//user signup
router.post("/signup", function (req, res) {
    var user = {
        fname: req.body.fname,
        lname: req.body.lname,
        email: req.body.email,
        username: req.body.username
    }
    User.register(user, req.body.password, function (err, user) {
        if (err) {
            console.log(err);
            req.flash("error", err.message);
            return res.redirect("/signup");
        }
        passport.authenticate("local")(req, res, function () {
            res.redirect("/profile/" + req.user.username);
        });
    });
});

//user login
// router.post("/login", passport.authenticate("local", {
//     successRedirect: "/signup",
//     failureRedirect: "/",
//     failureFlash: true
// }), function (req, res) {
//     res.send('login success');
// });
router.post('/login', (req, res) => {
    console.log(req.body);
    res.status(201).json({ success: true });
})

//user logout
router.get("/logout", function (req, res) {
    req.logout();
    res.redirect("/login");
});

module.exports = router;