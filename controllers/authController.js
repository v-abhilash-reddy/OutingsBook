require('../models/database');
const Outing = require('../models/Outing');
const User = require('../models/userAuth');
const passport = require("passport");

/* Auth */
exports.login = async(req, res) => {
  try {
    if(req.isAuthenticated()){
      return res.status(500).json({message:"You are already logged in"})
    }
    else return res.status(200).render('login', {isLoggedIn:req.isAuthenticated(), LoggingIn:''});
  } catch (error) {
    res.status(500).send({message: error.message || "Error Occured" });
  }
}

exports.loginOnPost = async function (req, res) {
  try{
    const user = new User({
        username: req.body.username,
        password: req.body.password,
      });
    
    req.login(user, function (err) {
      if (err) {
        res.status(500).send({loginErrorMsg: err || "Error Occured" });
      } else {
        passport.authenticate("local")(req, res, function () {
            res.status(303).redirect("/");
        });

        // req.flash('LoggingIn', 'Please sign up before logging in.');
        // return res.status(404).render('login' , {LoggingIn : req.flash('LoggingIn'), isLoggedIn:false});

      }
    });
  } catch (error) {
    res.status(500).send({message: error.message || "Error Occured" });
  }
}

exports.register = async(req, res) => {
  try {
    if(req.isAuthenticated()){
      return res.status(500).json({message:"You are already logged in"})
    }
    req.flash('registerFailed');
    return res.status(200).render('register', {isLoggedIn:req.isAuthenticated(), registerFailed:req.flash('registerFailed')});
  } catch (error) {
    res.status(500).send({message: error.message || "Error Occured" });
  }
}

exports.registerOnPost = async (req, res) => {
  try{
    const dupe = await User.find({email:req.body.email}).count();
    if(dupe!==0){
        req.flash('registerFailed', 'This username is already registered. Please use another username.');
        return res.status(200).render('register', {isLoggedIn:req.isAuthenticated(), registerFailed:req.flash('registerFailed')});
    }
    await User.register(
        { email:req.body.email, username: req.body.username },
        req.body.password,
        function (err, user) {
          if (err) {
            console.log(err);
            res.redirect("/");
          } else {
            passport.authenticate("local")(req, res, function () {
              res.status(303).redirect("/");
            });
          }
        }
      );
  } catch (error) {
    res.status(500).send({message: error.message || "Error Occured" });
  }
}

exports.logout = async(req, res) => {
  try {
    req.logout(()=>{});
    res.status(303).redirect("/");
  } catch (error) {
    res.status(500).send({message: error.message || "Error Occured" });
  }
}

exports.googleRedirect = async function (req, res) {
    try {
        res.status(303).redirect("/");
    } catch (error) {
        res.status(500).send({message: error.message || "Error Occured" });
    }
}