module.exports = {
    production: {
        src: [ 'build/<%= pkg.name %>-<%= pkg.version %>.js' ],
        dest: 'build/<%= pkg.name %>-<%= pkg.version %>.min.js'
    }
};