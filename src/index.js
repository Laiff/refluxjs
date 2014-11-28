exports.ActionMethods = require('./ActionMethods');

exports.ListenerMethods = require('./ListenerMethods');
exports.PublisherMethods = require('./PublisherMethods');

exports.StoreMethods = require('./StoreMethods');

exports.createAction = require('./createAction');
exports.createActions = require('./createActions');
exports.createStore = require('./createStore');
exports.connect = require('./connect');
exports.ListenerMixin = require('./ListenerMixin');
exports.listenTo = require('./listenTo');
exports.listenToMany = require('./listenToMany');
exports.ActionMethods = require('./ActionMethods');

var maker = require('./joins').staticJoinCreator;
exports.joinTrailing = exports.all = maker("last"); // Reflux.all alias for backward compatibility
exports.joinLeading = maker("first");
exports.joinStrict = maker("strict");
exports.joinConcat = maker("all");

/**
 * Sets the eventmitter that Reflux uses
 */
exports.setEventEmitter = function(ctx) {
    var _ = require('./utils');
    _.EventEmitter = ctx;
};

/**
 * Sets the method used for deferring actions and stores
 */
exports.nextTick = function(nextTick) {
    var _ = require('./utils');
    _.nextTick = nextTick;
};

/**
 * Provides the set of created actions and stores for introspection
 */
exports.__keep = require('./Keep');

/**
 * Warn if Function.prototype.bind not available
 */
if (!Function.prototype.bind) {
    console.error(
        'Function.prototype.bind not available. ' +
        'ES5 shim required. ' +
        'https://github.com/spoike/refluxjs#es5'
    );
}
