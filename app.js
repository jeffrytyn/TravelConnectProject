const express = require('express');
const app = express();
const methodOverride = require('method-override');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const User = require('./models/user');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const flash = require('connect-flash');
const port = process.env.PORT || 3000;

// ------------------- mongoose setup --------------//
//Set up default mongoose connection
mongoose.set('useUnifiedTopology', true);
mongoose.set('useNewUrlParser', true);
mongoose.set('useFindAndModify', false);
var mongoDB = process.env.DATABASEURL || 'mongodb://127.0.0.1/TravelConnect';
mongoose.connect(mongoDB);

//Get the default connection
var db = mongoose.connection;

//Bind connection to error event (to get notification of connection errors)
db.on('error', console.error.bind(console, 'MongoDB connection error:'));


// -------------------- Passport/session setup ---------------------//
app.use(require('express-session')({
    secret: "A very secret secure key",
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
//authenticate, serialize, deserialize come from local-mongoose plugin
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


// -------------------- middleware -------------------//

let isLoggedIn = function(req, res, next){
    if (req.user) {
        return next();
    }
    res.redirect('/login');
}

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
    User.find({}, (err, users) => {
        if(err) return res.render('index');
        const names = [];
        users.forEach(user => names.push(user.username));
        return res.render('index', {names: names});
    }); //express looks in views directory by default
});

app.get('/login', function(req, res){
    res.render('login'); 
});

app.post('/login', 
    passport.authenticate('local',{ successRedirect: '/',
                                    failureRedirect: '/login',
                                    successFlash: "You've been signed in!", //maps to success in req.flash
                                    failureFlash: "Invalid username or password."}), //maps to error in req.flash 
    function(req, res){
});

app.get('/register', function(req, res){
    res.render('register'); 
});

app.post('/register', function(req, res){
    if(req.body.password != req.body.confirmPass){
        req.flash('error', "Passwords don't match!");
        return res.render('register');
    }
    let new_user = new User({username: req.body.username});
    User.register(new_user, req.body.password, (err, user) => {
        if(err){
            req.flash('error', "User with that name already exists.");
            return res.redirect('/register');
        }
        req.login(user, function(err) {
            if (err) { return req.flash('error', "Error with login."); }
            req.flash("success", "You have been registered!");
            return res.redirect('/');
          });
    });
});

app.get('/logout', function(req, res){
    req.logout();
    req.flash('success', "You have been logged out!");
    res.redirect("/");
});

app.get('/:username', function(req, res){
    User.findOne({username: req.params.username}, function(err, user){
        if(!user || err){
            req.flash("error", `No user with username ${req.params.username} found`);
            return res.redirect("back");
        }
        res.render('user/show', {foundUser: user});
    });
});

app.listen(port, () => console.log(`Server started on ${port}`));