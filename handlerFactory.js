var Path = require("path");
var FileSystem = require("fs");

module.exports = {
    createEntry: function(dir, name, dims, handler, displayLength) {
        var fullPath = Path.join(dir, name);
        return {
            name: name,
            fullPath: fullPath,
            dimensions: dims,
            handler: handler,
            displayLength: displayLength
        };
    },
    fileCss: function (file, onLoad, defaultCss, winston) {
        var fn = file.fullPath + ".css";
        FileSystem.readFile(fn,
            function(error, data) {
                if (error) {
                    winston.debug(error);
                    onLoad("<link rel='stylesheet' type='text/css' href='" + defaultCss + "' />");
                    return;
                }

                winston.debug("serving item css from: " + fn);
                onLoad("<style>" + data + "</style>");
            });
    }
};