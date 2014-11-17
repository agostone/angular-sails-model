'use strict';

/**
 * Tama configuration file
 */
module.exports = {
    configPath: './tasks/config',
    customTaskPaths: ['./tasks/register'],
    taskMaps: {
        bower: 'grunt-bower-install-simple:bower-install-simple',
        ngAnnotate: 'grunt-ng-annotate'
    }
};