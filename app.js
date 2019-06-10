const path = require("path");

const express = require("express");
//const mongoConnect = require('./util/database').mongoConnect;
const mongoose = require("mongoose");
const csrf = require('csurf');
const bodyParser = require("body-parser");
const multer = require('multer')
const session = require('express-session');
const MongoDbStore = require('connect-mongodb-session')(session)
const flash = require('connect-flash')

const errorController = require("./controllers/error");
const adminRoutes = require("./routes/admin");
const shopRoutes = require("./routes/shop");
const authRoutes = require("./routes/auth");

const User = require("./models/user");

const MONGODB_URI = "mongodb+srv://deep:xOe6p6SKJVHDY5Tx@cluster0-exmnw.mongodb.net/shop"

const app = express();

const store = new MongoDbStore({
  uri: MONGODB_URI,
  collection: 'sessions'
})

const csrfProtection = csrf();

const fileStorage = multer.diskStorage({ // this funtion is used to define the storage of files using multer package.
  destination: (req, file, cb)=>{
    cb(null, 'images')
  },
  filename : (req, file, cb) =>{
    cb(null, new Date().toISOString() + '-' + file.originalname)
  } 
})

const fileFilter = (req, file, cb) =>{
  if(file.mimetype === 'image/png' || file.mimetype === 'image/jpeg' || file.mimetype === 'image/jpg'){

    cb(null, true)
  }else{

    cb(null, false)
  }
}

app.use(bodyParser.urlencoded({ extended: false }));
app.use(multer({storage : fileStorage, fileFilter : fileFilter}).single('image'))
app.use(express.static(path.join(__dirname, "public")));
app.use(
  session(
    {
      secret: 'some secret string',
      resave: false,
      saveUninitialized: false,
      store: store
    }))

app.use(csrfProtection);
app.use(flash());

app.use((req,res,next)=>{

  res.locals.isAuthenticated= req.session.isLoggedIn;
  res.locals.csrfToken = req.csrfToken();
  next()
})

app.use((req,res,next)=>{
  if(!req.session.user){
    return next();
    
  }
  User.findById(req.session.user._id)
        .then(user => {
          if(!user){
            return next()
          }
            req.user = user;
            next()
        })
        .catch(err => {
            next(new Error(err))
        });

})

app.set("view engine", "ejs");
app.set("views", "views");


app.use("/admin", adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);

app.get('/500',errorController.get500Error)
app.use(errorController.getErrorPage);

app.use((error, req, res, next)=>{
  res.status(500)
  .render('500', {
    pageTitle : 'Internal server error',
    path:'/500',
    isAuthenticated : req.session});
})

mongoose
  .connect(
    MONGODB_URI
  )
  .then(result => {

    app.listen(3000);
  })
  .catch(err => {
    console.log(err);
  });
