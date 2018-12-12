app.controller('homeJccController', ['$rootScope','$scope','$httpService','$hostService','$filter','sharedData','$location',
    function($rootScope,$scope,$httpService,$hostService,$filter,sharedData,$location) {

    $rootScope.headerSearch = 0;
    $rootScope.headerNav = 0;
    $rootScope.isMobile = false;
    $rootScope.isMobile = checkPlatform();

    $scope.category = [];
    $scope.recommeds = [];
    $scope.bannerList = [];
    $scope.bannerImgUrl = [];
    $scope.imageService = $hostService.imageApi+'/sizes/m/imageSets/';
    $scope.bannerImageService = $hostService.imageApi+'/images/';
    $scope.showProductType=0;

    var userId = $httpService.getCookie($httpService.USER_ID);
    var bizId = $httpService.getCookie($httpService.BIZ_ID);

    $scope.jjcSearch = function () {
        var kw = '';
        kw = $('#jjcProdcutSearch').val();
        if (kw.length > 0) {
           window.location.href = "indexApp.html#/product_filter/" + kw +'/type/2';
         }
    }

    $rootScope.$on('$routeChangeSuccess',function(){
        $rootScope.nowPath = $location.path();
    });

    $scope.showLabel = function () {
        $('.product-label').toggle();
    }


        $(document).ready(function(){
       $("#scrollDiv").Scroll({
            line:1,
            speed:500,
            timer:3000,
            up:"but_up",
            down:"but_down"
       });
     });

}]);