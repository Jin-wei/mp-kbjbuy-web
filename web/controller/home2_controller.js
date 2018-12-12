/**
 * Created by BaiBin on 16/7/7.
 */
app.controller('home2Controller', ['$rootScope','$scope','$httpService','$hostService','$filter','sharedData','$location',
    function($rootScope,$scope,$httpService,$hostService,$filter,sharedData,$location) {

    $rootScope.headerSearch = 0;
    $rootScope.headerNav = 0;

    $scope.category = [];
    $scope.recommeds = [];
    $scope.bannerList = [];
    $scope.bannerImgUrl = [];
    $scope.imageService = $hostService.imageApi+'/sizes/m/imageSets/';
    $scope.bannerImageService = $hostService.imageApi+'/images/';

    var userId = $httpService.getCookie($httpService.USER_ID);
    var bizId = $httpService.getCookie($httpService.BIZ_ID);

    var zyUser = $location.search().zyUser ? $location.search().zyUser : null;//造艺用户
    if(zyUser!=null){
        sharedData.saveZyUser(zyUser);
    }



    initHeaer();
    var isMobile = checkPlatform();


    //延时初始化OwlCarousel
    window.setTimeout(function(){
        OwlCarousel.initOwlCarousel();
    },1000);

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
            if (banner) {
                window.location.href = 'indexApp.html#/product/' + banner.prodId + '/bizId/0';
            }
        }

        $scope.home2Search = function () {
            var kw = '';
            var choiceData=[];
            kw = $(".select2-search__field").val();
            if(isMobile){
                choiceData=$('#selectMbProduct').select2("data");
            }else{
                choiceData=$('#selectPcProduct').select2("data");
            }

            if (kw.length > 0) {
                window.location.href = "indexApp.html#/product_filter/" + kw + "/type/3";
            }
            if(choiceData.length>0){
                window.location.href = "indexApp.html#/product_filter/" + choiceData[0].text + "/type/3";
            }
        }

        function initSelect2(data) {
            var select2Input = '';
            if (isMobile) {
                select2Input = $('#selectMbProduct');
            } else {
                select2Input = $('#selectPcProduct');
            }
            select2Input.select2({
                language: "zh-CN",// 指定语言为中文，国际化才起效
                placeholder: '请输入商品名称',
                width: '100%',
                multiple: true,
                maximumSelectionLength: 1,
                minimumInputLength: 1,
                tags: false,
                allowClear: false,
                data: data,
                ajax: {
                    url: $hostService.productApi + '/biz/0/prodsList?active=1',
                    dataType: 'json',
                    delay: 250,// 延迟显示
                    allowClear: false,
                    data: function (params) {
                        return {
                            name : params.term, // 搜索框内输入的内容，传递到后端的parameter为name
                            tenant: $rootScope.tenant
                        };
                    },
                    processResults: function (data, params) {
                        var selectData=[]
                        var labelArr = {
                            id: "T01",
                            text: "标签",
                            element: "HTMLOptGroupElement",
                            children:[]
                        }
                        var prodArr={
                            id: "T02",
                            text: "产品",
                            element: "HTMLOptGroupElement",
                            children:[]
                        };
                        for (var i = 0; i < data.label.length; i++) {
                            var temy = {
                                id: data.label[i].id,
                                text: data.label[i].label_name
                            }
                            labelArr.children.push(temy);
                        }
                        for (var i = 0; i < data.prod.length; i++) {
                            var temy = {
                                id: data.prod[i].prod_id,
                                text: data.prod[i].name
                            }
                            prodArr.children.push(temy);
                        }
                        if(prodArr.children.length>0){
                            selectData.push(prodArr)
                        }
                        if(labelArr.children.length>0){
                            selectData.push(labelArr)
                        }
                        return {
                            results: selectData// 后台返回的数据集
                        };
                    },
                    cache: true
                },
                escapeMarkup: function (markup) {
                    return markup;
                }, // let our custom formatter work
                templateSelection: function (repo) {
                    /*$('.labelSearch').val('');*/
                    window.setTimeout(function () {
                        $(".select2-search__field").val('');
                    }, 100)
                    return repo.text;

                }//
            });
        }

        $scope.toHome = function () {
           window.location.href = '/';
        };


    var getOrderInfo=function () {
        if($location.$$url.indexOf('json')!=-1){
            var ncaJson=$location.$$url.split('=')[1];
            var currentOrderInfo=JSON.parse(decodeURIComponent(ncaJson));//本次Link的Order信息
            var lastOrderInfo=sharedData.getOrderInfo();//上次link的Order信息

            var roomArr=[];
            for(var i in currentOrderInfo.roomsInfo){
                if(currentOrderInfo.roomsInfo[i].id!==''){
                    roomArr.push(currentOrderInfo.roomsInfo[i]);
                }
            }
            currentOrderInfo.roomsInfo=roomArr;
            sharedData.saveOrderInfo(currentOrderInfo);

            if(currentOrderInfo.orderId==undefined){
                InfoBox('订单号不存在!');
            }else{
                if(lastOrderInfo!==null){
                    if(lastOrderInfo.orderId!==currentOrderInfo.orderId){
                        window.setTimeout(function () {
                            $rootScope.allNum=0;
                            $rootScope.clearCart();
                            $scope.$apply();
                        },1000)
                        window.setTimeout(function () {
                            $scope.$apply();
                        },2000)
                    }
                }
            }

            if(currentOrderInfo.roomsInfo.length==0){
                InfoBox('空间信息不存在!');
            }else if(currentOrderInfo.authorization==undefined){
                InfoBox('Token不存在!');
            }

        }

    }

    //判断是否登陆
    var turnToLogin=function () {
        if(userId == null || userId.length == 0 || bizId == null || bizId.length == 0){
            var isLoginReturn=configLogin($filter,'home2');
            if(isLoginReturn){
                return;
            }
        }
    }

    checkPlatform();
    getBanners();
    getOrderInfo();

    $scope.$watch('setCookieStatus', function (to, from) {
        if($rootScope.setCookieStatus===true){
             $rootScope.isLogin = true;
             $rootScope.userName = $httpService.getCookie('username');
        }else if($location.$$url.indexOf('json')===-1){
                turnToLogin();
        }
        console.log('getCookie-isLogin :' + $httpService.getCookie('isLogin'));
        console.log('time :' + new Date());
        window.setTimeout(function () {
            if($httpService.getCookie('isLogin') == '1'){
                $rootScope.isLogin=true;
                $rootScope.userName = $httpService.getCookie('username')?$httpService.getCookie('username'):null;
                $scope.$apply('isLogin');
                $scope.$apply('userName');
            }
        },5000)
    });

    $(function () {
        window.setTimeout(function () {
            initSelect2();
            //百度搜索资源平台主动推送链接
        },100)
        baiduLinkSubmit();
        setPageTitle('','','');
    })
    // initBanner();

}]);