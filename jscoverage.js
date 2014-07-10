var esprima = require('esprima');
var escodegen = require('escodegen');
var jscover = require('node-jscover');
var fs = require('fs');

module.exports = function(pagerun){
    var self = this;
    var config = self.config({});
    pagerun.injectCode('<script src="//pagerun/jscoverage-client.js"></script>', 'header');
    var bOpenUrl = false;
    pagerun.on('proxyStart', function(msg){
        var proxy = msg.proxy;
        var include = config.include;
        var beautify = config.beautify;
        proxy.addFilter(function(httpData, next){
            if(bOpenUrl === true){
                var responseContent = httpData.responseContent;
                if(httpData.responseCode === 200 &&
                    responseContent !== undefined &&
                    httpData.responseType === 'js' &&
                    pagerun.isMatchUrl(httpData.url, include)
                    ){
                        // beautify the js code
                        if(beautify === true){
                            var syntax = esprima.parse(responseContent, { raw: true, tokens: true, range: true, comment: true });
                            syntax = escodegen.attachComments(syntax, syntax.comments, syntax.tokens);
                            responseContent = escodegen.generate(syntax, 
                                {
                                    comment: true,
                                    format: {
                                        indent: {
                                            style: '  '
                                        },
                                        quotes: 'single'
                                    }
                                }
                            );
                        }
                        httpData.responseContent = jscover.instrument(responseContent, httpData.url);
                }
            }
            next();
        });
    });
    pagerun.on('webdriverOpenUrl', function(){
        bOpenUrl = true;
    });
    pagerun.addRequestMap('pagerun/jscoverage-client.js', {
        'responseCode': '200',
        'responseHeaders': {
            'Content-Type': 'application/javascript'
        },
        'responseData': fs.readFileSync(__dirname+'/jscoverage-client.js')
    });
};
