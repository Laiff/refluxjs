/**
 * Created by laiff on 29.11.14.
 */
var Reflux = require('./src');

var action = Reflux.createActions(["load","loadComplete","loadError"]).load;
action.preEmit = function() {};
action();

console.log(action);
