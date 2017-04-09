"use strict";
(function() {
    var fileSystem = require("fs");
    var express = require("express");

    // Initial setup
    if (process.argv.length <= 2) {
        console.log("Usage: " + __filename + " path/to/directory");
        process.exit(-1);
    }

    var imageFolderPath = process.argv[2];
    var winston = require("winston");
    winston.add(winston.transports.File, { filename: "picture-frame.log" });
    winston.info("image folder: " + imageFolderPath);

    var sessions = require("./session").sessions();
    var files = require("./files").files(imageFolderPath, winston);

    files.updateFileList(imageFolderPath);

    fileSystem.readFile("picture-frame.html",
        (errno, pictureFrameData) => {
            if (errno) {
                winston.error(errno);
                process.exit(-2);
            }

            // start the server
            var app = express();
            app.use(express.static("public"));
            app.get("/refresh",
                function (req, res) {
                    var sessionId = sessions.getOrCreateSessionId(req, res);
                    if (sessions.get(sessionId) === undefined) {
                        sessions.create(sessionId);
                    }

                    var session = sessions.get(sessionId);
                    res.writeHead(200, { 'Content-Type': "text/javscript" });
                    res.write("setTimeout(() => { window.location = window.location; }, " + files.files[session.imageIndex].displayLength() + ");");
                    res.end();
                });
            app.get("/",
                function(req, res) {
                    // pre processing                
                    var sessionId = sessions.getOrCreateSessionId(req, res);
                    if (sessions.get(sessionId) === undefined) {
                        sessions.create(sessionId);
                    }

                    var session = sessions.get(sessionId);

                    var browserDimensions = sessions.screenDimensions(req, res);

                    // write content
                    res.writeHead(200, { 'Content-Type': "text/html" });
                    var html = pictureFrameData.toString();
                    var htmlParts = html.split("<!-- split -->");
                    res.write(htmlParts[0]);
                    files.files[session.imageIndex].render(req,
                        res,
                        browserDimensions,
                        function() {
                            res.write(htmlParts[1]);
                            res.end();
                        });

                    // post processing
                    sessions.get(sessionId).imageIndex += 1;
                    if (sessions.get(sessionId).imageIndex >= files.files.length) {
                        sessions.get(sessionId).imageIndex = 0;
                        files.updateFileList(imageFolderPath);
                    }

                });

            app.listen(1337,
                function() {
                    winston.info("server started.");
                });

        });
}());