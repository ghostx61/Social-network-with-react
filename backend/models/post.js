var mongoose = require("mongoose");

const PostSchema = new mongoose.Schema({
    text: String,
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
});
// var PostSchema = new mongoose.Schema({
//     text: String,
//     image: String,
//     imageId: String,
//     author:{
//         id:{
//             type: mongoose.Schema.Types.ObjectId,
//             ref : "User"
//         },
//         username: String,
//     },
//     likes: [String],
//     comments:
//     [
//         {
//             type: mongoose.Schema.Types.ObjectId,
//             ref : "Comment"
//         }
//     ],
//     createdAt: {type:Date, default:Date.now}
// });
module.exports = mongoose.model("Post", PostSchema);