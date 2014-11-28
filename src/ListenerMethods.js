var invariant = require('react/lib/invariant'),
    _ = require('./utils'),
    maker = require('./joins').instanceJoinCreator;

/**
 * A module of methods related to listening.
 */
module.exports = {

    /**
     * An internal utility function used by `validateListening`
     *
     * @param {Action|Store} listenable The listenable we want to search for
     * @returns {Boolean} The result of a recursive search among `this.subscriptions`
     */
<<<<<<< HEAD
    hasListener: function (listenable) {
        var i = 0,
            listener;
        for (; i < (this.subscriptions || []).length; ++i) {
            listener = this.subscriptions[i].listenable;
            if (listener === listenable || listener.hasListener && listener.hasListener(listenable)) {
                return true;
=======
    hasListener: function(listenable) {
        var i = 0, j, listener, listenables;
        for (;i < (this.subscriptions||[]).length; ++i) {
            listenables = [].concat(this.subscriptions[i].listenable);
            for (j = 0; j < listenables.length; j++){
                listener = listenables[j];
                if (listener === listenable || listener.hasListener && listener.hasListener(listenable)) {
                    return true;
                }
>>>>>>> spoike/master
            }
        }
        return false;
    },

    /**
     * A convenience method that listens to all listenables in the given object.
     *
     * @param {Object} listenables An object of listenables. Keys will be used as callback method names.
     */
    listenToMany: function (listenables) {
        for (var key in listenables) {
            var cbName = _.callbackName(key),
                localName = this[cbName] ? cbName : this[key] ? key : undefined;
            if (localName) {
                var defaultCallback = this[cbName + "Default"] || this[localName + "Default"] || localName;
                this.listenTo(listenables[key], localName, defaultCallback);
            }
        }
    },

    /**
     * Checks if the current context can listen to the supplied listenable
     *
     * @param {(Action|Store)} listenable An Action or Store that should be
     *  listened to.
     * @returns {String|Undefined} An error message, or undefined if there was no problem.
     */
    validateListening: function (listenable) {
        invariant(
            listenable !== this,
            "Listener is not able to listen to itself"
        );
        invariant(
            _.isFunction(listenable.listen),
            "`%s` is missing a listen method",
            listenable
        );
        invariant(
            !(listenable.hasListener && listenable.hasListener(this)),
            "Listener cannot listen to this listenable because of circular loop"
        );
    },

    /**
     * Sets up a subscription to the given listenable for the context object
     *
     * @param {Action|Store} listenable An Action or Store that should be
     *  listened to.
     * @param {Function|String} callback The callback to register as event handler
     * @param {Function|String} defaultCallback The callback to register as default handler
     * @returns {Object} A subscription obj where `stop` is an unsub function and `listenable` is the object being listened to
     */
<<<<<<< HEAD
    listenTo: function (listenable, callback, defaultCallback) {
        var deSub, unsubscriber, subscriptionObj,
            subs = this.subscriptions = this.subscriptions || [];
        this.validateListening(listenable);
        this.fetchDefaultData(listenable, defaultCallback);
        deSub = listenable.listen(this[callback] || callback, this);
        unsubscriber = function () {
            var index = subs.indexOf(subscriptionObj);
            invariant(index !== -1, 'Tried to remove listen already gone from subscriptions list!');
=======
    listenTo: function(listenable, callback, defaultCallback) {
        var desub, unsubscriber, subscriptionobj, subs = this.subscriptions = this.subscriptions || [];
        _.throwIf(this.validateListening(listenable));
        this.fetchInitialState(listenable, defaultCallback);
        desub = listenable.listen(this[callback]||callback, this);
        unsubscriber = function() {
            var index = subs.indexOf(subscriptionobj);
            _.throwIf(index === -1,'Tried to remove listen already gone from subscriptions list!');
>>>>>>> spoike/master
            subs.splice(index, 1);
            deSub();
        };
        subscriptionObj = {
            stop: unsubscriber,
            listenable: listenable
        };
        subs.push(subscriptionObj);
        return subscriptionObj;
    },

    /**
     * Stops listening to a single listenable
     *
     * @param {Action|Store} listenable The action or store we no longer want to listen to
     * @returns {Boolean} True if a subscription was found and removed, otherwise false.
     */
    stopListeningTo: function (listenable) {
        var subs = this.subscriptions;
        return !!subs.reduce(function (acc, sub) {
            if (sub.listenable === listenable) {
                sub.stop();
                invariant(subs.indexOf(sub) === -1, 'Failed to remove listen from subscriptions list!');
                return true;
            }
            return acc;
        }, false);
    },

    /**
     * Stops all subscriptions and empties subscriptions array
     */
    stopListeningToAll: function () {
        var remaining, subs = this.subscriptions;
        while ((remaining = subs.length)) {
            subs[0].stop();
            invariant(subs.length === remaining - 1, 'Failed to remove listen from subscriptions list!');
        }
    },

    /**
     * Used in `listenTo`. Fetches initial data from a publisher if it has a `getInitialState` method.
     * @param {Action|Store} listenable The publisher we want to get initial state from
     * @param {Function|String} defaultCallback The method to receive the data
     */
    fetchInitialState: function (listenable, defaultCallback) {
        defaultCallback = (defaultCallback && this[defaultCallback]) || defaultCallback;
        var me = this;
<<<<<<< HEAD
        if (_.isFunction(defaultCallback) && _.isFunction(listenable.getDefaultData)) {
            var data = listenable.getDefaultData();
=======
        if (_.isFunction(defaultCallback) && _.isFunction(listenable.getInitialState)) {
            data = listenable.getInitialState();
>>>>>>> spoike/master
            if (data && _.isFunction(data.then)) {
                data.then(function () {
                    defaultCallback.apply(me, arguments);
                });
            } else {
                defaultCallback.call(this, data);
            }
        }
    },

    /**
     * The callback will be called once all listenables have triggered at least once.
     * It will be invoked with the last emission from each listenable.
     * @param {...Publishers} publishers Publishers that should be tracked.
     * @param {Function|String} callback The method to call when all publishers have emitted
     * @returns {Object} A subscription obj where `stop` is an unsub function and `listenable` is an array of listenables
     */
    joinTrailing: maker("last"),

    /**
     * The callback will be called once all listenables have triggered at least once.
     * It will be invoked with the first emission from each listenable.
     * @param {...Publishers} publishers Publishers that should be tracked.
     * @param {Function|String} callback The method to call when all publishers have emitted
     * @returns {Object} A subscription obj where `stop` is an unsub function and `listenable` is an array of listenables
     */
    joinLeading: maker("first"),

    /**
     * The callback will be called once all listenables have triggered at least once.
     * It will be invoked with all emission from each listenable.
     * @param {...Publishers} publishers Publishers that should be tracked.
     * @param {Function|String} callback The method to call when all publishers have emitted
     * @returns {Object} A subscription obj where `stop` is an unsub function and `listenable` is an array of listenables
     */
    joinConcat: maker("all"),

    /**
     * The callback will be called once all listenables have triggered.
     * If a callback triggers twice before that happens, an error is thrown.
     * @param {...Publishers} publishers Publishers that should be tracked.
     * @param {Function|String} callback The method to call when all publishers have emitted
     * @returns {Object} A subscription obj where `stop` is an unsub function and `listenable` is an array of listenables
     */
    joinStrict: maker("strict")
};
