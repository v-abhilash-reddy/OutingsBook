const mongoose = require('mongoose');
require('dotenv').config();
const url = process.env.MONGODB_URI;

mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(()=>console.log('db connected'))
    .catch((err)=>console.log(err));

// Models
require('./Outing');
require('./userAuth');