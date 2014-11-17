'use strict';

module.exports = {
    production: {
        files: [
            {
                src: [ '<%= path.src %>' ],
                dest: 'build',
                expand: true
            }
        ]
    }
};
