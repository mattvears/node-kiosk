module.exports = {
    files: function(imageFolderPath, winston) {
        var async = require("async");
        var path = require("path");
        var imageSize = require("image-size");
        var fileSystem = require("fs");
        var imageTypes = ["png", "gif", "jpg"];
        var animated = require('animated-gif-detector');

        function scaleRatio(img, screenDimensions) {
            var imgMax = 0;
            var dimMax = 0;
            if (img.dimensions.width > img.dimensions.height) {
                // picture is wide
                imgMax = img.dimensions.width;
                dimMax = screenDimensions.width;
            } else {
                // picture is tall
                imgMax = img.dimensions.height;
                dimMax = screenDimensions.height;
            }

            var ratio;
            if (imgMax > dimMax) { // scale down
                ratio = imgMax / dimMax;
                winston.info("scaling image down (ratio: " + ratio + ")");
                return {
                    width: img.dimensions.width / ratio,
                    height: img.dimensions.height / ratio
                };
            } else { // scale up
                ratio = dimMax / imgMax;
                winston.info("scaling image up (ratio: " + ratio + ")");
                return {
                    width: img.dimensions.width * ratio,
                    height: img.dimensions.height * ratio
                };
            }
        }

        function getImageScalingInfo(img, screenDimensions) {
            if (img.dimensions.width !== img.dimensions.height) {
                return scaleRatio(img, screenDimensions);
            } else { // square.
                if (screenDimensions.width > screenDimensions.height) {
                    return {
                        width: screenDimensions.height,
                        height: screenDimensions.height
                    };
                } else {
                    return {
                        width: screenDimensions.width,
                        height: screenDimensions.width
                    };
                }
            }
        }

        function createFileEntry(name, dir) {
            var joinedPath = path.join(dir, name);
            var dims = imageSize(joinedPath);
            winston.info(joinedPath + " (" + dims.type + ") " + dims.width + "x" + dims.height);
            return {
                name: name,
                fullPath: joinedPath,
                dimensions: dims,
                displayLength: function () {
                    if (dims.type === "gif") {
                        if (animated(fileSystem.readFileSync(this.fullPath))) {
                            return 5000;
                        } else {
                            return 2500;
                        }
                    } else if (dims.type === "jpg" || dims.type === "png") {
                        return 2500;
                    } else {
                        throw "image time for " + dims.type;
                    }
                },
                render: function(req, res, browserDimensions, callback) {
                    var dims = browserDimensions;
                    fileSystem.readFile(this.fullPath,
                        (e, d) => {
                            if (e) {
                                winston.error(e);
                                process.exit(-1);
                            }

                            var scaling = getImageScalingInfo(this, browserDimensions);

                            res.write(
                                "<img src='data:image/" +
                                dims.type +
                                ";base64," +
                                d.toString("base64") +
                                "' width='" +
                                scaling.width +
                                "' height='" +
                                scaling.height +
                                "' />");

                            callback(req, res);
                        });
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
                                for (var j = 0; j < imageTypes.length; j++) {
                                    if (item.indexOf(imageTypes[j]) !== -1) {
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