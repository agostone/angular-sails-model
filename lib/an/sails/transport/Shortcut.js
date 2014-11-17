/* global io:false */
'use strict';

var an = an || {};
an.sails = an.sails || {};
an.sails.model = an.sails.model || {};

(function () {

    /**
     * Shortcut model communication method
     *
     * @namespace an.sails.transport.Shortcut
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
     * @returns {an.sails.transport.Shortcut}
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
     * @returns {an.sails.transport.Shortcut}
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
     * @returns {an.sails.transport.Shortcut}
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
     * @returns {an.sails.transport.Shortcut}
     */
    Shortcut.delete = function (url, filters, callback) {
        url += 'destroy';
        io.socket.get(url, filters, callback);
    };

    // Assinging to the namespace
    an.sails.transport.Shortcut = Shortcut;

})();
