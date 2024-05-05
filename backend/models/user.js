var mongoose = require("mongoose");
var passportLocalMongoose = require("passport-local-mongoose");
var UserSchema = new mongoose.Schema(
  {
    fname: {
      type: String,
      required: true,
    },
    lname: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    profileImg: {
      type: String,
    },
    profileImgId: String,
    dob: Date,
    bio: String,
    address: String,
    username: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      select: false,
      required: true,
    },
    createdAt: { type: Date, default: Date.now },
    // posts: [
    //     {
    //         type: mongoose.Schema.Types.ObjectId,
    //         ref: "Post"
    //     }
    // ],
    // following: [
    //     {
    //         type: mongoose.Schema.Types.ObjectId,
    //         ref: 'User'
    //     }
    // ],
    // followers: [
    //     {
    //         type: mongoose.Schema.Types.ObjectId,
    //         ref: 'User'
    //     }
    // ]
  },
  {
    toJSON: { virtuals: true }, // for reverse populate
    toObject: { virtuals: true }, // for reverse populate
  }
);

// populate viruals (reverse populate)
UserSchema.virtual("post", {
  ref: "Post",
  localField: "_id",
  foreignField: "user",
});
UserSchema.virtual("following", {
  ref: "Follow",
  localField: "_id",
  foreignField: "follower",
});

UserSchema.virtual("follower", {
  ref: "Follow",
  localField: "_id",
  foreignField: "following",
});

UserSchema.plugin(passportLocalMongoose);
module.exports = mongoose.model("User", UserSchema);
