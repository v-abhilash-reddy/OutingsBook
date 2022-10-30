require('../models/database');
const Outing = require('../models/Outing');
const User = require('../models/userAuth');

/* Homepage */
exports.homepage = async(req, res) => {
  try {
    const limitNumber = 5;
    const latest = await Outing.find({}).sort({_id: -1}).limit(limitNumber);
    const northIndia = await Outing.find({ 'category': 'northIndia' }).limit(limitNumber);
    const westIndia = await Outing.find({ 'category': 'westIndia' }).limit(limitNumber);
    const southIndia = await Outing.find({ 'category': 'southIndia' }).limit(limitNumber);
    const eastIndia = await Outing.find({ 'category': 'eastIndia' }).limit(limitNumber);
    const trips = { latest, northIndia, westIndia, southIndia, eastIndia};

    res.status(200).render('index', { title: 'Outings Book - Home', trips, isLoggedIn : req.isAuthenticated() } );
  } catch (error) {
    res.status(500).send({message: error.message || "Error Occured" });
  }
}

/* About page */
exports.aboutpage = async(req, res) => {
  try{
    res.status(200).render('about',{isLoggedIn : req.isAuthenticated()});
  } catch (error) {
    res.status(500).send({message: error.message || "Error Occured" });
  }
}

/* categories */
exports.exploreOutings = async(req, res) => {
  try {
    const limitNumber = 20;
    const Outings = await Outing.find({}).limit(limitNumber);
    res.status(200).render('outings', { title: 'Outings Book - All', Outings, isLoggedIn : req.isAuthenticated() } );
  } catch (error) {
    res.status(500).send({message: error.message || "Error Occured" });
  }
} 


/* categories/:id */
exports.exploreCategoriesById = async(req, res) => { 
  try {
    let categoryId = req.params.id;
    const limitNumber = 20;
    const categoryById = await Outing.find({ 'category': categoryId }).limit(limitNumber);
    res.status(200).render('categories', { title: 'Outings Book - Categories', categoryById , isLoggedIn : req.isAuthenticated()} );
  } catch (error) {
    res.status(500).send({message: error.message || "Error Occured" });
  }
} 
 
/* outing/:id */
exports.exploreOuting = async(req, res) => {
  try {
    const userId = req.isAuthenticated() ? req.user._id : null;
    let outingId = req.params.id;
    const outing = await Outing.findById(outingId);
    let isAuthor = false,likes = Object.keys(outing.likes).length;
    let isLiked  = outing.likes.hasOwnProperty(userId);
    const comments = outing.comments;
    if(userId == outing.userId) isAuthor = true;
    res.status(200).render('outing', { title: 'Outings Book - Outing', outing ,isAuthor, isLoggedIn : req.isAuthenticated(),likes,isLiked,comments,userId : outing.userId} );
  } catch (error) {
    res.status(500).send({message: error.message || "Error Occured" });
  }
} 


/* POST /search */
exports.searchOuting = async(req, res) => {
  try {
    let searchTerm = req.body.searchTerm;
    let outing = await Outing.find( { $text: { $search: searchTerm, $diacriticSensitive: true } });
    res.status(200).render('search', { title: 'Outings Book - Search', outing, isLoggedIn : req.isAuthenticated() } );
  } catch (error) {
    res.status(500).send({message: error.message || "Error Occured" });
  }
  
}

/* explore-latest */
exports.exploreLatest = async(req, res) => {
  try {
    const limitNumber = 20;
    const outing = await Outing.find({}).sort({ _id: -1 }).limit(limitNumber);
    res.status(200).render('explore-latest', { title: 'Outings Book - Explore Latest', outing , isLoggedIn : req.isAuthenticated()} );
  } catch (error) {
    res.status(500).send({message: error.message || "Error Occured" });
  }
} 



/* explore-random */
exports.exploreRandom = async(req, res) => {
  try {
    let count = await Outing.find().countDocuments();
    let random = Math.floor(Math.random() * count);
    let outing = await Outing.findOne().skip(random).exec();
    res.status(200).render('explore-random', { title: 'Outings Book - Explore Latest', outing, isLoggedIn : req.isAuthenticated() } );
  } catch (error) {
    res.status(500).send({message: error.message || "Error Occured" });
  }
} 


/* submit-outing */
exports.submitOuting = async(req, res) => {
  try{
    if(!req.isAuthenticated()){
        req.flash('LoggingIn', 'Please login / signup to access the requested page');
        return res.render('login' , {LoggingIn : req.flash('LoggingIn'), isLoggedIn:false});
    }
    const infoErrorsObj = req.flash('infoErrors');
    const infoSubmitObj = req.flash('infoSubmit');
    res.status(200).render('submit-outing', { title: 'Outings Book - Submit Outing', infoErrorsObj, infoSubmitObj , isLoggedIn : req.isAuthenticated() } );
  } catch{
    res.status(500).send({message: error.message || "Error Occured" });
  }
}

/* POST submit-outing */
exports.submitOutingOnPost = async(req, res) => {
  try {

    let imageUploadFile;
    let uploadPath;
    let newImageName;

    if(!req.files || Object.keys(req.files).length === 0){
      return res.status(404).json({message: 'No file found. Please upload a file.'})
    } else {

      imageUploadFile = req.files.image;
      newImageName = Date.now() + imageUploadFile.name;

      uploadPath = require('path').resolve('./') + '/public/uploads/' + newImageName;

      imageUploadFile.mv(uploadPath, function(err){
        if(err) return res.satus(500).send(err);
      })

    }

    const newOuting = new Outing({
      userId:req.user._id,
      name: req.body.name,
      description: req.body.description,
      email: req.body.email,
      category: req.body.category,
      image: newImageName
    });
    
    await newOuting.save();

    req.flash('infoSubmit', 'Outing has been added.')
    res.status(201).redirect('/submit-outing');
  } catch (error) {
    req.flash('infoErrors', error);
    res.redirect('/submit-outing');
  }
}

exports.myPages = async(req,res) => {
  try{
    if(!req.isAuthenticated()){
      req.flash('LoggingIn', 'Please login / signup to access the requested page');
      return res.render('login' , {LoggingIn : req.flash('LoggingIn'), isLoggedIn:false});
    }
    const userId = req.user._id;
    const outing = await Outing.find({userId});
    return res.status(200).render('my-blogs', {outing, isLoggedIn : req.isAuthenticated()});
  }
  catch(err){
    res.status(500).send({message: error.message || "Error Occured" });
  }
}



exports.editpage = async(req,res) => {

  try {
    if(!req.isAuthenticated()){
      req.flash('LoggingIn', 'Please login / signup to access the requested page');
      return res.render('login' , {LoggingIn : req.flash('LoggingIn'), isLoggedIn:false});
    }

    const userId = req.user._id;
    const outingId = req.params.id;
    const outing = await Outing.findById(outingId);
    if(outing.userId != userId){
      return res.status(404).json({'msg':" You can only edit your posts."})
    }
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

    const newOuting = {
      userId:req.user._id,
      name: req.body.name,
      description: req.body.description,
      email: req.body.email,
      category: req.body.category,
      image: newImageName
    };

    const outingId = req.params.id;
    const outing = await Outing.findByIdAndUpdate(outingId, newOuting,
      (err)=>{
        if(err){
          console.log(err);
          return res.status(500).json({message: error.message || "Error Occured" });
        }
      }
    );
    res.status(303).redirect(`/outing/${outingId}`);
  } catch (error) {
    res.status(500).send({message: error.message || "Error Occured" });
  }
}

exports.deletepage = async(req, res) => {

  try {
    if(!req.isAuthenticated()){
      req.flash('LoggingIn', 'Please login / signup to access the requested page');
      return res.render('login' , {LoggingIn : req.flash('LoggingIn'), isLoggedIn:false});
    }
    const userId = req.user._id;
    const outingId = req.params.id;
    const outing = await Outing.findById(outingId);
    if(outing.userId != userId){
      return res.status(404).json({'msg':" You can only delete your posts."})
    }

    const deleteOuting = await Outing.findByIdAndDelete(outingId);
    res.status(303).redirect('/myPages');
    
  } catch (error) {
    res.status(500).send({message: error.message || "Error Occured" });
  }
};


exports.exploreLike = async(req,res) =>{
  try{
    if(!req.isAuthenticated()){
      req.flash('LoggingIn', 'Please login / signup to access the requested page');
      return res.render('login' , {LoggingIn : req.flash('LoggingIn'), isLoggedIn:false});
    }

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
    res.status(303).redirect(`/outing/${outingId}`);
  }
  catch(err) {
    res.status(500).send({message: error.message || "Error Occured" });
  }

}

exports.exploreComment = async(req,res) =>{
  try{
    if(!req.isAuthenticated()){
      req.flash('LoggingIn', 'Please login / signup to access the requested page');
      return res.render('login' , {LoggingIn : req.flash('LoggingIn'), isLoggedIn:false});
    }
    const userId = req.user._id;
    let outingId = req.params.id;
    if(!req.body.commentField.length) 
      return res.json({ msg : "comment should not be empty"});
    const user = await User.findById(userId);
    const outing  = await Outing.findById(outingId);
    const commentsArr = [...outing.comments];
    commentsArr.push({
      userName : user.username,
      comment : req.body.commentField,
      userId : outing.userId
    })
    outing.comments = commentsArr;
    await outing.save();
    res.status(303).redirect(`/outing/${outingId}`);
  }
  catch(err) {
    res.status(500).send({message: error.message || "Error Occured" });
  }

}

exports.exploreDeleteComment = async(req,res) =>{
  try{
    if(!req.isAuthenticated()){
      req.flash('LoggingIn', 'Please login / signup to access the requested page');
      return res.render('login' , {LoggingIn : req.flash('LoggingIn'), isLoggedIn:false});
    }
    let outingId = req.params.id;
    const outing  = await Outing.findById(outingId);
    const commentsArr = [...outing.comments];
    commentsArr.splice(req.params.index, 1);
    outing.comments = commentsArr;
    await outing.save();
    res.status(303).redirect(`/outing/${outingId}`);
  }
  catch(err) {
    res.status(500).send({message: error.message || "Error Occured" });
  }
}
