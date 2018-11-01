var express = require('express'),
    app = express(),
    bodyParser = require('body-parser'),
    mongoose = require('mongoose'),
    methodOverride = require('method-override'),
    passport = require("passport"),
    localStrategy = require("passport-local"),
    expressSession = require("express-session"),
    User = require('./models/user'), //schemas
    Member = require('./models/member'), //schemas
    NewMember = require('./models/new_member'), //schemas
    member = require("./models/routes/member"),
    authentication = require("./models/routes/authentication"),
    middleware = require("./middleware"),
    moment = require('moment');
    
   
var url = process.env.DATABASEURL || "mongodb://localhost/gym_app";
mongoose.connect(url);
app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));
app.use(methodOverride('_method'));


// config passport
app.use(expressSession({
    secret:"my name is harman",
    resave:false,
    saveUninitialized:false
}));

app.use(passport.initialize());
app.use(passport.session());
passport.use(new localStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(function(req,res,next){
    res.locals.currentUser = req.user;
    next();
});

app.use(member);
app.use(authentication);
// app.use(users);



app.get('/',function(req,res){
    res.render('home')
});

app.get('/pricing',function(req,res){
    res.render('pricing')
})

app.get('/join',function(req,res){
    res.render('join')
})

// app.listen(8888,function () {
//     console.log("server has started");
// });

app.listen(process.env.PORT, process.env.IP,function () {
    console.log("server has started");
});
