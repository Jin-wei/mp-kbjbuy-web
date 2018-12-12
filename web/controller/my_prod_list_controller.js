/**
 * Created by BaiBin on 17/2/28.
 */
app.controller("myProdListController",['$scope','$rootScope','$httpService','$location','$hostService','$filter', function($scope,$rootScope,$httpService,$location,$hostService,$filter) {

    var custId = $httpService.getCookie($httpService.USER_ID);
    initHeaer();
    function getFavorityProds(){
        $httpService.get($hostService.bizApi+'/custs/'+custId+'/customerprices').then(function(data){
            if(data.success) {
                for (var i=0;i<data.result.length;i++){
                    data.result[i].num = 0
                    data.result[i].productName = data.result[i].prodName;
                }
                $scope.products = data.result;
                for(var i=0;i<$scope.products.length;i++){
                    getImg($scope.products[i])
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

    function getImg(prod){
        $httpService.get($hostService.productApi+'/biz/0/prods/'+prod.prodId).then(function(data){
            if(data) {
                var smallImgUrl = $rootScope.staticContentURL+'/'+$rootScope.tenant+'/assets/images/prodDefault240.jpg';
                if(data.result.imgUrl != null){
                    smallImgUrl = data.result.imgUrl;
                }
                prod.imgUrl = smallImgUrl;
            } else {
                //WarningBox(data.msg);
            }
        }).catch(function(error){
            if (error.code != 'NotAuthorized') {
                ErrorBox('服务器内部错误');
            }
        });
    }

    getFavorityProds();
    $scope.imageService = $hostService.imageApi+'/sizes/m/imageSets/';

    $scope.increaseClick = function(p){
        if(p.num != 0){
            p.num--;
        }
    }

    $scope.nextClick = function(){

        $("input[name='checkbox']").each(function(i){
            if($(this).attr("checked")) {
                var p = $(this).val();
                var p1 = JSON.parse(p);
                if(parseInt(p1.num) > 0){
                    $rootScope.prodPush(p1,parseInt(p1.num));
                }
            }
        });
        /*toOrderInfo($filter);*/
        window.location.href = "indexApp.html#/orderInfo";
    }

    $scope.plusClick = function(p){
        p.num++;
    }

    $(".allSelect").change(function() {
        if($('.allSelect').is(':checked')) {
            $("input[name='checkbox']").attr("checked","true");
        }else{
            $("input[name='checkbox']").removeAttr("checked");
        }
    });


    //进入详情
    $scope.gotoDetail = function(productId,bizId) {
        window.location.href = "indexApp.html#/product/"+productId+'/bizId/0';
    }

    $(function () {
        setPageTitle('订单列表','','');
    })

}]);