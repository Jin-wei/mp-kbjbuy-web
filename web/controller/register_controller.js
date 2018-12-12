app.controller('registerController', ['$rootScope','$scope','$httpService','$hostService','L','$filter',function($rootScope,$scope,$httpService,$hostService,L,$filter){

    $rootScope.headerSearch = 0;
    $rootScope.headerNav = 0;

    var wait=60;
    initHeaer();
    $scope.sendCode = function() {
     if ($scope.name == null || $scope.name =="") {
            WarningBox('请输入用户名!');
        } else if($scope.phone == null || $scope.phone == ""){
            WarningBox('请输入手机号!');
        } else {
             if(wait==60){
                 var params = {
                     "smsType": "registeruser",
                     "phone":$scope.phone
                 };
                 $httpService.post($hostService.loginApi+'/sms/captcha',params).then(function(data){
                     if(data.success){
                         InfoBox('验证码发送成功,请注意查收!');
                         $scope.code = data.id;
                     }else{
                         WarningBox(data.msg);
                         wait=0;
                     }
                 }).catch(function (error) {
                     if (error.code != 'NotAuthorized') {
                         ErrorBox('服务器内部错误');
                     }
                 });
             }

             if (wait == 0) {
                 document.getElementById("codeBtn").disabled=false;
                 document.getElementById("codeBtn").innerHTML="发送验证码";
                 wait = 60;
             } else {
                 document.getElementById("codeBtn").disabled=true;
                 document.getElementById("codeBtn").innerHTML="重新发送(" + wait + ")";
                 wait--;
                 setTimeout(function() {
                     $scope.sendCode();
                 }, 1000);
             }
        }
    };

    $scope.registerClick = function() {
        if ($scope.identity == null || $scope.identity == ""){
            WarningBox('请选择用户身份!');
            return;
        }
        if($scope.name == null || $scope.name == ""){
            WarningBox('请输入用户名!');
            return;
        }
        if($scope.phone==null || $scope.phone==""){
            if($scope.RegisterType == 1){
                WarningBox('请输入手机号!');
                return;
            }
        }
        if($scope.code==null || $scope.code==""){
            if($scope.RegisterType == 1){
                WarningBox('请输入验证码!');
                return;
            }
        }
        if($scope.email==null || $scope.email==""){
            if($scope.RegisterType == 2){
                WarningBox('请输入邮箱!');
                return;
            }
        }

        if($scope.password==null || $scope.password==""){
            WarningBox('请输入密码!');
            return;
        }
        if($scope.password.length < 6){
            WarningBox('请输入6位以上的密码!');
            return;
        }
        if($scope.passwordConfirm != $scope.password){
            WarningBox('两次输入密码不一致');
            return;
        }
        var params;
        if($scope.RegisterType == 1){
            params = {
                "method":'phonepassword',
                "att1String": $scope.identity,
                "name": $scope.name,
                "phone": $scope.phone,
                "password": $scope.password,
                "code": $scope.code
            };
        }else{
            params = {
                "method":'emailpassword',
                "att1String": $scope.identity,
                "name": $scope.name,
                "password": $scope.password,
                'email':$scope.email
            };
        }
        $httpService.post($hostService.loginApi+'/registeredusers',params).then(function(data) {
            if(data.success) {
                if($scope.RegisterType == 1){
                    InfoBox('恭喜您,注册成功!');
                    $httpService.setCookie($httpService.COMMON_AUTH_NAME ,data.result.accessToken);
                    $httpService.setCookie($httpService.USER_ID ,data.result.user.userId);
                    $httpService.setCookie($httpService.USER_NAME,data.result.user.name);
                    $httpService.setCookie($httpService.CITY,data.result.user.city);
                    $httpService.setHeader("auth-token",$httpService.getCookie($httpService.COMMON_AUTH_NAME));

                    $httpService.setCookie('isLogin' ,'1');
                    $httpService.setCookie('username' ,data.result.user.name);
                    $rootScope.userName = $httpService.getCookie('username');
                    $rootScope.isLogin = true;

                    getBizId(data.result.user.userId);
                    $rootScope.toHome();
                }else{
                    InfoBox('恭喜您,注册成功!请到邮箱激活账号');
                }

            } else {
                var message = L.L(data.msg);
                WarningBox(message);
            }
        }).catch(function(error){
            if (error.code != 'NotAuthorized') {
                ErrorBox('服务器内部错误');
            }
        });
     };

    $scope.RegisterType = 1
    $scope.clickRegisterType = function(){
        if($scope.RegisterType == 1){
            $scope.RegisterType = 2;
        }else{
            $scope.RegisterType = 1;
        }
    }

    function getBizId(userId){
        $httpService.get($hostService.bizApi +'/custs/'+userId+'/biz').then(function(data){
            if(data.success) {
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

            } else {
                WarningBox(data.msg);
            }
        }).catch(function(error){
            if (error.code != 'NotAuthorized') {
                ErrorBox('服务器内部错误');
            }
        });
    }


    $(function () {
        //百度搜索资源平台主动推送链接
        baiduLinkSubmit();
        setPageTitle('注册','','');
    })
}]);

