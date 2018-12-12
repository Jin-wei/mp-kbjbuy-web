/**
 * Created by BaiBin on 16/11/2.
 */
app.controller('paySuccessController', ['$rootScope','$scope','$location','$httpService','$hostService', function($rootScope,$scope,$location,$httpService,$hostService) {
    initHeaer();
    $scope.continueClick = function(){
        window.location.href = '/'
    }
    $scope.orderClick = function(){
        window.location.href = 'indexApp.html#/my_orders'
    }

    $scope.orderPrice = $httpService.getCookie($httpService.NOW_ORDER_PRICE)
    $scope.orderId = $httpService.getCookie($httpService.NOW_ORDER_ID)
}]);



