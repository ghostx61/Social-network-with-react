var express = require("express");
var router = express.Router();

var User = require("../models/user");
const Follow = require('../models/follow');
const auth = require('../middleware/auth');
const { check, validationResult } = require('express-validator');
// var middleware = require("../middleware");


// GET  | get all users  | /api/user
router.get("/search", auth, async (req, res) => {
    try {
        const userId = req.user.id;
        let selectedFields = '';
        let searchQuery = {};

        searchQuery = { _id: { $ne: userId } }

        // add search term to query
        if (req.query.searchTerm) {
            const searchTerm = req.query.searchTerm;
            // console.log(searchTerm);
            const regex = new RegExp(searchTerm, 'i'); // 'i' flag for case-insensitive matching
            searchQuery = {
                ...searchQuery,
                $or: [
                    { fname: regex },
                    { lname: regex },
                    { username: regex }
                ]
            }
        }


        let newQuery = User.find(searchQuery);

        //select user fields
        if (req.query.select) {
            selectedFields = req.query.select.replace(/,/g, ' ');
            newQuery = newQuery.select(selectedFields);
        }
        console.log(userId);
        newQuery = newQuery.populate(
            {
                path: 'follower',
                match: { follower: userId }
            }
        );

        if (req.query.isFollower) {
            newQuery.populate(
                {
                    path: 'following',
                    match: { following: userId }
                }
            )
        }

        const users = await newQuery.lean();
        // console.log(JSON.stringify(users, null, 4));
        let updatedUsers = [];
        if (req.query.isFollowing) {
            for (let user of users) {
                if (user.follower.length > 0) {
                    user.isFollowing = true;
                    delete user.follower;
                    updatedUsers.push(user);
                }
            }
        } else if (req.query.isFollower) {
            for (let user of users) {
                if (user.following.length > 0) {
                    user.isFollowing = user.follower.length > 0;
                    delete user.follower;
                    delete user.following;
                    updatedUsers.push(user);
                }
            }
        } else {
            for (let user of users) {
                user.isFollowing = user.follower.length > 0;
                delete user.follower;
                updatedUsers.push(user);
            }
        }
        res.json({ users: updatedUsers });
    } catch (err) {
        console.log(err.message);
        res.status(401).json({ err })
    }
});


// POST  | follow user  | /api/user/follow
router.post("/follow", auth, [check('followingUserId', 'user id is required').exists()], async (req, res) => {
    try {
        //validate body
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const followerId = req.user.id;
        const followingId = req.body.followingUserId;
        console.log({ followerId, followingId });

        // Handle the case of duplicate relationship
        const isExisting = await Follow.findOne({ following: followingId, follower: followerId });
        console.log(isExisting);
        if (isExisting) {
            console.log('Duplicate follow relationship found.');
        } else {
            //Save the relationship
            const follow = new Follow({
                following: followingId,
                follower: followerId
            });
            await follow.save();
        }
        res.status(201).json({ success: true });
    } catch (err) {
        console.log(err.message);
        res.status(400).json({ error: 'not found' });
    }
});

// POST  | unfollow user  | /api/user/unfollow
router.post("/unfollow", auth, [check('unfollowingUserId', 'user id is required').exists()], async (req, res) => {
    try {
        // validate body
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const followerId = req.user.id;
        const followingId = req.body.unfollowingUserId;
        // console.log({ followingId, followerId });

        // delete following relationship
        await Follow.findOneAndDelete({
            following: followingId,
            follower: followerId
        })
        res.status(201).json({ success: true });
    } catch (err) {
        console.log(err.message);
        res.status(400).json({ err });
    }
});

module.exports = router;
