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
const cookieParser = require('cookie-parser')

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const templateVars = {};

app.use(cookieParser());
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static(__dirname));

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
  let longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

app.get("/urls/new", (req, res) => {
  res.render("urls_new", templateVars);
});

app.post("/urls", (req, res) => {
  let randString = generateRandomString();
  urlDatabase[randString] = req.body.longURL;
  res.redirect(`/urls/${randString}`)       
});

app.post("/login", (req, res) => {
  // do biz
  console.log("line 59:" + req.body);
  res.cookie("username", req.body.username);
  
  templateVars.username = req.cookies["username"];
  console.log(templateVars);
  res.redirect(`/urls`)        
});

app.post("/logout", (req, res) => {
  // do biz
  res.clearCookie("username");
  delete templateVars.username;
  
  res.redirect(`/urls`)        
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.post('/urls/:id/delete', (req, res) => {
  delete urlDatabase[req.params.id];
  res.redirect('/urls');
});

app.post('/urls/:id', (req, res) => {
  let longURL = req.body.longURL;
  let shortURL = req.body.shortURL;
  urlDatabase[shortURL] = longURL;
  res.redirect('/urls');
});

app.get("/urls", (req, res) => {
  templateVars.urls = urlDatabase;
  templateVars.username = req.cookies["username"];
  
  res.render("urls_index", templateVars);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/urls/:id", (req, res) => {
  
  templateVars.shortURL = req.params.id;
  templateVars.urls = urlDatabase;
   
  res.render("urls_show", templateVars);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});