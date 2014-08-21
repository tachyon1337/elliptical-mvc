/*
 * =============================================================
 * elliptical.factory v0.9.1
 * =============================================================
 * Copyright (c) 2014 S.Francis, MIS Interactive
 * Licensed MIT
 *
 * Dependencies:
 *
 */

//umd pattern

(function (root, factory) {
    if (typeof module !== 'undefined' && module.exports) {
        //commonjs
        module.exports = factory(require('elliptical-utils'));
    } else if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define(['elliptical-utils'], factory);
    } else {
        // Browser globals (root is window)
        root.elliptical.factory=factory(root.elliptical.utils);
        root.returnExports = root.elliptical.factory;
    }
}(this, function (utils) {
    var _=utils._;

    var factory={
        partial:function(){
            var args = [].slice.call(arguments);
            return _.partial.apply(this,args);
        },

        partialRight:function(){
            var args = [].slice.call(arguments);
            return _.partialRight.apply(this,args);
        },

        curry:function(){
            var args = [].slice.call(arguments);
            return _.curry.apply(this,args);
        },

        defer:function(){
            var args = [].slice.call(arguments);
            return _.defer.apply(this,args);
        },

        delay:function(){
            var args = [].slice.call(arguments);
            return _.delay.apply(this,args);
        },

        after:function(){
            var args = [].slice.call(arguments);
            return _.after.apply(this,args);
        },

        bind:function(){
            var args = [].slice.call(arguments);
            return _.bind.apply(this,args);
        },

        bindKey:function(){
            var args = [].slice.call(arguments);
            return _.bindKey.apply(this,args);
        },

        bindAll:function(){
            var args = [].slice.call(arguments);
            return _.bindAll.apply(this,args);
        },

        debounce:function(){
            var args = [].slice.call(arguments);
            return _.debounce.apply(this,args);
        },

        throttle:function(){
            var args = [].slice.call(arguments);
            return _.throttle.apply(this,args);
        },


        wrap:function(){
            var args = [].slice.call(arguments);
            return _.wrap.apply(this,args);
        },

        memoize:function(){
            var args = [].slice.call(arguments);
            return _.memoize.apply(this,args);
        }

    };

    return factory;

}));
