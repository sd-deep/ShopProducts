const path = require("path");

const express = require("express");

//const mongoConnect = require('./util/database').mongoConnect;
const mongoose = require("mongoose");

const bodyParser = require("body-parser");
const session = require('express-session');
const MongoDbStore = require('connect-mongodb-session')(session)

const errorController = require("./controllers/error");
const adminRoutes = require("./routes/admin");
const shopRoutes = require("./routes/shop");
const authRoutes = require("./routes/auth");

const User = require("./models/user");

const MONGODB_URI = "mongodb+srv://deep:xOe6p6SKJVHDY5Tx@cluster0-exmnw.mongodb.net/shop"

const app = express();

const store = new MongoDbStore({
  uri : MONGODB_URI,
  collection : 'sessions'
})



app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));
app.use(session({secret:'some secret string', resave : false, saveUninitialized:false, store : store}))

app.set("view engine", "ejs");
app.set("views", "views");


app.use("/admin", adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);


app.use(errorController.getErrorPage);

mongoose
  .connect(
    MONGODB_URI
  )
  .then(result => {
    User.findOne().then(user=>{
        if(!user){
            const user = new User({
                name: "deep",
                email: "shankhadeepdas8@gmail.com",
                cart: {
                  item: []
                }
              });
              user.save();
        }
    }) 
    
    app.listen(3000);
  })
  .catch(err => {
    console.log(err);
  });
