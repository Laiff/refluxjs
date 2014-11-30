/**
 * Created by laiff on 29.11.14.
 */

var ReactErrorUtils = require('react/lib/ReactErrorUtils'),

    assign = require('react/lib/Object.assign'),
    invariant = require('react/lib/invariant'),
    keyMirror = require('react/lib/keyMirror'),
    keyOf = require('react/lib/keyOf');

var MIXINS_KEY = keyOf({mixins: null});

/**
 * Policies that describe methods in `RefluxClass`.
 */
var SpecPolicy = keyMirror({
    /**
     * These methods may be defined only once by the class specification or mixin.
     */
    DEFINE_ONCE: null,
    /**
     * These methods may be defined by both the class specification and mixins.
     * Subsequent definitions will be chained. These methods must return void.
     */
    DEFINE_MANY: null,
    /**
     * These methods are overriding the base class.
     */
    OVERRIDE_BASE: null,
    /**
     * These methods are similar to DEFINE_MANY, except we assume they return
     * objects. We try to merge the keys of the return values of all the mixed in
     * functions. If there is a key conflict we throw.
     */
    DEFINE_MANY_MERGED: null
});


var RefluxClassInterface = {

    /**
     * An array of Mixin objects to include when defining your component.
     *
     * @type {array}
     * @optional
     */
    mixins: SpecPolicy.DEFINE_MANY,

    /**
     * Invoked once before the component is mounted. The return value will be used
     * as the initial value of `this.state`.
     *
     *   getInitialState: function() {
     *   return {
     *       isOn: false,
     *       fooBaz: new BazFoo()
     *     }
     *   }
     *
     * @return {object}
     * @optional
     */
    getInitialState: SpecPolicy.DEFINE_MANY_MERGED,

    // Delegate methods

    /**
     * Invoked when the store have been created.
     * Usual used for initialize store fields with initial values
     *
     * @optional
     */
    storeWillCreate: SpecPolicy.DEFINE_MANY,

    /**
     * Invoked when the store start lifecycle.
     * This method may have side effects, but any external subscriptions
     * has been cleaned up in `storeWillDestroy`
     *
     * @optional
     */
    storeWillInit: SpecPolicy.DEFINE_MANY,

    /**
     * Invoked when the store end lifecycle.
     * Usual used for clean up external subscriptions
     *
     * @optional
     */
    storeWillDestroy: SpecPolicy.DEFINE_MANY,

    // Advanced

    /**
     * Invoked on server-side only before destroying store
     * to save store state and transfer it to client
     *
     * @return {Object} serialized store state
     * @optional
     */
    serializeState: SpecPolicy.DEFINE_MANY_MERGED,

    /**
     * Invoked on client-side only before store have start lifecycle
     *
     * @param {object} serialized store state
     * @optional
     */
    deserializeState: SpecPolicy.DEFINE_MANY_MERGED
};

/**
 * Mapping from class specification keys to special processing functions.
 *
 */
var RESERVED_SPEC_KEYS = {

    symbol: function(Constructor, symbol) {
        Constructor.symbol = symbol;
    },

    displayName: function(Constructor, displayName) {
        Constructor.displayName = displayName;
    },

    mixins : function(Constructor, mixins) {
        if (mixins) {
            for (var i = 0; i < mixins.length; i++) {
                mixSpecIntoStore(Constructor, mixins[i]);
            }
        }
    }
};


function validateMethodOverride(proto, name) {
    var specPolicy = RefluxClassInterface.hasOwnProperty(name) ?
        RefluxClassInterface[name] :
        null;

    // Disallow overriding of base class methods unless explicitly allowed.
    if (RefluxClassMixin.hasOwnProperty(name)) {
        invariant(
            specPolicy === SpecPolicy.OVERRIDE_BASE,
            'RefluxClassInterface: You are attempting to override ' +
            '`%s` from your class specification. Ensure that your method names ' +
            'do not overlap with Reflux methods.',
            name
        );
    }

    // Disallow defining methods more than once unless explicitly allowed.
    if (proto.hasOwnProperty(name)) {
        invariant(
            specPolicy === SpecPolicy.DEFINE_MANY ||
            specPolicy === SpecPolicy.DEFINE_MANY_MERGED,
            'RefluxClassInterface: You are attempting to define ' +
            '`%s` on your component more than once. This conflict may be due ' +
            'to a mixin.',
            name
        );
    }
}

/**
 * Mixin helper which handles policy validation and reserved
 * specification keys when building Reflux classes.
 */
function mixSpecIntoStore(Constructor, spec) {
    if (!spec) {
        return;
    }

    invariant(
        typeof spec !== 'function',
        'RefluxClass: You\'re attempting to ' +
        'use a component class as a mixin. Instead, just use a regular object.'
    );
    invariant(
        !Reflux.isValidStore(spec),
        'RefluxClass: You\'re attempting to ' +
        'use a component as a mixin. Instead, just use a regular object.'
    );

    var proto = Constructor.prototype;

    // By handling mixins before any other properties, we ensure the same
    // chaining order is applied to methods with DEFINE_MANY policy, whether
    // mixins are listed before or after these methods in the spec.
    if (spec.hasOwnProperty(MIXINS_KEY)) {
        RESERVED_SPEC_KEYS.mixins(Constructor, spec.mixins);
    }

    for (var name in spec) {
        if (!spec.hasOwnProperty(name)) {
            continue;
        }

        if (name === MIXINS_KEY) {
            // We have already handled mixins in a special case above
            continue;
        }

        var property = spec[name];
        validateMethodOverride(proto, name);

        if (RESERVED_SPEC_KEYS.hasOwnProperty(name)) {
            RESERVED_SPEC_KEYS[name](Constructor, property);
        } else {
            // Setup methods on prototype:
            // The following member methods should not be automatically bound:
            // 1. Expected ReactClass methods (in the "interface").
            // 2. Overridden methods (that were mixed in).
            var isRefluxClassMethod =
                RefluxClassInterface.hasOwnProperty(name);
            var isAlreadyDefined = proto.hasOwnProperty(name);
            var markedDontBind = property && property.__reactDontBind;
            var isFunction = typeof property === 'function';
            var shouldAutoBind =
                isFunction &&
                !isRefluxClassMethod &&
                !isAlreadyDefined &&
                !markedDontBind;

            if (shouldAutoBind) {
                if (!proto.__refluxAutoBindMap) {
                    proto.__refluxAutoBindMap = {};
                }
                proto.__refluxAutoBindMap[name] = property;
                proto[name] = property;
            } else {
                if (isAlreadyDefined) {
                    var specPolicy = RefluxClassInterface[name];

                    // These cases should already be caught by validateMethodOverride
                    invariant(
                        isRefluxClassMethod && (
                        specPolicy === SpecPolicy.DEFINE_MANY_MERGED ||
                        specPolicy === SpecPolicy.DEFINE_MANY
                        ),
                        'RefluxClass: Unexpected spec policy %s for key %s ' +
                        'when mixing in component specs.',
                        specPolicy,
                        name
                    );

                    // For methods which are defined more than once, call the existing
                    // methods before calling the new property, merging if appropriate.
                    if (specPolicy === SpecPolicy.DEFINE_MANY_MERGED) {
                        proto[name] = createMergedResultFunction(proto[name], property);
                    } else if (specPolicy === SpecPolicy.DEFINE_MANY) {
                        proto[name] = createChainedFunction(proto[name], property);
                    }
                } else {
                    proto[name] = property;
                    if (__DEV__) {
                        // Add verbose displayName to the function, which helps when looking
                        // at profiling tools.
                        if (typeof property === 'function' && spec.displayName) {
                            proto[name].displayName = spec.displayName + '_' + name;
                        }
                    }
                }
            }
        }
    }
}

/**
 * Merge two objects, but throw if both contain the same key.
 *
 * @param {object} one The first object, which is mutated.
 * @param {object} two The second object
 * @return {object} one after it has been mutated to contain everything in two.
 */
function mergeIntoWithNoDuplicateKeys(one, two) {
    invariant(
        one && two && typeof one === 'object' && typeof two === 'object',
        'mergeIntoWithNoDuplicateKeys(): Cannot merge non-objects.'
    );

    for (var key in two) {
        if (two.hasOwnProperty(key)) {
            invariant(
                one[key] === undefined,
                'mergeIntoWithNoDuplicateKeys(): ' +
                'Tried to merge two objects with the same key: `%s`. This conflict ' +
                'may be due to a mixin; in particular, this may be caused by two ' +
                'getInitialState() methods returning objects with clashing keys.',
                key
            );
            one[key] = two[key];
        }
    }
    return one;
}

/**
 * Creates a function that invokes two functions and merges their return values.
 *
 * @param {function} one Function to invoke first.
 * @param {function} two Function to invoke second.
 * @return {function} Function that invokes the two argument functions.
 * @private
 */
function createMergedResultFunction(one, two) {
    return function mergedResult() {
        var a = one.apply(this, arguments);
        var b = two.apply(this, arguments);
        if (a == null) {
            return b;
        } else if (b == null) {
            return a;
        }
        var c = {};
        mergeIntoWithNoDuplicateKeys(c, a);
        mergeIntoWithNoDuplicateKeys(c, b);
        return c;
    };
}

/**
 * Creates a function that invokes two functions and ignores their return vales.
 *
 * @param {function} one Function to invoke first.
 * @param {function} two Function to invoke second.
 * @return {function} Function that invokes the two argument functions.
 * @private
 */
function createChainedFunction(one, two) {
    return function chainedFunction() {
        one.apply(this, arguments);
        two.apply(this, arguments);
    };
}

/**
 * Binds a method to the component.
 *
 * @param {object} component Component whose method is going to be bound.
 * @param {function} method Method to be bound.
 * @return {function} The bound method.
 */
function bindAutoBindMethod(component, method) {
    return method.bind(component);
}

/**
 * Binds all auto-bound methods in a component.
 *
 * @param {object} component Component whose method is going to be bound.
 */
function bindAutoBindMethods(component) {
    for (var autoBindKey in component.__refluxAutoBindMap) {
        if (component.__refluxAutoBindMap.hasOwnProperty(autoBindKey)) {
            var method = component.__refluxAutoBindMap[autoBindKey];
            component[autoBindKey] = bindAutoBindMethod(
                component,
                ReactErrorUtils.guard(
                    method,
                    component.constructor.displayName + '.' + autoBindKey
                )
            );
        }
    }
}

/**
 * @lends RefluxClass.prototype
 */
var RefluxClassMixin = {

};

var RefluxClassBase = function() {};
assign(
    RefluxClassBase.prototype,
    RefluxClassMixin
);

var RefluxClass = {

    createClass : function (spec) {
        var Constructor = function() {
            // Wire up auto-binding
            if (this.__refluxAutoBindMap) {
                bindAutoBindMethods(this);
            }
        };
        Constructor.prototype = new RefluxClassBase();
        Constructor.prototype.constructor = Constructor;

        mixSpecIntoStore(Constructor, spec);

        // Initialize the initialState property after all mixins have been merged
        if (Constructor.getInitialState) {
            Constructor.initialState = Constructor.getInitialState();
        }

        // Reduce time spent doing lookups by setting these on the prototype.
        for (var methodName in RefluxClassInterface) {
            if (!Constructor.prototype[methodName]) {
                Constructor.prototype[methodName] = null;
            }
        }

        return Constructor;
    }
};
