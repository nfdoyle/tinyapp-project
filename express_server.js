/*******************************************************************************
/*******************************************************************************
This four-day project will have you building a web app using Node. The app will 
allow users to shorten long URLs much like TinyURL.com and bit.ly do.
@nfdoyle
*******************************************************************************/

const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
//const cookieParser = require('cookie-parser')
const bcrypt = require('bcrypt');
const cookieSession = require('cookie-session')

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const templateVars = {};

const new_urlDatabase = { 
  
  "b2xVn2": {
    id: "b2xVn2", 
    url: "http://www.lighthouselabs.ca", 
    creator: "admin"
  },
 "9sm5xK": {
    id: "9sm5xK", 
    url: "http://www.google.ca", 
    creator: "admin"
  }
}

const defaultUserPasswords = {
  Steve: bcrypt.hashSync("tony-is-my-best-friend", 10),
  Tony: bcrypt.hashSync("tony-is-my-best-friend", 10)
}

const users = { 
  "TheCaptain": {
    id: "TheCaptain", 
    email: "captainamerica@shield.gov", 
    password: defaultUserPasswords.Steve
  },
 "IronMan": {
    id: "IronMan", 
    email: "stark@stark.com", 
    password: defaultUserPasswords.Tony
  }
}

//app.use(cookieParser());
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static(__dirname));
app.use(cookieSession({
  name: 'session',
  keys: ['key1', 'key2']
}))

app.set("view engine", "ejs");
  //tmp = req.body.longURL;
function generateRandomString() {
  var text = "";
  var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for(var i = 0; i < 6; i++) {
      text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
}

app.get("/", (req, res) => {
  
  res.redirect(`/urls/`)
});

app.get("/u/:shortURL", (req, res) => {
  // let longURL = ...
  let longURL = new_urlDatabase[req.params.shortURL].url;
  res.redirect(longURL);
});

app.get("/register", (req, res) => {
  // let longURL = ...
  console.log(templateVars);
  if (!templateVars.user) {
    templateVars.user = {};
  }
  res.render("register", templateVars);
});

app.get("/urls/new", (req, res) => {
  if (!templateVars.user.id){
    res.redirect(`/login`) 
  } else {
    res.render("urls_new", templateVars);
    }
});

app.post("/urls", (req, res) => {
  let randString = generateRandomString();
  new_urlDatabase[randString] = {};
  new_urlDatabase[randString].id = randString;
  new_urlDatabase[randString].url = req.body.longURL;
  console.log(new_urlDatabase[randString]);
  new_urlDatabase[randString].creator = templateVars.user.id;
  console.log("owner property: ", new_urlDatabase[randString].creator);
  res.redirect(`/urls/${randString}`)       
});

app.get("/login", (req, res) => {
  // do biz
  
  res.render(`login`, templateVars);        
});

app.post("/login", (req, res) => {
  if (req.body.email == '' || req.body.password == ''){
    res.statusCode = 400;
    npmres.redirect("/error");
  }
  let userid;
  
  for (user in users){

    if (users[user].email == req.body.email){

      
      userid = users[user].id;
    }
  }
  //let hashedPass = bcrypt.hashSync(req.body.password, 10);
  //if (users[userid].password !== hashedPass) {(

  if (bcrypt.compareSync(req.body.password, users[userid].password)){
    console.log("logged in id: " + userid);
    //res.cookie("user_id", userid);
    req.session.user_id = userid;
    //templateVars.user.id = req.cookies["user_id"];
    templateVars.user.id = req.session.user_id;
    console.log("TVAR in post reg:", templateVars);
    res.redirect(`/urls`) 
  } else {
    
    res.statusCode = 400;
    res.render('error', templateVars);  
  }     
});

app.post("/register", (req, res) => {
  // do bizIf the e-mail or password are empty strings, send 
  //back a response with the 400 status code.
  //If someone tries to register with an existing user's 
  //email, send back a response with the 400 status code.
  if (req.body.email == '' || req.body.password == ''){
    res.statusCode = 400;
    res.render('error');
  }
  
  for (user in users) {
    if (users[user].email === req.body.email){
      res.statusCode = 400;
      res.render('error');
      }
    }
  let newid = generateRandomString();
  users[newid] = {};
  users[newid].id = newid;
  users[newid].email = req.body.email;
  users[newid].password = bcrypt.hashSync(req.body.password, 10);
  console.log(users);


  //res.cookie("user_id", users[newid].id);
  req.session.user_id = users[newid].id;
  //templateVars.user.id = req.cookies["user_id"];
  templateVars.user.id = req.session.user_id
  console.log("TVAR in post reg:", templateVars);
  res.redirect(`/urls`)        
});

app.get("/logout", (req, res) => {
  // do biz
  //res.clearCookie("user_id");
  req.session = null;
  templateVars.user = {};
  
  res.redirect(`/urls`)        
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.post('/urls/:id/delete', (req, res) => {
  if (new_urlDatabase[req.params.id].creator == templateVars.user.id){
    delete new_urlDatabase[req.params.id];
  }
  res.redirect('/urls');
});

app.post('/urls/:id', (req, res) => {
  let longURL = req.body.longURL;
  let shortURL = req.body.shortURL;
  new_urlDatabase[shortURL].id = shortURL;
  new_urlDatabase[shortURL].url = longURL;
  new_urlDatabase[shortURL].creator = templateVars.user.id;
  res.redirect('/urls');
});

app.get("/urls", (req, res) => {
  templateVars.urls = new_urlDatabase;
  console.log(new_urlDatabase);
  console.log("cookie sess: ", + req.session.user_id);
  //if (req.cookies["user_id"]){
  if (req.session.user_id) {
    //templateVars.user = users[req.cookies["user_id"]];
    templateVars.user = users[req.session.user_id];
    } else {
      templateVars.user = {};
    }
  console.log(templateVars); 
  
  res.render("urls_index", templateVars);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/urls/:id", (req, res) => {
  
  templateVars.shortURL = req.params.id;
  templateVars.urls = new_urlDatabase;

  if (templateVars.user.id !== new_urlDatabase[req.params.id].creator) {
    res.render('error');
  }
   
  res.render("urls_show", templateVars);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});