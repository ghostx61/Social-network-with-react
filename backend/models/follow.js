var mongoose = require("mongoose");
var FollowSchema = new mongoose.Schema({
    following:
    {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
    ,
    follower:
    {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
});

module.exports = mongoose.model("Follow", FollowSchema);