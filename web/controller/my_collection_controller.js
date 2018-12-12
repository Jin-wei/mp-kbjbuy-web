/**
 * Created by BaiBin on 16/12/28.
 */
app.controller('myCollectionController', ['$rootScope','$scope','$location','$httpService','$hostService', '$filter' ,function($rootScope,$scope,$location,$httpService,$hostService,$filter) {

    initHeaer();
    function getFavorityProds(){
        $httpService.get($hostService.productApi+'/favoriteProds').then(function(data){
            if(data.success) {
                $scope.products = data.result;
            } else {
                WarningBox(data.msg);
            }
        }).catch(function(error){
            if (error.code != 'NotAuthorized') {
                ErrorBox('服务器内部错误');
            }
        });
    }
    $scope.imageService = $hostService.imageApi+'/sizes/m/imageSets/';
    getFavorityProds();
    $scope.deleteClick = function(prodId){
        var params = {
            "prods": [
                prodId
            ]
        }
        $httpService.delete($hostService.productApi+'/favoriteProds',{'data':params}).then(function(data){
            if(data.success) {
                getFavorityProds();
            } else {
                WarningBox(data.msg);
            }
        }).catch(function(error){
            if (error.code != 'NotAuthorized') {
                ErrorBox('服务器内部错误');
            }
        });
    }

    //进入详情
    $scope.gotoDetail = function(productId,bizId) {
        window.location.href = "indexApp.html#/product/"+productId+'/bizId/'+bizId;
    }

    //加入购物车点击事件
    $scope.addShoppingCartClick = function(productData,num,index,mark){
        //var result=false;
        ////查找购物车中是否有该商品
        //for(var i in $scope.carts){
        //    if($scope.carts[i].id==productData.prodId){
        //        result = true;
        //    }
        //}
        //if (result){
        //    return;
        //}

        $rootScope.prodPush(productData,num);
        var id = '#add-cart-btn' + index;
        var offset = $(id).offset();

        var imgUrl = $rootScope.staticContentURL+'/'+$rootScope.tenant+'/assets/images/prodDefault240.jpg';
        if (productData.imgUrl != null && productData.imgUrl.length > 0){
            imgUrl = $scope.imageService+productData.imgUrl
        }

        var left = 0;
        var top = 0;
        if (mark == '栅格'){
            left = offset.left + 30;
            top = offset.top - 5 - scrollY;
        }else{
            left = offset.left + 20;
            top = offset.top - scrollY;
        }
        var flyer = $('<img class="u-flyer" src="'+imgUrl+'">');
        flyer.css({
            'width':'50px',
            'height':'50px'
        })
        flyer.fly({
            start: {
                left: left,
                top: top
            },
            end: {
                left: $rootScope.cartOffset.left+10,
                top: $rootScope.cartOffset.top+10,
                width: 0,
                height: 0
            },
            onEnd: function(){
                //$("#msg").show().animate({width: '250px'}, 200).fadeOut(1000);
                //addcar.css("cursor","default").removeClass('orange').unbind('click');
                this.destory();
            }
        });
    }

    $(function () {
        setPageTitle('我的收藏','','');
    })
}]);
