var alipayConfig = {
    partner: '2088121906293676',
    key: 'd3aryvmm6bjwyukwytxnsiptrwspea8p',
    seller_email: 'mpdalian@126.com',
    host: 'http://localhost:8080',
    cacert: 'cacert.pem',
    create_direct_pay_by_user_return_url: "http://localhost:8020/#/pay_success",
    create_direct_pay_by_user_notify_url: "http://localhost:8020/api/alipay/notify"
};

var loggerConfig = {
    level: 'DEBUG',
    config: {
        appenders: [
            {type: 'console'},
            {
                "type": "file",
                "filename": "../jinjiechengweb.log",
                "maxLogSize": "2048000",
                "backups": "10"
            }
        ]
    }
};

var checkoutApi = "http://59.111.97.208:16667/api";
var loginApi = "http://59.111.97.208:18091/api";
var bizApi = "@@sysBizApi";
var cmsApi = "http://39.105.213.26:8097/api";

var auth = {
    tenant: "jjc",
    userName: "jjcadmin",
    password: "jjcadmin"
};

var maxAge=0;

var ncaApiUrl="http://localhost:9090";
module.exports = {
    alipayConfig: alipayConfig,
    loggerConfig: loggerConfig,
    checkoutApi: checkoutApi,
    loginApi: loginApi,
    auth: auth,
    bizApi: bizApi,
    ncaApiUrl:ncaApiUrl,
    cmsApi:cmsApi,
    maxAge:maxAge
}
