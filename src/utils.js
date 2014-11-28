/*
 * isObject, extend, isFunction, isArguments are taken from undescore/lodash in
 * order to remove the dependency
 */
exports.isObject = function (obj) {
    var type = typeof obj;
    return type === 'function' || type === 'object' && !!obj;
};

exports.isFunction = function(value) {
    return typeof value === 'function';
};

exports.isArguments = function (value) {
    return value && typeof value == 'object' && typeof value.length == 'number' &&
        (toString.call(value) === '[object Arguments]' || (hasOwnProperty.call(value, 'callee' && !propertyIsEnumerable.call(value, 'callee')))) || false;
};

exports.EventEmitter = require('eventemitter3');

require('setimmediate2');
exports.nextTick = function(callback) {
    setImmediate(callback);
};

exports.callbackName = function(string){
    return "on" + string.charAt(0).toUpperCase() + string.slice(1);
};

exports.object = function(keys,vals){
    var o={}, i=0;
    for(;i<keys.length;i++){
        o[keys[i]] = vals[i];
    }
    return o;
};
