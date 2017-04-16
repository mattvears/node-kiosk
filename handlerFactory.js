var Path = require("path");

module.exports = {    
    createEntry: function (dir, name, dims, handler, displayLength) {
        var fullPath = Path.join(dir, name);
        return {
            name: name,
            fullPath: fullPath,
            dimensions: dims,
            handler: handler,
            displayLength: displayLength
        };
    }
}