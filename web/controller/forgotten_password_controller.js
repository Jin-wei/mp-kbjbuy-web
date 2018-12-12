
app.controller('forgottenPasswordController', ['$scope','$httpService','$hostService','$rootScope','$filter',function($scope,$httpService,$hostService,$rootScope,$filter){

    var wait=60;
    initHeaer();
    $scope.sendCode = function() {
         if($scope.phone == null || $scope.phone == ""){
            WarningBox('请输入手机号!');
         } else {
             if(wait==60) {
                 var params = {
                     "smsType": "resetpassword",
                     "phone": $scope.phone
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
        if($scope.phone==null || $scope.phone==""){
            WarningBox('请输入手机号!');
        }else if($scope.code==null || $scope.code==""){
            WarningBox('请输入验证码!');
        }else if($scope.password==null || $scope.password==""){
            WarningBox('请输入密码!');
        } else {
            var params = {
                "method": 'phone',
                "phone": $scope.phone,
                "password": $scope.password,
                "code":parseInt($scope.code)
            };
            $httpService.post($hostService.loginApi+'/passwords',params).then(function(data) {
                if(data.success) {
                    InfoBox('恭喜您,重置密码成功,请重新登录!');
                    $rootScope.toHome();
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
        setPageTitle('修改手机号','','');
    })
}]);
