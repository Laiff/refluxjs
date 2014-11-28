/**
 * Created by laiff on 29.11.14.
 */

var daggy = require('daggy'),

    Listener = require('./Listener'),
    Livecycle = require('./Livecycle');

var Store = daggy.tagged(['start']);

Store.create = function(definition) {
    return Store(function(context){
        this.context = context;
        return
    })
};
