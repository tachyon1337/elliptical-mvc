/*
 * =============================================================
 * elliptical.$Provider
 * =============================================================
 */

//umd pattern

(function (root, factory) {
    if (typeof module !== 'undefined' && module.exports) {
        //commonjs
        module.exports = factory(require('../class/class'));
    } else if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define(['../class/class'], factory);
    } else {
        // Browser globals (root is window)
        root.elliptical.Provider=factory(root.elliptical.Class);
        root.returnExports = root.elliptical.$Provider;
    }
}(this, function (Class) {

    var $Provider = function(name){
        return Class.extend({
            '@class':name

        },{});
    };

    return $Provider;


}));
