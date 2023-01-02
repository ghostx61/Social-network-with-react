var express = require("express");
var router = express.Router();
//cloudinary config
var multer = require('multer');
var storage = multer.diskStorage({
    filename: function (req, file, callback) {
        callback(null, Date.now() + file.originalname);
    }
});
var imageFilter = function (req, file, cb) {
    // accept image files only
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/i)) {
        return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
};
var upload = multer({ storage: storage, fileFilter: imageFilter });

var cloudinary = require('cloudinary');
cloudinary.config({
    cloud_name: 'ghostx61',
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

var User = require("../models/user");
var Post = require("../models/post");
var Comment = require("../models/comment");
var middleware = require("../middleware");

//user posts
router.get("/profile/:username", middleware.isLoggedIn, function (req, res) {
    User.findOne({ username: req.params.username }).populate('posts').lean().exec(
        function (err, foundUser) {
            if (err && foundUser) {
                console.log(err);
                req.flash("error", err.message);
                res.redirect("back");
            } else {
                // follow status
                var status = false;
                for (let follow of req.user.follow) {
                    if (follow == foundUser._id)
                        status = true;
                }
                var posts = [];
                //post in order of time
                for (let i = foundUser.posts.length - 1; i >= 0; i--) {
                    posts.push(foundUser.posts[i]);
                }
                foundUser.posts = posts;

                //pagination
                var perPage = 6;
                var pageQuery = parseInt(req.query.page);
                var pageNumber = pageQuery ? pageQuery : 1;
                var userPostArr = [];
                var count = Math.ceil(foundUser.posts.length / perPage);
                if (foundUser.posts.length > 6) {
                    var loopIndex = ((pageNumber - 1) * 6);
                    for (let i = loopIndex; i <= loopIndex + 5; i++) {
                        if (!foundUser.posts[i])
                            break;
                        userPostArr.push(foundUser.posts[i]);
                    }
                    foundUser.posts = userPostArr;
                }
                const data = { user: foundUser, userId: req.user._id, following: status, User: req.user, current: pageNumber, pages: count };
                console.log(data);
                res.render("profile", data);
            }
        }
    );
});

//profile edit
router.get("/profile/:username/edit", middleware.profileOwnership, function (req, res) {
    User.findOne({ username: req.params.username }, function (err, user) {
        if (err) {
            console.log(err);
            req.flash("error", err.message);
            res.redirect("back");
        } else {
            res.render("profileEdit", { user: user, User: req.user });
        }
    });
});

//profile edit post
router.put("/profile/:username", upload.single('image'), function (req, res) {
    User.findOne({ username: req.params.username }, async function (err, newUser) {
        if (err) {
            console.log(err);
            req.flash("error", err.message);
            res.redirect("back");
        } else {
            if (req.file) {
                try {
                    if (newUser.imageId) {
                        await cloudinary.v2.uploader.destroy(newUser.imageId);
                    }
                    var result = await cloudinary.v2.uploader.upload(req.file.path);
                    newUser.image = result.secure_url;
                    newUser.imageId = result.public_id;
                }
                catch (err) {
                    console.log(err);
                    req.flash("error", err.message);
                    return res.redirect("back");
                }
            }
            newUser.fname = req.body.fname;
            newUser.lname = req.body.lname;
            newUser.email = req.body.email;
            newUser.bio = req.body.bio;
            newUser.address = req.body.address;
            newUser.dob = req.body.dob;
            newUser.save();
            res.redirect("/profile/" + req.params.username);
        }
    });
});

//account delete 
router.delete("/profile/:username", middleware.profileOwnership, async function (req, res) {
    try {
        var user = await User.findOne({ username: req.params.username }).populate('posts');
        var posts_id = [], comments_id = [], image_id = [];
        for (let post of user.posts) {
            posts_id.push(post._id);
            comments_id = comments_id.concat(post.comments);
            //image ids for cloudinary delete
            if (post.image != '')
                image_id.push(post.imageId);
        }
        //add user profile image as well 
        image_id.push(user.imageId);
        //delete images from cloudinary
        await cloudinary.v2.api.delete_resources(image_id);

        var followingUsers = await User.find({ _id: { $in: user.follow } });
        for (let u of followingUsers) {
            var index = u.followers.indexOf(user._id.toString());
            u.followers.splice(index, 1);
            await u.save();
        }

        var followerUsers = await User.find({ _id: { $in: user.followers } });
        for (let u of followerUsers) {
            var index = u.follow.indexOf(user._id.toString());
            u.follow.splice(index, 1);
            await u.save();
        }

        Promise.all([
            User.deleteOne({ username: user.username }),
            Post.deleteMany({ _id: { $in: posts_id } }),
            Comment.deleteMany({ _id: { $in: comments_id } })
        ]).then(function () {
            res.redirect("/login");
        });

    } catch (err) {
        console.log(err);
        req.flash("error", err.message);
        return res.redirect("back");
    }
});

module.exports = router;