const express = require('express');
const morgan = require('morgan');
const methodOverride = require('method-override');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const flash = require('connect-flash');
const bodyParser = require('body-parser');
const offerRoutes = require('./routes/offerRoute');
const itemRoutes = require('./routes/itemRoute');
const userRoutes = require('./routes/userRoute');
const Item = require('./models/itemModel');

const app = express();

const port = 3000;
const host = 'localhost';
const mongoUri = 'mongodb+srv://admin:admin123@cluster0.vw7m8.mongodb.net/group15project?retryWrites=true&w=majority&appName=Cluster0';

mongoose.connect(mongoUri)
   .then(() => console.log('Connected to MongoDB'))
   .catch(err => console.error(err));

app.use((req, res, next) => {
       next();
});
         
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));
app.use(morgan('tiny'));
app.use(methodOverride('_method'));
app.set('view engine', 'ejs');

app.use(session({
   secret: 'ajfeirf90aeu9eroejfdoefj',
   resave: false,
   saveUninitialized: false,
   store: MongoStore.create({ mongoUrl: mongoUri }),
   cookie: { maxAge: 180 * 60 * 1000 }
}));

app.use(flash());
app.use((req, res, next) => {
   res.locals.user = req.session.userId || null;
   res.locals.successMessage = req.flash('success').pop();
   res.locals.errorMessage = req.flash('error').pop();
   next();
});

app.get('/', async (req, res) => {
   try {
       const items = await Item.find({ active: true });
       res.render('index', { items: items });
   } catch (error) {
       console.error(error);
       res.status(500).render('error', { errorMessage: 'Internal Server Error' });
   }
});

app.use('/items', itemRoutes);
app.use('/users', userRoutes);
app.use('/offers', offerRoutes);

app.use((req, res, next) => {
   const err = new Error('The server cannot locate ' + req.url);
   err.status = 404;
   next(err);
});

app.use((err, req, res, next) => {
   const errorMessage = err.message || 'Internal Server Error';
   res.status(err.status || 500);
   res.render('error', { errorMessage });
});

module.exports = app;