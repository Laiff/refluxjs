var Reflux = require('../src'),
    _ = require('./utils');

module.exports = function (listenable, key) {
    return {
        componentWillMount: function () {
            var me = this,
                cb = (key === undefined ? this.setState : function (v) {
                    me.setState(_.object([key], [v]));
                });
            this.listenTo(listenable, cb, cb);
        },

        componentWillUnmount: Reflux.ListenerMethods.componentWillUnmount
    };
};
