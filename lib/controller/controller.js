
/*
 * =============================================================
 * elliptical.Controller
 * =============================================================
 *
 * Controller factory for an expressJS style application function/object
 * var Controller = new elliptical.Controller(app);
 *
 * Controller(route,f1,...fn,{
 *   Get:function(req,res,next){}
 *   Post:function(req,res,next){}
 *   Put: function(req,res,next){}
 *   Delete: function(req,res,next){}
 * });
 *
 * or:
 *
 * Controller(route/@action,f1,...fn,{
 *   Get:{
 *      Action1:function(req,res,next){},
 *      ActionN:function(req,res,next){},
 *   },
 *   Post:{
 *      Action1:function(req,res,next){},
 *      ActionN:function(req,res,next){},
 *   },
 *   Put:{
 *      Action1:function(req,res,next){},
 *      ActionN:function(req,res,next){},
 *   },
 *   Delete:{
 *      Action1:function(req,res,next){},
 *      ActionN:function(req,res,next){},
 *   },
 * });
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
        root.elliptical.Controller = factory(root.elliptical.utils);
        root.returnExports = root.elliptical.Controller;
    }
}(this, function (utils) {


    /* Controller is a simple factory for the app function. It accepts the app function as an argument and returns a function
     * with a variable arg list of (route,f1,...fn,obj}, where route=route{String}, f1,...fn =middleware, and the last arg
     * is a plain object that binds a callback to a http method
     * obj={Get:func(req,res,next),Post:func(req,res,next),Put:func(req,res,next),Delete:func(req,res,next)}
     *
     * the first arg of the list must be the route and the last one must be the plain object.
     *
     * Controller can also group an arbitrary number of Actions around a http method and a base route:
     * Example:
     * Controller('/Company/@action',{
     *   Get:{
     *      Home:function(req,res,next){},
     *      About:function(req,res,next){},
     *      Contact:function(req,res,next){},
     *   },
     *   Post:{
     *      Contact:function(req,res,next){}
     *   }
     * }
     *
     * instead of app.get('/Company/Home',function(req,res,next){}),app.get('/Company/About',function(req,res,next){})
     *            app.get('/Company/Contact',function(req,res,next){}),app.post('/Company/Contact',function(req,res,next){})
     *
      * */
    var Controller=function(app){
        this.app=app;
        /**
         * @param route {String}
         * @param obj {Object}
         * @returns {Function}
         */
        return function(route,obj){
            var args = [].slice.call(arguments);
            var route_=args[0];
            if(typeof route_ !=='string'){
                throw 'Controller requires a route as the first parameter';
            }
            var obj_=args.pop();
            if(typeof obj_ ==='object'){
                ['Get','Post','Put','Delete'].forEach(function(v){
                    if(obj_[v] && typeof obj_[v]==='function'){
                        var clonedArgs=utils.cloneArray(args);
                        clonedArgs.push(obj_[v]);
                        app[v.toLowerCase()].apply(app,clonedArgs);
                    }else{ //@action grouping,NOTE: @action must be the param name
                        for(var prop in obj_[v]){
                            var clonedArgs_=utils.cloneArray(args);
                            if(prop==='Index'){
                                clonedArgs_[0]=clonedArgs_[0].replace(/@action/g,'');
                            }else{
                                var prop_=prop.replace(/_/,'-'); //ex: '/Sign-In' ---> Sign_In:fn()
                                clonedArgs_[0]=clonedArgs_[0].replace(/@action/g,prop_);
                            }

                            clonedArgs_.push(obj_[v][prop]);
                            app[v.toLowerCase()].apply(app,clonedArgs_);
                        }
                    }
                });
            }else{
                throw 'Controller requires the last function parameter to be an object';
            }
        }
    };

    return Controller;
}));
