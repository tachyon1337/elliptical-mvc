/*
 * =============================================================
 * elliptical.View
 * =============================================================
 *
 */

//umd pattern
(function (root, factory) {
    if (typeof module !== 'undefined' && module.exports) {
        //commonjs
        module.exports = factory(require('elliptical-utils'),require('../class/class'));
    } else if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define(['elliptical-utils','../class/class'], factory);
    } else {
        // Browser globals (root is window)
        root.elliptical.View=factory(root.elliptical.utils,root.elliptical.Class);
        root.returnExports = root.elliptical.View;
    }
}(this, function (utils,Class) {


    var isBrowser=utils.isBrowser,
        _=utils._,
        isFunction=_.isFunction;



        var View = Class.extend({
                _data:{}, //{Object}
                transition:null, //{String},
                $provider:null, //{Object}
                selector:'[data-container="base"]', //{String}
                selectorSet:false,
                clientContextRootNamespace:'$$', //{String}
                pushContextToClient:true,

                /**
                 * static render method
                 * @param template {String}
                 * @param context {Object}
                 * @param transition {String}
                 * @param callback {Function}
                 * @returns callback
                 * @public
                 */
                render: function(template,context,transition,callback){
                    if(isFunction(transition)){
                        callback=transition;
                        transition=null;
                    }
                    this.selector=this.$getSelector();
                    this.$provider.render(template,context,function(err,out){
                        //_render(err,out,selector,transition,callback);
                        if(callback){
                            callback(err,out)
                        }
                    });
                },

                /**
                 * set the template provider
                 * @param $provider {Function}
                 * @public
                 */
                $setProvider:function($provider){
                    this.$provider=$provider;
                },

                /**
                 * set the DOM selector
                 * @param selector {String}
                 */
                $setSelector:function(selector){
                    this.selectorSet=true;
                    this.selector=selector;
                },

                $getSelector:function(){
                    if(typeof window !=='undefined'){
                        if(this.selectorSet){
                            return this.selector;
                        }else{
                            var selector=($('html').hasClass('customelements')) ? 'ui-container[name="base"]' : '[data-container="base"]';
                            this.selector=selector;
                            return selector;
                        }
                    }

                }


            },
            {
                /**
                 * new instance init
                 * @param $provider {Function}
                 * @param selector {String}
                 */
                init:function($provider,selector){
                    if(typeof $provider === 'undefined'){
                        $provider=this.constructor.$provider;
                        selector=this.constructor.$getSelector();
                    }
                    else if(typeof $provider === 'string'){
                        selector=$provider;
                        $provider=this.constructor.$provider;
                    }else if(typeof selector != 'string'){
                        selector=this.constructor.$getSelector();
                    }
                    this.constructor._data.$provider= new $provider(true);
                    this.constructor._data.selector= selector;

                },

                /**
                 * prototype render method
                 * @param template {String}
                 * @param context {Object}
                 * @param transition {String}
                 * @param callback {Function}
                 * @returns callback
                 * @public
                 */
                render: function(template,context,transition,callback){
                    if(isFunction(transition)){
                        callback=transition;
                        transition=this.constructor.transition;
                    }
                    var selector=this.constructor._data.selector;
                    this.constructor._data.$provider.render(template,context,function(err,out){
                        if(callback){
                            callback(err,out);
                        }
                    });
                }
            });







    return View;
}));