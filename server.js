"use strict";
(function() {
    var fileSystem = require("fs");
    var express = require("express");

    // Initial setup
    if (process.argv.length <= 2) {
        console.log("Usage: " + __filename + " path/to/directory [port]");
        process.exit(-1);
    }

    var contentPath = process.argv[2];
    var port = process.argv[3];

    if (port === null || port === undefined) {
        port = 1337;
    }

    var winston = require("winston");
    winston.add(winston.transports.File,
    {
        filename: "kiosk.log",
        maxsize: 1000000
    });

    winston.info("content folder: " + contentPath);
    winston.info("port: " + port);

    var sessions = require("./session").sessions();
    var files = require("./files").files(contentPath, winston);

    files.updateFileList(contentPath);

    fileSystem.readFile("splash-screen.html",
        function(splashScreenError, splashScreenData) {
            if (splashScreenError) {
                winston.error(splashScreenError);
                process.exit(-2);
            }

            fileSystem.readFile("container.html",
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
                                var itemIndex = parseInt(req.query["item"], 10);
                                if (itemIndex === NaN || itemIndex === null || itemIndex === undefined) {
                                    winston.error("invalid item index: " + itemIndex);
                                } else {
                                    refreshTime = files.files[itemIndex].displayLength();
                                }
                            }

                            res.writeHead(200, { 'Content-Type': "text/javscript" });
                            res.write("setTimeout(() => { window.location = window.location; }, " + refreshTime + ");");
                            res.end();
                        });
                    app.get("/",
                        function (req, res) {             
                            // show the splash screen if there is no session data.
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
                            var file = files.files[session.itemIndex];
                            file.handler.load(file,
                                browserDimensions,
                                function (content) {
                                    var html = pictureFrameData.toString();
                                    html = html.split("ITEM_ID").join(session.itemIndex);
                                    html = html.split("/* CSS */").join(file.handler.css());

                                    var htmlParts = html.split("<!-- split -->");
                                    res.writeHead(200, { 'Content-Type': "text/html" });
                                    res.write(htmlParts[0]);
                                    res.write(content);
                                    res.write(htmlParts[1]);
                                    res.end();

                                    // update state after response is sent.
                                    sessions.get(sessionId).itemIndex += 1;
                                    if (sessions.get(sessionId).itemIndex >= files.files.length) {
                                        sessions.get(sessionId).itemIndex = 0;
                                        files.updateFileList(contentPath);
                                    }
                                });
                        });

                    app.listen(port,
                        function() {
                            winston.info("server started.");
                        });

                });
        });
}());
