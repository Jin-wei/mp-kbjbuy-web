app.controller('personalCenterController', ['$rootScope','$scope','$location','$httpService','$hostService','$filter',
    function($rootScope,$scope,$location,$httpService,$hostService,$filter) {
        $scope.loginUserName = $httpService.getCookie($httpService.USER_NAME);
        $(function () {
            setPageTitle('个人中心','','');
        })
}]);