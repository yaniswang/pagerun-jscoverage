var parser = require("uglify-js").parser;
var uglify = require("uglify-js").uglify;

module.exports = function(pagerun){
    var self = this;
    var bOpenUrl = false;
    pagerun.on('proxyStart', function(msg){
        var proxy = msg.proxy;
        proxy.addFilter(function(httpData, next){
            if(bOpenUrl === true){
                var responseType = httpData.responseType;
                var responseContent = httpData.responseContent;
                if(httpData.responseCode === 200 &&
                    responseContent !== undefined){
                    if(responseType === 'html'){
                        httpData.responseContent = responseContent.replace(/<\/head>/i, '<script type="text/javascript">if(window.pagerun){pagerun.beforeEnd(function(){if(window._jscoverage){pagerun.result("jscoverage", _jscoverage);}});}</script>$&');
                    }
                    else if(responseType === 'js'){
                        httpData.responseContent = jscoverage(httpData.path, responseContent);
                    }
                }
            }
            next();
        });
    });
    pagerun.on('webdriverOpenUrl', function(){
        bOpenUrl = true;
    });
};

//Copyright (c) 2012 Fabio Crisci <fabio.crisci@gmail.com>
function jscoverage(filename, jscode){
    var oldTree;
    try {
        oldTree = parser.parse(jscode, false, true);
    } catch (ex) {
        console.error(ex.message);
    }
    if(oldTree){
        jscode = uglify.gen_code(oldTree, {beautify : true});
        oldTree = parser.parse(jscode, false, true);

        var walker = uglify.ast_walker();
        var analyzing = [];

        var lineCount = 0,
            arrLines = [],
            functionCount = 0,
            arrFunctions = [];

        function pushLine(line) {
            arrLines.push(line);
            lineCount++;
        }

        function pushFunction(line, name) {
            arrFunctions.push(line + ':' + name);
            functionCount++;
        }

        function wrapLabel() {
            var self = this, ret;
            if (self[0].start && analyzing.indexOf(self) < 0) {
                var content = self[2];
                if (content[0].name == "for" && content[4] && content[4].name != "block") {
                    content[4] = ["block", [content[4]]];
                }
                analyzing.push(content);
                var ret = countLine.call(self);
                analyzing.pop(content);
            }
            return ret;
        }

        function wrapIf() {
            var self = this, ret, decision;
            if (self[0].start && analyzing.indexOf(self) < 0) {
                decision = self[1];
                if (self[2] && self[2][0].start && self[2][0].start.value != "{") {
                    self[2] = ["block", [self[2]]];
                }
                if (self[3] && self[3][0].start && self[3][0].start.value != "{") {
                    self[3] = ["block", [self[3]]];
                }
            }
            ret = countLine.call(self);
            if (decision) {
                analyzing.pop(decision);
            }
            return ret;
        }

        function wrapBlock(position) {
            return function countLoop() {
                var self = this;

                if (self[0].start && analyzing.indexOf(self) < 0) {
                    if (self[0].start && analyzing.indexOf(self) < 0) {
                        if (self[position] && self[position][0].name != "block") {
                            self[position] = [ "block", [self[position]]];
                        }
                    }
                }

                return countLine.call(self);
            };
        };

        function giveNameToAnonymousFunction () {
            var self = this;
            if (self[0].name == "var" || self[0].name == "object") {
                self[1].forEach(function (assignemt) {
                    if (assignemt[1]) {
                        if (assignemt[1][0].name === "function") {
                            assignemt[1][0].anonymousName = assignemt[0];
                        } else if (assignemt[1][0].name === "conditional") {
                            if (assignemt[1][2][0] && assignemt[1][2][0].name === "function") {
                                assignemt[1][2][0].anonymousName = assignemt[0];
                            }
                            if (assignemt[1][3][0] && assignemt[1][3][0].name === "function") {
                                assignemt[1][3][0].anonymousName = assignemt[0];
                            }
                        }
                    }
                });
            } else if (self[0].name == "assign" && self[1] === true) {
                if (self[3][0].name === "function") {
                    self[3][0].anonymousName = getNameFromAssign(self);
                } else if (self[3][0] === "conditional") {
                    if (self[3][2][0] && self[3][2][0].name === "function") {
                        self[3][2][0].anonymousName = getNameFromAssign(self);
                    }
                    if (self[3][3][0] && self[3][3][0].name === "function") {
                        self[3][3][0].anonymousName = getNameFromAssign(self);
                    }
                }
            }
        };

        function getNameFromAssign (node) {
            if (node[2][0].name === "name") {
                return node[2][1];
            } else if (node[2][0].name === "dot") {
                return node[2][2];
            }
        }

        function countLine() {
            var self = this, ret;
            if (self[0].start && analyzing.indexOf(self) < 0) {
                giveNameToAnonymousFunction.call(self);
                var line = "" + self[0].start.line;
                analyzing.push(self);
                pushLine(line);
                ret = ["splice", [
                    ["stat", ["call", ["name", "_jscoverage_line"],
                        [
                            ["string", filename],
                            ["string", line]
                        ]
                    ]], walker.walk(self)]];
                analyzing.pop(self);
            }
            return ret;
        }

        function countFunction(){
            var self = this, ret;
            if (self[0].start && analyzing.indexOf(self) < 0) {
                var defun = self[0].name === "defun";
                var fnName = self[1] || self[0].anonymousName || "(?)";
                var fnLine = "" + self[0].start.line;
                var body = self[3];

                analyzing.push(self);
                pushFunction(fnLine, fnName);
                body.splice(0, 0, [ "stat",
                    [ "call",
                        ["name", "_jscoverage_func"],
                        [
                            ["string", filename],
                            ["string", "" + fnLine],
                            ["string", fnName]
                        ]
                    ]
                ]);

                if (defun) {
                    pushLine(fnLine);
                    ret = [ "splice",
                        [
                            [ "stat",
                                [ "call", [ "name", "_jscoverage_line" ],
                                    [
                                        ["string", filename],
                                        ["string", fnLine]
                                    ]
                                ]
                            ],
                            walker.walk(self)
                        ]
                    ];
                } else {
                    ret = walker.walk(self);
                }
                analyzing.pop(self);
            }
            return ret;
        }

        var newTree = walker.with_walkers({
            "label"    : wrapLabel,
            "if"       : wrapIf,
            "while"    : wrapBlock(2),
            "do"       : wrapBlock(2),
            "for"      : wrapBlock(4),
            "for-in"   : wrapBlock(4),
            "assign"   : giveNameToAnonymousFunction,
            "object"   : giveNameToAnonymousFunction,
            "stat"     : countLine,
            "break"    : countLine,
            "continue" : countLine,
            "debugger" : countLine,
            "var"      : countLine,
            "const"    : countLine,
            "return"   : countLine,
            "throw"    : countLine,
            "try"      : countLine,
            "switch"   : countLine,
            "with"     : countLine,
            "function" : countFunction,
            "defun"    : countFunction
        }, function () {
            return walker.walk(oldTree);
        });

        var newJsCode = uglify.gen_code(newTree, {beautify : true});

        var arrTemp;
        var arrContent = ['(function(win, undefined) {\r\n    if(win._jscoverage === undefined){\r\n        var _jscoverage = {};\r\n        win._jscoverage = _jscoverage;\r\n        win._jscoverage_func = function(file, line, name){\r\n            var coverage = _jscoverage[file],\r\n                funcId = line + ":" + name;\r\n            if(coverage.arrFunctions[funcId] === 0){\r\n                coverage.coveredFunctions++;\r\n            }\r\n            coverage.arrFunctions[funcId]++;\r\n        }\r\n        win._jscoverage_line = function(file, line){\r\n            var coverage = _jscoverage[file];\r\n            if(coverage.arrLines[line] === 0){\r\n                coverage.coveredLines++;\r\n            }\r\n            coverage.arrLines[line]++;\r\n        }\r\n    }\r\n'];
        arrContent.push('    win._jscoverage["'+filename+'"] = {\r\n');
        arrContent.push('        validLines: '+lineCount+',\r\n        coveredLines : 0,\r\n        validFunctions: '+functionCount+',\r\n        coveredFunctions : 0,\r\n');
        arrTemp = arrLines.map(function(line){
            return '"'+line+'":0';
        });
        arrContent.push('        arrLines : {'+arrTemp.join(',')+'},\r\n');
        arrTemp = arrFunctions.map(function(fundId){
            return '"'+fundId+'":0';
        });
        arrContent.push('        arrFunctions : {'+arrTemp.join(',')+'}\r\n');
        arrContent.push('    }\r\n})(window);\r\n');

        jscode = arrContent.join('') + newJsCode;
    }
    return jscode;
}