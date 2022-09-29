const mongoose = require('mongoose');
const passportLocalMongoose = require("passport-local-mongoose");
const findOrCreate = require("mongoose-findorcreate");

const userAuthSchema = new mongoose.Schema({
  email: {
    type: String
  },
  password: {
    type: String
  },
  googleId: {
    type: String
  },
  secret:{
    type:String
  }
});

userAuthSchema.plugin(passportLocalMongoose);
userAuthSchema.plugin(findOrCreate);

module.exports = mongoose.model('userAuth', userAuthSchema);