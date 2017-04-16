"use strict";

function GetFileExtension(fileName, winston) {
    var re = ".*?\\.(.*)$";
    var txt = fileName.match(re);
    if (txt.length > 1) {
        return txt[txt.length-1];
    } else {
        winston.error("Could not determine extension for " + fileName);
        winston.debug(txt);
        process.exit(-1);
    }
}

module.exports = {
    files: function(contentPath, winston) {
        var async = require("async");
        var fileSystem = require("fs");
        var fileTypes = require("./fileType");

        function createFileEntry(name, dir) {
            var extension = GetFileExtension(name, winston);
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
                            function (item, cb) {
                                winston.info("processing file: " + item);
                                var fileEntry = createFileEntry(item, contentPath);
                                if (fileEntry !== null && fileEntry !== undefined) {
                                    tmpFiles.push(fileEntry);
                                }
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