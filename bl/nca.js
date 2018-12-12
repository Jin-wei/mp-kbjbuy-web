/**
 * Created by niejichun on 2018/5/15.
 */
var request=require('request');
var sysConfig = require('../config/SystemConfig.js');
function sendNca(req,res,next){
    var options = {
        headers: {"Connection": "close"},
        url:sysConfig.ncaApiUrl +'/api/nca/ordermanage/NCAOrderShopSyncControl?method=sync',
        method: 'POST',
        json:true,
        body: req.params
    };
    function callback(error, response, data) {
        res.send(200,data);
        next()
    }
    request(options, callback);
}

module.exports = {
    sendNca: sendNca
};