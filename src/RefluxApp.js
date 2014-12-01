/**
 * Created by laiff on 29.11.14.
 */
var daggy = require('daggy'),
    invariant = require('react/lib/invariant'),
    mapObject = require('react/lib/mapObject'),

    RefluxStore = require('./RefluxStore'),
    Action = require('./mixins/Action');

function RefluxApp(options) {
    var self = daggy.getInstance(this, RefluxApp);
    self.stores = {};
    self.actions = {};
    return self;
}

RefluxApp.registerStore = function(store) {
    invariant(
        RefluxStore.isValidStore(store),
        "Only Stores can be registered here"
    );
    RefluxApp.stores[store.symbol] = store;
};

RefluxApp.registerAction = function(actions) {
    mapObject(actions, function(action){
        invariant(
            action instanceof Action,
            "Only Actions can be registered here"
        );
        RefluxApp.actions[action.symbol] = action;
    });
};

RefluxApp.createContext = function(options) {
    var context = Context();
    context.stores = mapObject(this.stores, this.startLivecycle);
    context.actions = mapObject(this.actions, this.startLivecycle);
    return context;
};

module.exports = RefluxApp;
