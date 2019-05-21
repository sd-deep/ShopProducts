const path = require('path');

const express = require('express');

const errorController = require('./controllers/error')
const bodyParser = require('body-parser');
/* const expressHbs = require('express-handlebars') */



const app = express();

app.use(bodyParser.urlencoded({ extended: false }));

app.use(express.static(path.join(__dirname, 'public')));


/* app.engine('hbs', expressHbs({layoutsDir : 'views/layouts', defaultLayout : 'main-layout.hbs'})) */
/* app.set('view engine','hbs'); */
/* app.set('view engine','pug'); */
app.set('view engine', 'ejs');
app.set('views', 'views')





const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');

app.use('/admin', adminRoutes);
app.use(shopRoutes);

app.use(errorController.getErrorPage);

app.listen(3002);
