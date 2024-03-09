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
            //console.log(req.user);
            const newComment = new Comment({
                text: req.body.text,
                author: req.user,
                post: req.body.postId
            });
            const savedComment = await newComment.save();
            // console.log(savedComment);
            res.status(201).json({ success: true, comment: savedComment });
        } catch (err) {
            console.log(err.message)
            return res.status(500).json({ errors: [{ msg: 'Server Error' }] });
        }
    });

// GET  | get comments on post | /api/comment/post/postId

router.get('/post/:postId', auth, async (req, res) => {
    try {
        // console.log(req.params)
        const postId = req.params.postId;
        const comments = await Comment.find({ post: postId }).sort({ createdAt: -1 });
        // console.log(comments);
        res.status(200).json(comments);
    } catch (err) {
        console.log(err.message);
    }
})

module.exports = router;
