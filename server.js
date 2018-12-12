// Copyright (c) 2012 Mark Cavage. All rights reserved.


var commonUtil =require('mp-common-util');
var authHeaderParser = commonUtil.authHeaderParser;
var authCheck = commonUtil.authCheck;
var restify = require('restify');
var sysConfig = require('./config/SystemConfig.js');
var serverLogger = require('./util/ServerLogger.js');
var logger = serverLogger.createLogger('Server.js');
var orderPayment = require('./bl/OrderPayment.js');
var contentHtml = require('./bl/contentHtml');
var nca = require('./bl/nca.js');

function createServer() {


    var server = restify.createServer({

        name: 'JINJIECHENG',
        version: '1.0.0'
    });

    var authUrl=sysConfig.loginApi+"/auth/tokens";
    logger.debug(authUrl);

    server.pre(restify.pre.sanitizePath());
    server.pre(restify.pre.userAgentConnection());
    server.use(restify.throttle({
        burst: 100,
        rate: 50,
        ip: true
    }));

    server.use(restify.CORS());
    restify.CORS.ALLOW_HEADERS.push('auth-token');
    restify.CORS.ALLOW_HEADERS.push('tenant');
    server.use(restify.acceptParser(server.acceptable));
    server.use(restify.dateParser());
    server.use(restify.authorizationParser());
    server.use(restify.queryParser());
    server.use(restify.gzipResponse());
    server.use(restify.fullResponse());
    server.use(restify.bodyParser({uploadDir: __dirname + '/uploads/'}));
    server.use(authHeaderParser.authHeaderParser({logger:logger,authUrl:authUrl}));

    var STATICS_FILE_RE = /\.(css|js|jpe?g|png|gif|less|eot|svg|bmp|tiff|ttf|otf|woff|woff2|pdf|ico|json|wav|ogg|mp3?|xml|txt)$/i;
    var STATICS_HTML = /\.(pdf|json|xml|html|txt)$/i;

    /*server.get(/\.html$/i,restify.serveStatic({
        directory: './web',
        maxAge: 0}));
    server.get(/\.html\?/i,restify.serveStatic({
        directory: './web',
        maxAge: 0}));*/
    server.get('/',restify.serveStatic({
        directory: './web',
        default: 'index.html',
        maxAge: 0
    }));
    server.get(/\/apidoc\/?.*/, restify.serveStatic({
        directory: './public'
    }));
    server.get(STATICS_FILE_RE, restify.serveStatic({ directory: './web', maxAge: sysConfig.maxAge }));
    server.get(STATICS_HTML, restify.serveStatic({ directory: './web', maxAge: 0 }));

    server.post({path:'/api/sendNca', contentType: 'application/json'}, authCheck.authCheck(), nca.sendNca);
    server.get('/api/order/:orderId/alipay', authCheck.authCheck(), orderPayment.doAliPay);
    server.post({path: '/api/alipay/notify', contentType: 'application/x-www-form-urlencoded'}, orderPayment.doAliNotify);
    server.post({path: '/api/alipay/testnotify', contentType: 'application/json'},authCheck.authCheck(), orderPayment.doAliNotifyTest);
    server.get({path:'/api/type/:typeId/page/:pageId',contentType: 'text/html; charset=utf-8'}, contentHtml.contentListHtml);
    server.get({path:'/api/contentId/:contentId',contentType: 'text/html; charset=utf-8'}, contentHtml.contentDetailHtml);


    server.on('NotFound', function (req, res, next) {
        /*res.setHeader('Content-Type', 'text/html');
        res.writeHead(200);
        var url = req.getUrl();
        var queryString = '';
        if (url.pathname) {
            queryString += "path=" + url.pathname;
        }
        if (url.query) {
            queryString += "&query=" + encodeURIComponent(url.query);
        }
        res.end("<html><script>window.location.href='/?" + queryString + "'</script></html>");
        next();*/
        res.send(404);
        next();
    })
    return (server);
}



///--- Exports

module.exports = {
    createServer: createServer
};