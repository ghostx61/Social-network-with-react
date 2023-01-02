var express = require("express");
var router = express.Router();

var User = require("../models/user");
var Post = require("../models/post");
var Comment = require("../models/comment");
var middleware =require("../middleware");

router.get("/post/:postId/comments", middleware.isLoggedIn, function(req, res){
    Post.findById(req.params.postId).populate('comments').exec(function(err, newPost){
        if(err){
            console.log(err);
            req.flash("error", err.message);
            res.redirect("back");
        }else{
            User.findById(newPost.author.id, function(err, user){
                var pic = user.image;
                res.render("comment", {post: newPost, User: req.user, pic:pic});
            });
        }
    });
}); 

router.post("/post/:postId/comment", function(req, res){
    Post.findById(req.params.postId, function(err, post){
        if(err){
            console.log(err);
            req.flash("error", err.message);
            res.redirect("back");
        }else{
            Comment.create(req.body.comment, function(err, comment){
                if(err){
                    console.log(err);
                    req.flash("error", err.message);
                res.redirect("back");
                }else{
                    comment.author.id = req.user._id;
                    comment.author.username = req.user.username;
                    comment.save();
                    post.comments.push(comment);
                    post.save();
                    res.redirect("/post/"+post._id+"/comments"); 
                }
            });  
        }
         
    });
});

module.exports =router;
