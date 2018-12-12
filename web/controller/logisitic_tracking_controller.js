/**
 * Created by BaiBin on 16/8/23.
 */
app.controller('logisticTrackingController', ['$rootScope','$scope','$location','$httpService','$hostService', function($rootScope,$scope,$location,$httpService,$hostService) {

    var orderId = $location.search().orderId;
    initHeaer();
    $scope.arr = [{'time':'2016-03-10 18:07:15','info':'感谢您在京东购物，欢迎您再次光临！'},{'time':'2016-03-10 18:07:15','info':'【京东到家】京东配送员【申国龙】已出发，联系电话【18410106883，感谢您的耐心等待，参加评价还能赢取京豆呦】'},{'time':'2016-03-10 18:07:15','info':'感谢您在京东购物，欢迎您再次光临！'},{'time':'2016-03-10 18:07:15','info':'感谢您在京东购物，欢迎您再次光临！'},{'time':'2016-03-10 18:07:15','info':'感谢您在京东购物，欢迎您再次光临！'},{'time':'2016-03-10 18:07:15','info':'感谢您在京东购物，欢迎您再次光临！'}];
    //百度搜索资源平台主动推送链接
    baiduLinkSubmit();
}]);