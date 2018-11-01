var express = require('express'),
    router = express.Router(),
    User = require('../user'),
    Member = require('../member'),
    NewMember = require('../new_member'),
    multer = require("multer"),
    cloudinary = require('cloudinary'),
    bodyParser = require("body-parser"),
    middleware = require("../../middleware"),
    moment = require('moment');


cloudinary.config({ 
  cloud_name: 'newcampapp', 
  api_key:process.env.API_KEY, 
  api_secret: process.env.API_SECRET
});


var fileName;
router.use(bodyParser.urlencoded({extended: true}));    

var storage = multer.diskStorage({
  filename: function(req, file, callback) {
      fileName = Date.now() + file.originalname;
    callback(null,fileName );
  }
});

var imageFilter = function (req, file, cb) {
    // accept image files only
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
        return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
};

var upload = multer({ storage: storage, fileFilter: imageFilter});


router.get('/addMember',middleware.isLoggedIn,middleware.isAdmin,function(req,res){
    res.render('addMember')
});



router.post('/addMember',middleware.isLoggedIn,middleware.isAdmin,upload.single('img'),function(req,res){
    cloudinary.uploader.upload(req.file.path,function(result){
        // console.log(result);
        // console.log(req.body.member.name);
        // console.log('::::::::::::::body::'+req.body.member)
        var newMember = req.body.member;
        newMember.name = req.body.member.name.toUpperCase();
        newMember.pic_url = result.secure_url;
        newMember.pic_file_name = fileName;
        newMember.pic_public_id = result.public_id;
        // console.log(req.body.member);

        Member.create(newMember,function(err,member){
        if (err){
            console.log(err)
        } else{
            // console.log(member)
            res.redirect('/showMembers')
        }
    })
    });

});



// show all members
router.get('/showMembers',middleware.isLoggedIn,function(req,res){
	Member.find({},function(err,members){
        if (err){
            console.log(err)
        } else{
            res.render('showMembers',{members :members})
        }
    })
});


// show one member
router.get('/member/:id',middleware.isLoggedIn,function(req,res){
    Member.findById(req.params.id,function(err,member){
        if(err){
            console.log(err)
        } else{
            if (member.paid_dates.length<1){
                member.paid_dates.push(member.joiningDate);
                member.save()
            }
            last_paid = member.paid_dates.slice(-1)[0];
            // console.log(last_paid);
            time_diff = moment.duration(moment().diff(last_paid)).as('months')
            // console.log(time_diff )
            if (time_diff >1){
                // console.log("payment pending");
                unpaid_dates = [];
                unpaid_dates.push(last_paid);
                temp_diff = time_diff;
                while (temp_diff > 1){
                    unpaid_date = moment(unpaid_dates.slice(-1)[0], "YYYY-MM-DD").add(1, 'months').format(moment.HTML5_FMT.DATE)
                    unpaid_dates.push(unpaid_date);
                    temp_diff-=1;
                    // moment(unpaid_dates.slice(-1)[0], "YYYY-MM-DD").add(1, 'months')
                }
            }

            if (typeof unpaid_dates == "undefined"){
                unpaid_dates = []
                // console.log(unpaid_dates)
            }else{
                unpaid_dates = unpaid_dates.slice(1);
            }
            // console.log(unpaid_dates)
            res.render('showOneMember',{member:member,unpaid_dates:unpaid_dates});
            unpaid_dates = [];
        }
    })
});


// edit
router.get('/member/:id/edit',middleware.isLoggedIn,middleware.isAdmin,function(req,res){
    Member.findById(req.params.id,function(err,member){
        if(err){
            console.log(err)
        } else{
            res.render('editMember',{member:member})
        }
    })
});

// edit member
router.put('/member/:id',middleware.isLoggedIn,middleware.isAdmin,function(req,res){
    // console.log(req.body.member);
    Member.findByIdAndUpdate(req.params.id, req.body.member,function(err,member){
        if (err){
            console.log(err)
        } else {
            res.redirect('/member/'+ member._id)
        }
    })
    
});

// delete member

router.delete("/member/:id",middleware.isLoggedIn,middleware.isAdmin,function(req,res){
	Member.findById(req.params.id,function(err,member){
		if (err){
			console.log(err)
		} else{
            cloudinary.v2.uploader.destroy(member.pic_public_id, function(error, result){console.log(result, error)});
            member.remove();
			res.redirect('/showMembers');
		}
	});
});

router.post('/searchById',middleware.isLoggedIn,middleware.isAdmin,function(req,res){
    // res.send(req.body.pay_num)
    var noMatch = null;
    if (req.body.search_id){
        var pay_num = req.body.search_id;
        Member.find({pay_id: pay_num},function(err,member){
            if (err){
                console.log(err);
            } else{
                if (member.length <1){
                    noMatch = " No User with this id exist, enter correct id.";
                    res.send(noMatch)
                } else{
                    // console.log(member)
                res.render('searchedMember',{members:member,noMatch:noMatch})
                       }
            }
        })
    }
})


// Search
router.post('/search',middleware.isLoggedIn,middleware.isAdmin,function(req,res){
    var noMatch = null;
    if(req.body.name){
        var name = req.body.name.toUpperCase();
        Member.find({name:name},function(err,members){
            if (err){
                console.log(err);
            }else{
                if (members.length <1){
                    noMatch = " No User with this name exist, enter correct name.";
                    res.send(noMatch)
                } else{
                    // console.log(members)
                    res.render('searchedMember',{members:members,noMatch:noMatch})
                }
            }
        })
    }
})

router.get('/member/:id/pay',middleware.isLoggedIn,middleware.isAdmin,function(req,res){
    Member.findById(req.params.id,function(err,member){
       if (err){
        console.log(err);
       } else{
        last_paid = member.paid_dates.slice(-1)[0];
        new_last_paid = moment(last_paid, "YYYY-MM-DD").add(1, 'months').format(moment.HTML5_FMT.DATE);
        res.render('paymentPage',{member:member,new_last_paid:new_last_paid})
       }
    })
})

router.post('/member/:id/paying',middleware.isLoggedIn,middleware.isAdmin,function(req,res){
    Member.findById(req.params.id,function(err,member){
       if (err){
        console.log(err);
       } else{
        last_paid = member.paid_dates.slice(-1)[0];
        new_last_paid = moment(last_paid, "YYYY-MM-DD").add(1, 'months').format(moment.HTML5_FMT.DATE);
        member.paid_dates.push(new_last_paid);
        member.save()
        res.redirect('/member/'+member._id)
       }
    })
})


router.get('/memberPayInfo',middleware.isLoggedIn,middleware.isAdmin,function(req,res){
    Member.find({},function(err,members){
        unpaid_members = [];
        paid_members = [];
        members.forEach(function(member){
            last_paid = member.paid_dates.slice(-1)[0];
            time_diff = moment.duration(moment().diff(last_paid)).as('months')
            if (time_diff>1){
                unpaid_members.push(member)
            } else{
                paid_members.push(member)
            }
        })
    })
    res.render('paymentInfoTable',{unpaid_members:unpaid_members,paid_members:paid_members});
    unpaid_members = [];
    paid_members = [];
})


// New sign up member
router.post('/join',function(req,res){
    // console.log(req.body.new)
    NewMember.create(req.body.new,function(err,member){
        if(err){
            console.log(err);
            res.render('home')
        } else{
            // console.log(member)
            res.render('home')
        }
    })
});

// Showing new signed up members
router.get('/newMembers',middleware.isLoggedIn,middleware.isAdmin,function(req,res){
    NewMember.find({},function(err,members){
        if (err){
            console.log(err)
        } else{
            res.render('newMembers',{members:members})
        }
    })
});


module.exports = router;
