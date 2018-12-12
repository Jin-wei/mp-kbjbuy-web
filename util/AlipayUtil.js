var sysConfig = require('../config/SystemConfig.js');
var serverLogger = require('../util/ServerLogger.js');
var logger = serverLogger.createLogger('AlipayUtil.js');

var Alipay = require('alipay').Alipay;

exports.alipay = new Alipay(sysConfig.alipayConfig,logger);
