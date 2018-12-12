/**
 * Created by BaiBin on 16/6/29.
 */
app.controller('productDetailController', ['$scope','$rootScope','$location','$anchorScroll','$httpService','$hostService', 'sharedData','$filter','$routeParams',function($scope,$rootScope,$location,$anchorScroll,$httpService,$hostService,sharedData,$filter,$routeParams) {
    $scope.MimageService = $hostService.imageApi+'/sizes/m/imageSets/';
    bizId = 0;
    //App.initScrollBar();
    //OwlCarousel.initOwlCarousel();

    var params = {
        "start":0,
        "size":1
    }
    initHeaer();
    window.setTimeout(function(){
        //返回到页面顶部
        $('html, body').animate({
            scrollTop: 0
        }, 0);
    },100);


    var productId = $location.search().productId;
    var bizId = $location.search().biz_id ? $location.search().biz_id : 0;

    if($routeParams.productId){
        productId=$routeParams.productId;
        bizId=$routeParams.bizId;
    }

    var userId = $httpService.getCookie($httpService.USER_ID);
    var bizCookieId = $httpService.getCookie($httpService.BIZ_ID);
    $scope.descriptionImage = [];
    $scope.collections = [];
    $scope.fileData = [];

    //产品详情页是否需要登陆
    /*var productDetailLogin = $filter('translate')('productDetailLogin');
    if (productDetailLogin==='true' && $rootScope.tenant !=='shop') {
        if(userId == null || userId.length == 0 || bizCookieId == null || bizCookieId.length == 0){
            window.location.href = 'indexApp.html#/login?whereCome='+ $filter('translate')('homeLink');
            return true
        }
    }*/

    $httpService.get($hostService.productApi+'/biz/'+bizId+'/prods/'+productId).then(function(data){
        if(data.success) {
            $scope.productData = data.result;
            $scope.productData.num = 1;//初始化数量为1
            var imges = [];
            if(data.result.images != null && data.result.images.length > 0){
                for (var i=0 ;i < data.result.images.length;i++){
                    var image = data.result.images[i];
                    if(image.img_type == 'cover'){
                        var bigImgUrl = $hostService.imageApi+'/sizes/l/imageSets/'+data.result.images[i].img_url;
                        var smallImgUrl = $hostService.imageApi+'/sizes/m/imageSets/'+data.result.images[i].img_url;
                        imges.push({'bigImgUrl':bigImgUrl,'smallImgUrl':smallImgUrl,description:data.result.images[i].description})
                    }else if(image.img_type == 'description'){
                        var imageUrl = $hostService.imageApi+'/images/'+image.img_url;
                        $scope.descriptionImage.push({url:imageUrl,description:data.result.images[i].description});
                    }else if(image.img_type == 'file'){
                        var imageUrl = $hostService.imageApi+'/images/'+image.img_url;
                        $scope.fileData.push(imageUrl);
                    }

                }
            }else{
                imges.push({'bigImgUrl':'../assets/images/no_img.png','smallImgUrl':'../assets/images/no_img_s.png'})
            }

            $scope.imageArr = imges;
            //延时初始化OwlCarousel
            window.setTimeout(function(){
                MasterSliderShowcase2.initMasterSliderShowcase2();
            },300);

            var keywords=($scope.productData.productName?$scope.productData.productName:'')+($scope.productData.prodCode?','+$scope.productData.prodCode:'')+($scope.productData.type?','+$scope.productData.type:'')+($scope.productData.measurement?','+$scope.productData.measurement:'');
            if($scope.productData.description!==null){
                setPageTitle($scope.productData.productName+'',$scope.productData.description,keywords);
            }else if (data.result == []){
                setPageTitle('产品描述',$scope.productData.productName,keywords);
            }else {
                setPageTitle($scope.productData.productName+'',$scope.productData.productName,keywords);
            }

            //createSilde(imges)
            getRelevantProduct(data.result.typeId);

            if($scope.fileData.length>0){
                $scope.showFileButton();
            }
        } else {
            WarningBox(data.msg);
        }
    }).catch(function(error){
        if (error.code != 'NotAuthorized') {
            ErrorBox('服务器内部错误');
        }
    });

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

    function createSilde(imgArr){
        var parentDiv = document.getElementById("masterslider");
        for (var i=0;i<imgArr.length;i++){
            var div = document.createElement("div");//创建div
            div.className = 'ms-slide';
            var big_img = document.createElement("img");//创建大图
            big_img.setAttribute("src", imgArr[i].bigImgUrl);
            //big_img.setAttribute("data-src", imgArr[i].bigImgUrl);
            var small_img = document.createElement("img");//创建小图
            small_img.setAttribute("class", 'ms-thumb');
            small_img.setAttribute("src", imgArr[i].smallImgUrl);
            div.appendChild(big_img);
            div.appendChild(small_img);
            parentDiv.appendChild(div);
        }
    }

    var nowReviews = [];
    var start = 0;
    var size = 10;
    var isHaveNext = false;
    //第一页,设置上一页按钮不可用
    $('#preBtn').attr('disabled',true);
    getReview();

    function  getReview(){
        //获取评论
        $httpService.get($hostService.productApi+'/biz/'+bizId+'/prods/'+ productId + '/prodComments?start='+start+'&size=' + (size+1)).then(function(data){

            if(data.result != null) {
                if(!(data.result instanceof Array)){
                    return
                }
                if(data.result.length ==0){
                    return
                }
                if(start >= size){
                    $('#preBtn').attr('disabled',false);
                }else{
                    $('#preBtn').attr('disabled',true);
                }
                if (data.result.length < size+1){
                    $('#nextBtn').attr('disabled',true);
                    isHaveNext = false;
                }else{
                    $('#nextBtn').attr('disabled',false);
                    isHaveNext = true;
                }

                nowReviews.splice(0,nowReviews.length);
                nowReviews = data.result.slice(0,size);
                for (var i = 0 ; i < nowReviews.length; i++){
                    var obj = nowReviews[i];
                    var date = new Date(obj.createTime);
                    var dateStr = date.toLocaleString();
                    obj.createTime = dateStr;
                }
                $scope.nowReviews = nowReviews;
            } else {
                WarningBox(data.msg);
            }
        }).catch(function(error){
            if (error.code != 'NotAuthorized') {
                ErrorBox('服务器内部错误');
            }
        });
    }



    //上一页
    $scope.previousPageClick = function(){
        if(start >= size){
            start -= size;
            getReview();
        }
    }

    //下一页
    $scope.nextPageClick = function(){
        if (isHaveNext){
            start += size;
            getReview();
        }
    }


    //根据productType获取相关的产品
    function getRelevantProduct(prodectType){
        var params = {
            "start":0,
            "size":10
        }
        $httpService.get($hostService.productApi+'/biz/'+bizId+'/prodTypes/'+prodectType+'/prods?start=0&size=10').then(function(data){
            if(data) {
                $scope.relevantProduct = [];
                for(var i=0;i<data.result.length;i++){
                    if(data.result[i].prodId!=productId){
                        $scope.relevantProduct.push(data.result[i]);
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



    //减号点击事件
    $scope.increaseClick = function(){
        if($scope.productQuantity > 1){
            $scope.productQuantity--;
        }
        $scope.productData.num = $scope.productQuantity;
    }

    //加号点击事件
    $scope.plusClick = function(){
        $scope.productQuantity++;
        $scope.productData.num = $scope.productQuantity;
    }

    $scope.changeNum = function () {
      console.log($scope.productQuantity)
    };

    //加入购物车点击事件
    $scope.addShoppingCartClick = function(productData,num){

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

        if($scope.productQuantity > 200){
            $scope.productQuantity = 200;
            WarningBox('购买的最大数量为200');
        }
        $rootScope.prodPush(productData,$scope.productQuantity);
        var offset = $("#add-cart-btn").offset();

        var imgUrl = $rootScope.staticContentURL+'/'+$rootScope.tenant+'/assets/images/prodDefault240.jpg';
        if (productData.imgUrl != null && productData.imgUrl.length > 0){
            imgUrl = $scope.MimageService+productData.imgUrl
        }
        var flyer = $('<img class="u-flyer" src="'+imgUrl+'">');
        flyer.css({
            'width':'50px',
            'height':'50px'
        })
        flyer.fly({
            start: {
                left: offset.left,
                top: offset.top
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


    $scope.activeTab = 1;
    $scope.descriptionClick = function(index){
        $scope.activeTab = index;
    }

    $scope.goto = function(id){
        $scope.activeTab = 2;
        window.setTimeout(function(){
            $location.hash(id);
            $anchorScroll();
        },10);

    }

    $scope.backToType = function(type){
        window.location.href = 'indexApp.html#/product_filter/' + type + '/type/1';
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
    if ( token != null ){
        getFavoriteProds();
    }

    //今日推荐 加入购物车点击事件
    $scope.addShoppingCartTodyClick = function(productData,num,index){

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

    $scope.toSearch=function (labelName) {
        window.location.href = "indexApp.html#/product_filter/" + labelName + '/type/3';
    }

    $scope.setue4 = function () {
        var string='<script>'+
        '"object"==typeof ue&&"object"==typeof ue.interface&&function(e){"function"==typeof e.broadcast&&(ue.interface={},ue.interface.broadcast=function(t,a){void 0!==a?e.broadcast(t,JSON.stringify(a)):e.broadcast(t,"")},ue4=ue.interface.broadcast)}(ue.interface);'+
        '</script>'
        $(document .body).append(string);

    }

    $scope.downPakFIle=function (url) {
        ue4("volume",url);
    }

    $scope.showFileButton=function () {
        //是否显示下载文件button
        var zyUser=sharedData.getZyUser(zyUser) ? sharedData.getZyUser(zyUser) : null;
        if(zyUser==='zy'){
            $scope.pakFileButtonShow=true;
            $scope.setue4();
        }else {
            $scope.pakFileButtonShow=false;
        }
    };

    //百度搜索资源平台主动推送链接
    baiduLinkSubmit();

}]);
