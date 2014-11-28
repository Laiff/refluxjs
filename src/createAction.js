var invariant = require('react/lib/invariant'),
    mergeInto = require('react/lib/mergeInto'),
    _ = require('./utils'),
    Reflux = require('../src'),
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

    for(var a in Reflux.ActionMethods){
        if (!allowed[a] && Reflux.PublisherMethods[a]) {
            throw new Error("Cannot override API method " + a +
                " in Reflux.ActionMethods. Use another method name or override it on Reflux.PublisherMethods instead."
            );
        }
    }
    for (var d in definition) {
        invariant(
            allowed[d] || !Reflux.PublisherMethods[d],
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

    var context = {};
    mergeInto(context, internal);
    mergeInto(context, Reflux.PublisherMethods);
    mergeInto(context, Reflux.ActionMethods);
    mergeInto(context, definition);

    var functor = function () {
        functor[functor.sync ? "trigger" : "triggerAsync"].apply(functor, arguments);
    };

    mergeInto(functor, context);

    Keep.createdActions.push(functor);

    return functor;
};
