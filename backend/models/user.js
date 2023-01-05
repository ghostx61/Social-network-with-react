var mongoose = require("mongoose");
var passportLocalMongoose = require("passport-local-mongoose");
var UserSchema = new mongoose.Schema({
    fname: {
        type: String,
        required: true
    },
    lname: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    image: String,
    imageId: String,
    dob: Date,
    bio: String,
    address: String,
    username: {
        type: String,
        required: true,
        unique: true
    },
    password: String,
    posts: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Post"
        }
    ],
    follow: [String],
    followers: [String]
});
UserSchema.plugin(passportLocalMongoose);
module.exports = mongoose.model("User", UserSchema);