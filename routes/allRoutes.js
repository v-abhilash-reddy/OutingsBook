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
const Controller = require('../controllers/allController');
const authController = require('../controllers/authController');
require('dotenv').config();

/* App Routes */
router.get('/', Controller.homepage);
router.get('/about', Controller.aboutpage);
router.get('/outing/:id', Controller.exploreOuting );
router.post('/outing/like/:id', Controller.exploreLike);
router.post('/outing/comment/:id', Controller.exploreComment);
router.post('/outing/comment/delete/:id/:index',Controller.exploreDeleteComment);
router.get('/outings', Controller.exploreOutings);
router.get('/categories/:id', Controller.exploreCategoriesById);
router.post('/search', Controller.searchOuting);
router.get('/explore-latest', Controller.exploreLatest);
router.get('/explore-random', Controller.exploreRandom);
router.get('/submit-outing', Controller.submitOuting);
router.post('/submit-outing', Controller.submitOutingOnPost);

router.get("/myPages",Controller.myPages);
router.get("/edit/:id", Controller.editpage);
router.post("/edit/:id", Controller.updatepage);
router.get("/delete/:id", Controller.deletepage);

/* Auth Routes */
passport.use(User.createStrategy());
passport.serializeUser((user, done) => {done(null, user.id);});
passport.deserializeUser((id, done) => {
  User.findById(id, function (err, user) {
    done(err, user);
  });
});
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.CLIENT_ID,
      clientSecret: process.env.CLIENT_SECRET,
      callbackURL: "http://localhost:5000/auth/google/outings",
      userProfileURL: "https://www.googleapis.com/oauth2/v3/userinfo",
    },
    function (accessToken, refreshToken, profile, cb) {
      User.findOrCreate({ googleId: profile.id, username:profile.displayName}, function (err, user) {
        return cb(err, user);
      });
    }
  )
);
  
router.get("/auth/google", passport.authenticate("google", { scope: ["profile"] }));
router.get("/auth/google/outings", passport.authenticate("google", { failureRedirect: "/login" }), authController.googleRedirect);
router.get("/login", authController.login);
router.get("/register", authController.register);
router.get("/logout", authController.logout);
router.post("/register", authController.registerOnPost);
router.post("/login", authController.loginOnPost);

 
module.exports = router;