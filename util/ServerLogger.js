/**
 * Created by Jie Zou on 2016/9/25.
 */

var sysConfig = require('../config/SystemConfig.js');
var serverLogger = require('mp-common-util').serverLogger;

function createLogger(name ){

    return serverLogger.createLogger(name,sysConfig.loggerConfig);
}

///-- Exports

module.exports = {
    createLogger : createLogger
};