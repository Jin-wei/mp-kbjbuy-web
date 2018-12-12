/**
 * Created by BaiBin on 16/7/7.
 */
app.controller('homeController', ['$rootScope','$scope','$httpService','$hostService','$filter',
    function($rootScope,$scope,$httpService,$hostService,$filter) {

    $rootScope.headerSearch = 0;
    $rootScope.headerNav = 0;

    $scope.category = [];
    $scope.recommeds = [];
    $scope.bannerList = [];
    $scope.bannerImgUrl = [];
    $scope.imageService = $hostService.imageApi+'/sizes/m/imageSets/';
    $scope.bannerImageService = $hostService.imageApi+'/images/';
    initHeaer();
    //$("#rightTabs a").click(function(e){
    //    e.preventDefault();
    //    $(this).tab("show");
    //});


    $scope.categoryClick = function (id) {
        console.log("商品分类Id="+id);
        window.location.href = "indexApp.html#/product_filter/" + id + '/type/1';
    }

    $httpService.get($hostService.productApi+'/tags/1/prodTypes').then(function(data){
        $scope.category = [];
        if(data.result.length>9){
            for(var i=0;i<9;i++){
                $scope.category.push(data.result[i]);
            }
        }else{
            $scope.category=data.result;
        }

    }).catch(function(data){
        if (error.code != 'NotAuthorized') {
            ErrorBox('服务器内部错误');
        }
    });

    $httpService.get($hostService.productApi+'/biz/0/tags/1/prods').then(function(data){
        if(data.success){
            $scope.recommeds = data.result.slice(0,20);
        }else{
            WarningBox(data.msg);
        }
    }).catch(function(data){
        if (error.code != 'NotAuthorized') {
            ErrorBox('服务器内部错误');
        }
    })

    $rootScope.imageSize = function(size){
        return $hostService.imageApi+'/sizes/'+size+'/imageSets/';
    }

    var scrollY = 0;
    var scrollX = 0;
    window.onscroll = function() {
        scrollY = window.scrollY;
        scrollX = window.scrollX;
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

   /*var token = $httpService.getCookie($httpService.COMMON_AUTH_NAME);
    if ( token != null ){
        getFavoriteProds();
    }*/


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

        var flyer = $('<img class="u-flyer" src="'+imgUrl+'">');
        flyer.css({
            'width':'50px',
            'height':'50px'
        })
        flyer.fly({
            start: {
                left: offset.left - scrollX + 30,
                top: offset.top - scrollY
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

    //获取banner信息
    function getBanners() {
        $httpService.get($hostService.productApi+'/biz/0/tags/2/prods').then(function(data){
            if(data.success){
                $scope.bannerList = data.result;
                getBannerUrls(data.result);
            }else{
                WarningBox(data.msg);
            }
        }).catch(function(data){
            ErrorBox('获取banner列表服务器内部错误');
        })
    }

    //获取商品信息中image_type是'banner'的imageId
    function getBannerUrls(list) {
        for(var i = 0; i<list.length; i++){
            var obj = list[i];
            $httpService.get($hostService.productApi+'/biz/'+obj.bizId+'/prods/'+obj.prodId).then(function(data){
                if(data.success) {
                    if(data.result.images != null && data.result.images.length > 0){
                        for (var i=0 ;i < data.result.images.length;i++){
                            var image = data.result.images[i];
                            if(image.img_type == 'banner'){
                                $scope.bannerImgUrl.push(data.result.images[i].img_url);
                                console.log($scope.bannerImageService+data.result.images[i].img_url);
                            }
                        }
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
    }

    $scope.bannerLinkToProduct = function (index) {
        var banner = $scope.bannerList[index];
        if(banner){
            window.location.href = 'indexApp.html#/product/'+banner.prodId+'/bizId/0';
        }
    }


    // initBanner();

    //百度搜索资源平台主动推送链接
    baiduLinkSubmit();
    $(function () {
        getBanners();
        checkPlatform();
        setPageTitle('','','');
        //延时初始化OwlCarousel
        window.setTimeout(function(){
            OwlCarousel.initOwlCarousel();
        },1000);
    })

    //测试缓存

}]);