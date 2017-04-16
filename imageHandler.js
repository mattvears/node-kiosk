"use strict";
function ScaleRatio(img, screenDimensions) {
    var imgMax, dimMax;

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
        return {
            width: img.dimensions.width / ratio,
            height: img.dimensions.height / ratio
        };
    } else { // scale up
        ratio = dimMax / imgMax;
        return {
            width: img.dimensions.width * ratio,
            height: img.dimensions.height * ratio
        };
    }
}

function GetImageScalingInfo(img, browserDimensions, winston) {
    if (isNaN(browserDimensions.height) || isNaN(browserDimensions.width)) {
        winston.error("no browser dimensions provided");        
    }

    if (img.dimensions.width !== img.dimensions.height) {
        return ScaleRatio(img, browserDimensions);
    } else { // square.
        if (browserDimensions.width > browserDimensions.height) {
            return {
                width: browserDimensions.height,
                height: browserDimensions.height
            };
        } else {
            return {
                width: browserDimensions.width,
                height: browserDimensions.width
            };
        }
    }
}
var Path = require("path");

module.exports = {
    handler: function(winston) {
        var fileSystem = require("fs");
        var imageSize = require("image-size");
        var handlerFactory = require("./handlerFactory");

        return {
            createEntry: function (dir, name) {
                var fullPath = Path.join(dir, name);
                return handlerFactory.createEntry(dir, name, imageSize(fullPath), this, function () { return 5000; });
            },
            css: function(file, callback) {
                callback("body { margin: 0; padding: 0; text-align: center; background-color: black; }");
            },
            load: function(file, browserDimensions, callback) {
                fileSystem.readFile(file.fullPath,
                    function(fileReadError, d) {
                        if (fileReadError) {
                            winston.error("read file error");
                            process.exit(-1);
                        }
                        
                        var scaling = GetImageScalingInfo(file, browserDimensions, winston);
                        winston.debug("image scaling:" + scaling);

                        var topOffset = 0;
                        if (scaling.height < browserDimensions.height) {
                            topOffset = (browserDimensions.height - scaling.height) / 2;
                        }
                        
                        callback("<img src='data:image/" +
                            browserDimensions.type +
                            ";base64," +
                            d.toString("base64") +
                            "' width='" +
                            scaling.width +
                            "' height='" +
                            scaling.height +
                            "' style='margin-top: " + topOffset + "px' />");
                    });
            }
        };
    }
};