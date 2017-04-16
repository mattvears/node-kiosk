var HandlerFactory = require("./handlerFactory");
var Exec = require("child_process").exec;

module.exports = {
    handler: function (winston) {
        return {
            createEntry: function(dir, name) {
                return HandlerFactory.createEntry(
                    dir,
                    name,
                    {
                        width: 300, // TODO: not used yet...
                        height: 300 // TODO: not used yet...
                    },
                    this,
                    function() {
                        return 5000;
                    });
            },
            css: function (file, callback) {
                HandlerFactory.fileCss(file,
                    function (txt) {
                        callback(txt);
                    },
                    "output.css",
                    winston); 
            },
            load: function (file, browserDimensions, callback) {
                var cmd = "node " + file.fullPath;
                winston.debug("executing '" + cmd + "'");
                Exec(cmd, function (err, stdout, stderr) {
                    if (stderr) {
                        winston.error("Error when running js file: " + stderr);
                    }

                    var result = "";
                    if (stderr != null) {
                        result += "<div class='stderr'>" + stderr + "</div>";
                    }
                    
                    result += "<div class='stdout'>" + stdout + "</div>";
                    callback(result);
                });
            }
        }
    }
}