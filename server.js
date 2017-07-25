// server.js
// where your node app starts

// init project
var express = require('express');
var app = express();

var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.use(express.static('public')); // http://expressjs.com/en/starter/static-files.html
var connected=false;

// setup our datastore
var datastore = require("./datastore").sync;
datastore.initializeApp(app);


// http://expressjs.com/en/starter/basic-routing.html
app.get("/", function (request, response) {
  initializeDatastoreOnProjectCreation();
  
  response.sendFile(__dirname + '/views/index.html');
});

app.get("/*", function (request, response) {
  var dbItems = [];
  let receivedParamater = request.params[0];
      
  if (datastore.get(receivedParamater) !== null) {
    dbItems = datastore.get(receivedParamater);
    response.redirect(dbItems);
  } else if (isValidUrl(receivedParamater)){
    var newKey = makeKey();
    datastore.set(newKey, receivedParamater);
    response.send({
      original_url: receivedParamater,
      short_url: "https://shorten-url-fast.glitch.me/" + newKey});
  } else {
    response.send("Invalid url!");
  }
  
});

function isValidUrl(url) {
  return /^(?:(?:(?:https?|ftp):)?\/\/)(?:\S+(?::\S*)?@)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,})).?)(?::\d{2,5})?(?:[/?#]\S*)?$/i.test( url );
}

function makeKey() {
  var text = "";
  var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for (var i = 0; i < 5; i++)
    text += possible.charAt(Math.floor(Math.random() * possible.length));

  return text;
}



// listen for requests :)
var listener = app.listen(process.env.PORT, function () {
  console.log('Your app is listening on port ' + listener.address().port);
});

// ------------------------
// DATASTORE INITIALIZATION

function initializeDatastoreOnProjectCreation() {
  if(!connected){
    connected = datastore.connect();
  }
  if (!datastore.get("initialized")) {
    datastore.set("initialized", true);
  }  
}