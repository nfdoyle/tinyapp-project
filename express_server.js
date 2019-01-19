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
const bcrypt = require('bcrypt');
const cookieSession = require('cookie-session')

// persistent variable set
const templateVars = {
  user: ''
};

// objects for server data
const urlDatabase = { 
  
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

//module section
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static(__dirname));
app.use(cookieSession({
  name: 'session',
  keys: ['key1', 'key2']
}))

function generateRandomString() {
  var text = "";
  var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for(var i = 0; i < 6; i++) {
      text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
}

//*********************
// GET and POST section
//********************/
app.get("/", (req, res) => {
  if (!templateVars.user.id){
    res.render(`login`, templateVars) 
  } else {
    res.redirect(`/urls/`)
    }
});

app.get("/u/:shortURL", (req, res) => {
  // let longURL = the long-form url in database using paramater key - direct to external URL
  let longURL = urlDatabase[req.params.shortURL].url;
  res.redirect(longURL);
});

app.get("/register", (req, res) => {
  // get registration page
  console.log(templateVars);
  if (templateVars.user.id) {
    //if logged in: redirect
    res.redirect(`/urls`)
  }
  res.render("register", templateVars);
});

app.get("/urls/new", (req, res) => {
  // if not logged in, force login redirection
  if (!templateVars.user.id){
    res.redirect(`/login`) 
  } else {
    res.render("urls_new", templateVars);
    }
});

app.post("/urls", (req, res) => {
  //logic to create to url database entry
  let randString = generateRandomString();
  urlDatabase[randString] = {};
  urlDatabase[randString].id = randString;
  urlDatabase[randString].url = req.body.longURL;
  urlDatabase[randString].creator = templateVars.user.id;
  //redirect to the page associated with the url
  res.redirect(`/urls/${randString}`)       
});

app.get("/login", (req, res) => {
  // get for login page, not available if logged in 
  res.render(`login`, templateVars);        
});

app.post("/login", (req, res) => {
  if (req.body.email == '' || req.body.password == ''){
    res.statusCode = 400;
    res.render('error');
  }
  let userid;
  for (user in users){
    if (users[user].email == req.body.email){
      userid = users[user].id;
    }
  }

  if (bcrypt.compareSync(req.body.password, users[userid].password)){
    console.log("logged in id: " + userid);
    req.session.user_id = userid;
    templateVars.user.id = req.session.user_id;
    console.log("TVAR in post reg:", templateVars);
    res.redirect(`/urls`) 
  } else {
    res.statusCode = 400;
    res.render('error', templateVars);  
  }     
});

app.post("/register", (req, res) => {
  //If the e-mail or password are empty strings, send 
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

  req.session.user_id = users[newid].id;
  templateVars.user.id = req.session.user_id
  res.redirect(`/urls`)        
});

app.get("/logout", (req, res) => {
  req.session = null;
  templateVars.user = {};
  res.redirect(`/urls`)        
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.post('/urls/:id/delete', (req, res) => {
  if (urlDatabase[req.params.id].creator == templateVars.user.id){
    delete urlDatabase[req.params.id];
  }
  res.redirect('/urls');
});

app.post('/urls/:id', (req, res) => {
  let longURL = req.body.longURL;
  let shortURL = req.body.shortURL;
  urlDatabase[shortURL].id = shortURL;
  urlDatabase[shortURL].url = longURL;
  urlDatabase[shortURL].creator = templateVars.user.id;
  res.redirect('/urls');
});

app.get("/urls", (req, res) => {
  templateVars.urls = urlDatabase;
  if (req.session.user_id) {
    templateVars.user = users[req.session.user_id];
    } else {
      templateVars.user = {};
    }
  res.render("urls_index", templateVars);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/urls/:id", (req, res) => {
  templateVars.shortURL = req.params.id;
  templateVars.urls = urlDatabase;
  //refuses connection to url modification of non-creators
  if (templateVars.user.id !== urlDatabase[req.params.id].creator) {
    res.render('error');
  }
  res.render("urls_show", templateVars);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});