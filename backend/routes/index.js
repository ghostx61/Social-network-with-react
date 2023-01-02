var express = require("express");
var router = express.Router();
var mongoose =require("mongoose");

var User = require("../models/user");
var middleware =require("../middleware");

router.get("/", middleware.isLoggedIn, function(req, res){
    var currentUser =req.user;
    //lean()- convert mongoose document to plain js object 
    User.find({_id:{$in: currentUser.follow}}).populate("posts").lean()
    .exec(function(err, users){
        var postArray=[];
        for(let user of users){
            for(let post of user.posts){
                post.profilePic = user.image; 
            }
            postArray= postArray.concat(user.posts);
        }
        //sort post by time
        postArray.sort(function(a, b){
            return b.createdAt.getTime() - a.createdAt.getTime();
        });
        //pagination
        var perPage = 6;
        var pageQuery = parseInt(req.query.page);
        var pageNumber = pageQuery ? pageQuery : 1;
        var postArr = [];
        var count = Math.ceil(postArray.length / perPage);
        if(postArray.length>6){
            var loopIndex =((pageNumber-1)*6);
            for(let i=loopIndex; i<=loopIndex+5; i++){
                if(!postArray[i])
                    break;
                postArr.push(postArray[i]);
            }
        }else{
            postArr=postArray;
        }
        res.render("index", {posts: postArr, userId: currentUser._id, User: req.user, page:"index", current: pageNumber, pages: count});
    });
});

router.get("/findFriends", middleware.isLoggedIn, function(req, res){
    var result= 0;
    if(req.query.search){
        //search
        const regex = new RegExp(escapeRegex(req.query.search), 'gi');
        User.find({
            $and: [
                 { _id: {$ne: req.user._id} },
                 { $or: [
                       {fname: regex,}, {lname: regex}, {username:regex}
                 ]},
             ]
     }, function(err, allusers){
            if(err){
                console.log(err);
                req.flash("error", err.message);
                res.redirect("back");
            }else{
                if(allusers.length < 1){
                    result=1;
                }
                res.render("users", {allusers: allusers, User: req.user, result: result, page:"users"});
            }
        });
    }
    else{
        let allusers=[];
        result=2;
        res.render("users", {allusers: allusers, User: req.user, result: result, page:"users"});
    }
});

router.post("/follow/:id", middleware.isLoggedIn, function(req, res){
    User.findById(req.params.id, function(err, followingUser){
        if(err){
            console.log(err);
            req.flash("error", err.message);
            return res.redirect("back");
        }
        // following user's ID in follower user
        followingUser.followers.push(mongoose.Types.ObjectId(req.user._id));
        followingUser.save();
        // follower user's ID in following user
        req.user.follow.push(mongoose.Types.ObjectId(req.params.id));
        req.user.save(function(err){
            if(err){
                console.log(err);
                req.flash("error", err.message);
                res.redirect("back");
            }else{
                res.redirect("back");
            }
        });
    });
    
});

router.post("/unfollow/:id", middleware.isLoggedIn,function(req, res){
    User.findById(req.params.id, function(err, followingUser){
        var index=followingUser.followers.indexOf(req.user._id);
        followingUser.followers.splice(index,1);
        followingUser.save();
        var index=req.user.follow.indexOf(req.params.id);
        req.user.follow.splice(index,1);
        req.user.save(function(err){
            if(err){
                console.log(err);
                req.flash("error", err.message);
                res.redirect("back");
            }else{
                res.redirect("back");
            }
        });
    });
});


//for search
function escapeRegex(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
};

module.exports =router;
