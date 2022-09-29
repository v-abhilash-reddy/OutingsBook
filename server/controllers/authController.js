const User = require('../models/userAuth');

exports.login = async(req, res) => {
    try {
      res.render('login');
    } catch (error) {
      res.status(500).send({message: error.message || "Error Occured" });
    }
  }
  
  exports.register = async(req, res) => {
    try {
      res.render('register');
    } catch (error) {
      res.status(500).send({message: error.message || "Error Occured" });
    }
  }