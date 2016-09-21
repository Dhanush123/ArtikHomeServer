var firebase = require("firebase");
var rndstring = require("randomstring");
var fileExists = require('file-exists');

var config = {
	apiKey: "AIzaSyC7hWtD1r_e955AOODxO8ppc7gm8ICMYZA",
	databaseURL: "https://artik-home.firebaseio.com",
};

firebase.initializeApp(config);

if (!fileExists("uid.id")) {
}

var db = firebase.database();
var deviceRef = db.ref("devices/<INSERT NAME HERE>");
ref.once("value", function(snapshot) {
	console.log(snapshot.val());
});
