var express = require("express");
var app = express();
var mongoose = require("mongoose");
var passport = require("passport");
var localStrategy = require("passport-local");
var passportLocalMongoose = require("passport-local-mongoose");
var methodOverride = require("method-override");
var flash = require("connect-flash");
const path = require('path');
const cors = require('cors');

var Comment = require("./models/comment");
var Post = require("./models/post");
var User = require("./models/user");

var postRoutes = require("./routes/posts");
var profileRoutes = require("./routes/profile");
var authRoutes = require("./routes/auth");
var indexRoutes = require("./routes/index");
var commentRoutes = require("./routes/comments");

require('dotenv').config()
app.use(express.static(__dirname + "/public"));
app.use(express.static(path.join(__dirname, '../frontend/build/')));
app.use(cors());

app.use(methodOverride("_method"));
app.locals.moment = require('moment');

app.set("view engine", "ejs");
app.use(flash());

//for jquery
var jsdom = require("jsdom");
const { JSDOM } = jsdom;
const { window } = new JSDOM();
const { document } = (new JSDOM('')).window;
global.document = document;
var $ = require("jquery")(window);

var bodyParser = require("body-parser");
app.use(express.json({ extended: false, limit: '50mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }));

var cloudinary = require('cloudinary');
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

//DATABASEURL variable for mongoAtlas
mongoose.set("strictQuery", false); // to remove mongoose warning
mongoose.connect(process.env.DATABASE_URL || "mongodb://localhost:27017/mongoDemo_v7", { useNewUrlParser: true }).
  then(res => {
    console.log('connnected to DATABASE');
  })
  .catch(error => console.log(error));


//passport config
app.use(require("express-session")({
  secret: "dsadsfjfgjhfghfdjhfgjgdhjkg",
  resave: false,
  saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());
passport.use(new localStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(function (req, res, next) {
  res.locals.message = req.flash("error");
  next();
});

app.use("/api/profile", profileRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/post", postRoutes);
app.use("/api", indexRoutes);
app.use("/api/comment", commentRoutes);

// for testing
app.get('/api/name', (req, res) => {
  res.send('api home');
})
app.post('/api/ytest', (req, res) => {
  console.log(req.body);
  res.send('api post');
})

app.use('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/build/', 'index.html'));
});
//PORT variable for heroku deploy
app.listen(process.env.PORT || 3100, function () {
  console.log("Server running on port 3100");
});

