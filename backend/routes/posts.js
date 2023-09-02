var express = require("express");
var router = express.Router();
const mongoose = require('mongoose');
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
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

var User = require("../models/user");
var Post = require("../models/post");
var Comment = require("../models/comment");
var middleware = require("../middleware");

//new

//GET  |   get user's following post   |  /api/post/follow
router.get("/follow", auth, async function (req, res) {
    try {
        const userId = req.user.id;

        // get user's following list
        const newUser = await User.findById(userId).select('_id').populate('following');
        if (!newUser) {
            res.status(200).json({ posts: [] })
        }
        const followingList = newUser.following.map(el => el.following);

        // get posts of all following list users and sort posts
        const allPosts = await Post.find({
            user: { $in: followingList }
        }).populate({
            path: 'user',
            select: 'fname lname username profileImg'
        }).populate({
            path: 'comment',
            options: { sort: { createdAt: -1 } }
        }
        ).sort({ createdAt: -1 }).lean();

        //add likes and comment counts to posts
        for (let post of allPosts) {
            post.likesCount = post.likes.length
            post.commentsCount = post.comment.length
            post.isPostLiked = post.likes.some(el => el._id.toString() === userId.toString());
        }
        //console.log(newUser);
        res.status(200).json({ posts: allPosts });
    } catch (err) {
        console.log(err.message);
    }

});

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
            console.log(result);
            //add image to body
            postBody.photo = result.secure_url;
            postBody.type = 'photo'
            postBody.photoId = result.public_id;
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

//Delete  |   delete post   |  /api/post/:postId
router.delete("/:postId", auth, async function (req, res) {
    try {
        //start mongodb session
        session = await mongoose.startSession();
        session.startTransaction();

        // find post by postId and userid and delete
        const deletedPost = await Post.findOneAndDelete({
            _id: req.params.postId,
            user: req.user.id
        }, { session })
        console.log(deletedPost);

        //if user not found, end session
        if (!deletedPost) {
            await session.abortTransaction();
            session.endSession();
            throw new Error('Post not found');
        }

        // delete image for cloudinary
        await cloudinary.v2.uploader.destroy(deletedPost.photoId);

        // delete post's comments
        await Comment.deleteMany({ post: deletedPost._id }, { session });

        // If all queries are executed successfully, commit changes
        await session.commitTransaction();

        // return success message
        res.status(201).json({ success: true });

    } catch (err) {
        console.log(err.message);
        await session.abortTransaction();
        res.status(404).json({ error: err.message });
    } finally {
        session.endSession();
    }
});


module.exports = router;