var createAction = require('./createAction');

/**
 * Convenience function for creating a set of actions
 *
 * @param actionNames the names for the actions to be created
 * @returns an object with actions of corresponding action names
 */
/*jshint -W093 */
module.exports = function (actionNames) {
    return actionNames.reduce(function (actions, name) {
        return (actions[name] = createAction()) && actions;
    }, {});
};
