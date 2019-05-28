const path = require('path');

const express = require('express');

const mongoConnect = require('./util/database').mongoConnect;

const User = require('./models/user')

const errorController = require('./controllers/error')

const bodyParser = require('body-parser');

const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');

const app = express();

app.use(bodyParser.urlencoded({ extended: false }));

app.use(express.static(path.join(__dirname, 'public')));

app.set('view engine', 'ejs');
app.set('views', 'views')


app.use((req,res,next)=>{
   User.findUserById('5ce8436ec944bc1af43670c0')
    .then(user=>{
        req.user = new User(user.name,user.email,user.cart,user._id);
        next();
    })
    .catch(err=>{
        console.log(err)
    }) 
    
})

app.use('/admin', adminRoutes);
app.use(shopRoutes);

app.use(errorController.getErrorPage);


mongoConnect(()=>{
    app.listen(3000)
})
