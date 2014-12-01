/**
 * Created by laiff on 01.12.14.
 */

var RefluxApp = require('./RefluxApp'),
    RefluxClass = require('./RefluxClass'),
    StoreSpecBuilder = require('./StoreSpecBuilder'),

    Publisher = require('./mixins/Publisher'),
    Listener = require('./mixins/Listener'),
    Store = require('./mixins/Store');

var RefluxStore = {};

RefluxStore.create = function(spec) {
    var Store = RefluxClass.createClass(
        StoreSpecBuilder.of(spec)
            .mixin(Publisher)
            .mixin(Listener)
            .mixin(Store)
            .build()
    );
    RefluxApp.registerStore(Store);
    return Store;
};

RefluxStore.isValidStore = function(maybeStore) {
    return maybeStore && !!maybeStore.isStore;
};

module.exports = RefluxStore;
