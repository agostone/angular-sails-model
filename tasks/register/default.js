'use strict';

module.exports = function (grunt) {
    grunt.registerTask('default', ['clean:all', 'jscs', 'jshint', 'ngAnnotate', 'concat', 'uglify', 'clean:temporary']);
};
