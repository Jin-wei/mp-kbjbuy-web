app.controller('loginController', ['$rootScope','$scope','$location','$httpService','$hostService','$filter', function($rootScope,$scope,$location,$httpService,$hostService,$filter) {

    $rootScope.headerSearch = 0;
    $rootScope.headerNav = 0;
    $scope.saveCheck = true;
    initHeaer();
    function getBizId(userId){
        $httpService.get($hostService.bizApi +'/custs/'+userId+'/biz').then(function(data){
            if(data.success) {
                InfoBox('登录成功!');
                if(data.result){
                    if(data.result.bizId == null){
                        $httpService.setCookie($httpService.BIZ_ID,0);
                    }else{
                        $httpService.setCookie($httpService.BIZ_ID,data.result.bizId);
                        $httpService.setCookie($httpService.BIZ_NAME,data.result.bizName);
                    }
                }else{
                    $httpService.setCookie($httpService.BIZ_ID,0);
                }

                var whereCome = $location.search().whereCome;
                if(whereCome != null && whereCome != 'any'){
                    window.setTimeout(function () {
                        window.location ='indexApp.html#/'+whereCome;
                    },100)
                }else{
                    $rootScope.toHome();
                }
            } else {
                WarningBox(data.msg);
            }
        }).catch(function(error){
            if (error.code != 'NotAuthorized') {
                ErrorBox('服务器内部错误');
            }
        });
    }

    if($httpService.getCookie($httpService.REMEBER_PWD) == 'true'){
        $scope.saveCheck = true;
        if($httpService.getCookie($httpService.USER_PHONE) != null){
            $scope.account = $httpService.getCookie($httpService.USER_PHONE);
            $scope.password = $httpService.getCookie($httpService.USER_PWD);
        }
    }else{
        $scope.saveCheck = false;
        $scope.account = '';
        $scope.password = '';
    }

    $scope.loginClick = function() {

        var checkState = $scope.saveCheck;
        $httpService.setCookie($httpService.REMEBER_PWD,checkState);

        if($scope.account == null || $scope.account == ""){
            WarningBox('请输入手机号!');
        } else if($scope.password == null || $scope.password == ""){
            WarningBox('请输入密码!');
        } else {
            var params
            if($scope.account.indexOf("@") > 0 ){
                params = {
                    "method":'emailpassword',
                    "email":$scope.account,
                    "phone":'',
                    "password":$scope.password
                }
            }else{
                params = {
                    "method":'phonepassword',
                    "phone":$scope.account,
                    "password":$scope.password
                }
            }


            $httpService.post($hostService.loginApi+'/auth/tokens',params).then(function(data){
                if(data.success) {

                    //if (checkState) {
                        $httpService.setCookie($httpService.COMMON_AUTH_NAME ,data.result.accessToken);
                        $httpService.setCookie($httpService.USER_ID ,data.result.user.userId);
                        $httpService.setCookie($httpService.USER_NAME,data.result.user.name);
                        $httpService.setCookie($httpService.CITY,data.result.user.city);
                        $httpService.setCookie($httpService.USER_PHONE,$scope.account);
                        $httpService.setCookie($httpService.USER_PWD,$scope.password);
                        $httpService.setHeader("auth-token",$httpService.getCookie($httpService.COMMON_AUTH_NAME));
                        getBizId(data.result.user.userId);
                    //} else {
                    //    $httpService.removeCookie($httpService.COMMON_AUTH_NAME );
                    //    $httpService.removeCookie($httpService.USER_ID);
                    //    $httpService.removeCookie($httpService.USER_NAME);
                    //    $httpService.removeCookie($httpService.USER_PHONE);
                    //    $httpService.removeCookie($httpService.CITY);
                    //}

                    $httpService.setCookie('isLogin' ,'1');
                    $httpService.setCookie('username' ,data.result.user.name);
                    $rootScope.userName = $httpService.getCookie('username');
                    $rootScope.isLogin = true;
                } else {
                    WarningBox(data.msg);
                }
            }).catch(function(error){
                $httpService.setCookie('isLogin' ,'0');
                //ErrorBox('服务器内部错误');
                if (error.code != 'NotAuthorized') {
                    ErrorBox('服务器内部错误');
                } else {
                    WarningBox('用户名或密码错误!');
                }
            });
        }
     };

    //百度搜索资源平台主动推送链接
    baiduLinkSubmit();
    $(function () {
        setPageTitle('登陆','','');
    })
}]);



