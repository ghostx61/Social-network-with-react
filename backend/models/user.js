var mongoose =require("mongoose");
var passportLocalMongoose = require("passport-local-mongoose");
var UserSchema = new mongoose.Schema({
    fname: String,
    lname: String,
    email: String,
    image: String,
    imageId: String,
    dob: Date,
    bio: String,
    address: String,
    username: String,
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