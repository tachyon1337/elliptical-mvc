/*
 * =============================================================
 * elliptical.Service
 * =============================================================
 *
 */

//umd pattern

(function (root, factory) {
    if (typeof module !== 'undefined' && module.exports) {
        //commonjs
        module.exports = factory(require('../model/model'));
    } else if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define(['../model/model'], factory);
    } else {
        // Browser globals (root is window)
        root.elliptical.Service=factory(root.elliptical.Model);
        root.returnExports = root.elliptical.Service;
    }
}(this, function (Model) {

    var Service=Model.extend({
        _data:null, //{Object}
        '@class':null,
        $provider:null

    },{});

    return Service;




}));

