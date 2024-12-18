var express = require("express");
var router = express.Router();
const mongoose = require("mongoose");
const { check, validationResult } = require("express-validator");
var multer = require("multer");
const fs = require("fs");
const path = require("path");
const auth = require("../middleware/auth");
const sharp = require("sharp");
const { compressImage } = require("../helper/imageStorage");
const { deleteImage } = require("../helper/imageStorage");
//cloudinary config
// var storage = multer.diskStorage({
//   filename: function (req, file, callback) {
//     callback(null, Date.now() + file.originalname);
//   },
// });
// var imageFilter = function (req, file, cb) {
//   // accept image files only
//   if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/i)) {
//     return cb(new Error("Only image files are allowed!"), false);
//   }
//   cb(null, true);
// };
// var upload = multer({ storage: storage, fileFilter: imageFilter });

var cloudinary = require("cloudinary");
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Set up multer storage configuration
const storage = multer.memoryStorage();

// Set up multer file filter to accept only images
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("File type not allowed"), false);
  }
};

const upload = multer({ storage, fileFilter });

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
    const newUser = await User.findById(userId)
      .select("_id")
      .populate("following");
    if (!newUser) {
      res.status(200).json({ posts: [] });
    }
    const followingList = newUser.following.map((el) => el.following);

    //get count of all posts
    const totalPostCount = await Post.countDocuments({
      user: { $in: followingList },
    });
    // get posts of all following list users and sort posts
    const pageSize = req.query.pageSize; // Number of posts to load per page

    let newQuery = Post.find({
      user: { $in: followingList },
    });

    //if page size is sent, do pagination
    const pageNo = parseInt(req.query.pageNo) || 1; // Get the current page from the request query parameters
    let totalPageCount = 1;
    if (pageSize) {
      const skip = (pageNo - 1) * pageSize; // Calculate the number of posts to skip
      totalPageCount = Math.ceil(totalPostCount / pageSize);
      newQuery = newQuery.skip(skip).limit(pageSize);
    }

    const allPosts = await newQuery
      .populate({
        path: "user",
        select: "fname lname username profileImg",
      })
      .populate({
        path: "comment",
        options: { sort: { createdAt: -1 } },
      })
      .sort({ createdAt: -1 })
      .lean();

    // let allPosts = await Post.find({
    //     user: { $in: followingList }
    // }).skip(skip)
    // .limit(pageSize)
    // .populate({
    //     path: 'user',
    //     select: 'fname lname username profileImg'
    // }).populate({
    //     path: 'comment',
    //     options: { sort: { createdAt: -1 } }
    // }).sort({ createdAt: -1 }).lean();

    // add likes and comment counts to posts
    for (let post of allPosts) {
      post.likesCount = post.likes.length;
      post.commentsCount = post.comment.length;
      post.isPostLiked = post.likes.some(
        (el) => el._id.toString() === userId.toString()
      );
    }
    // console.log(newUser);
    console.log("request sent");
    res.status(200).json({
      totalPostCount,
      postsLength: allPosts.length,
      pageNo,
      totalPageCount,
      posts: allPosts,
    });
  } catch (err) {
    console.log(err.message);
  }
});

// GET  | Get post by id  | /api/post/new
router.get("/:postId", auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId)
      .populate({
        path: "user",
        select: "username email",
      })
      .populate("comment");
    // console.log(post)
    res.json(post);
  } catch (err) {
    console.log(err.message);
    return res.send({ errors: [{ msg: "Server Error" }] });
  }
});

// // POST  | Create new post  | /api/post/new
// router.post("/new", auth, upload.single("photo1"), async (req, res) => {
//   // console.log(req.headers['content-type']);
//   // console.log(req.file);
//   try {
//     let postBody = {
//       user: req.user.id,
//       text: req.body.text,
//       type: "text",
//     };
//     if (req.file) {
//       // save image in cloudinary
//       const newImage = req.file.path;
//       var result = await cloudinary.v2.uploader.upload(newImage);
//       // console.log(result);
//       //add image to body
//       postBody.photo = result.secure_url;
//       postBody.type = "photo";
//       postBody.photoId = result.public_id;
//     }
//     const newPost = new Post(postBody);
//     await newPost.save();
//     return res.json({ success: true });
//   } catch (err) {
//     console.error(err.message);
//     return res.send({ errors: [{ msg: "Server Error" }] });
//   }
// });

// POST  | Create new post  | /api/post/new2
router.post("/new", auth, upload.single("photo1"), async (req, res) => {
  try {
    let postBody = {
      user: req.user.id,
      text: req.body.text,
      type: "text",
    };

    if (req.file) {
      // Compress and save image
      const compressedImagePath = await compressImage(
        req.file.buffer,
        req.file.originalname
      );

      // Add image details to postBody
      postBody.photo = `/uploads/${path.basename(compressedImagePath)}`;
      postBody.type = "photo";
    }

    const newPost = new Post(postBody);
    // console.log(newPost);
    await newPost.save();
    return res.json({ success: true, imageUrl: postBody.photo });
  } catch (err) {
    console.error(err.message);
    return res.status(500).send({ errors: [{ msg: "Server Error" }] });
  }
});

//Delete  |   delete post   |  /api/post/:postId
router.delete("/:postId", auth, async function (req, res) {
  try {
    //start mongodb session
    session = await mongoose.startSession();
    session.startTransaction();

    // find post by postId and userid and delete
    const deletedPost = await Post.findOneAndDelete(
      {
        _id: req.params.postId,
        user: req.user.id,
      },
      { session }
    );
    // console.log(deletedPost);

    //if user not found, end session
    if (!deletedPost) {
      await session.abortTransaction();
      session.endSession();
      throw new Error("Post not found");
    }

    // Delete image from local storage if it exists
    if (deletedPost.photo) {
      deleteImage(deletedPost.photo);
    }

    // // delete image for cloudinary
    // await cloudinary.v2.uploader.destroy(deletedPost.photoId);

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

//Delete  |   delete post   |  /api/post/:postId
// router.delete("/:postId", auth, async function (req, res) {
//   try {
//     //start mongodb session
//     session = await mongoose.startSession();
//     session.startTransaction();

//     // find post by postId and userid and delete
//     const deletedPost = await Post.findOneAndDelete(
//       {
//         _id: req.params.postId,
//         user: req.user.id,
//       },
//       { session }
//     );
//     // console.log(deletedPost);

//     //if user not found, end session
//     if (!deletedPost) {
//       await session.abortTransaction();
//       session.endSession();
//       throw new Error("Post not found");
//     }

//     // delete image for cloudinary
//     await cloudinary.v2.uploader.destroy(deletedPost.photoId);

//     // delete post's comments
//     await Comment.deleteMany({ post: deletedPost._id }, { session });

//     // If all queries are executed successfully, commit changes
//     await session.commitTransaction();

//     // return success message
//     res.status(201).json({ success: true });
//   } catch (err) {
//     console.log(err.message);
//     await session.abortTransaction();
//     res.status(404).json({ error: err.message });
//   } finally {
//     session.endSession();
//   }
// });

//GET  |   add like to post   |  /api/post/:postId/like
router.get("/:postId/like", auth, async function (req, res) {
  const userId = req.user.id;
  const postId = req.params.postId;

  try {
    // Find post
    let currPost = await Post.findById(postId);
    if (!currPost) {
      throw new Error("Post not found");
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
    return res.send({ errors: [{ msg: "Server Error" }] });
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
      throw new Error("Post not found");
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
    return res.send({ errors: [{ msg: "Server Error" }] });
  }
});

module.exports = router;
