var Handlers = (function () {
    var fileSystem = require("fs");
    var imageHandler = function () {
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

        return {
            load: function (file, browserDimensions, callback) {
                fileSystem.readFile(file.fullPath,
                    function (e, d) {
                        if (e) {
                            process.exit(-1);
                        }

                        var scaling = getImageScalingInfo(file, browserDimensions);

                        callback("<img src='data:image/" +
                            browserDimensions.type +
                            ";base64," +
                            d.toString("base64") +
                            "' width='" +
                            scaling.width +
                            "' height='" +
                            scaling.height +
                            "' />");
                    });
            }
        }
    };

    return {
        'jpg': function() {
            return imageHandler();
        },
        'gif': function() {
            return imageHandler();
        },
        'png': function() {
            return imageHandler();
        }
    };
}());

module.exports = {
    extensions: ["jpg", "gif", "png"],
    getHandler: function(fileType) {
        return Handlers[fileType]();
    }
};