app.controller('changePhoneController', ['$scope','$httpService','$hostService','$filter',function($scope,$httpService,$hostService,$filter){

    var userId = $httpService.getCookie($httpService.USER_ID);
    initHeaer();
    if(userId == null || userId.length == 0){
        /*window.location.href = '/login?whereCome=changePhone';
        return;*/
        var isLoginReturn=configLogin($filter,'changePhone');
        if(isLoginReturn){
            return;
        }
    }

    var wait=60;
    $scope.sendCode = function() {
        if($scope.oldPhone==null || $scope.oldPhone==""){
            WarningBox('请输入原手机号!');
        } else if($scope.newPhone == null || $scope.newPhone == ""){
            WarningBox('请输入新手机号!');
        } else {
            if(wait==60) {
                var params = {
                    "smsType": "changephone",
                    "phone": $scope.newPhone
                };
                $httpService.post($hostService.loginApi + '/sms/captcha', params).then(function (data) {
                    if (data.success) {
                        InfoBox('验证码发送成功,请注意查收!');
                        $scope.code = data.id;
                    } else {
                        WarningBox(data.msg);
                        wait=0;
                    }
                }).catch(function (error) {
                    if (error.code != 'NotAuthorized') {
                        if (error.code != 'NotAuthorized') {
                            ErrorBox('服务器内部错误');
                        }
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

    $scope.submit = function() {
        if($scope.oldPhone==null || $scope.oldPhone==""){
            WarningBox('请输入原手机号!');
        } else if($scope.newPhone==null || $scope.newPhone==""){
            WarningBox('请输入新手机号!');
        } else if($scope.code==null || $scope.code==""){
            WarningBox('请输入验证码!');
        } else {
            var params = {
                "phone": $scope.newPhone,
                "code":parseInt($scope.code)
            };
            var userId = $httpService.getCookie($httpService.USER_ID);
            $httpService.put($hostService.loginApi+'/users/'+userId+'/phones',params).then(function(data) {
                if(data.success) {
                    InfoBox('恭喜您,手机号修改成功,请重新登录!');
                    logOut();
                } else {
                    WarningBox(data.msg);
                }
            }).catch(function(error){
                if (error.code != 'NotAuthorized') {
                    ErrorBox('服务器内部错误');
                }
            });
        }
    };

    $(function () {
        setPageTitle('找回密码','','');
    })
}]);
