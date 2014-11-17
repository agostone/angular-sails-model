/* global io:false */
'use strict';

var an = an || {};
an.sails = an.sails || {};
an.sails.model = an.sails.model || {};

(function () {

    /**
     * Restful model communication method
     *
     * @public
     * @namespace an.sails.model.method.Restful
     */
    var Restful = {};

    /**
     * Finds one or more model(s) according to the provided filters
     *
     * @public
     * @static
     * @param {string} url Model url.
     * @param {object} filters Filter parameters.
     * @param {function} callback Callback function.
     * @returns {an.sails.model.method.Restful}
     */
    Restful.find = function (url, filters, callback) {
        io.socket.get(url, filters, callback);
    };

    /**
     * Inserts a new model
     *
     * @public
     * @static
     * @param {string} url Model url.
     * @param {object} data Model data.
     * @param {function} callback Callback function.
     * @returns {an.sails.model.method.Restful}
     */
    Restful.insert = function (url, data, callback) {
        io.socket.post(url, data, callback);
    };

    /**
     * Updates a specific model
     *
     * @public
     * @static
     * @param {string} url Model url.
     * @param {object} data Model data.
     * @param {function} callback Callback function.
     * @returns {an.sails.model.method.Restful}
     */
    Restful.update = function (url, data, callback) {
        url += '/' + data.id;
        io.socket.put(url, data, callback);
    };

    /**
     * Deletes a specific model
     *
     * @public
     * @static
     * @param {string} url Model url.
     * @param {object} data Model data.
     * @param {function} callback Callback function.
     * @returns {an.sails.model.method.Restful}
     */
    Restful.delete = function (url, data, callback) {
        io.socket.delete(url, data, callback);
    };

    // Assinging to the namespace
    an.sails.model.Restful = Restful;

})();

/* global io:false */
'use strict';

var an = an || {};
an.sails = an.sails || {};
an.sails.model = an.sails.model || {};

(function () {

    /**
     * Shortcut model communication method
     *
     * @namespace an.sails.model.method.Shortcut
     * @public
     */
    var Shortcut = {};

    /**
     * Finds one or more model(s) according to the provided filters
     *
     * @public
     * @static
     * @param {string} url Model url.
     * @param {object} filters Filter parameters.
     * @param {function} callback Callback function.
     * @returns {an.sails.model.method.Restful}
     */
    Shortcut.find = function (url, filters, callback) {
        io.socket.get(url, filters, callback);
    };

    /**
     * Inserts a new model
     *
     * @public
     * @static
     * @param {string} url Model url.
     * @param {object} data Model data.
     * @param {function} callback Callback function.
     * @returns {an.sails.model.method.Restful}
     */
    Shortcut.insert = function (url, data, callback) {
        url += 'create';
        io.socket.get(url, data, callback);
    };

    /**
     * Updates a specific model
     *
     * @public
     * @static
     * @param {string} url Model url.
     * @param {object} data Model data.
     * @param {function} callback Callback function.
     * @returns {an.sails.model.method.Restful}
     */
    Shortcut.update = function (url, data, callback) {
        url += 'update/' + data.id;
        io.socket.get(url, data, callback);
    };

    /**
     * Deletes a specific model
     *
     * @public
     * @static
     * @param {string} url Model url.
     * @param {object} filters Model data.
     * @param {function} callback Callback function.
     * @returns {an.sails.model.method.Restful}
     */
    Shortcut.delete = function (url, filters, callback) {
        url += 'destroy';
        io.socket.get(url, filters, callback);
    };

    // Assinging to the namespace
    an.sails.model.Shortcut = Shortcut;

})();

/* global io:false */
'use strict';

var an = an || {};
an.sails = an.sails || {};
an.sails.model = an.sails.model || {};

(function () {

    /**
     * Creates a sails model for the given model url.
     *
     * @namespace an.sails.model.Model
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
    var _method = an.sails.model.Restful;
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
     * @returns {an.sails.model.Restful|an.sails.model.Shortcut)
   */
    Model.setMethod = function (method) {

        method = method.charAt(0).toUpperCase() + method.toLowerCase().substr(1);
        _method = an.sails.model[method] || an.sails.model.Restful;
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

/* global angular:false */
'use strict';

var an = an || {};
an.angular = an.angular || {};
an.angular.sails = an.angular.sails || {};

angular.injector(['ng']).invoke(function ($q) {

    var parent = an.sails.Model;

    function Model(modelUrl) {
        parent.call(this, modelUrl);
    }

    Model.prototype = Object.create(parent.prototype);

    // Static public function inheritance
    Model.setMethod = parent.setMethod;
    Model.find = parent.find;
    Model.getName = parent.getName;
    Model.createFromObject = parent.createFromObject;
    Model.isModel = parent.isModel;
    Model.on = parent.on;
    Model.off = parent.off;

    // Instance function overrides
    Model.prototype.save = function () {

        var deferred = $q.defer();

        parent.prototype.save.call(
            this,
            function (model) {
                deferred.resolve(model);
            },
            function (error) {
                deferred.reject(error);
            }
        );

        return deferred.promise;
    };

    Model.prototype.delete = function () {

        var deferred = $q.defer();

        parent.prototype.delete.call(
            this,
            function (model) {
                deferred.resolve(model);
            },
            function (error) {
                deferred.reject(error);
            }
        );

        return deferred.promise;
    };

    // Assigning to the namespace
    an.angular.sails.Model = Model;

});

/* global angular:false,an:false */
/* jshint unused:false */
'use strict';

var anSailsModule;

try {
    anSailsModule = angular.module('anSailsModule');
} catch (error) {
    anSailsModule = angular.module('anSailsModule', []);
}

anSailsModule.factory('anSailsModel', ["$q", "$rootScope", function ($q, $rootScope) {

    function difference(source, target) {
        return source.filter(function (element) {
            return target.indexOf(element) === -1;
        });
    }

    /**
     * Binds a sails model to the given scope.
     *
     * @param {string|array} modelUrl Model name/url or if an array must contain the scope variable name as well.
     * @param {object} $scope The scope where to attach the bounded model.
     * @param {object} filter JSON query filter parameters. Check
     *          http://beta.sailsjs.org/#!documentation/reference/Blueprints/FindRecords.html
     *          to see what you can send.
     * @param {object} options Configuration options
     * @returns {object} Promise object
     */
    function bind(modelUrl, $scope, filter, options) {

        function broadcastEvent(event, model, data) {

            if (eventModel === 'perModel') {
                event = model.name + event.charAt(0).toUpperCase() + event.substr(1);
            }

            $rootScope.$broadcast(
                event,
                {'model': model, 'data': data, 'scope': $scope.$id}
            );
        }

        function modelIndex(model) {

            var found = null;

            $scope[scopeVariable].every(function (value, index) {

                if (value.id === model.id) {
                    found = index;
                    return false;
                }
                return true;
            });

            return found;
        }

        function watchModel(model) {
            $scope.$watchCollection(model, function (newValue) {

                if (autoPersist) {
                    newValue.save().then(
                        // Success
                        function (data) {
                            broadcastEvent('sailsModelSaveSucceed', newValue, data);
                        },
                        // Error
                        function (data) {
                            broadcastEvent('sailsModelSaveFailed', newValue, data);
                        }
                    );
                }
            });
        }

        function watchModels(collection) {

            $scope.$watchCollection(collection, function (newValues, oldValues) {

                newValues = newValues || [];
                oldValues = oldValues || [];

                var newModels = difference(newValues, oldValues);
                var removedModels = difference(oldValues, newValues);

                removedModels.forEach(function (model) {

                    // If model id is set, we assume there is a model on the backend.
                    if (model.id !== undefined) {
                        model.delete().then(
                            // Success
                            function (data) {
                                broadcastEvent('sailsModelDeleteSucceed', model, data);
                            },
                            // Error
                            function (data) {
                                broadcastEvent('sailsModelDeleteFailed', model, data);
                            }
                        );
                    }
                });

                newModels.forEach(function (model) {

                    // If model id isn't set, it's a new item, inserting it
                    if (model.id === undefined) {
                        model.save().then(
                            // Success
                            function (data) {
                                broadcastEvent('sailsModelSaveSucceed', model, data);
                            },
                            // Error
                            function (data) {
                                broadcastEvent('sailsModelSaveFailed', model, data);
                            }
                        );
                    }

                });
            });
        }

        function onSocketEvent(action, model) {
            var index;
            switch (action) {
                case 'create':
                    if (angular.isArray($scope[scopeVariable])) {
                        $scope[scopeVariable].push(model);
                        $scope.$apply();
                    }
                    break;
                case 'update':
                    if (angular.isArray($scope[scopeVariable])) {
                        index = modelIndex(model);
                        if (index > -1) {
                            $scope[scopeVariable][index] = model;
                            $scope.$apply();
                        }
                    } else {
                        $scope[scopeVariable] = model;
                        $scope.$apply();
                    }
                    break;
                case 'destroy':
                    if (angular.isArray($scope[scopeVariable])) {
                        index = modelIndex(model);
                        if (index > -1) {
                            delete $scope[scopeVariable][index];
                            $scope.$apply();
                        }
                    } else {
                        delete $scope[scopeVariable];
                        $scope.$apply();
                    }
                    break;
            }
        }

        options = options || {};

        var scopeVariable;

        if (modelUrl instanceof Array) {
            scopeVariable = modelUrl[1];
            modelUrl = modelUrl[0];
        }

        var deferred = new $q.defer();
        var SailsModel = options.model || an.angular.sails.Model;
        var eventModel = options.eventModel || 'perModel';
        var autoPersist = options.autoPersist || false;
        var autoListen = options.autoListen || false;
        scopeVariable = scopeVariable || SailsModel.getName(modelUrl);

        SailsModel.find(
            modelUrl,
            filter,
            // Success
            function (data) {
                $scope[scopeVariable] = data;
                $scope.$apply();

                // Adding watcher
                if (angular.isArray(data)) {
                    watchModels(scopeVariable);
                } else { // Single model
                    watchModel(scopeVariable);
                }

                if (autoListen) {

                    SailsModel.on(modelUrl, onSocketEvent);
                    $scope.$on('$destroy', function () {
                        SailsModel.off(modelUrl, onSocketEvent);
                    });
                }
                deferred.resolve(data);
            },
            // Error
            function (data) {
                deferred.reject(data);
            }
        );

        return deferred.promise;
    }

    return {
        bind: bind
    };

}]);
