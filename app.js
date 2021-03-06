const express = require('express');
const app = express();
const methodOverride = require('method-override');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const flash = require('connect-flash');
if(!process.env.NODE_ENV || process.env.NODE_ENV === "development"){
    require("dotenv").config();
}
const port = process.env.PORT || 3000;

const userRoutes = require('./routes/userRoutes');
const authRoutes = require('./routes/auth');
const postRoutes = require('./routes/postRoutes');

const User = require('./models/user');
const Post = require("./models/post");

// ------------------- mongoose setup --------------//
//Set up default mongoose connection
mongoose.set('useUnifiedTopology', true);
mongoose.set('useNewUrlParser', true);
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);
const mongoDB = process.env.DATABASEURL || 'mongodb://localhost/TravelConnect';
mongoose.connect(mongoDB);

//Get the default connection
const db = mongoose.connection;

//Bind connection to error event (to get notification of connection errors)
db.on('error', console.error.bind(console, 'MongoDB connection error:'));


// -------------------- Passport/session setup ---------------------//
app.use(require('express-session')({
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
//authenticate, serialize, deserialize come from local-mongoose plugin
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// -------------------- app setup ------------------//
app.set("view engine", "ejs");

app.use(express.static(__dirname + "/public"));
app.use(methodOverride("_method"));
app.use(bodyParser.urlencoded({extended: true}));
app.use(flash());

app.use(function(req, res, next){
    res.locals.currentUser = req.user;
    res.locals.error = req.flash("error");
    res.locals.success = req.flash("success");
    next();
 });

// --------------- ROUTES ------------------ //
app.get('/', function(req, res){
    User.find({}, {"_id": 0, "username": 1}, (err, users) => {
        if(err) return res.render('index');
        let names = [];
        users.forEach(user => names.push(user.username));
        if(req.isAuthenticated()){
            Post.find({author: {$in: req.user.following}}).sort({_date: -1}).limit(15).exec(function(err, posts){
                if(err){
                    req.flash("error", "Error retrieving recent posts");
                    return res.render('index', {names: names});
                }
                return res.render('index', {names: names, posts: posts});
            });
        }else{
            res.render('index', {names: names});
        }
    }); //express looks in views directory by default
});

app.use('/', authRoutes);

app.use('/accounts', userRoutes);

app.use('/accounts/:username/posts', postRoutes);

app.get("*", function(req, res){
    res.redirect('/');
});

app.listen(port, () => console.log(`Server started on ${port}`));