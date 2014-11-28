/**
 * Created by laiff on 29.11.14.
 */
var daggy = require('daggy'),
    invariant = require('react/lib/invariant'),
    mapObject = require('react/lib/mapObject'),

    Store = require('./Store'),
    Action = require('./Action');

function RefluxApp(options) {
    var self = daggy.getInstance(this, RefluxApp);
    self.stores = {};
    self.actions = {};
    return self;
}

RefluxApp.prototype.registerStore = function(store) {
    invariant(
        store instanceof Store,
        "Only Stores can be registered here"
    );
    this.stores[store.symbol] = store;
};

RefluxApp.prototype.registerAction = function(actions) {
    mapObject(actions, function(action){
        invariant(
            action instanceof Action,
            "Only Actions can be registered here"
        );
        this.actions[action.symbol] = action;
    });
};

RefluxApp.prototype.createContext = function(options) {
    var context = Context();
    context.stores = mapObject(this.stores, this.startLivecycle);
    context.actions = mapObject(this.actions, this.startLivecycle);
    return context;
};

module.exports = RefluxApp;
