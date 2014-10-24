var invariant = require('react/lib/invariant'),
    mixInto = require('react/lib/mixInto'),
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
 */
module.exports = function (definition) {

    definition = definition || {};

    for (var d in definition) {
        invariant(
            allowed[d] || !Reflux.PublisherMethods[d],
            "Cannot override API method `%s` in action creation. " +
            "Use another method name or override it on Reflux.PublisherMethods instead.",
            d
        );
    }

    var internal = {
        eventLabel: "action",
        emitter: new _.EventEmitter(),
        _isAction: true
    };

    var context = {};
    mergeInto(context, internal);
    mergeInto(context, Reflux.PublisherMethods);
    mergeInto(context, definition);

    var functor = function () {
        functor[functor.sync ? "trigger" : "triggerAsync"].apply(functor, arguments);
    };

    mixInto(functor, context);

    Keep.createdActions.push(functor);

    return functor
};
