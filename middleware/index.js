var User = require('../models/user'), //schemas
    Member = require('../models/member') //schemas


var middlewareObj = {};

middlewareObj.isLoggedIn = function(req,res,next) {
    if(req.isAuthenticated()){
        return next();
    }
    // req.flash("error","You must be Logged in");
    res.redirect("/login");
};

middlewareObj.isAdmin = function(req,res,next) {
    if(req.isAuthenticated()){
        if(req.user.isAdmin){
            return next();
    }}
    // req.flash("error","Only admin can do this");
    res.redirect("back");
};


module.exports = middlewareObj;

