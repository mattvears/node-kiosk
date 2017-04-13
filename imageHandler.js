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

function GetImageScalingInfo(img, screenDimensions) {
    if (img.dimensions.width !== img.dimensions.height) {
        return ScaleRatio(img, screenDimensions);
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

module.exports = {
    handler: function(winston) {
        var fileSystem = require("fs");
        return {
            load: function(file, browserDimensions, callback) {
                fileSystem.readFile(file.fullPath,
                    function(fileReadError, d) {
                        if (fileReadError) {
                            process.exit(-1);
                        }

                        var scaling = GetImageScalingInfo(file, browserDimensions);
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