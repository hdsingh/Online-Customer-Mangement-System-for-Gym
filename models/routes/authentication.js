var express = require('express'),
    router = express.Router(),
    passport = require("passport"),
    User = require('../user'),
    Member = require('../member')

router.get('/signup',function(req,res){
	res.render('signup')
})

router.post('/signup',function(req,res){
    User.register(new User({username:req.body.username}),req.body.password,function(err, user){
        if (err){
            console.log(err);
            return res.send(err.message);
        } 
        passport.authenticate('local')(req,res,function(){
            res.redirect('/showMembers');
        });
    });
});

router.get('/login',function(req,res){
    // console.log(req.user);
    res.render('login')
})

router.post('/login',passport.authenticate('local',{
    failureRedirect:'/'
}),function(req,res){
    res.redirect('/showMembers')
})

router.get('/logout',function(req,res){
    req.logout();
    res.redirect('/')
})

module.exports = router;