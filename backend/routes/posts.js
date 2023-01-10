var express = require("express");
var router = express.Router();
const { check, validationResult } = require('express-validator');
//cloudinary config
var multer = require('multer');
const auth = require('../middleware/auth');
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

//new
// POST  | Create new post  | /api/post/new
router.get('/test',
    auth,
    async (req, res) => {
        try {
            const post = await Post.findById("63b6a20ca4b8b8b9bd59ea11")
                .populate('user');
            console.log(post)
            res.json(post);
        } catch (err) {
            console.log(err.message);
            return res.send('error');
        }
    });

// POST  | Create new post  | /api/post/new
router.post('/new', auth, async (req, res) => {
    console.log(req.body);
    console.log(req.user);
    try {
        const newPost = new Post({
            text: req.body.text,
            user: req.user.id
        });
        await newPost.save();
        return res.send('post saved');
    } catch (err) {
        console.error(err.message);
    }
    res.send('new post from /post');
})



//old
//add new post (post route)
router.post("/post", middleware.isLoggedIn, upload.single('image'), async function (req, res) {
    var currentUser = req.user;
    var author = {
        id: req.user._id,
        username: req.user.username
    }
    var newPost = {
        text: req.body.text,
        image: "",
        author: author
    }
    try {
        //add image if image file uploaded
        if (req.file) {
            var result = await cloudinary.v2.uploader.upload(req.file.path);
            newPost.image = result.secure_url;
            newPost.imageId = result.public_id
        }
        var post = await Post.create(newPost);
        currentUser.posts.push(post);
        await currentUser.save();
        res.redirect("back");
    } catch (err) {
        console.log(err);
        req.flash("error", err.message);
        res.redirect("back");
    }
});

//like button
router.get("/post/:postId/like", function (req, res) {
    Post.findById(req.params.postId, function (err, foundPost) {
        if (err) {
            console.log(err);
            req.flash("error", err.message);
            res.redirect("back");
        } else {
            foundPost.likes.push(req.user._id);
            foundPost.save(function (err, post) {
                if (err) {
                    console.log(err);
                    req.flash("error", err.message);
                    res.redirect("back");
                } else {
                    res.send({ postID: post._id });
                }
            });
        }
    });
});

router.get("/post/:postId/unlike", function (req, res) {
    Post.findById(req.params.postId, function (err, foundPost) {
        if (err) {
            console.log(err);
            req.flash("error", err.message);
            res.redirect("back");
        } else {
            var index = foundPost.likes.indexOf(req.user._id);
            foundPost.likes.splice(index, 1);
            foundPost.save(function (err) {
                if (err) {
                    console.log(err);
                    req.flash("error", err.message);
                    res.redirect("back");
                } else {
                    res.send({ postID: foundPost._id });
                }
            });
        }
    });
});

router.delete("/post/:postId", async function (req, res) {
    try {
        var post = await Post.findByIdAndDelete(req.params.postId);
        await Comment.deleteMany({ _id: { $in: post.comments } });
        if (post.image != '')
            await cloudinary.v2.uploader.destroy(post.imageId);
        res.redirect("back");
    } catch (err) {
        console.log(err);
        req.flash("error", err.message);
        res.redirect("back");
    }
});

module.exports = router;