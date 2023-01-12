var express = require("express");
var router = express.Router();
const { check, validationResult } = require('express-validator');

var User = require("../models/user");
var Post = require("../models/post");
var Comment = require("../models/comment");
var middleware = require("../middleware");
const auth = require('../middleware/auth');


///////NEW code
// POST  | Create new comment  | /api/comment
router.post('/',
    auth,
    [check('text', 'Comment text is required').exists(),
    check('postId', 'Invalid Input').exists()
    ],
    async (req, res) => {
        try {
            console.log(req.body);
            const newComment = new Comment({
                text: req.body.text,
                author: req.user.id,
                post: req.body.postId
            });
            await newComment.save()
            res.status(201).json({ success: true });
        } catch (err) {
            console.log(err.message)
            return res.status(500).json({ errors: [{ msg: 'Server Error' }] });
        }
    });

// GET  | get comments on post | /api/comment/:id

router.get('/:id', auth, (req, res) => {
    res.send(req.params.id);
})






///;////////OLD
router.get("/post/:postId/comments", middleware.isLoggedIn, function (req, res) {
    Post.findById(req.params.postId).populate('comments').exec(function (err, newPost) {
        if (err) {
            console.log(err);
            req.flash("error", err.message);
            res.redirect("back");
        } else {
            User.findById(newPost.author.id, function (err, user) {
                var pic = user.image;
                res.render("comment", { post: newPost, User: req.user, pic: pic });
            });
        }
    });
});

router.post("/post/:postId/comment", function (req, res) {
    Post.findById(req.params.postId, function (err, post) {
        if (err) {
            console.log(err);
            req.flash("error", err.message);
            res.redirect("back");
        } else {
            Comment.create(req.body.comment, function (err, comment) {
                if (err) {
                    console.log(err);
                    req.flash("error", err.message);
                    res.redirect("back");
                } else {
                    comment.author.id = req.user._id;
                    comment.author.username = req.user.username;
                    comment.save();
                    post.comments.push(comment);
                    post.save();
                    res.redirect("/post/" + post._id + "/comments");
                }
            });
        }

    });
});

module.exports = router;
