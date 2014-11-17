'use strict';

module.exports = {
    build: {
        src: [ 'build/lib/an/sails/model/**/*.js', 'build/lib/an/sails/Model.js', 'build/lib/an/angular/**/*.js' ],
        dest: 'build/<%= pkg.name %>-<%= pkg.version %>.js'
    }
};
