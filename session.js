module.exports = {
    sessions: function() {
        var Cookies = require("cookies");
        var offset = 0;
        var states = {};
        
        return {
            create: function() {
                offset += 1;
                states[offset] = {
                    imageIndex: 0
                };
                return offset;
            },
            get: function(id) {
                return states[id];
            },
            screenDimensions: function(req, res) {
                var cookies = new Cookies(req, res);
                var width = parseInt(cookies.get("innerWidth"), 10);
                var height = parseInt(cookies.get("innerHeight"), 10);
                return {
                    width: width,
                    height: height
                };
            },
            getOrCreateSessionId: function(req, res) {
                var cookies = new Cookies(req, res);
                var sessionId;
                if (cookies.get("session") === undefined) {
                    sessionId = this.create();
                    cookies.set("session", sessionId);
                } else {
                    sessionId = cookies.get("session");
                }

                return sessionId;
            }
        };
    }
};
