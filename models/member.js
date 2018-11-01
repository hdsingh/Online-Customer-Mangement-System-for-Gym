var mongoose = require("mongoose"),
    passportLocalMongoose = require("passport-local-mongoose");

var MemberSchema = new mongoose.Schema({
    name: String,
    age: Number,
    father_name: String,
    mobile: Number,
    gym_fee: Number,
    cardio_fee:Number,
    joiningDate: String,    //{type: Date, default: Date},
    pay_id: Number,
    pic_public_id: String,
    pic_url: String,
    pic_file_name: String,
    paid_dates: [String],
});


module.exports = mongoose.model("Member",MemberSchema);