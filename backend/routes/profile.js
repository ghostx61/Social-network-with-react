var express = require("express");
var router = express.Router();
const mongoose = require("mongoose");
const { check, validationResult } = require("express-validator");
//cloudinary config
var multer = require("multer");
const { compressImage } = require("../helper/imageStorage");
const { deleteImage } = require("../helper/imageStorage");
const path = require("path");

// Middleware to parse JSON body with large payloads
router.use(express.json({ limit: "10mb" })); // Adjust the limit as needed

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

var cloudinary = require("cloudinary");
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

var User = require("../models/user");
var Post = require("../models/post");
var Comment = require("../models/comment");
var middleware = require("../middleware");
const auth = require("../middleware/auth");
const checkOwner = require("../middleware/checkOwner");
const populateLikeStatus = require("../helper/populateLikeStatus");

// GET  | get user profile and posts  | /api/profile/:username
router.get("/:username", auth, async (req, res) => {
  // console.log('user profile');
  try {
    let newQuery = User.findOne({ username: req.params.username });
    //select user fields
    if (req.query.select) {
      const filters = req.query.select.replace(/,/g, " ");
      newQuery = newQuery.select(filters);
    }
    //add posts
    if (req.query.posts) {
      newQuery = newQuery.populate({
        path: "post",
        options: {
          sort: { createdAt: -1 },
        },
      });
    }
    //add follow count
    if (req.query.followCount) {
      newQuery = newQuery.populate("following").populate("follower");
    }
    //execute query
    console.log(newQuery);
    let profileData = await newQuery.lean();
    if (!profileData) {
      return res.status(404).json({ errors: [{ msg: "Profile not found" }] });
    }
    //populate like status and count for post
    if (req.query.posts) {
      profileData.post = populateLikeStatus(profileData.post, req.user.id);
    }
    // add follow count
    if (req.query.followCount) {
      console.log(JSON.stringify(profileData, null, 2));
      profileData.followerCount = profileData.follower.length;
      profileData.isFollowing = profileData.follower.some(
        (el) => el.follower.toString() === req.user.id.toString()
      );
      profileData.followingCount = profileData.following.length;
      delete profileData.following;
      delete profileData.follower;
    }
    // console.log(profileData);
    res.json(profileData);
  } catch (err) {
    console.log(err.message);
    return res.send("profile error");
  }
});

// POST  | Create new post  | /api/profile/new
router.post("/new", auth, (req, res) => {
  res.send("new post");
});

// PUT | Edit user profile | /api/profile/edit
router.put(
  "/edit",
  auth,
  [
    check("fname", "Full name is required").isLength({ min: 1 }),
    check("lname", "Last name is required").isLength({ min: 1 }),
    check("username", "Username is required").isLength({ min: 1 }),
    check("email", "Enter a valid email address").isEmail(),
  ],
  async (req, res) => {
    try {
      // console.log(req.body);
      const errors = validationResult(req);
      // console.log(req.body);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      let updatedUser = {
        fname: req.body.fname,
        lname: req.body.lname,
        username: req.body.username,
        email: req.body.email,
      };
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
      res.status(500).json({ errors: [{ msg: "Server Error" }] });
    }
  }
);

// POST  | upload profile image  | /api/profile/img

router.post("/img", auth, upload.single("image"), async (req, res) => {
  try {
    // Check if the base64 string has the proper data URI prefix
    let base64String = req.body.newImage;
    const matches = base64String.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);

    if (!matches || matches.length !== 3) {
      throw new Error("Invalid input string");
    }

    // Extract the base64 data and decode it
    const buffer = Buffer.from(matches[2], "base64");
    const originalname = req.body.filename || "profile-image.jpg"; // Use a default filename if not provided

    // Compress and save image
    let compressedImagePath = await compressImage(buffer, originalname);
    compressedImagePath = `/uploads/${path.basename(compressedImagePath)}`;

    //save image url in database
    const updateQuery = {
      profileImg: compressedImagePath,
    };
    // await User.findByIdAndUpdate(req.user.id, updateQuery, { upsert: true });
    let userData = await User.findById(req.user.id).select("profileImg");
    if (!userData) {
      throw new Error("Cant find user data");
    }
    const prevProfileImgPath = userData.profileImg;
    userData.profileImg = compressedImagePath;
    await userData.save();

    // delete old image
    deleteImage(prevProfileImgPath);

    return res.json({ result: { imageUrl: compressedImagePath } });
  } catch (err) {
    console.log(err);
    // res.json()
  }
});

// router.post("/img", auth, upload.single("image"), async (req, res) => {
//   try {
//     // save image in cloudinary
//     const newImage = req.body.newImage;
//     //console.log(newImage);
//     // console.log(req.headers['content-type']);
//     var result = await cloudinary.v2.uploader.upload(newImage);
//     //save image url in database
//     const updateQuery = {
//       profileImg: result.secure_url,
//       profileImgId: result.public_id,
//     };
//     await User.findByIdAndUpdate(req.user.id, updateQuery, { upsert: true });
//     // console.log(result);
//     return res.json({ result: result });
//   } catch (err) {
//     console.log(err);
//     // res.json()
//   }
// });

// DELETE  | delete profile  | /api/profile
router.delete("/", auth, async (req, res) => {
  let session;
  try {
    //start mongodb session
    session = await mongoose.startSession();
    session.startTransaction();

    // delete user
    const deletedUser = await User.findByIdAndDelete(req.user.id, { session });

    //if user not found, end session
    if (!deletedUser) {
      // console.log('User not found.');
      await session.abortTransaction();
      session.endSession();
      return;
    }

    // Delete the user's profile image from Cloudinary
    if (deletedUser.profileImgId) {
      await cloudinary.uploader.destroy(deletedUser.profileImgId);
    }

    // Retrieve and delete user's posts
    const userPosts = await Post.find(
      { user: req.user.id },
      { _id: 1, photoId: 1 },
      { session }
    );

    for (const post of userPosts) {
      // Delete post's associated image from Cloudinary
      await cloudinary.uploader.destroy(post.photoId);
      // Delete post's comments
      await Comment.deleteMany({ post: post._id }, { session });
      // Delete the post itself
      await Post.findByIdAndDelete(post._id, { session });
    }

    // If all queries are executed successfully, commit changes
    await session.commitTransaction();
    // console.log('User and their posts deleted.');
    res.status(201).json({ success: true });
  } catch (err) {
    console.error("Error deleting user and posts:", err);
    await session.abortTransaction();
    res.status(400).json({ errors: err.message });
  } finally {
    session.endSession();
  }
});

module.exports = router;
