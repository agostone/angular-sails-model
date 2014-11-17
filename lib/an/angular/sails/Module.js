/* global angular:false,an:false */
/* jshint unused:false */
'use strict';

var anSailsModule;

try {
    anSailsModule = angular.module('anSailsModule');
} catch (error) {
    anSailsModule = angular.module('anSailsModule', []);
}

anSailsModule.factory('anSailsModel', function ($q, $rootScope) {

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
        if (options.transport) {
            SailsModel.setMethod(options.transport);
        }

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

});
