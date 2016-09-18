/*var hue = require("node-hue-api"),
    HueApi = hue.HueApi,
    lightState = hue.lightState;
 
var onResult = function(result) {
    console.log(JSON.stringify(result, null, 4));
};

var onError = function(err) {
    console.log(err);
}
 
var hostname = "192.168.1.148",
    username = "7AUPhCnc5SLS9AThF-qdFO2J1sAWrLP0DeaJwCjH",
    api;
 
api = new HueApi(hostname, username);
// Set light state to 'on' with warm white value of 500 and brightness set to 100% 
state = lightState.create().on().white(50, 50);
 
// -------------------------- 
// Using a promise 
api.setLightState(5, state)
    .then(onResult)
    .fail(onError)
    .done();
*/

var ArtikCloud = require('artikcloud-js');

var defaultClient = ArtikCloud.ApiClient.default;

// Configure OAuth2 access token for authorization: artikcloud_oauth 
var artikcloud_oauth = defaultClient.authentications['artikcloud_oauth'];
artikcloud_oauth.accessToken = "YOUR ACCESS TOKEN"

var api = new ArtikCloud.DeviceTypesApi()

var deviceTypeId = "deviceTypeId_example"; // {String} deviceTypeId 


var callback = function(error, data, response) {
  if (error) {
    console.error(error);
  } else {
    console.log('API called successfully. Returned data: ' + data);
  }
};
api.getAvailableManifestVersions(deviceTypeId, callback);
