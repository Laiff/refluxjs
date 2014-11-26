var invariant = require('react/lib/invariant'),
    mixInto = require('react/lib/mixInto'),
    mergeInto = require('react/lib/mergeInto'),
    _ = require('./utils'),
    Reflux = require('../src'),
    Keep = require('./Keep'),
    allowed = {preEmit:1,shouldEmit:1},
    bindMethods = require('./bindMethods');

/**
 * Creates an event emitting Data Store. It is mixed in with functions
 * from the `ListenerMethods` and `PublisherMethods` mixins. `preEmit`
 * and `shouldEmit` may be overridden in the definition object.
 *
 * @param {Object} definition The data store object definition
 * @returns {Store} A data store instance
 */
module.exports = function(definition) {

    definition = definition || {};

    for(var a in Reflux.StoreMethods){
        if (!allowed[a] && (Reflux.PublisherMethods[a] || Reflux.ListenerMethods[a])){
            throw new Error("Cannot override API method " + a +
                " in Reflux.StoreMethods. Use another method name or override it on Reflux.PublisherMethods / Reflux.ListenerMethods instead."
            );
        }
    }
    for (var d in definition) {
        invariant(
                allowed[d] || !(Reflux.PublisherMethods[d] || Reflux.ListenerMethods[d]),
                "Cannot override API method `%s` in action creation. " +
                "Use another method name or override it on Reflux.PublisherMethods / Reflux.ListenerMethods instead.",
            d
        );
    }

    function Store() {
        this.subscriptions = [];
        this.emitter = new _.EventEmitter();
        this.eventLabel = "change";
        if (this.init && _.isFunction(this.init)) {
            this.init();
        }
        if (this.listenables){
            [].concat(this.listenables).forEach(this.listenToMany);
        }
    }

    var context = {};
    mergeInto(context, Reflux.ListenerMethods);
    mergeInto(context, Reflux.PublisherMethods);
    mergeInto(context, Reflux.StoreMethods);
    mergeInto(context, definition);

    mixInto(Store, context);

    var store = bindMethods(new Store(), definition);
    Keep.createdStores.push(store);

    return store;
};
