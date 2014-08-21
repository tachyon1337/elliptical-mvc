/*
 * =============================================================
 * elliptical.proto v0.9.1
 * =============================================================
 * Copyright (c) 2014 S.Francis, MIS Interactive
 * Licensed MIT
 *
 * Dependencies:
 * none
 *
 * EcmaScript5 inheritance pattern mostly culled from:
 * https://github.com/daffl/uberproto
 *
 * Ecma5 Object.create() allows us to dispense with the "facade" of the classical inheritance pattern
 * and the use of function constructors to create object factories. Object.create gives us
 * a clear and non-confusing prototype chain--i.e., prototypal inheritance.
 *
 * However, Ecma6 looks to introduce "Class" as a formal javascript construct, thus guaranteeing that
 * there will be no "official standard pattern" for javascript inheritance. In fact, with the creep of
 * javascript superset langs like typescript, classical inheritance syntax not only is not going anywhere, but likely will predominate,
  * particularly for large-scale apps/frameworks.
  *
  * Hence, at least for the present, this framework treats "proto" as an alt inheritance pattern and not as the core one
 */

//umd pattern

(function (root, factory) {
    if (typeof module !== 'undefined' && module.exports) {
        //commonjs
        module.exports = factory();
    } else if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define([], factory);
    } else {
        // Browser globals (root is window)
        root.elliptical.proto=factory();
        root.returnExports = root.elliptical.proto;
    }
}(this, function () {

    var proto={

        /**
         *
         * @returns {Object}
         */
        create: function () {
            var instance = Object.create(this),
                init = typeof instance.__init === 'string' ? instance.__init : 'init';
            if (typeof instance[init] === "function") {
                instance[init].apply(instance, arguments);
            }
            return instance;
        },


        /**
         * Mixin a given set of properties
         * @param prop {Object} The properties to mix in
         * @param obj {Object} [optional] The object to add the mixin
         */
        mixin: function (prop, obj) {
            var self = obj || this,
                fnTest = /\b_super\b/,
                _super = Object.getPrototypeOf(self) || self.prototype,
                _old;

            // Copy the properties over
            for (var name in prop) {
                // store the old function which would be overwritten
                _old = self[name];
                // Check if we're overwriting an existing function
                self[name] = (typeof prop[name] === "function" && typeof _super[name] === "function" && fnTest.test(prop[name])) ||
                    (typeof _old === "function" && typeof prop[name] === "function") ? //
                    (function (old, name, fn) {
                        return function () {
                            var tmp = this._super;

                            // Add a new ._super() method that is the same method
                            // but either pointing to the prototype method
                            // or to the overwritten method
                            this._super = (typeof old === 'function') ? old : _super[name];

                            // The method only need to be bound temporarily, so we
                            // remove it when we're done executing
                            var ret = fn.apply(this, arguments);
                            this._super = tmp;

                            return ret;
                        };
                    })(_old, name, prop[name]) : prop[name];
            }

            return self;
        },


        /**
         * Extend the current or a given object with the given property
         * and return the extended object.
         * @param prop {Object} The properties to extend with
         * @param obj {Object} [optional] The object to extend from
         * @returns {Object} The extended object
         */
        extend: function (prop, obj) {
            return this.mixin(prop, Object.create(obj || this));
        },


        /**
         * Return a callback function with this set to the current or a given context object.
         * @param name {String} Name of the method to proxy
         * @param args... [optional] Arguments to use for partial application
         */
        proxy: function (name) {
            var fn = this[name],
                args = Array.prototype.slice.call(arguments, 1);

            args.unshift(this);
            return fn.bind.apply(fn, args);
        }
    };

    return proto;
}));

