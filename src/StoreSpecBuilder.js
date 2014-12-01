/**
 * Created by laiff on 01.12.14.
 */
var assign = require('react/lib/Object.assign'),
    invariant = require('react/lib/invariant'),
    daggy = require('daggy'),
    isFunction = require('./utils').isFunction,
    isObject = require('./utils').isObject,

    StoreSpecBuilder = daggy.tagged('spec');

/**
 * Create spec builder for basic definition
 *
 * @param spec
 * @returns {StoreSpecBuilder}
 */
StoreSpecBuilder.of = function(spec) {
    return StoreSpecBuilder(spec);
};

/**
 * Create Symbol for future identification of objects
 *
 * @param {string} key
 * @returns {StoreSpecBuilder}
 */
StoreSpecBuilder.prototype.symbol = function(key) {
    return StoreSpecBuilder(assign({}, this.spec, {symbol: Symbol.for(key)}))
};

/**
 * Add mixin for spec
 *
 * @param {Object} mixin
 * @returns {StoreSpecBuilder}
 */
StoreSpecBuilder.prototype.mixin = function(mixin) {
    var mixins = this.spec.mixins || [];
    mixins.push(mixin);
    return StoreSpecBuilder(assign({}, this.spec, {mixins: mixins}))
};

StoreSpecBuilder.prototype.preEmit = function(f) {
    invariant(
        isFunction(f),
        "preEmit should be a function"
    );
    return StoreSpecBuilder(assign({}, this.spec, {preEmit: f}))
};

StoreSpecBuilder.prototype.shouldEmit = function(f) {
    invariant(
        isFunction(f),
        "shouldEmit should be a function"
    );
    return StoreSpecBuilder(assign({}, this.spec, {shouldEmit: f}))
};

/**
 * Build store specification for create store class
 *
 * @returns {StoreSpec}
 */
StoreSpecBuilder.prototype.build = function() {
    return this.spec;
};

module.exports = StoreSpecBuilder;
