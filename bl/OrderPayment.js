var alipay = require('../util/AlipayUtil.js').alipay;
var httpreq = require('httpreq');
var sysConfig = require('../config/SystemConfig.js');
var serverLogger = require('../util/ServerLogger.js');
var logger = serverLogger.createLogger('OrderPayment.js');
var commonUtil = require('mp-common-util');
var resUtil = commonUtil.responseUtil;
var authToken = require('./AuthToken.js');
var Alipay = require('alipay').Alipay;


function doAliPay(req, res, next) {
    var params = req.params;
    var authUser = params.authUser;
    var tenant = params.tenant;
    var orderId = params.orderId;
    var authUserId = authUser.userId;
    var order;
    if (tenant == null) {
        return next(sysError.MissingParameterError(sysMsg.TENANT_NOT_EXIST, sysMsg.TENANT_NOT_EXIST));
    }
    //get the order information
    var tempObj = {};

    var url = sysConfig.checkoutApi + "/orders?orderId=" + orderId + "&userId=" + authUserId;
    logger.debug("order url:" + url);

    authToken.getAuthToken(req, function (error, token) {
        if (error) {
            return resUtil.resInternalError(error, res, next);
        }

        httpreq.get(url, {
            headers: {
                'tenant': tenant,
                'auth-token': token
            }
        }, function (err, response) {
            if (err) {
                logger.error("get order failed", err);
                resUtil.resetFailedRes(res, "get order failed");
                return next();
            } else {
                var resObj = JSON.parse(response.body);
                logger.debug("validate get order response body:", resObj);
                if (response.statusCode == 200) {
                    if (resObj.success == true && resObj.result && resObj.result.length > 0) {
                        order = resObj.result[0];
                        //todo check order status
                        var data = {
                            out_trade_no: _getUniqueOutTradeNo(tenant, orderId),
                            //todo move to configuraion file
                            subject: "kbj",
                            total_fee: order.orderAmount
                        };
                        var bizId = order.bizId;
                        logger.debug('bizId   :   ', bizId);
                        if (bizId == 0) {
                            logger.error("get biz failed", err);
                            resUtil.resetFailedRes(res, "get biz failed");
                            return next();
                        } else {
                            var bizUrl = sysConfig.bizApi + "/paysettings?bizId=" + bizId;
                            logger.info('bizUrl   :   ',bizUrl);
                            try {
                                httpreq.get(bizUrl, {
                                    headers: {
                                        'tenant': tenant,
                                        'auth-token': token
                                    }
                                }, function (err, response) {
                                    if (err) {
                                        logger.error("get biz failed", err);
                                        resUtil.resetFailedRes(res, "get biz failed");
                                        return next();
                                    } else {
                                        logger.info('-------  正常进入支付1  ------');
                                        logger.debug('response body',response.body);
                                        var resObj = JSON.parse(response.body);
                                        logger.debug('biz body',resObj);
                                        if (response.statusCode == 200) {
                                            if(resObj.success == true && resObj.result && resObj.result.length > 0 && resObj.result[0].partner != null && resObj.result[0].key != null && resObj.result[0].sellerEmail != null){
                                                var alipayConfig = {
                                                    partner:resObj.result[0].partner,
                                                    key:resObj.result[0].key,
                                                    seller_email:resObj.result[0].sellerEmail,
                                                    host:sysConfig.alipayConfig.host,
                                                    cacert:sysConfig.alipayConfig.cacert,
                                                    create_direct_pay_by_user_return_url:sysConfig.alipayConfig.create_direct_pay_by_user_return_url,
                                                    create_direct_pay_by_user_notify_url:sysConfig.alipayConfig.create_direct_pay_by_user_notify_url
                                                };
                                                logger.info('alipayConfig  ',alipayConfig)
                                                alipay = new Alipay(alipayConfig,logger);
                                                var htmlStr = alipay.create_direct_pay_by_user_form(data);
                                                res.send(200,{success:true,html:htmlStr});
                                                return next();
                                            }else{
                                                alipay = new Alipay(sysConfig.alipayConfig, logger);
                                                var htmlStr = alipay.create_direct_pay_by_user_form(data);
                                                res.send(200, {success: true, html: htmlStr});
                                                return next();
                                            }
                                        }else{
                                            logger.error("get biz failed", err);
                                            resUtil.resetFailedRes(res, "get biz failed");
                                            return next();
                                        }
                                    }
                                });
                            } catch (e) {
                                logger.debug(e);
                            }
                        }
                    }
                }
                //resUtil.resetFailedRes(res, "get order failed");
                //return next();
            }
        });
    })
}


function _getUniqueOutTradeNo(tenant, orderId) {
    var temp = sysConfig.checkoutApi;
    if (temp) {
        temp = temp.replace(/[^\w\n]/gi, '');
    } else {
        temp = "";
    }
    return tenant + "|" + Date.now() + "|" + temp + "|" + orderId;
}

function _getOrderId(outTradeNo) {
    var index = outTradeNo.lastIndexOf("|");
    return outTradeNo.substring(index + 1);
}

function _getTenant(outTradeNo) {
    var index = outTradeNo.indexOf("|");
    return outTradeNo.substring(0, index);
}

function doAliNotifyTest(req, res, next) {
    var params = req.params;
    _createPayment(params, req, res, function (error) {
        if (error) {
            resUtil.resetFailedRes(req, "create payment failed");
        } else {
            resUtil.resetSuccessRes(res);
        }
    });
}

function _createPayment(payment, req, res, callback) {
    var payAmount, aliTradeNo, outTradeNo, orderId, tenant;
    var url = sysConfig.checkoutApi + "/payments";
    payAmount = payment['total_fee'];
    aliTradeNo = payment['trade_no'];
    outTradeNo = payment['out_trade_no'];
    orderId = _getOrderId(outTradeNo);
    tenant = _getTenant(outTradeNo);
    var body = '{"payments": [{"orderId":' + orderId + ',"paymentNonce":"' + aliTradeNo + '","paymentAmount":' + payAmount + ',"paymentType":' + '"alipay"}]}';
    logger.debug("body:" + body);
    //find the payment created or not
    authToken.getAuthToken(req, function (error, token) {
        if (error) {
            callback(error);
        }
        httpreq.post(url, {
            body: body,
            headers: {
                'tenant': tenant,
                'auth-token': token,
                'Content-Type': 'application/json'
            }
        }, function (err, response) {
            if (err) {
                return callback(err);
            } else {
                var resObj = JSON.parse(response.body);
                logger.debug("validate create payment:", resObj);
                if (response.statusCode == 200) {
                    if (resObj.success == true && resObj.result.length > 0 && resObj.result[0].success) {
                        return callback(null);
                    } else {
                        return callback(new Error("create payment failed"));
                    }
                } else {
                    return callback(new Error("create payment failed"));
                }
            }
        });
    })
}

function doAliNotify(req, res, next) {
    logger.info('-------正常进入支付宝回调接口------');
    var payment = req.params;
    var paymentArr = payment.out_trade_no.split("|");
    var orderId = ''
    var tenant = 'jjc'
    if(paymentArr.length > 0){
        orderId = paymentArr[paymentArr.length-1];
        tenant = paymentArr[0]
    }
    var url = sysConfig.checkoutApi + "/orders?orderId=" + orderId
    logger.info("order url:",url);

    authToken.getAuthToken(req, function (error, token) {
        if (error) {
            return resUtil.resInternalError(error, res, next);
        }

        httpreq.get(url, {
            headers: {
                'tenant': tenant,
                'auth-token': token
            }
        }, function (err, response) {
            if (err) {
                logger.error("get order failed", err);
            } else {
                var resObj = JSON.parse(response.body);
                logger.debug("validate get order response body:", resObj);
                if (response.statusCode == 200) {
                    if (resObj.success == true && resObj.result && resObj.result.length > 0) {
                        var order = resObj.result[0];
                        var bizId = order.bizId;
                        logger.debug('bizId   :   ', bizId);
                        if (bizId == 0) {
                            logger.error("get biz failed : bizId=0");
                        } else {
                            var bizUrl = sysConfig.bizApi + "/paysettings?bizId=" + bizId;
                            try {
                                httpreq.get(bizUrl, {
                                    headers: {
                                        'tenant': tenant,
                                        'auth-token': token
                                    }
                                }, function (err, response) {
                                    if (err) {
                                        logger.error("get biz failed", err);
                                    } else {
                                        var resObj = JSON.parse(response.body);
                                        if (response.statusCode == 200) {
                                            if(resObj.success == true && resObj.result && resObj.result.length > 0 && resObj.result[0].partner != null && resObj.result[0].key != null && resObj.result[0].sellerEmail != null){
                                                logger.debug(resObj)
                                                var alipayConfig = {
                                                    partner:resObj.result[0].partner,
                                                    key:resObj.result[0].key,
                                                    seller_email:resObj.result[0].sellerEmail,
                                                    host:sysConfig.alipayConfig.host,
                                                    cacert:sysConfig.alipayConfig.cacert,
                                                    create_direct_pay_by_user_return_url:sysConfig.alipayConfig.create_direct_pay_by_user_return_url,
                                                    create_direct_pay_by_user_notify_url:sysConfig.alipayConfig.create_direct_pay_by_user_notify_url
                                                };
                                                var alipay_v = new Alipay(alipayConfig,logger);
                                                alipay_v.verify_direct_pay_by_user_notify(payment, function (error, verified) {
                                                    if (error) {
                                                        logger.error("Alipay notify failed");
                                                        //notify alipay
                                                        res.send("fail");
                                                    } else if (verified) {
                                                        return _createPayment(payment, req, res, function (error) {
                                                            if (error) {
                                                                logger.error("create payment failed");
                                                            } else {
                                                                //notify alipay
                                                                logger.debug("Alipay payment created successfully");
                                                                res.send("success");
                                                            }
                                                        });
                                                    }
                                                })                                            }
                                            else{
                                                var alipay_v = new Alipay(sysConfig.alipayConfig, logger);
                                                alipay_v.verify_direct_pay_by_user_notify(payment, function (error, verified) {
                                                    if (error) {
                                                        logger.error("Alipay notify failed");
                                                        //notify alipay
                                                        res.send("fail");
                                                    } else if (verified) {
                                                        return _createPayment(payment, req, res, function (error) {
                                                            if (error) {
                                                                logger.error("create payment failed");
                                                            } else {
                                                                //notify alipay
                                                                logger.debug("Alipay payment created successfully");
                                                                res.send("success");
                                                            }
                                                        });
                                                    }
                                                })                                            }
                                        }
                                    }
                                });
                            } catch (e) {
                                logger.debug(e);
                            }
                        }
                    }
                }
            }
        });
    })
};

function verifyAlipay(alipay_v,payment){
    logger.debug('alipay 哈哈哈哈   :',alipay)
    logger.info('alipay_v  : ',alipay_v);
    logger.info('payment',payment);
    alipay_v.verify_direct_pay_by_user_notify(payment, function (error, verified) {
        if (error) {
            logger.error("Alipay notify failed");
            //notify alipay
            res.send("fail");
        } else if (verified) {
            return _createPayment(payment, req, res, function (error) {
                if (error) {
                    logger.error("create payment failed");
                } else {
                    //notify alipay
                    logger.debug("Alipay payment created successfully");
                    res.send("success");
                }
            });
        }
    })
}


///-- Exports

module.exports = {
    doAliPay: doAliPay,
    doAliNotify: doAliNotify,
    doAliNotifyTest: doAliNotifyTest

};