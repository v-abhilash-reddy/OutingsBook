const mongoose = require('mongoose');
const url = "mongodb+srv://abs1289:abs%401289@cluster0.fhm2u.mongodb.net/recipe?retryWrites=true&w=majority";

mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(()=>console.log('Server connected on port 5000...'))
    .catch((err)=>console.log(err));
// mongoose.set("useCreateIndex", true);

// Models
require('./Category');
require('./Recipe');
require('./userAuth');