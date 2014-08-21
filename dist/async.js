/*
 * =============================================================
 * elliptical.async
 * =============================================================
 * Copyright (c) 2014 S.Francis, MIS Interactive
 * Licensed MIT
 *
 * Dependencies:
 * async library
 *
 * merely copying a reference of async over to the elliptical namespace. For browsers, we'll delete
 * the global reference from root(window)
 *
 */

//umd pattern

(function (root, factory) {
    if (typeof module !== 'undefined' && module.exports) {
        //commonjs
        module.exports = factory(require('async'));
    } else if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define(['async'], factory);
    } else {
        // Browser globals (root is window)
        root.elliptical.async=factory(root.async);
        root.returnExports = root.elliptical.async;
    }
}(this, function (async) {
    return async;
}));
