const path = require('path');

const express = require('express');

const mongoConnect = require('./util/database').mongoConnect;

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
   /*  User.findByPk(1)
    .then(user=>{
        req.user = user;
        next();
    })
    .catch(err=>{
        console.log(err)
    }) */
    next()
})





app.use('/admin', adminRoutes);
app.use(shopRoutes);

app.use(errorController.getErrorPage);


mongoConnect(()=>{
    app.listen(3000)
})
