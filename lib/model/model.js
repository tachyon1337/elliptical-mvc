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

