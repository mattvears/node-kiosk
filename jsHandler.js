var HandlerFactory = require("./handlerFactory");
var Exec = require("child_process").exec;

module.exports = {
    handler: function (winston) {        
        return {
            createEntry: function (dir, name) {
                return HandlerFactory.createEntry(
                    dir,
                    name,
                    {
                        width: 300,
                        height: 300
                    },
                    this,
                    function() {
                         return 5000;
                    });
            },
            css: function () {
                return [
                    "body { background-color: #FFFFFF; }",
                    ".stderr { color: red; }",
                    ".stdout { " +
                    "background-color: #E0E0E0; " +
                    "font-family: Consolas, Courier New, fixed;" +
                    "font-size: 22px;" + 
                    "color: #212121;" +
                    "margin: 25px; " +
                    "padding: 25px; " +
                    "border-radius: 8px;" +
                    "border: 4px solid #EEEEEE; }"
                ].join("\n");
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