"use strict";
module.exports = {
    files: function(imageFolderPath, winston) {
        var async = require("async");
        var path = require("path");
        var imageSize = require("image-size");
        var fileSystem = require("fs");
        var fileTypes = require("./fileType");
        var animated = require("animated-gif-detector");

        function createFileEntry(name, dir) {
            var joinedPath = path.join(dir, name);
            var dims = imageSize(joinedPath);
            winston.info(joinedPath + " (" + dims.type + ") " + dims.width + "x" + dims.height);
            return {
                name: name,
                fullPath: joinedPath,
                dimensions: dims,
                handler: fileTypes.getHandler(dims.type, winston),
                displayLength: function() {
                    if (dims.type === "gif") {
                        if (animated(fileSystem.readFileSync(this.fullPath))) {
                            return 5000;
                        }
                    }

                    return 2500;
                }
            };
        };

        return {
            files: [],
            updateFileList: function() {
                winston.info("updating files (" + imageFolderPath + ")");
                var tmpFiles = [];
                var that = this;
                fileSystem.readdir(imageFolderPath,
                    function(err, items) {
                        if (err) {
                            winston.error(err);
                            process.exit(-1);
                        }

                        async.each(items,
                            function(item, cb) {
                                for (var j = 0; j < fileTypes.extensions.length; j++) {
                                    if (item.indexOf(fileTypes.extensions[j]) === item.length - 3) {
                                        tmpFiles.push(createFileEntry(item, imageFolderPath));
                                    }
                                }
                            },
                            function(err) {
                                winston.error(err);
                            });
                    });

                that.files = tmpFiles;
            }
        };
    }
}