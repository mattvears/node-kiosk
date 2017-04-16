"use strict";
module.exports = {
    files: function(contentPath, winston) {
        var async = require("async");
        var fileSystem = require("fs");
        var fileTypes = require("./fileType");

        function createFileEntry(name, dir) {
            var extension = name.substr(name.length - 3);
            var handler = fileTypes.getHandler(extension, winston);
            if (handler === null || handler === undefined) {
                return null;
            }

            return handler.createEntry(dir, name);
        };

        return {
            files: [],
            updateFileList: function() {
                winston.info("updating files (" + contentPath + ")");
                var tmpFiles = [];
                var that = this;
                fileSystem.readdir(contentPath,
                    function(readDirError, items) {
                        if (readDirError) {
                            winston.error(readDirError);
                            process.exit(-1);
                        }

                        async.each(items,
                            function(item, cb) {
                                var fileEntry = createFileEntry(item, contentPath);
                                if (fileEntry !== null && fileEntry !== undefined) {
                                    tmpFiles.push(fileEntry);
                                }

                                cb();
                            },
                            function(asyncEachError) {
                                winston.error(asyncEachError);
                            });
                    });

                that.files = tmpFiles;
            }
        };
    }
}