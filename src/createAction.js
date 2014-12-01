var invariant = require('react/lib/invariant'),
    assign = require('xtend/mutable'),
    _ = require('./utils'),
    ActionMethods = require('./mixins/Action'),
    PublisherMethods = require('./mixins/Publisher'),
    Keep = require('./Keep'),
    allowed = {preEmit: 1, shouldEmit: 1};

/**
 * Creates an action functor object. It is mixed in with functions
 * from the `PublisherMethods` mixin. `preEmit` and `shouldEmit` may
 * be overridden in the definition object.
 *
 * @param {Object} definition The action object definition
 * @returns {Action} Action
 */
module.exports = function (definition) {

    definition = definition || {};

    for(var a in Action) {
        invariant(
            allowed[a] || !Publisher[a],
            "Cannot override API method `%s` in Reflux.ActionMethods. " +
            "Use another method name or override it on Reflux.PublisherMethods instead.",
            a
        );
    }

    for (var d in definition) {
        invariant(
            allowed[d] || !Publisher[d],
            "Cannot override API method `%s` in action creation. " +
            "Use another method name or override it on Reflux.PublisherMethods instead.",
            d
        );
    }

    var internal = {
        sync: false,
        eventLabel: "action",
        emitter: new _.EventEmitter(),
        _isAction: true
    };

    var functor = function () {
        functor[functor.sync ? "trigger" : "triggerAsync"].apply(functor, arguments);
    };

    assign(functor, internal, Publisher, Action, definition);

    Keep.createdActions.push(functor);

    return functor;
};
