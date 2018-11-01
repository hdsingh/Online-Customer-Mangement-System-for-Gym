var mongoose = require("mongoose");
    
var NewMemberSchema = new mongoose.Schema({
    name: String,
    mobile: String,
    date: {type: Date, default: Date},
});

module.exports = mongoose.model("NewMember",NewMemberSchema);