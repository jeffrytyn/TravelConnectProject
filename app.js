const express = require('express');
const app = express();
const methodOverride = require('method-override');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const User = require('./models/user')
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


// -------------------- app setup ------------------//
app.set("view engine", "ejs");

app.use(express.static(__dirname + "/public"));
app.use(methodOverride("_method"));
app.use(bodyParser.urlencoded({extended: true}));

app.use(function(req, res, next){
    res.locals.currentUser = req.user;
    // res.locals.error = req.flash("error");
    // res.locals.success = req.flash("success");
    next();
 });

// --------------- ROUTES ------------------ //
app.get('/', function(req, res){
    res.render('index'); //express looks in views directory by default
});

app.get('/login', function(req, res){
    res.render('login'); 
});

app.post('/login', function(req, res){
    res.send(req.body.username + req.body.password);
});

app.get('/register', function(req, res){
    res.render('register'); 
});

app.post('/register', function(req, res){
    res.send(req.body.username + req.body.password);
});

app.listen(port, () => console.log(`Server started on ${port}`));