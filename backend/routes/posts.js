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
// GET  | Get post by id  | /api/post/new
router.get('/:postId',
    auth,
    async (req, res) => {
        try {
            const post = await Post.findById(req.params.postId)
                .populate({
                    path: 'user',
                    select: 'username email'
                }).populate('comment');
            console.log(post)
            res.json(post);
        } catch (err) {
            console.log(err.message);
            return res.send({ errors: [{ msg: 'Server Error' }] });
        }
    });

// POST  | Create new post  | /api/post/new
router.post('/new', auth, upload.single('photo1'), async (req, res) => {
    // console.log(req.headers['content-type']);
    // console.log(req.file);
    try {
        let postBody = {
            user: req.user.id,
            text: req.body.text,
            type: 'text'
        };
        if (req.file) {
            // save image in cloudinary 
            const newImage = req.file.path;
            var result = await cloudinary.v2.uploader.upload(newImage);
            // console.log(result);
            //add image to body
            postBody.photo = result.secure_url;
            postBody.type = 'photo'
        }
        const newPost = new Post(postBody);
        await newPost.save();
        return res.json({ success: true });
    } catch (err) {
        console.error(err.message);
        return res.send({ errors: [{ msg: 'Server Error' }] });
    }
})

//GET  |   add like to post   |  /api/post/:postId/like
router.get("/:postId/like", auth, async function (req, res) {
    const userId = req.user.id;
    const postId = req.params.postId;

    try {
        // Find post
        let currPost = await Post.findById(postId);
        if (!currPost) {
            throw new Error('Post not found');
        }
        //check if like is unique
        const likeUnique = currPost.likes.includes(userId);
        // save if like is unique
        if (!likeUnique) {
            currPost.likes.push(userId);
            await currPost.save();
        }
        res.json({ success: true });
    } catch (err) {
        console.log(err.message);
        return res.send({ errors: [{ msg: 'Server Error' }] });
    }
});


//GET  |   add unlike to post   |  /api/post/:postId/unlike
router.get("/:postId/unlike", auth, async function (req, res) {
    const userId = req.user.id;
    const postId = req.params.postId;

    try {
        // Find post
        let currPost = await Post.findById(postId);
        if (!currPost) {
            throw new Error('Post not found');
        }
        var index = currPost.likes.indexOf(userId);
        if (index !== -1) {
            currPost.likes.splice(index, 1);
        }
        // console.log(currPost.likes);
        await currPost.save();
        res.json({ success: true });
    } catch (err) {
        console.log(err.message);
        return res.send({ errors: [{ msg: 'Server Error' }] });
    }
});

// //POST  |   add comment to post   |  /api/post/:postId/comment
// router.post('/:postId/comment', auth, async (req, res) => {
//     const postId = req.params.postId;
//     const user = req.user;
//     const text = req.body.comment || '';
//     try {
//         const newComment = await Comment.create({
//             text,
//             author: user.id,
//             post: postId
//         });
//         console.log(newComment);
//         res.json({ success: true });
//     } catch (err) {
//         console.log(err.message);
//     }
// })



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