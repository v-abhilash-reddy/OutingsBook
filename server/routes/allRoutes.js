const express = require('express');
const router = express.Router();

const session = require('express-session');
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const findOrCreate = require("mongoose-findorcreate");

router.use(passport.initialize());
router.use(passport.session());

const User = require('../models/userAuth');
const Controller = require('../controllers/controller');
// require('../../')
require('dotenv').config({path:__dirname + '../../.env'});
// console.log(process.env.CLIENT_ID);

/**
 * App Routes 
*/
router.get('/', Controller.homepage);
router.get('/recipe/:id', Controller.exploreRecipe );
router.get('/categories', Controller.exploreCategories);
router.get('/categories/:id', Controller.exploreCategoriesById);
router.post('/search', Controller.searchRecipe);
router.get('/explore-latest', Controller.exploreLatest);
router.get('/explore-random', Controller.exploreRandom);
router.get('/submit-recipe', Controller.submitRecipe);
router.post('/submit-recipe', Controller.submitRecipeOnPost);

router.get("/myblogs",Controller.myBlogs);

/* Auth Routes */
passport.use(User.createStrategy());

passport.serializeUser(function (user, done) {
  done(null, user.id);
});

passport.deserializeUser(function (id, done) {
  User.findById(id, function (err, user) {
    done(err, user);
  });
});

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.CLIENT_ID,
      clientSecret: process.env.CLIENT_SECRET,
      callbackURL: "http://localhost:5000/auth/google/secrets",
      userProfileURL: "https://www.googleapis.com/oauth2/v3/userinfo",
    },
    function (accessToken, refreshToken, profile, cb) {
      console.log(profile);

      User.findOrCreate({ googleId: profile.id }, function (err, user) {
        return cb(err, user);
      });
    }
  )
);
  
router.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["profile"] })
);

router.get(
  "/auth/google/secrets",
  passport.authenticate("google", { failureRedirect: "/login" }),
  function (req, res) {
    // Successful authentication, redirect to secrets.
    res.redirect("/");
  }
);

router.get("/login", function (req, res) {
  const isLoggedIn = req.isAuthenticated();
  res.render("login", {isLoggedIn});
});

router.get("/register", function (req, res) {
  const isLoggedIn = req.isAuthenticated();
  res.render("register", {isLoggedIn});
});

router.get("/logout", function (req, res) {
    // console.log("ooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooo\n\n\n");
    req.logout(()=>{});
    res.redirect("/");
  });

router.post("/register", function (req, res) {
    User.register(
      { username: req.body.username },
      req.body.password,
      function (err, user) {
        if (err) {
          console.log(err);
          res.redirect("/");
        } else {
          passport.authenticate("local")(req, res, function () {
            // res.redirect("/secrets");
            res.redirect("/");
          });
        }
      }
    );
  });

router.post("/login", function (req, res) {
    const user = new User({
      username: req.body.username,
      password: req.body.password,
    });
    console.log(req);
  
    req.login(user, function (err) {
      if (err) {
        console.log(err);
      } else {
        passport.authenticate("local")(req, res, function () {
        //   res.redirect("/secrets");
            res.redirect("/");
        });
      }
    });
  });

 
module.exports = router;