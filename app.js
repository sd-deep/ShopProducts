const path = require("path");
const https = require('https');

const express = require("express");
const mongoose = require("mongoose");
const csrf = require('csurf');
const bodyParser = require("body-parser");
const multer = require('multer')
const session = require('express-session');
const MongoDbStore = require('connect-mongodb-session')(session)
const flash = require('connect-flash');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const fs = require('fs');

const errorController = require("./controllers/error");
const shopController = require('./controllers/shop');
const isAuth = require('./middleware/is-auth');
const User = require('./models/user');


const MONGODB_URI = `mongodb+srv://deep:xOe6p6SKJVHDY5Tx@cluster0-exmnw.mongodb.net/shop`

const app = express();

const store = new MongoDbStore({
  uri: MONGODB_URI,
  collection: 'sessions'
})

const csrfProtection = csrf();

const privateKey = fs.readFileSync('server.key');
const certificate = fs.readFileSync('server.cert');

const fileStorage = multer.diskStorage({ // this funtion is used to define the storage of files using multer package.
  destination: (req, file, cb)=>{
    cb(null, 'images')
  },
  filename : (req, file, cb) =>{
    cb(null, Math.random() + '-' + file.originalname)
  } 
})

const fileFilter = (req, file, cb) =>{
  if(file.mimetype === 'image/png' || file.mimetype === 'image/jpeg' || file.mimetype === 'image/jpg'){
    
    cb(null, true)
  }else{
    
    cb(null, false)
  }
}

app.set("view engine", "ejs");
app.set("views", "views");

const adminRoutes = require("./routes/admin");
const shopRoutes = require("./routes/shop");
const authRoutes = require("./routes/auth");


const accessLogPath=fs.createWriteStream(path.join(__dirname,'access.log'),{flags : 'a'})

app.use(helmet());
app.use(compression());
app.use(morgan('combined',{stream:accessLogPath}))

app.use(bodyParser.urlencoded({ extended: false }));
app.use(multer({storage : fileStorage, fileFilter : fileFilter}).single('image'))

//statically serving public folder and images
app.use(express.static(path.join(__dirname, "public")));
app.use('/images',express.static(path.join(__dirname, "images"))); // serving files from images folder

app.use(
  session(
    {
      secret: 'some secret string',
      resave: false,
      saveUninitialized: false,
      store: store
    }))


app.use(flash());

app.use((req,res,next)=>{

  res.locals.isAuthenticated= req.session.isLoggedIn;
  
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

});

app.post('/create-order', isAuth, shopController.postOrder);

app.use(csrfProtection);
app.use((req, res, next) => {
  res.locals.csrfToken = req.csrfToken();
  next();
});

app.use("/admin", adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);

app.get('/500',errorController.get500Error)
app.use(errorController.getErrorPage);

app.use((error, req, res, next)=>{
  console.log(error);
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

    https.createServer({key : privateKey, cert : certificate},app).listen(process.env.PORT || 3010);
  })
  .catch(err => {
    console.log(err);
  });
