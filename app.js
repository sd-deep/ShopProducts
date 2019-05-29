const path = require("path");

const express = require("express");

//const mongoConnect = require('./util/database').mongoConnect;
const mongoose = require("mongoose");

const User = require("./models/user");

const errorController = require("./controllers/error");

const bodyParser = require("body-parser");

const adminRoutes = require("./routes/admin");
const shopRoutes = require("./routes/shop");

const app = express();

app.use(bodyParser.urlencoded({ extended: false }));

app.use(express.static(path.join(__dirname, "public")));

app.set("view engine", "ejs");
app.set("views", "views");

app.use((req, res, next) => {
  User.findById("5ceed79bc7d07b2378a743cd")
    .then(user => {
      req.user = user;
      next();
    })
    .catch(err => {
      console.log(err);
    });
});

app.use("/admin", adminRoutes);
app.use(shopRoutes);


app.use(errorController.getErrorPage);

mongoose
  .connect(
    "mongodb+srv://deep:xOe6p6SKJVHDY5Tx@cluster0-exmnw.mongodb.net/shop?retryWrites=true"
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
