app.factory('$hostService',['$rootScope','$filter',function($rootScope,$filter){
    var _this = {};
    _this.imageApi = sys_config.api.imageApi;
    _this.loginApi = sys_config.api.loginApi;
    _this.orderApi = sys_config.api.orderApi;
    _this.productApi =sys_config.api.productApi;
    _this.bizApi = sys_config.api.bizApi;
    var jiathis_config = {};

    //common functions

    $rootScope.tenant = getTenant();
    $rootScope.staticContentURL = sys_config.staticContent.url;


    return _this;

}]);
