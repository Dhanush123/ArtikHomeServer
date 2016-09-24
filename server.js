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

/*
-StartSession
-OverallStatus
-DeviceStatus
  -device -> "AMAZON.LITERAL"
-AMAZON.HelpIntent
-AMAZON.StopIntent
-AMAZON.CancelIntent
*/

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

var app = alexa.app("ArtikHome")
	.onLaunch((req, res) => {
		res.prompt("Welcome to the ARTIK home app! What do you want to do?")
			.reprompt("What would you like ARTIK HOME to do?")
			.endSession(false)
			.send();
	})
	.onIntent("StartSession", (req, res) => {
		var devId = req.intent.slots("devId");
		deviceRef = db.ref("devices/ARTIK-" + devId);
		res.prompt("Session with ARTIK-" + devId + " is now live!")
			.endSession(false)
			.send();
	})
	.onIntent("OverallStatus", (req, res) => {
		if (!handleNoSession()) {
			deviceRef.once("value")
				.then((snapshot) => {
					var soilMoisture = snapshot.child("soil-moisture");
					var airQuality = snapshot.child("air-quality");
					var temperature = snapshot.child("temperature");
					var resSoilMoisture = "Your plant's soil humidity is " + (soilMoisture * 100.0 / 1023.0) + "%."
					var resAirQuality = "Your home's air quality " + resFromAirQuality(airQuality);
					var resTemperature = "Your home's temperature is " + temperature + " fahrenheit.";
					res.prompt(resSoilMoisture + resAirQuality + resTemperature)
						.endSession(false)
						.send();
				});
		}
	})
	.onIntent("DeviceStatus", (req, res) => {
		if (!handleNoSession()) {
			var device = req.intent.slots("device");
			var response = "Unknown device requested!";
			
			if (device == "plants") {
				var soilMoisture = snapshot.child("soil-moisture");
				response = "Your plant's soil humidity is " + (soilMoisture * 100.0 / 1023.0) + "%."
			} else if (device == "fridge") {
				var temperature = snapshot.child("temperature");
				response = "Your home's temperature is " + temperature + " fahrenheit.";
			} else if (device == "air quality") {
				var airQuality = snapshot.child("air-quality");
				response = "Your home's air quality " + resFromAirQuality(airQuality);			
			}
			
			res.prompt(response)
				.endSession(false)
				.send();
		}
	})
	.onIntent("EndSession", (req, res) => {
		deviceRef = null;
		res.prompt("Thank you for using the ARTIK home. Goodbye!")
			.endSession(true)
			.send();
	})
	.onIntent("AMAZON.StopIntent", function(req, res) {
		deviceRef = null;
		res.endSession(true).send();
	})
	.onIntent("AMAZON.CancelIntent", function(req, res) {
		deviceRef = null;
		res.endSession(true).send();
	})
	.onSessionEnd((req, res) => {
		deviceRef = null;
		res.prompt("Thank you for using the ARTIK home. Goodbye!")
			.endSession(true)
			.send();
	})
	.host("/api", PORT, false);

console.log("Server started on port " + PORT);
