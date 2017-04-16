"use strict";
var ImageHandler = require("./imageHandler");
module.exports = {
    getHandler: function(fileType, winston) {
        switch (fileType) {
            case "jpg":
            case "gif":
            case "png":
                return ImageHandler.handler(winston);
        }

        return null;
    }
};