//middleware
var middlewareObj = {};

middlewareObj.isLoggedIn = function(req, res, next){
    if(req.isAuthenticated()){
        return next();
    }
    req.flash("error", "You need to be logged in");
    res.redirect("/login");
}

middlewareObj.profileOwnership= function(req, res, next){
    if(req.isAuthenticated()){
        if(req.user.username === req.params.username)
        return next();
    }
    req.flash("error", "Something went wrong");
    res.redirect("back");
}

module.exports = middlewareObj;