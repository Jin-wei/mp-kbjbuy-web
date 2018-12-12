var alipayConfig = {
    partner: '@@alipayPartner',
    key: '@@alipayKey',
    seller_email: '@@alipaySellerEmail',
    host: '@@alipayHost',
    cacert: 'cacert.pem',
    create_direct_pay_by_user_return_url: "@@alipayReturnUrl",
    create_direct_pay_by_user_notify_url: "@@alipayNotifyUrl"
};

var loggerConfig = {
    level: '@@logLevel',
    config: {
        appenders: [
            {type: 'console'},
            {
                "type": "file",
                "filename": "@@logFileFullName",
                "maxLogSize": "@@logMaxSize",
                "backups": "@@logBackups"
            }
        ]
    }
};

var checkoutApi = "@@orderApi";
var loginApi = "@@loginApi";
var bizApi = "@@sysBizApi";
var cmsApi = "@@cmsApi";

var auth = {
    tenant: "@@authTenant",
    userName: "@@authUserName",
    password: "@@authPassword"
};

var maxAge=@@maxAge;

var ncaApiUrl="@@ncaApiUrl";
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
