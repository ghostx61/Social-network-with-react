var express = require("express");
var router = express.Router();
const { check, validationResult } = require('express-validator');
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
const auth = require('../middleware/auth');
const checkOwner = require('../middleware/checkOwner');

// GET  | get user profile and posts  | /api/profile/:username
router.get("/:username", auth, async (req, res) => {
    try {
        console.log(req.query);
        let profileData;
        if (req.query.posts && req.query.posts === 'true') {
            profileData = await User.findOne({ username: req.params.username })
                .populate('post');
        } else {
            profileData = await User.findOne({ username: req.params.username });
        }
        if (!profileData) {
            return res.status(404).json({ errors: [{ msg: 'Profile not found' }] })
        }
        // console.log(profileData);
        res.json(profileData);
    } catch (err) {
        console.log(err.message);
        return res.send('profile error');
    }
});

// POST  | Create new post  | /api/profile/new
router.post('/new', auth, (req, res) => {
    res.send('new post');
})

// PUT | Edit user profile | /api/profile/edit
router.put('/edit',
    auth,
    [check('fname', 'Full name is required').isLength({ min: 1 }),
    check('lname', 'Last name is required').isLength({ min: 1 }),
    check('username', 'Username is required').isLength({ min: 1 }),
    check('email', 'Enter a valid email address').isEmail()],
    async (req, res) => {
        try {
            console.log(req.body);
            const errors = validationResult(req);
            // console.log(req.body);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }
            let updatedUser = {
                fname: req.body.fname,
                lname: req.body.lname,
                username: req.body.username,
                email: req.body.email
            }
            if (req.body.bio) {
                updatedUser.bio = req.body.bio;
            }
            if (req.body.dob) {
                updatedUser.dob = req.body.dob;
            }
            await User.findByIdAndUpdate(req.user.id, updatedUser);
            res.status(201).json({ success: true });
        } catch (err) {
            console.error(err.message);
            res.status(500).json({ errors: [{ msg: 'Server Error' }] });
        }
    })

// POST  | upload profile image  | /api/profile/img

router.post('/img', auth, upload.single('image'), async (req, res) => {
    try {
        // save image in cloudinary 
        const newImage = req.body.newImage;
        var result = await cloudinary.v2.uploader.upload(newImage);
        //save image url in database
        const updateQuery = { profileImg: result.secure_url };
        await User.findByIdAndUpdate(req.user.id, updateQuery, { upsert: true });
        // console.log(result);
        return res.json({ result: result });
    } catch (err) {
        console.log(err);
        // res.json()
    }
});

// router.get("/profile/:username", middleware.isLoggedIn, function (req, res) {
//     User.findOne({ username: req.params.username }).populate('posts').lean().exec(
//         function (err, foundUser) {
//             if (err && foundUser) {
//                 console.log(err);
//                 req.flash("error", err.message);
//                 res.redirect("back");
//             } else {
//                 // follow status
//                 var status = false;
//                 for (let follow of req.user.follow) {
//                     if (follow == foundUser._id)
//                         status = true;
//                 }
//                 var posts = [];
//                 //post in order of time
//                 for (let i = foundUser.posts.length - 1; i >= 0; i--) {
//                     posts.push(foundUser.posts[i]);
//                 }
//                 foundUser.posts = posts;

//                 //pagination
//                 var perPage = 6;
//                 var pageQuery = parseInt(req.query.page);
//                 var pageNumber = pageQuery ? pageQuery : 1;
//                 var userPostArr = [];
//                 var count = Math.ceil(foundUser.posts.length / perPage);
//                 if (foundUser.posts.length > 6) {
//                     var loopIndex = ((pageNumber - 1) * 6);
//                     for (let i = loopIndex; i <= loopIndex + 5; i++) {
//                         if (!foundUser.posts[i])
//                             break;
//                         userPostArr.push(foundUser.posts[i]);
//                     }
//                     foundUser.posts = userPostArr;
//                 }
//                 const data = { user: foundUser, userId: req.user._id, following: status, User: req.user, current: pageNumber, pages: count };
//                 console.log(data);
//                 res.render("profile", data);
//             }
//         }
//     );
// });

//profile edit
// router.get("/profile/:username/edit", middleware.profileOwnership, function (req, res) {
//     User.findOne({ username: req.params.username }, function (err, user) {
//         if (err) {
//             console.log(err);
//             req.flash("error", err.message);
//             res.redirect("back");
//         } else {
//             res.render("profileEdit", { user: user, User: req.user });
//         }
//     });
// });

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