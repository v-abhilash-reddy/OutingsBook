require('dotenv').config();
const express = require('express');
const expressLayouts = require('express-ejs-layouts');
const fileUpload = require('express-fileupload');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const flash = require('connect-flash');
const bodyParser = require("body-parser");

const app = express();
const port = process.env.PORT || 5000;

app.use(express.urlencoded( { extended: true } ));
app.use(express.static('public'));
app.use(expressLayouts);

app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser('OutingsBookSecure'));
app.use(session({
  secret: 'OutingsBookSecretSession',
  saveUninitialized: true,
  resave: true
}));
app.use(flash());
app.use(fileUpload());

app.set('layout', './layouts/main');
app.set('view engine', 'ejs');

const routes = require('./routes/allRoutes.js');
app.use('/', routes);

app.listen(port, ()=> console.log(`Listening to port ${port}`));