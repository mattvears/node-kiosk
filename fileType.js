"use strict";
var ImageHandler = require("./imageHandler");
var JsHandler = require("./jsHandler");
module.exports = {
    getHandler: function (fileType, winston) {
        switch (fileType) {
            case "jpg":
            case "gif":
            case "png":
                return ImageHandler.handler(winston);
            case "js":
                return JsHandler.handler(winston);
        }

        return null;
    }
};