/*global module:false*/
module.exports = {
    javascript: {
        files: '<%= jshint.gruntfile.all %>',
        tasks: ['jshint', 'karma']
    }
}