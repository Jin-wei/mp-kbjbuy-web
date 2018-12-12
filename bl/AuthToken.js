var serverLogger = require('../util/ServerLogger.js');
var httpreq = require('httpreq');
var sysConfig = require('../config/SystemConfig.js');

var authToken={
    accessToken:null,
    expireAt:null
};

var logger= serverLogger.createLogger("AuthToken.js");


function getAuthToken(req,callback) {
    if (authToken.accessToken && authToken.expireAt>(new Date()).getTime()) {
        callback(null,authToken.accessToken);
    }

    var authUrl=sysConfig.loginApi+"/auth/tokens";
        //validate the token against server and get user information
        var result,tokenInfo=null;
        httpreq.post(authUrl, {
            body: '{"method": "usernamepassword","userName":"'+sysConfig.auth.userName+ '","password":"'+sysConfig.auth.password+'"}',
            headers:{
                'tenant': sysConfig.auth.tenant,
                'Content-Type': 'application/json'
            }
        }, function (err, res){
            if (err){
                logger.error("get auth token failed",err);
                callback(err,null);
            }else{
                if (res.statusCode==200){
                    result=JSON.parse(res.body);
                    logger.debug("validate token response body:",result);
                    if (result.success==true){
                        tokenInfo = result.result;
                        logger.debug("token info:",tokenInfo);
                        if (tokenInfo && tokenInfo.accessToken) {
                            authToken.accessToken = tokenInfo.accessToken;
                            authToken.expireAt =tokenInfo.expireAt;
                            return callback(null,authToken.accessToken);
                        }
                    }
                }
                return callback(new Error("fail to authenticate",500),null);
            }

        });
}

///--- Exports

module.exports = {
    getAuthToken:  getAuthToken
}