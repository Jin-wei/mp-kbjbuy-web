/**
 * Created by Cici
 */
app.controller("setCookieController", ['$scope', '$rootScope', '$httpService', '$location', '$hostService', function ($scope, $rootScope, $httpService, $location, $hostService) {
    var isSetCookie = $location.$$url.indexOf('setCookie');//判断url中是否有cookie
    if (isSetCookie !== -1) {
        var userCookieJson = $location.$$url.split('=')[1];
        var userCookie = JSON.parse(decodeURIComponent(userCookieJson));
        $httpService.setCookie($httpService.COMMON_AUTH_NAME, userCookie.accessToken);
        $httpService.setCookie($httpService.USER_ID, userCookie.userId);
        $httpService.setCookie($httpService.USER_NAME, userCookie.name);
        $httpService.setCookie($httpService.CITY, userCookie.city);
        $httpService.setCookie($httpService.REMEBER_PWD, false);
        if (userCookie.bizId == null) {
            $httpService.setCookie($httpService.BIZ_ID, 0);
        } else {
            $httpService.setCookie($httpService.BIZ_ID, userCookie.bizId);
            $httpService.setCookie($httpService.BIZ_NAME, userCookie.bizName);
        }

        $httpService.setCookie('isLogin', '1');
        $httpService.setCookie('username', userCookie.name);
        $.cookie('username2' ,  userCookie.name);
        $rootScope.userName = $httpService.getCookie('username');
        $rootScope.isLogin = true;
        $rootScope.setCookieStatus = true;//是否存过Cookie
        console.log('start $.cookie : '+ $rootScope.setCookieStatus);
    } else {
        $rootScope.setCookieStatus = false;//是否存过Cookie
    }

}]);