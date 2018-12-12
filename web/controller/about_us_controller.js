/**
 * Created by BaiBin on 16/10/24.
 */
app.controller("aboutUsController",['$scope','$rootScope','$httpService','$location','$hostService','$filter', function($scope,$rootScope,$httpService,$location,$hostService,$filter) {
    //百度搜索资源平台主动推送链接
    baiduLinkSubmit();
    $(function () {
        setPageTitle('公司介绍','','');
    })
}]);