const path = require('path');

const express = require('express');

const errorController = require('./controllers/error')
const bodyParser = require('body-parser');
/* const expressHbs = require('express-handlebars') */

const sequelize = require('./util/database')
const Product = require('./models/product');
const User = require('./models/user')
const Cart = require('./models/cart')
const CartItem = require('./models/cart-item')

const app = express();

app.use(bodyParser.urlencoded({ extended: false }));

app.use(express.static(path.join(__dirname, 'public')));


/* app.engine('hbs', expressHbs({layoutsDir : 'views/layouts', defaultLayout : 'main-layout.hbs'})) */
/* app.set('view engine','hbs'); */
/* app.set('view engine','pug'); */
app.set('view engine', 'ejs');
app.set('views', 'views')


app.use((req,res,next)=>{
    User.findByPk(1)
    .then(user=>{
        req.user = user;
        next();
    })
    .catch(err=>{
        console.log(err)
    })
    
})


const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');

app.use('/admin', adminRoutes);
app.use(shopRoutes);

app.use(errorController.getErrorPage);

Product.belongsTo(User, {constraints : true, onDelete :'CASCADE'})
User.hasMany(Product)
User.hasOne(Cart)
//Cart.belongsTo(User) // this is not required as both this and User.hasOne(Cart) are same
Cart.belongsToMany(Product,{ through : CartItem})
Product.belongsToMany(Cart,{ through : CartItem})


sequelize.sync( {force : true}) // {force : true } for new associaltion rules
    .then((result)=>{
        User.findByPk(1)
        //console.log(result)
    })
    .then(user=>{
        if(user){
            return User.create({userName: 'Deep',email : 'test@test.com'})
        }
        return user;
    })
    .then(user=>{
        console.log(user)
        app.listen(3000);

    })
    .catch(err=>{
        console.log(err)
    })
