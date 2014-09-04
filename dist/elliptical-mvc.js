/*
 * =============================================================
 * elliptical.Class v0.9.1
 * =============================================================
 * Copyright (c) 2014 S. Francis, MIS Interactive
 * Licensed MIT
 *
 * Dependencies:
 * utils.js
 *
 * Classical inheritance pattern adopted from JavascriptMVC(which is an implementation of the Resig pattern), sans the jQuery dependency.
 * https://github.com/jupiterjs/jquerymx/blob/master/class/class.js
 *
 * var MyClass=Class.extend({},{});
 *
 * examples.:
 *
 * var MyClass=Class.extend({
 *
 * //@static
 *    method1:function(){
 *       return 'method1';
 *    }
 * },{
 *
 * //@prototype
 *    init:function(arg){
 *      this.name=arg;
 *    },
 *
 *    method1: function(){
 *       return this.name;
 *    }
 *
 * });
 *
 * MyClass.method1() //  'method1'
 * var myClassInstance=new MyClass('Bob');
 *
 * myClassInstance instanceof MyClass // true
 * myClassInstance.method1()  // 'Bob'
 *
 * var AnotherClass=Class.extend({  //define only instance props and methods
 *    init:function(arg){
 *        this.name=arg;
 *    },
 *    method1: function(){
 *       return this.name;
 *    }
 * });
 *
 * var anotherClassInstance=new AnotherClass('Fred');
 * anotherClassInstance instanceof AnotherClass // true
 * anotherClassInstance.method1()  // 'Fred'
 *
 * var Class2=Class.extend({
 *      prop1:true
 *      method1:function(){
 *        return 'method1';
 *      }
 * },
 * {
 *    init:function(arg){
 *      this.name=arg;
 *    },
 *
 *    method1: function(){
 *       return this.name;
 *    }
 * });
 *
 * var Class3=Class2.extend({
 *      prop1:false,
 *      prop2:true,
 *      method2:function(){
 *         return 'method2';
 *      }
 *
 * },{
 *     method2: function(){
 *       return this.name + ' from method 2';
 *     }
 * });
 *
 * var myClass3=new Class3('Jane');
 * Class2.prop1 //true
 * Class3.prop1 //false
 * myClass3 instanceof Class2  //true
 * myClass3 instanceof Class3  //true
 *
 * myClass3.method2() // 'Jane from method 2'
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
        root.elliptical.Class=factory(root.elliptical.utils);
        root.returnExports = root.elliptical.Class;
    }
}(this, function (utils) {
        var _=utils._,
        initializing = false,
        makeArray = utils.makeArray,
        isFunction = _.isFunction,
        isArray = _.isArray,
        extend = utils.extend,
        concatArgs = utils.concatArgs,


    /* tests if we can get super in .toString() */
    fnTest = /xyz/.test(function()
    {
        xyz;
    }) ? /\b_super\b/ : /.*/,


        /**
         * overwrites an object with methods, sets up _super
         * @param newProps {Object}
         * @param oldProps {Object}
         * @param addTo {Object}
         */
        inheritProps = function(newProps, oldProps, addTo)
        {

            addTo = addTo || newProps;
            for ( var name in newProps)
            {
                /* Check if we're overwriting an existing function */
                addTo[name] = isFunction(newProps[name]) && isFunction(oldProps[name])
                    && fnTest.test(newProps[name]) ? (function(name, fn)
                {
                    return function()
                    {
                        var tmp = this._super, ret;

                        /* Add a new ._super() method that is the same method, but on the super-class */
                        this._super = oldProps[name];

                        /* The method only need to be bound temporarily, so we remove it when we're done executing */
                        ret = fn.apply(this, arguments);
                        this._super = tmp;

                        return ret;
                    };
                })(name, newProps[name]) : newProps[name];
            }
        };

    var clss =function()
    {
        if (arguments.length)
        {
            clss.extend.apply(clss, arguments);
        }
    };

    /* @Static */
    extend(
        clss,
        {
            /**
             * Returns a callback function for a function on this Class.
             * Proxy ensures that 'this' is set appropriately.
             * @param funcs {Array}
             * @returns {Function} the callback function
             */
            proxy : function(funcs)
            {
                /* args that should be curried */
                var args = makeArray(arguments), self;

                funcs = args.shift();

                if (!isArray(funcs))
                {
                    funcs = [ funcs ];
                }

                self = this;
                for ( var i = 0; i < funcs.length; i++)
                {
                    if (typeof funcs[i] == "string"
                        && !isFunction(this[funcs[i]]))
                    {
                        throw ("class.js "
                            + (this.fullName || this.Class.fullName)
                            + " does not have a " + funcs[i] + "method!");
                    }
                }
                return function class_cb()
                {
                    var cur = concatArgs(args, arguments), isString, length = funcs.length, f = 0, func;
                    for (; f < length; f++)
                    {
                        func = funcs[f];
                        if (!func)
                        {
                            continue;
                        }

                        isString = typeof func == "string";
                        if (isString && self._set_called)
                        {
                            self.called = func;
                        }

                        cur = (isString ? self[func] : func).apply(self, cur
                            || []);
                        if (f < length - 1)
                        {
                            cur = !isArray(cur) || cur._use_call ? [ cur ]
                                : cur;
                        }
                    }
                    return cur;
                };
            },

            /**
             * Creates a new instance of the class.
             * @returns {Class} instance of the class
             */
            newInstance: function() {
                var inst = this.rawInstance(),
                    args;
                /* call setup if there is a setup */
                if ( inst.setup ) {
                    args = inst.setup.apply(inst, arguments);
                }
                /* call init if there is an init, if setup returned args, use those as the arguments */
                if ( inst.init ) {
                    inst.init.apply(inst, isArray(args) ? args : arguments);
                }
                return inst;
            },

            /**
             * Setup gets called on the inherting class with the base class followed by the inheriting class's raw properties.
             * Setup will deeply extend a static defaults property on the base class with properties on the base class.
             * @param baseClass {Object}
             * @param fullName {String}
             * @returns {Arguments}
             */
            setup: function( baseClass, fullName ) {
                this.defaults = extend(true, {}, baseClass.defaults, this.defaults);
                return arguments;
            },

            /**
             * returns the raw instance before application of setup and init
             * @returns {Class}
             */
            rawInstance: function() {
                initializing = true;
                var inst = new this();
                initializing = false;
                return inst;
            },

            /**
             * NOTE: support for namespacing fullName dropped because of its reliance on globals (S.Francis)
             * @param klass {Object}
             * @param proto {Object}
             * @returns {Class}
             */
            extend: function(klass, proto) {
                if(!proto) {
                    proto = klass;
                    klass = null;
                }
                proto = proto || {};
                var _super_class = this,
                    _super = this.prototype, prototype;

                /* Instantiate a base class (but only create the instance, don't run the init constructor */
                initializing = true;
                prototype = new this();
                initializing = false;
                /* Copy the properties over onto the new prototype */
                inheritProps(proto, _super, prototype);

                /* The dummy class constructor */

                function Class() {
                    /* All construction is actually done in the init method */
                    if ( initializing ) return;

                    /* extending */
                    if ( this.constructor !== Class && arguments.length ) {
                        return arguments.callee.extend.apply(arguments.callee, arguments);
                    } else { /* we are being called with new */
                        return this.Class.newInstance.apply(this.Class, arguments);
                    }
                }
                /* copy old stuff onto class */
                for ( name in this ) {
                    if ( this.hasOwnProperty(name) && ['prototype', 'defaults'].indexOf(name) == -1 ) {
                        Class[name] = this[name];
                    }
                }

                /* static inheritance */
                inheritProps(klass, this, Class);

                /* set things that can't be overwritten */
                extend(Class, {
                    prototype: prototype,
                    constructor: Class
                });

                //make sure our prototype looks nice
                Class.prototype.Class = Class.prototype.constructor = Class;

                var args = Class.setup.apply(Class, utils.concatArgs([_super_class],arguments));

                if ( Class.init ) {
                    Class.init.apply(Class, args || []);
                }

                /* @Prototype*/
                return Class;
            }
        });


    clss.callback=clss.prototype.callback=clss.prototype.proxy=clss.proxy;

    return clss;


}));





/*
 * =============================================================
 * elliptical.Controller v0.9.1
 * =============================================================
 * Copyright (c) 2014 S.Francis, MIS Interactive
 * Licensed MIT
 *
 * Dependencies:
 * elliptical.Class
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

/*
 * =============================================================
 * elliptical.Model v0.9.1
 * =============================================================
 * Copyright (c) 2012 MIS Interactive
 * Licensed MIT
 *
 * Dependencies:
 * class.js
 * static and prototype "interface" for the standard http verbs, plus map(for document dbs), [query and command(e.g., graph dbs)]
 * requires a document/data store provider for implementation
 *
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
        root.elliptical.Model=factory(root.elliptical.Class);
        root.returnExports = root.elliptical.Model;
    }
}(this, function (Class) {

    var Model = Class.extend({
            id: 'id', //{String} set a custom id property other than 'id'
            _data: null, //{Object}
            '@class': null, //{String}
            $provider: {}, //{Class|Object|Function}
            $paginationProvider:null,//{Class|Object|Function}


            /**
             * @static
             */

            /**
             * get all models by class or get model by id
             * @param params {Object}
             * @param query {Object}
             * @param callback {Function}
             * @public
             */
            get: function (params, query,callback) {
                this.__isImplemented('get');
                if(typeof query==='function'){
                    callback=query;
                    query={};
                }
                var self = this,
                    $provider = this.$provider,
                    $paginationProvider=this.$paginationProvider,
                    classType = this['@class'],
                    result;

                $provider.get(params, classType, query, function (err, data) {
                    if(!err){

                        if (query.paginate && $paginationProvider) {
                            result=$paginationProvider.get(query,data);
                            self._data=result.data;
                        }else{
                            result=data;
                            self._data=data;
                        }
                    }
                    if (callback) {
                        callback(err, result);
                    }
                });
            },


            /**
             * query model
             * @param params {Object}
             * @param query {Object}
             * @param callback {Function}
             * @public
             */
            query: function (params, query,callback) {
                this.__isImplemented('query');
                var self=this,
                    $provider = this.$provider,
                    $paginationProvider=this.$paginationProvider,
                    result;

                $provider.query(params, query,function (err, data) {
                    if(!err){
                        if (query.paginate && $paginationProvider) {
                            result=$paginationProvider.get(query,data);
                            self._data=result.data;
                        }else{
                            result=data;
                            self._data=data;
                        }
                    }
                    if (callback) {
                        callback(err, result);
                    }
                });
            },


            /**
             * post model
             * @param params {Object}
             * @param callback {Function}
             * @public
             */
            post: function (params, callback) {
                this.__isImplemented('post');
                var $provider = this.$provider,
                    classType = this['@class'];
                $provider.post(params, classType,callback);

            },

            /**
             * put model
             * @param params {Object}
             * @param callback {Function}
             * @public
             */
            put: function (params, callback) {
                var $provider = this.$provider,
                    classType = this['@class'];
                $provider.put(params, classType,callback);

            },

            /**
             * patch model (~merge)
             * @param params {Object}
             * @param callback
             */
            patch: function (params, callback) {
                this.__isImplemented('patch');
                var $provider = this.$provider,
                    classType = this['@class'];
                $provider.patch(params, classType,callback);

            },

            /**
             * delete model
             * @param params {Object}
             * @param callback {Function}
             * @public
             */
            delete: function (params, callback) {
                this.__isImplemented('delete');
                var $provider = this.$provider,
                    classType = this['@class'];
                $provider.delete(params, classType, callback);

            },

            /**
             * command
             * @param params {Object}
             * @param callback {Function}
             * @public
             */
            command: function (params, callback) {
                this.__isImplemented('command');
                var $provider = this.$provider;
                $provider.command(params, callback);
            },

            /**
             * sets the model providers for implementation
             * @param $provider {Object}
             * @param $pagination {Object}
             * @public
             */
            $setProviders: function ($provider,$pagination) {
                this.$provider = $provider;
                this.$paginationProvider=$pagination;
            },

            __isImplemented:function(method){
                if(!this.$provider[method]){
                    throw new Error(method + ' not implemented');
                }
            }

        },

        /**
         * @prototype
         */

        {
            _data: null,

            /**
             *
             * @param params {Object}
             * @public
             */
            init: function (params) {
                /* this will get passed up as the params in below methods if params not explicitly passed in the calls */
                this._data = params;
                this.$query={};
            },

            /**
             * @param params {Object}
             * @param callback {Function}
             * @public
             */
            get: function (params,callback) {
                var data = this._data,
                    query=this.$query;

                (typeof params==='function') ? callback=params : data=params;
                this.constructor.get(data,query, callback);
            },

            /**
             * @param params {Object}
             * @param callback {Function}
             * @public
             */
            save: function (params,callback) {
                var data = this._data;
                var length=arguments.length;
                if(length===0){
                    params=data;
                }else if(length===1 && typeof params==='function'){
                    callback=params;
                    params=data;
                }
                var idProp=this.constructor.id;
                if(params===undefined || params[idProp]===undefined){
                    /* posting a new model */
                    this.constructor.post(params, callback);
                }else{
                    /* put an update */
                    this.constructor.put(params, callback);
                }
            },

            /**
             * @param params {Object}
             * @param callback {Function}
             */
            put: function (params,callback) {
                var data = this._data;
                (typeof params==='function') ? callback=params : data=params;
                this.constructor.put(data, callback);
            },

            /**
             * @param params {Object}
             * @param callback {Function}
             */
            patch: function (params,callback) {
                var data = this._data;
                (typeof params==='function') ? callback=params : data=params;
                this.constructor.query(data, callback);
            },

            /**
             * @param params {Object}
             * @param callback {Function}
             * @public
             */
            query: function (params,callback) {
                var data = this._data,
                    query=this.$query;

                (typeof params==='function') ? callback=params : data=params;
                this.constructor.query(data, query,callback);
            },

            /**
             *
             * @param str {String}
             */
            filter: function (str) {
                this.$query.filter = str;
                return this;
            },

            /**
             *
             * @param str {String}
             */
            orderBy: function (str) {
                this.$query.orderBy = str;
                return this;
            },

            /**
             *
             * @param num {Number}
             */
            top: function (num) {
                this.$query.top = num;
                return this;
            },

            /**
             *
             * @param num {Number}
             */
            skip: function (num) {
                this.$query.skip = num;
                return this;
            },

            /**
             *
             * @param params {Object}
             */
            paginate: function (params) {
                try{
                    params.page=parseInt(params.page);
                }catch(ex){
                    params.page=1;
                }
                this.$query.paginate = params;
                return this;
            },

            /**
             * @param params {Object}
             * @param callback  {Function}
             * @public
             */
            delete: function (params,callback) {
                var data = this._data;
                (typeof params==='function') ? callback=params : data=params;
                this.constructor.delete(data, callback);
            },

            /**
             * @param params {Object}
             * @param callback {Function}
             * @public
             */
            command: function (params,callback) {
                var data = this._data;
                (typeof params==='function') ? callback=params : data=params;
                this.constructor.command(data, callback);
            }

        });


    return Model;



}));



/*
 * =============================================================
 * elliptical.noop v0.9.1
 * =============================================================
 * Copyright (c) 2014 S.Francis, MIS Interactive
 * Licensed MIT
 *
 * Dependencies:
 * elliptical.Class
 *
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
        root.elliptical.noop=factory();
        root.returnExports = root.elliptical.noop;
    }
}(this, function () {

    return{
        noop:function(){},
        throwErr:function(err){
            if (err) {
                throw err;
            }
        },
        doop:function(fn,args,context){
            if(typeof fn==='function') {
                return fn.apply(context, args);
            }
        }
    }


}));
/*
 * =============================================================
 * elliptical.debounce v0.9.1
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
        root.elliptical.debounce=factory(root.elliptical.utils);
        root.returnExports = root.elliptical.debounce;
    }
}(this, function (utils) {

    var _=utils._;

    return function debounce(fn,delay,opts){
        if(typeof delay==='undefined'){
            delay=1000;
        }
        if(typeof opts==='undefined'){
            opts={};
        }
        _.debounce(fn,delay,opts);
    }


}));

/*
 * =============================================================
 * elliptical.Interval v0.9.1
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
        module.exports = factory(require('./debounce'),require('./throttle'));
    } else if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define(['./debounce','./throttle'], factory);
    } else {
        root.elliptical.Interval=factory(root.elliptical.debounce,root.elliptical.throttle);
        root.returnExports = root.elliptical.Interval;
    }
}(this, function (debounce,throttle) {

    return function Interval(opts){
        this.delay=opts.delay;
        this.timeOutId=null;
        if(opts.thread==='throttle'){
            this.thread=throttle;
        }else if(opts.thread==='debounce'){
            this.thread=debounce;
        }else{
            this.thread=_exe;
        }

        this.run=function(fn){
            var self=this;
            this.timeOutId=setInterval(function(){
                self.thread(fn,{
                    delay:10
                });

            },self.delay);
        };

        this.terminate=function(){
            clearInterval(this.timeOutId);
        }
    };


    function _exe(fn,opts){
        fn();
    }

}));


/*
 * =============================================================
 * elliptical.throttle v0.9.1
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
        root.elliptical.throttle=factory(root.elliptical.utils);
        root.returnExports = root.elliptical.throttle;
    }
}(this, function (utils) {

    var _=utils._;

    return function throttle(fn,delay,opts){
        if(typeof delay==='undefined'){
            delay=1000;
        }
        if(typeof opts==='undefined'){
            opts={};
        }
        _.throttle(fn,delay,opts);
    }


}));

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


/*
 * =============================================================
 * elliptical.Provider v0.9.1
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
        module.exports = factory(require('../class/class'));
    } else if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define(['../class/class'], factory);
    } else {
        // Browser globals (root is window)
        root.elliptical.Provider=factory(root.elliptical.Class);
        root.returnExports = root.elliptical.Provider;
    }
}(this, function (Class) {

    var Provider=Class.extend({
        '@class':null
    },{});

    return Provider;


}));
/*
 * =============================================================
 * elliptical.$Provider v0.9.1
 * =============================================================
 * Copyright (c) 2014 S.Francis, MIS Interactive
 * Licensed MIT
 *
 * Dependencies:
 * elliptical.Class
 *
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

/*
 * =============================================================
 * elliptical.Service v0.9.1
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


/*
 * =============================================================
 * elliptical.View v0.9.1
 * =============================================================
 * Copyright (c) 2014 S.Francis, MIS Interactive
 * Licensed MIT
 *
 * Dependencies:
 * class.js
 * renders a view, given context,template name and <optional>transition(browser apps)
 * requires a template provider for implementation
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
        root.elliptical.View=factory(root.elliptical.utils,root.elliptical);
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