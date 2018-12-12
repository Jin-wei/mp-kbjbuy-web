'use strict';

app.controller('productFilterController',['$httpService','$hostService','$scope','$rootScope','$location','$filter','$routeParams',function($httpService,$hostService,$scope,$rootScope,$location,$filter,$routerParams) {

    $rootScope.headerSearch = 0;
    $rootScope.headerNav = 0;

    $scope.products = [];
    $scope.collections = [];
    $scope.bizId = 0;
    $scope.imageService = $hostService.imageApi+'/sizes/m/imageSets/';
    /*$scope.type = $location.search().typeId;
    $scope.keyword = $location.search().keyword;
    $scope.homeSearch = $location.search().homeSearch;*/

    $scope.searchText=$routerParams.typeId;
    $scope.searchType=$routerParams.type;//searchType 1类型id 2关键字 3标签id

    $scope.startIndex = 0;
    $scope.size = 20;
    $scope.hasMore = true;
    var isRequesting = false;
    var userId = $httpService.getCookie($httpService.USER_ID);
    var bizCookieId = $httpService.getCookie($httpService.BIZ_ID);
    initHeaer();

    //产品详情页是否需要登陆
    /*var productFilterLogin = $filter('translate')('productFilterLogin');
    if (productFilterLogin==='true' && $rootScope.tenant ==='shop') {
        if(userId == null || userId.length == 0 || bizCookieId == null || bizCookieId.length == 0){
            window.location.href = 'indexApp.html#/login?whereCome='+ $filter('translate')('homeLink');
            return true
        }
    }*/

    $scope.loadMore = function() {
        //$scope.$applyAsync(function() {
            if (!$scope.hasMore || isRequesting) {
                return;
            }
            isRequesting = true;
            var url;
            if ($scope.searchType==='1') {
                url = $hostService.productApi+'/biz/0/prodTypes/'+$scope.searchText+'/prods?active=1&start='+$scope.startIndex+'&size='+$scope.size;
            }else if($scope.searchType==='3'){
                url = $hostService.productApi+'/prodSearchNca?'+'name='+$scope.searchText+'&active=1&start='+$scope.startIndex+'&size='+$scope.size;
            }else if ($scope.searchType==='2') {
                url = $hostService.productApi+'/prodSearch/'+$scope.searchText+'?active=1&start='+$scope.startIndex+'&size='+$scope.size;
            }

            $httpService.get(url).then(function(data){
                isRequesting = false;
                if (data.success) {
                    //if(data.result.length>0){
                        var items =[];
                        if ($scope.searchType==='1' || $scope.searchType==='3') {
                            items = data.result;
                        }else {
                            items=data.result.hits;
                        }

                        for (var i = 0; i < items.length; i++) {
                            var d = items[i]._source ? items[i]._source :items[i];
                            $scope.products.push(d);
                        }
                        if($scope.startIndex==0){
                            //设置标题
                            getAllCategories($scope.searchText,items,$scope.searchType);
                        }
                        if (items.length>=$scope.size) {
                            $scope.startIndex += $scope.size;
                            $scope.hasMore = true;
                        } else {
                            $scope.startIndex += items.length;
                            $scope.hasMore = false;
                        }

                    //}else{
                    //    //InfoBox('暂无商品');
                    //}
                } else {
                    WarningBox(data.msg);
                }
            }).catch(function(error){
                if (error.code != 'NotAuthorized') {
                    ErrorBox('服务器内部错误');
                }
                $scope.hasMore = true;
                isRequesting = false;
            });
        //});
    };


    //获取分类信息
    function getAllCategories(id,item,type) {
        var url = $hostService.productApi+'/biz/0/prodTypes';
        $httpService.get(url).then(function(data){
            if (data) {
                var categories = data.result;
                var indexCateorie={};
                for(var i in categories){
                    if(categories[i].typeId==id && type==1){
                        indexCateorie=categories[i];
                    }
                }
                if(item.length>0 && type==2){
                    indexCateorie.name=id;
                    indexCateorie.nameLang='';
                }else if(item.length>0 && type==3){
                    indexCateorie.name=item[0].type;
                    indexCateorie.nameLang=item[0].typeLang;
                }else if(item.length==0 && type!=1){
                    indexCateorie.name=id;
                }else if(item.length==0 && type==1){
                    indexCateorie.name='产品分类';
                }
                if(indexCateorie){
                    if(indexCateorie.description){
                        setPageTitle(indexCateorie.name+'',indexCateorie.description,(indexCateorie.name)+(indexCateorie.nameLang?','+indexCateorie.nameLang:""));
                    }else {
                        setPageTitle(indexCateorie.name+'',indexCateorie.name,(indexCateorie.name)+(indexCateorie.nameLang?','+indexCateorie.nameLang:""));
                    }
                }else {
                    setPageTitle('','','');
                }
            }else{
            }
        }).catch(function(data){
            if (error.code != 'NotAuthorized') {
                ErrorBox('服务器内部错误');
            }
        });
    }


    var scrollY = 0;
    window.onscroll = function() {
        scrollY = window.scrollY;
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

    //添加收藏
    $scope.addCollectionClick = function(product){
        var params = {
            "prods": [
                product.prodId
            ]
        }
        $httpService.post($hostService.productApi+'/favoriteProds',params).then(function(data){
            if(data.success) {
                if(data.result.length > 0){
                    if(data.result[0].success){
                        $scope.collections.push(product);
                        Toast('已添加到收藏!');
                    }else{
                        //WarningBox(data.result[0].msg);
                        WarningBox('当前商品已经收藏,请到我的收藏里查看!');
                    }
                }else{
                    WarningBox('添加收藏失败!');
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

    //移除收藏
    $scope.deleteCollectionClick = function(product){
        var params = {
            "prods": [
                product.prodId
            ]
        }
        $httpService.delete($hostService.productApi+'/favoriteProds',{'data':params}).then(function(data){
            if(data.success) {
                getFavoriteProds()
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

    //获取收藏的商品
    function getFavoriteProds(){
        $httpService.get($hostService.productApi+'/favoriteProds').then(function(data){
            if(data.success) {
                $scope.collections = data.result;
            } else {
                WarningBox(data.msg);
            }
        }).catch(function(error){
            if (error.code != 'NotAuthorized') {
                ErrorBox('服务器内部错误');
            }
        });
    }

    //是否已收藏
     $scope.ifHasInFavorite = function(productId){
        var isHas = false;
        for(var i in $scope.collections){
            var prod = $scope.collections[i];
            if (prod.prodId == productId){
                isHas = true;
            }
        }
        return isHas;
    }

    var token = $httpService.getCookie($httpService.COMMON_AUTH_NAME);
    if ( token != null && token !== '' && token){
        getFavoriteProds();
    }

    //百度搜索资源平台主动推送链接
    baiduLinkSubmit();

}]);

