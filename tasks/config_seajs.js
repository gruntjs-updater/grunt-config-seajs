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
            copy     : true,
            strict   : true,
            singemark: true
        });

        if (this.files.length < 1) {
            grunt.verbose.warn('Destination not written because no source files were provided.');
        }

        // Iterate over all specified file groups.
        this.files.forEach(function (f) {

            var dest = f.dest;
            var build = path.extname(dest) === '.js';


            var files = f.src.filter(function (filepath) {
                // Warn on and remove invalid source files (if nonull was set).
                if (!grunt.file.exists(filepath)) {
                    grunt.fail.fatal('Source file "' + filepath + '" not found.');
                } else if (grunt.file.isFile(filepath)) {
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

            files.forEach(function (filePath) {
                var ret = '',
                    content,
                    mapping,
                    alias,
                    abspath;

                // 获取源文件的内容
                abspath = path.resolve(filePath);
                if (require.cache[abspath]) {
                    delete require.cache[abspath];
                }

                content = require(abspath);
                alias = content.alias;

                // 路径配置
                if (options.paths) {
                    content.paths = grunt.util._.merge(content.paths || {}, options.paths);
                }
                // 别名配置
                if (options.mapping) {

                    abspath = path.resolve(options.mapping);
                    if (require.cache[abspath]) {
                        delete require.cache[abspath];
                    }
                    mapping = require(abspath);


                    if (mapping && content && alias) {
                        var key,
                            val,
                            valFixed,
                            mappingKey,
                            keyFixed;

                        for (key in alias) {
                            val = alias[key];

                            valFixed = fixPath(val);

                            for (mappingKey in mapping) {

                                keyFixed = fixPath(mappingKey);

                                if (keyFixed === valFixed) {
                                    alias[key] = mapping[mappingKey];
                                }
                            }
                        }
                    }


                }

                // 输出文件
                content = JSON.stringify(content, null, '\t');
                if (build) {
                    if (options.strict) {
                        if (options.singemark) {
                            ret += '\'use strict\';\n\n';
                        }
                        else {
                            ret += '"use strict";\n\n'
                        }
                    }
                    ret += 'seajs.config(';

                    if (options.singemark) {
                        ret += content.replace(/'/g, "\\\\'").replace(/"/g, "'");
                    } else {
                        ret += content.replace(/"/g, '\\\\"').replace(/'/g, '"');
                    }

                    ret += ');';

                    grunt.file.write(dest, ret);
                } else {
                    grunt.file.write(dest, content);
                }

                if (options.reload) {
                    if (!Array.isArray(options.reload)) {
                        options.reload = [options.reload];
                    }

                    // 重新加载任务的配置文件
                    grunt.task.init(options.reload);
                }

                if (options.copy) {
                    grunt.file.copy(filePath, path.join(path.dirname(dest), path.basename(filePath)));
                }

            });

            function fixPath(p) {
                var ret = p;
                if (!path.extname(ret)) {
                    ret += '.js';
                }
                return ret.toLowerCase();
            }
        });
    });

};
