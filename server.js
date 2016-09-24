var firebase = require("firebase");
var alexa = require('alexa-utils');

const PORT = process.env.PORT || 8080;

var config = {
	apiKey: "AIzaSyC7hWtD1r_e955AOODxO8ppc7gm8ICMYZA",
	databaseURL: "https://artik-home.firebaseio.com",
};

firebase.initializeApp(config);

var db = firebase.database();
var deviceRef = null;
var devId = -1;

var handleNoSession = function(res) {
	if (!deviceRef) {
		res.prompt("Sorry, but you have not started a session with an ARTIK.").send();
		return true;
	} else {
		return false;
	}
}

var resFromAirQuality = function(value) {
	if (value == 3) {
		return "is clean.";
	} else if (value == 2) {
		return "has low amounts of pollution.";
	} else if (value == 1) {
		return "has high amounts of pollution. You should open some windows.";
	} else {
		return "has dangerous amounts of pollution. Get out of your house right now!"
	}
}

var app = alexa.app("ForceHome")
	.onLaunch((req, res) => {
		res.prompt("Welcome to the Force home app! What do you want to do?")
			.reprompt("What would you like Force Home to do?")
			.endSession(false)
			.send();
	})
	.onIntent("LinkDevice", (req, res) => {
		devId = req.intent.slot("devId");
		deviceRef = db.ref("devices/ARTIK-" + devId);
		res.prompt("ARTIK device " + devId + " is linked!")
			.send();
	})
	.onIntent("OverallStatus", (req, res) => {
		if (!handleNoSession()) {
			deviceRef.once("value")
				.then((snapshot) => {
					var soilMoisture = snapshot.child("soil-moisture").val();
					var airQuality = snapshot.child("air-quality").val();
					var temperature = snapshot.child("temperature").val();
					var resSoilMoisture = "Your plant's soil humidity is " + soilMoisture + "%."
					var resAirQuality = " Your home's air quality " + resFromAirQuality(airQuality);
					var resTemperature = " Your home's temperature is " + temperature + " fahrenheit.";
					res.prompt(resSoilMoisture + resAirQuality + resTemperature)
						.send();
				});
		}
	})
	.onIntent("DeviceStatus", (req, res) => {
		if (!handleNoSession()) {
			deviceRef.once("value")
				.then((snapshot) => {
					var device = req.intent.slot("device");
					var response = "Unknown device requested!";
					
					if (device == "plants") {
						var soilMoisture = snapshot.child("soil-moisture").val();
						response = "Your plant's soil humidity is " + soilMoisture + "%."
					} else if (device == "fridge") {
						var temperature = snapshot.child("temperature").val();
						response = "Your home's temperature is " + temperature + " fahrenheit.";
					} else if (device == "air quality") {
						var airQuality = snapshot.child("air-quality").val();
						response = "Your home's air quality " + resFromAirQuality(airQuality);			
					}
					
					res.prompt(response).send();
			});
		}
	})
	.onIntent("UnlinkDevice", (req, res) => {
		deviceRef = null;
		devId = -1;
		res.prompt("ARTIK device " + devId + " is unlinked! Goodbye").send();
	})
	.onIntent("AMAZON.StopIntent", function(req, res) {
		deviceRef = null;
		devId = -1
		res.prompt("ARTIK device " + devId + " is unlinked! Goodbye").send();
	})
	.onIntent("AMAZON.CancelIntent", function(req, res) {
		deviceRef = null;
		devId = -1;
		res.prompt("ARTIK device " + devId + " is unlinked! Goodbye").send();
	})
	.onSessionEnd((req, res) => {
		deviceRef = null;
		devId = -1;
		res.prompt("ARTIK device " + devId + " is unlinked! Goodbye").send();
	})
	.host("/api", PORT, false);

console.log("Server started on port " + PORT);
