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
