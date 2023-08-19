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




//OLD code
// router.get("/", middleware.isLoggedIn, function (req, res) {
//     var currentUser = req.user;
//     //lean()- convert mongoose document to plain js object 
//     User.find({ _id: { $in: currentUser.follow } }).populate("posts").lean()
//         .exec(function (err, users) {
//             var postArray = [];
//             for (let user of users) {
//                 for (let post of user.posts) {
//                     post.profilePic = user.image;
//                 }
//                 postArray = postArray.concat(user.posts);
//             }
//             //sort post by time
//             postArray.sort(function (a, b) {
//                 return b.createdAt.getTime() - a.createdAt.getTime();
//             });
//             //pagination
//             var perPage = 6;
//             var pageQuery = parseInt(req.query.page);
//             var pageNumber = pageQuery ? pageQuery : 1;
//             var postArr = [];
//             var count = Math.ceil(postArray.length / perPage);
//             if (postArray.length > 6) {
//                 var loopIndex = ((pageNumber - 1) * 6);
//                 for (let i = loopIndex; i <= loopIndex + 5; i++) {
//                     if (!postArray[i])
//                         break;
//                     postArr.push(postArray[i]);
//                 }
//             } else {
//                 postArr = postArray;
//             }
//             res.render("index", { posts: postArr, userId: currentUser._id, User: req.user, page: "index", current: pageNumber, pages: count });
//         });
// });

// router.get("/findFriends", middleware.isLoggedIn, function (req, res) {
//     var result = 0;
//     if (req.query.search) {
//         //search
//         const regex = new RegExp(escapeRegex(req.query.search), 'gi');
//         User.find({
//             $and: [
//                 { _id: { $ne: req.user._id } },
//                 {
//                     $or: [
//                         { fname: regex, }, { lname: regex }, { username: regex }
//                     ]
//                 },
//             ]
//         }, function (err, allusers) {
//             if (err) {
//                 console.log(err);
//                 req.flash("error", err.message);
//                 res.redirect("back");
//             } else {
//                 if (allusers.length < 1) {
//                     result = 1;
//                 }
//                 res.render("users", { allusers: allusers, User: req.user, result: result, page: "users" });
//             }
//         });
//     }
//     else {
//         let allusers = [];
//         result = 2;
//         res.render("users", { allusers: allusers, User: req.user, result: result, page: "users" });
//     }
// });

// router.post("/follow/:id", middleware.isLoggedIn, function (req, res) {
//     User.findById(req.params.id, function (err, followingUser) {
//         if (err) {
//             console.log(err);
//             req.flash("error", err.message);
//             return res.redirect("back");
//         }
//         // following user's ID in follower user
//         followingUser.followers.push(mongoose.Types.ObjectId(req.user._id));
//         followingUser.save();
//         // follower user's ID in following user
//         req.user.follow.push(mongoose.Types.ObjectId(req.params.id));
//         req.user.save(function (err) {
//             if (err) {
//                 console.log(err);
//                 req.flash("error", err.message);
//                 res.redirect("back");
//             } else {
//                 res.redirect("back");
//             }
//         });
//     });

// });

// router.post("/unfollow/:id", middleware.isLoggedIn, function (req, res) {
//     User.findById(req.params.id, function (err, followingUser) {
//         var index = followingUser.followers.indexOf(req.user._id);
//         followingUser.followers.splice(index, 1);
//         followingUser.save();
//         var index = req.user.follow.indexOf(req.params.id);
//         req.user.follow.splice(index, 1);
//         req.user.save(function (err) {
//             if (err) {
//                 console.log(err);
//                 req.flash("error", err.message);
//                 res.redirect("back");
//             } else {
//                 res.redirect("back");
//             }
//         });
//     });
// });


// //for search
// function escapeRegex(text) {
//     return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
// };

module.exports = router;
