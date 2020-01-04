const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const session = require('express-session');
const { check, validationResult } = require('express-validator');
const fileUpload = require('express-fileupload');
var passport = require('passport');
const mongoStore = require('connect-mongo')(session);

//init app
const app = express();

//view engine setup
app.set('views',path.join(__dirname,'views'));
app.set('view engine','ejs');

//set public folder
app.use(express.static(path.join(__dirname,'public')));

//set global errors variable
app.locals.errors = null;

//body-parser middleware 
app.use(bodyParser.urlencoded({ extended: false }));
// parse application/json
app.use(bodyParser.json());

//File Upload Middleware
app.use(fileUpload());

//Session middleware
if (process.env.NODE_ENV == 'production') {
  app.use(session({
    secret: 'testSession',
    resave: false,
    saveUninitialized: false,
    store: new mongoStore({
      mongooseConnection: mongoose.connection
    })
  }));
} else {
  app.use(session({
    secret: 'testSession',
    resave: false,
    saveUninitialized: true
  }));
}

// Express messages middleware
app.use(require('connect-flash')());
app.use(function (req, res, next) {
  res.locals.messages = require('express-messages')(req, res);
  next();
});

// Passport Config
require('./config/passport')(passport);

// Passport Middleware
app.use(passport.initialize());
app.use(passport.session());


app.get('*', (req,res,next)=>{
  res.locals.cart = req.session.cart;
  res.locals.user = req.user || null;
  next();
});


//set routes
const pages = require('./Routes/pages');
const adminPages = require('./Routes/admin_pages');
const adminCategory = require('./Routes/admin_category');
const adminProduct = require('./Routes/admin_product');
const ViewProduct = require('./Routes/product');
const Cart = require('./Routes/cart');
const user = require('./Routes/user');

app.use('/admin/pages',adminPages);
app.use('/admin/category',adminCategory);
app.use('/admin/product',adminProduct);
app.use('/product',ViewProduct);
app.use('/cart',Cart);
app.use('/user',user);
app.use('/',pages);

module.exports = app;