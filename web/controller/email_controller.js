/**
 * Created by BaiBin on 17/2/22.
 */
app.controller("emailController",['$scope','$rootScope','$httpService','$location','$hostService', function($scope,$rootScope,$httpService,$location,$hostService) {

    var activateCode = $location.search().activateCode;
    initHeaer();
    $httpService.get($hostService.loginApi + '/email/activateUser/'+ activateCode).then(function (data) {
        if (data.success) {
            alert('激活成功,请重新登陆!');
            window.location.href = 'indexApp.html#/login';
        } else {
            alert(data.msg);
        }
    }).catch(function (error) {
        if (error.code != 'NotAuthorized') {
            if (error.code != 'NotAuthorized') {
                ErrorBox('服务器内部错误');
            }
        }
    });

}]);
