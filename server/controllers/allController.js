require('../models/database');
// const Category = require('../models/Category');
const Outing = require('../models/Outing');
const User = require('../models/userAuth');

/*Auth*/
exports.login = async(req, res) => {
  try {
    if(req.isAuthenticated()){
      return res.redirect('/');
    }
    else return res.render('login', {isLoggedIn:req.isAuthenticated()});
  } catch (error) {
    res.status(500).send({message: error.message || "Error Occured" });
  }
}

exports.register = async(req, res) => {
  try {
    if(req.isAuthenticated()){
      return res.redirect('/');
    }
    else return res.render('register', {isLoggedIn:req.isAuthenticated()});
  } catch (error) {
    res.status(500).send({message: error.message || "Error Occured" });
  }
}

/**
 * GET /
 * Homepage 
*/
exports.homepage = async(req, res) => {
  try {
    const limitNumber = 5;
    // const categories = await Category.find({}).limit(limitNumber);
    const latest = await Outing.find({}).sort({_id: -1}).limit(limitNumber);
    const northIndia = await Outing.find({ 'category': 'northIndia' }).limit(limitNumber);
    const westIndia = await Outing.find({ 'category': 'westIndia' }).limit(limitNumber);
    const southIndia = await Outing.find({ 'category': 'southIndia' }).limit(limitNumber);
    const eastIndia = await Outing.find({ 'category': 'eastIndia' }).limit(limitNumber);

    // console.log(req.isAuthenticated());
    // const isLoggedIn = req.isAuthenticated();
    const trips = { latest, northIndia, westIndia, southIndia, eastIndia};
    console.log("ok from home");

    res.render('index', { title: 'Outings Book - Home', trips, isLoggedIn : req.isAuthenticated() } );
  } catch (error) {
    res.status(500).send({message: error.message || "Error Occured" });
  }
}

/* Abou page */
exports.aboutpage = async(req, res) => {
  try{
    res.status('200').render('about',{isLoggedIn : req.isAuthenticated()});
  } catch (error) {
    res.satus(500).send({message: error.message || "Error Occured" });
  }
}

/**
 * GET /categories
 * Categories 
*/
exports.exploreOutings = async(req, res) => {
  try {
    const limitNumber = 20;
    const Outings = await Outing.find({}).limit(limitNumber);
    res.render('outings', { title: 'Outings Book - All', Outings, isLoggedIn : req.isAuthenticated() } );
  } catch (error) {
    res.status(500).send({message: error.message || "Error Occured" });
  }
} 


/**
 * GET /categories/:id
 * Categories By Id
*/
exports.exploreCategoriesById = async(req, res) => { 
  try {
    let categoryId = req.params.id;
    const limitNumber = 20;
    const categoryById = await Outing.find({ 'category': categoryId }).limit(limitNumber);
    res.render('categories', { title: 'Outings Book - Categories', categoryById , isLoggedIn : req.isAuthenticated()} );
  } catch (error) {
    res.status(500).send({message: error.message || "Error Occured" });
  }
} 
 
/**
 * GET /outing/:id
 * Outing 
*/
exports.exploreOuting = async(req, res) => {
  try {
    const userId = req.isAuthenticated() ? req.user._id : null;
    let outingId = req.params.id;
    const outing = await Outing.findById(outingId);
    let isAuthor = false,likes = Object.keys(outing.likes).length;
    let isLiked  = outing.likes.hasOwnProperty(userId);
    const comments = outing.comments;
    console.log(userId, outing.userId);
    if(userId == outing.userId) isAuthor = true;
    res.render('outing', { title: 'Outings Book - Outing', outing ,isAuthor, isLoggedIn : req.isAuthenticated(),likes,isLiked,comments,userId : outing.userId} );
  } catch (error) {
    res.status(500).send({message: error.message || "Error Occured" });
  }
} 


/**
 * POST /search
 * Search 
*/
exports.searchOuting = async(req, res) => {
  try {
    let searchTerm = req.body.searchTerm;
    let outing = await Outing.find( { $text: { $search: searchTerm, $diacriticSensitive: true } });
    res.render('search', { title: 'Outings Book - Search', outing, isLoggedIn : req.isAuthenticated() } );
  } catch (error) {
    res.satus(500).send({message: error.message || "Error Occured" });
  }
  
}

/**
 * GET /explore-latest
 * Explplore Latest 
*/
exports.exploreLatest = async(req, res) => {
  try {
    const limitNumber = 20;
    const outing = await Outing.find({}).sort({ _id: -1 }).limit(limitNumber);
    res.render('explore-latest', { title: 'Outings Book - Explore Latest', outing , isLoggedIn : req.isAuthenticated()} );
  } catch (error) {
    res.satus(500).send({message: error.message || "Error Occured" });
  }
} 



/**
 * GET /explore-random
 * Explore Random as JSON
*/
exports.exploreRandom = async(req, res) => {
  try {
    let count = await Outing.find().countDocuments();
    let random = Math.floor(Math.random() * count);
    let outing = await Outing.findOne().skip(random).exec();
    res.render('explore-random', { title: 'Outings Book - Explore Latest', outing, isLoggedIn : req.isAuthenticated() } );
  } catch (error) {
    res.status(500).send({message: error.message || "Error Occured" });
  }
} 


/**
 * GET /submit-outing
 * Submit Outing
*/
exports.submitOuting = async(req, res) => {
    if(!req.isAuthenticated()){
        // req.flash('error_message', 'Please log in to access the requested page');
        // if(error_message){
        //     res.render('log');
        // }
        // else res.redirect('/login');
        return res.json({ok:"not ok"});
    }
  const infoErrorsObj = req.flash('infoErrors');
  const infoSubmitObj = req.flash('infoSubmit');
  res.render('submit-outing', { title: 'Outings Book - Submit Outing', infoErrorsObj, infoSubmitObj , isLoggedIn : req.isAuthenticated() } );
}

/**
 * POST /submit-outing
 * Submit Outing
*/
exports.submitOutingOnPost = async(req, res) => {
  try {

    let imageUploadFile;
    let uploadPath;
    let newImageName;

    if(!req.files || Object.keys(req.files).length === 0){
      console.log('No Files where uploaded.');
    } else {

      imageUploadFile = req.files.image;
      newImageName = Date.now() + imageUploadFile.name;

      uploadPath = require('path').resolve('./') + '/public/uploads/' + newImageName;

      imageUploadFile.mv(uploadPath, function(err){
        if(err) return res.satus(500).send(err);
      })

    }
    console.log(req.user._id);
    const newOuting = new Outing({
      userId:req.user._id,
      name: req.body.name,
      description: req.body.description,
      email: req.body.email,
      category: req.body.category,
      image: newImageName
    });
      // ingredients: req.body.ingredients,
    
    await newOuting.save();

    req.flash('infoSubmit', 'Outing has been added.')
    res.redirect('/submit-outing');
  } catch (error) {
    // res.json(error);
    req.flash('infoErrors', error);
    res.redirect('/submit-outing');
  }
}

exports.myPages = async(req,res) => {
  try{
    if(!req.isAuthenticated()){
        return res.json({msg:"pls login"});
    }
    // console.log(req.user);
    const userId = req.user._id;
    const outing = await Outing.find({userId});
    console.log(userId);
    return res.status(200).render('my-blogs', {outing, isLoggedIn : req.isAuthenticated()});
  }
  catch(err){
    res.status(400).json(err);
  }
}



exports.editpage = async(req,res) => {

  try {
    if(!req.isAuthenticated()){
      return res.json({msg:"pls login"});
    }
    // console.log(req.user);
    // console.log( "ok from editpage 1");
    const userId = req.user._id;
    const outingId = req.params.id;
    // console.log( "ok from editpage 2", userId, outingId);
    const outing = await Outing.findById(outingId);
    // console.log( "ok from editpage 3", outing.userId, userId);
    if(outing.userId != userId){
      return res.status(404).json({'msg':" You can only edit your posts."})
    }
    // console.log( "ok from editpage 4", userId, outingId);
    const category = {'northIndia' : 'North India', 'westIndia' : 'West India', 'southIndia' : 'South India', 'eastIndia' : 'East India'};
    return res.status(200).render('edit-outing', {outing, category, isLoggedIn : req.isAuthenticated()});
    
  } catch (error) {
    res.status(500).json({message: error.message || "Error Occured" });
  }
}

exports.updatepage = async(req,res) => {

  try {

    let imageUploadFile;
    let uploadPath;
    let newImageName;

    if(!req.files || Object.keys(req.files).length === 0){
      console.log('No Files where uploaded.');
    } else {

      imageUploadFile = req.files.image;
      newImageName = Date.now() + imageUploadFile.name;

      uploadPath = require('path').resolve('./') + '/public/uploads/' + newImageName;

      imageUploadFile.mv(uploadPath, function(err){
        if(err) return res.status(500).send(err);
      })

    }
    console.log(req.user._id);
    const newOuting = {
      userId:req.user._id,
      name: req.body.name,
      description: req.body.description,
      email: req.body.email,
      category: req.body.category,
      image: newImageName
    };

    const outingId = req.params.id;
    const outing = Outing.findByIdAndUpdate(outingId, newOuting,
      (err)=>{
        if(err){
          console.log(err);
          return res.status(500).json({message: error.message || "Error Occured" });
        }
      }
    );
    res.redirect(`/outing/${outingId}`);
  } catch (error) {
    // res.json(error);
    req.flash('infoErrors', error);
    res.redirect(`/outing/${outingId}`);
  }
}

exports.deletepage = async(req, res) => {

  try {
    if(!req.isAuthenticated()){
      return res.json({msg:"pls login"});
    }
    // console.log(req.user);
    const userId = req.user._id;
    const outingId = req.params.id;
    const outing = await Outing.findById(outingId);
    // console.log( "ok from deletepage 1", userId, outingId, outing, outing.userId);
    if(outing.userId != userId){
      return res.status(404).json({'msg':" You can only delete your posts."})
    }

    const deleteOuting = await Outing.findByIdAndDelete(outingId);
    // console.log( "ok from deletepage 2", deleteOuting);
    res.redirect('/myPages');
    
  } catch (error) {
    console.log(error);
    res.status(404).json({message: error.message || "Error Occured" });
  }
};


exports.exploreLike = async(req,res) =>{
  try{
    if(!req.isAuthenticated())
      return res.json({ msg : "Plz login"});
    const userId = req.user._id;
    let outingId = req.params.id;
    const outing  = await Outing.findById(outingId);
    const outingLikesObj = {...outing.likes};
    if(outingLikesObj.hasOwnProperty(userId))
       delete outingLikesObj[userId];
    else
      outingLikesObj[userId] = 1;
    outing.likes = outingLikesObj;
    await outing.save();
    res.redirect(`/outing/${outingId}`);
  }
  catch(err) {
    console.log(err);
  }

}

exports.exploreComment = async(req,res) =>{
  try{
    if(!req.isAuthenticated())
      return res.json({ msg : "Plz login"});
    const userId = req.user._id;
    let outingId = req.params.id;
    if(!req.body.commentField.length) 
      return res.json({ msg : "comment should not be empty"});
    const user = await User.findById(userId);
    const outing  = await Outing.findById(outingId);
    const commentsArr = [...outing.comments];
    console.log("username",user.username);
    commentsArr.push({
      userName : user.username,
      comment : req.body.commentField,
      userId : outing.userId
    })
    outing.comments = commentsArr;
    await outing.save();
    res.redirect(`/outing/${outingId}`);
  }
  catch(err) {
    console.log(err);
  }

}

exports.exploreDeleteComment = async(req,res) =>{
  try{
    if(!req.isAuthenticated())
      return res.json({ msg : "Plz login"});
    // const userId = req.user._id;
    let outingId = req.params.id;
    console.log(req.body);
    const outing  = await Outing.findById(outingId);
    const commentsArr = [...outing.comments];
    // console.log("username",user.username);
    commentsArr.splice(req.params.index, 1);
    outing.comments = commentsArr;
    await outing.save();
    res.redirect(`/outing/${outingId}`);
  }
  catch(err) {
    console.log(err);
  }


}
