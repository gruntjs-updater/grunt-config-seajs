/*
 * grunt-config-seajs
 * https://github.com/bubkoo/grunt-config-seajs
 *
 * Copyright (c) 2014 bubkoo
 * Licensed under the MIT license.
 */

'use strict';

module.exports = function (grunt) {

    var path = require('path');

    grunt.registerMultiTask('config_seajs', 'Create seajs config file with json file', function () {
        // Merge task-specific and/or target-specific options with these defaults.
        var options = this.options({
            copy: true,
            strict: true,
            singemark: true
        });

        if (this.files.length < 1) {
            grunt.verbose.warn('Destination not written because no source files were provided.');
        }

        // Iterate over all specified file groups.
        this.files.forEach(function (f) {

            var dest = f.dest;

            var files = f.src.filter(function (filepath) {
                // Warn on and remove invalid source files (if nonull was set).
                if (!grunt.file.exists(filepath)) {
                    grunt.fail.fatal('Source file "' + filepath + '" not found.');
                    return false;
                } else {
                    return true;
                }
            });

            if (files.length === 0) {
                if (f.src.length < 1) {
                    grunt.fail.fatal('Destination not written because no source files were found.');
                }
                // No src files, goto next target. Warn would have been issued above.
                return;
            }

//            if (dest && !grunt.file.isFile(dest)) {
//                grunt.fail.fatal('Destination for target ' + dest + ' is not a file');
//            }

            files.forEach(function (filePath) {
                var ret = '';
                if (options.strict) {
                    if (options.singemark) {
                        ret += '\'use strict\';\n\n';
                    }
                    else {
                        ret += '"use strict";\n\n'
                    }
                }
                ret += 'seajs.config(';

                var content = grunt.file.read(filePath);
                if (options.singemark) {
                    ret += content.replace(/'/g, "\\\\'").replace(/"/g, "'");
                } else {
                    ret += content.replace(/"/g, '\\\\"').replace(/'/g, '"');
                }
                ret += ');';

                grunt.file.write(dest, ret);

                if (options.copy) {

                    grunt.file.copy(filePath, path.join(path.dirname(dest), path.basename(filePath)));
                }
            });

        });
    });

};
