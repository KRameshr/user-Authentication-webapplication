const express = require("express");
const sessions = require("client-sessions");
const CONFIG = require("./config.json");
const mongoose = require("mongoose");
const { render } = require("pug");
const PORT = CONFIG.PORT || process.env.PORT;
const bcryptjs = require("bcryptjs");
const app = express();
const path = require("path");
// ---------------------------------------------------
// Set Pug as the view engine
app.set("view engine", "pug");

// Set the views directory
app.set("views", path.join(__dirname, "views"));

// Middleware to parse POST requests
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Static files
app.use(express.static(path.join(__dirname, "public")));
// global Middelware
app.use(express.urlencoded({ extended: true }));
// cookie congig
app.use(
  sessions({
    cookieName: "mySession", // cookie name dictates the key name added to the request object
    secret: "blargadeeb566677largblarg", // should be a large unguessable string
    duration: 30 * 60 * 1000, // how long the session will stay valid in ms 60x30 = 30 min
    activeDuration: 10 * 60 * 1000, // if expiresIn < activeDuration, the session will be extended by activeDuration milliseconds
    cookie: {
      ephemeral: true,
    },
  })
);

app.use((req, res, next) => {
  if (req.mySession && req.mySession.user) {
    User.findOne({ email: req.mySession.user.email })
      .then((dres) => {
        req.mySession.user = req.registeredUser = dres;
        next();
      })
      .catch((error) => {
        next();
      });
  } else {
    next();
  }
});

////////////////////////////////////////////////////////////////////////////

// localmiddle ware

let requiredLogin = function (req, res, next) {
  if (!req.registeredUser) {
    res.redirect("/login");
  } else {
    next();
  }
};
// ---------------------------------------------------
// model

let Schema = mongoose.Schema;
let ObjectId = Schema.ObjectId;
let User = mongoose.model(
  "User",
  new Schema({
    id: ObjectId,
    firstname: String,
    lastname: String,
    email: { type: String, unique: true },
    password: String,
  })
);

// DB CONNECT
let dbString =
  "mongodb+srv://{{uname}}:{{upass}}@cluster0.{{ustring}}.mongodb.net/{{dbname}}?retryWrites=true&w=majority&appName=Cluster0";
url = dbString
  .replace("{{uname}}", CONFIG.dbusername)
  .replace("{{upass}}", CONFIG.dbpassword)
  .replace("{{ustring}}", CONFIG.dbuserString)
  .replace("{{dbname}}", CONFIG.dbname);
mongoose
  .connect(url)
  .then((res) => {
    console.log("DB is connected");
  })
  .catch((err) => {
    console.log(err);
  });

app.get("/", (req, res) => {
  res.render("index.pug");
});
app.get("/home", (req, res) => {
  res.render("index.pug");
});
app.get("/about", (req, res) => {
  res.render("about.pug");
});
app.get("/login", (req, res) => {
  res.render("login.pug");
});
app.get("/services", (req, res) => {
  res.render("services.pug");
});

app.get("/register", (req, res) => {
  res.render("register.pug");
});

app.get("/logout", (req, res) => {
  req.mySession.reset();
  res.redirect("/login");
});

app.post("/login", (req, res) => {
  User.findOne({ email: req.body.email })
    .then((dres) => {
      if (bcryptjs.compareSync(req.body.password, dres.password)) {
        req.mySession.user = dres;
        res.redirect("/profile");
      } else {
        res.render("login.pug", { error: "invalid pass word" });
      }
    })
    .catch((error) => {
      res.render("login.pug", { error: "no user by that credential" });
    });
});

app.post("/register", (req, res) => {
  var hashed_pw = bcryptjs.hashSync(
    req.body.password,
    bcryptjs.genSaltSync(10)
  );
  var clienterror = "";
  var user = new User({
    firstname: req.body.firstname,
    lastname: req.body.lastname,
    email: req.body.email,
    password: hashed_pw,
  });
  user
    .save()
    .then((dress) => {
      res.redirect("/profile");
      console.log("new user registered");
    })
    .catch((error) => {
      if (error.code === 11000) {
        clienterror = "Email All Ready exit";
      } else {
        clienterror = "soming went wrong";
      }
      res.render("register.pug", { clienterror });
    });
});

app.get("/profile", requiredLogin, (req, res) => {
  // Ensure req.registeredUser exists
  if (!req.registeredUser) {
    return res.redirect("/login");
  }

  res.render("profile", {
    info: {
      firstname: req.registeredUser.firstname,
      lastname: req.registeredUser.lastname,
      email: req.registeredUser.email,
    },
  });
});

app.get("/dashbord", requiredLogin, (req, res) => {
  res.render("dashbord.pug", { info: req.registeredUser });
});

app.listen(PORT, CONFIG.LOCALHOST, (err) => {
  if (err) {
    console.log(err);
  } else {
    console.log(`the website is ${CONFIG.LOCALHOST} at ${PORT}`);
  }
});
