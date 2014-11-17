/* global io:false */
'use strict';

var an = an || {};
an.sails = an.sails || {};

(function () {

    /**
     * Creates a sails model for the given model url.
     *
     * @namespace an.sails.Model
     * @public
     * @param {string} modelUrl Model url used to bind.
     * @returns {an.sails.Model}
     */
    function Model(modelUrl) {

        /**
         * @public
         * @property {string} name Name of the model.
         */
        Object.defineProperty(this, 'name', {
            enumerable: false,
            get: function () {
                return Model.getName(this.url);
            }
        });

        /**
         * @public
         * @property {string} url Url of the resource.
         */
        Object.defineProperty(this, 'url', {
            enumerable: false,
            writable: false,
            value: normalizeUrl(modelUrl)
        });
    }

    // Private static variables
    var _method = an.sails.transport.Restful;
    var _listeners = {};

    // Private static functions
    function normalizeUrl(url) {

        url = url.split('/');

        // First element is not a '/'
        if (url[0] !== '') {
            url = [''].concat(url);
        }

        // Last element is a '/'
        if (url[url.length - 1] === '') {
            url.pop();
        }

        return url.join('/');
    }

    function createModel(modelUrl, data) {
        /* jshint validthis:true,newcap:false */
        var _this = this;

        // If multiple models
        if (data instanceof Array) {
            data.forEach(function (value, index, array) {
                array[index] = (new _this(modelUrl)).setData(value);
            });
        } else { // Single model
            data = (new _this(modelUrl)).setData(data);
        }

        return data;
    }

    function onSocketEvent(modelUrl, resData, jwres) {
        /* jshint validthis:true */
        function invokeCallback(callback) {

            switch (resData.verb) {
                case 'create':
                    callback(createModel.call(_this, modelUrl, resData.data), jwres);
                    break;
                case 'update':
                    callback(createModel.call(_this, modelUrl, resData.data), jwres);
                    break;
                case 'destroy':
                    callback(createModel.call(_this, modelUrl, resData.previous), jwres);
                    break;
            }
        }

        var targets = ['all', resData.verb];
        var index = targets.length;
        var _this = this;

        do {
            if (_listeners[modelUrl][targets[index]]) {
                _listeners[modelUrl][targets[index]].forEach(invokeCallback);
            }
        } while (index--);
    }

    // Public static functions
    /**
     * Sets the method the models should use when communicating with the backend.
     *
     * @public
     * @static
     * @param {string} method Method the models should use. Valid options: restful, shortcut (default: restful)
     * @returns {an.sails.transport.Restful|an.sails.transport.Shortcut)
   */
    Model.setMethod = function (method) {

        method = method.charAt(0).toUpperCase() + method.toLowerCase().substr(1);
        _method = an.sails.transport[method] || an.sails.transport.Restful;
    };

    /**
     * Finds models according to the given filters
     *
     * @public
     * @static
     * @param {string} modelUrl Url used to bind.
     * @param {object} filters Filter object.
     * @param {function} success Callback function on success.
     * @param {function} error Callback function on error.
     */
    Model.find = function (modelUrl, filters, success, error) {

        var _this = this;
        modelUrl = normalizeUrl(modelUrl);

        _method.find(modelUrl, filters, function (data, jwres) {

            // Http result codes 4xx and 5xx result in error
            if (jwres.statusCode >= 400 && jwres.statusCode < 600) {
                error(jwres);
            } else {

                data = createModel.call(_this, modelUrl, data);

                // Start listening for changes if not doing already
                if (_listeners[modelUrl] === undefined) {
                    _listeners[modelUrl] = [];
                    io.socket.on(modelUrl, function (resData, jwres) {
                        onSocketEvent.call(_this, modelUrl, resData, jwres);
                    });
                }

                success(data);
            }

        });
    };

    /**
     * Returns with the model name from the provided model url
     *
     * @param {string} modelUrl
     * @returns {string}
     */
    Model.getName = function (modelUrl) {
        var name = normalizeUrl(modelUrl).split('/');
        return name[name.length - 1];
    };

    /**
     * Creates a sails model from an existing object
     *
     * @public
     * @static
     * @param {object} target Existing object
     * @param {string} modelUrl Model url used to bind.
     * @returns {Model}
     */
    Model.createFromObject = function (target, modelUrl) {

        for (var propertyName in this.prototype) {
            target[propertyName] = this.prototype[propertyName];
        }

        Object.defineProperty(target, 'virtualModel', {
            enumerable: false,
            configurable: false,
            writable: false,
            value: true
        });

        this.prototype.constructor.apply(target, [modelUrl]);

        return target;
    };

    /**
     * Checks the target object if it's a sails model or not
     *
     * @static
     * @param {object} target Object to check
     * @returns {boolean}
     */
    Model.isModel = function (target) {
        return target instanceof Model || target.virtualModel === true;
    };

    /**
     * Registers a listener for the requested model url.
     *
     * @param {string} modelUrl Model url actions to listen to.
     * @param {function} callback Function to call back on model events.
     * @param {string} eventName Event to listen to. (default: all)
     * @returns {Model}
     */
    Model.on = function (modelUrl, callback, eventName) {
        eventName = eventName || 'all';
        _listeners[modelUrl] = _listeners[modelUrl] || {};

        if (_listeners[modelUrl][eventName] === undefined) {
            _listeners[modelUrl][eventName] = [];
        }

        if (_listeners[modelUrl][eventName].indexOf(callback) === -1) {
            _listeners[modelUrl][eventName].push(callback);
        }
        return this;
    };

    /**
     * Removes a listener for the requested model url.
     *
     * @param {string} modelUrl Model url actions to listen to.
     * @param {function} callback Function to call back on model events.
     * @param {string} eventName Event to listen to. (default: all)
     * @returns {Model}
     */
    Model.off = function (modelUrl, callback, eventName) {
        eventName = eventName || 'all';

        if (_listeners[modelUrl] &&
            _listeners[modelUrl][eventName]
            ) {
            var index = _listeners[modelUrl][eventName].indexOf(callback);
            if (index > -1) {
                _listeners[modelUrl][eventName].splice(index, 1);
            }
        }

        return this;
    };

    // Instance functions
    /**
     * Saves the model
     *
     * @param {function} success Callback function on success
     * @param {function} error Callback function on error
     * @returns {an.sails.Model}
     */
    Model.prototype.save = function (success, error) {

        var _this = this;
        var upsert = 'update';

        // Insert (new model)
        if (!this.id) {
            upsert = 'insert';
        }

        _method[upsert](this.url, this.getData(), function (data, jwres) {

            // Http result codes 4xx and 5xx result in error
            if (jwres.statusCode >= 400 && jwres.statusCode < 600) {
                error(jwres);
            } else {
                _this.setData(data);
                success(_this);
            }
        });
    };

    /**
     * Set the model data in one step
     *
     * @public
     * @param {object} data
     * @returns {an.sails.Model}
     */
    Model.prototype.setData = function (data) {

        for (var property in data) {
            if (!(data[property] instanceof Function)) {
                this[property] = data[property];
            }
        }

        return this;
    };

    /**
     * Returns model data as an object
     *
     * @returns {object}
     */
    Model.prototype.getData = function () {
        var data = {};

        for (var property in this) {
            if (!(this[property] instanceof Function)) {
                data[property] = this[property];
            }
        }

        return data;
    };

    /**
     * Deletes the model
     *
     * @param {function} success Callback function on success
     * @param {function} error Callback function on error
     * @returns {an.sails.Model}
     */
    Model.prototype.delete = function (success, error) {

        var _this = this;

        // If it's not a new model requesting a delete
        if (this.id) {
            _method.delete(this.url, this.getData(), function (data, jwres) {
                // Http result codes 4xx and 5xx result in error
                if (jwres.statusCode >= 400 && jwres.statusCode < 600) {
                    error(jwres);
                } else {
                    _this.id = undefined;
                    success(_this);
                }
            });
        } else { // If it's a new model, consider delete to be always successful
            success(this);
        }

        return this;
    };

    // Assigning to the namespace
    an.sails.Model = Model;

})();
