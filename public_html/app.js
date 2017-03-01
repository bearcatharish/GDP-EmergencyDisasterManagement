var Parse = require('parse/node').Parse;
var parseApplicationId = 'p1BiTwGFTIGB2Mm0YzyN0UXPxjjjxv5D72q0EdYI';
var parseJavascriptKey = 'z6RQbEU1IDzwUhLdc8RAmTysHADIbS1XRJ9zHQfu';
var parseMasterKey = 'DXXe1DjPAn8Y6pHicpgWzVzmeWlEyeE8sj8fULs1';

Parse.initialize(parseApplicationId, parseJavascriptKey, parseMasterKey);
Parse.serverURL = 'https://parseapi.back4app.com/';

Parse.Cloud.useMasterKey();

var obj = new Parse.Object('User');
obj.set('username', "Kalyan");
obj.save().then(function(obj) {
  console.log(obj.toJSON());
  var query = new Parse.Query('User');
  query.get(obj.id).then(function(objAgain) {
    console.log(objAgain.toJSON());
  }, function(err) {console.log(err); });
}, function(err) { console.log(err); });