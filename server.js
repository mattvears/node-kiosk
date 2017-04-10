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

    fileSystem.readFile("splash-screen.html",
        function(splashScreenError, splashScreenData) {
            if (splashScreenError) {
                winston.error(splashScreenError);
                process.exit(-2);
            }

            fileSystem.readFile("picture-frame.html",
                function(pictureFrameError, pictureFrameData) {
                    if (pictureFrameError) {
                        winston.error(pictureFrameError);
                        process.exit(-2);
                    }

                    // start the server
                    var app = express();
                    app.use(express.static("public"));
                    app.get("/refresh",
                        function(req, res) {
                            var refreshTime = 1;
                            if (req.query["splash"] !== "true") {
                                var image = req.query["image"];
                                var imageIndex = parseInt(image, 10);
                                if (imageIndex === NaN || imageIndex === null || imageIndex === undefined) {
                                    winston.error("invalid image index: " + imageIndex);
                                } else {
                                    refreshTime = files.files[imageIndex].displayLength();
                                }
                            }

                            res.writeHead(200, { 'Content-Type': "text/javscript" });
                            res.write("setTimeout(() => { window.location = window.location; }, " + refreshTime + ");");
                            res.end();
                        });
                    app.get("/",
                        function(req, res) {
                            // pre processing                
                            var sessionId = sessions.getOrCreateSessionId(req, res);
                            if (sessions.get(sessionId) === undefined) {
                                sessions.create(sessionId);
                                res.writeHead(200, { 'Content-Type': "text/html" });
                                res.write(splashScreenData.toString());
                                res.end();
                                return;
                            }

                            var session = sessions.get(sessionId);
                            var browserDimensions = sessions.screenDimensions(req, res);
                            var file = files.files[session.imageIndex];

                            file.handler.load(file,
                                browserDimensions,
                                function(content) {
                                    res.writeHead(200, { 'Content-Type': "text/html" });
                                    var html = pictureFrameData.toString();
                                    html = html.split("IMAGE_ID").join(session.imageIndex);
                                    var htmlParts = html.split("<!-- split -->");
                                    res.write(htmlParts[0]);
                                    res.write(content);
                                    res.write(htmlParts[1]);
                                    res.end();

                                    // post processing
                                    sessions.get(sessionId).imageIndex += 1;
                                    if (sessions.get(sessionId).imageIndex >= files.files.length) {
                                        sessions.get(sessionId).imageIndex = 0;
                                        files.updateFileList(imageFolderPath);
                                    }
                                });
                        });

                    app.listen(1337,
                        function() {
                            winston.info("server started.");
                        });

                });
        });
}());