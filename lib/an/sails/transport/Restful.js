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
     * @namespace an.sails.transport.Restful
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
     * @returns {an.sails.transport.Restful}
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
     * @returns {an.sails.transport.Restful}
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
     * @returns {an.sails.transport.Restful}
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
     * @returns {an.sails.transport.Restful}
     */
    Restful.delete = function (url, data, callback) {
        io.socket.delete(url, data, callback);
    };

    // Assinging to the namespace
    an.sails.transport.Restful = Restful;

})();
