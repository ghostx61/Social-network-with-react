var mongoose = require("mongoose");

const PostSchema = new mongoose.Schema({
    text: String,
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, {
    toJSON: { virtuals: true },     // for reverse populate
    toObject: { virtuals: true },   // for reverse populate
});

// populate viruals (reverse populate)
PostSchema.virtual('comment', {
    ref: 'Comment',
    localField: '_id',
    foreignField: 'post'
});
module.exports = mongoose.model("Post", PostSchema);