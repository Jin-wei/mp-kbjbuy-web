/**
 * Created by Cici
 */
app.controller('headerController', ['$scope','$element','$httpService','$rootScope','$hostService','$filter','sharedData','$location',
    function($scope, $element,$httpService,$rootScope,$hostService,$filter,sharedData,$location) {
        var tenant = getTenant();
        $httpService.setCookie($httpService.TENANT,tenant);
        $rootScope.isMobile = checkPlatform();
        $rootScope.setCookieStatus='';

        $scope.enterEvent = function(e) {
            var keycode = window.event?e.keyCode:e.which;
            if(keycode==13){
                $scope.search()
            }
        }

        //获取窗口宽度
        if (window.innerWidth)
            winWidth = window.innerWidth;
        else if ((document.body) && (document.body.clientWidth))
            winWidth = document.body.clientWidth;
        if (document.documentElement && document.documentElement.clientWidth) {
            winWidth = document.documentElement.clientWidth;
        }

        if(winWidth > 991){
            //获取电脑模式购物车的坐标
            window.setTimeout(function(){
                var offset = $("#cart").offset();
                $rootScope.cartOffset = offset;
            },500);
        }else{
            //获取手机模式下购物车的坐标
            window.setTimeout(function(){
                var offset = $("#cart-iphone").offset();
                $rootScope.cartOffset = offset;
            },500);
        }


        $scope.keyword = '';
        $scope.mobileKeyword = '';
        $scope.items = [];
        //$httpService.removeCookie('isLogin');
        //$httpService.removeCookie('username');
        $rootScope.userName = $httpService.getCookie('username')?$httpService.getCookie('username'):null;
        $scope.imageService = $hostService.imageApi+'/sizes/m/imageSets/';
        $scope.categories = [];
        $rootScope.nowPath = '';

        //导航上退出登录
        $rootScope.logOut = function() {
            $httpService.removeCookie($httpService.COMMON_AUTH_NAME);
            $httpService.removeCookie($httpService.USER_ID);
            $httpService.removeCookie($httpService.USER_NAME);
            //$httpService.removeCookie($httpService.USER_PHONE);

            $rootScope.userId = null;
            $httpService.setCookie('username' ,null);
            $httpService.setCookie('isLogin' ,null);
            $rootScope.userName = $httpService.getCookie('username');
            $rootScope.isLogin = false;


            window.location.href = 'indexApp.html#/login';
        }

        $scope.search = function() {
            /*var kw='';
            if($scope.isMobile){
                kw=$('#searchInput').val();
            }else{
                kw=$('#webProdcutSearch').val();
            }
            var kw = $scope.isMobile ? $('#searchInput').val() : $scope.keyword;*/
            var kw=$('#webProdcutSearch').val()
            if(kw.length>0){
                window.location.href = "indexApp.html#/product_filter/" + kw + '/type/2';
            }
        }

        //search hits
        var engine = new Bloodhound({
            datumTokenizer: Bloodhound.tokenizers.obj.whitespace('category'),
            queryTokenizer: Bloodhound.tokenizers.whitespace,
            prefetch: './assets/search.json',
            remote: {
                url: $hostService.productApi+'/prodSearch/'+'%QUERY'+'?start='+0+'&size='+10,
                wildcard: '%QUERY'
            }
        });

        $('#searchInput').typeahead(null, {
            name: 'search',
            display: 'category',
            source: engine
        });
        /*$('#webProdcutSearch').typeahead(null, {
            name: 'search',
            display: 'category',
            source: engine
        });*/

        //进入二级分类
        $scope.gotoSecondCategory = function(typeId) {
            window.location.href = "indexApp.html#/product_filter/" + typeId + '/type/1';
        }

        //获取分类信息
        function getAllCategories() {
            var url = $hostService.productApi+'/biz/0/prodTypes';
            $httpService.get(url).then(function(data){
                if (data) {
                    $scope.categories = sortCategory(data.result);
                }else{
                }
            }).catch(function(error){
                if (error.code != 'NotAuthorized') {
                    ErrorBox('服务器内部错误');
                }
            });
        }


        getAllCategories();


        //***************购物车的通用方法******************

        //localStorage中存储的信息格式
        //'{"productlist":[{"id":2010017,"name":"Espresso样板","num":2,"price":null},
        // {"id":1010010,"name":"FN淡奶","num":1,"price":null},
        // {"id":2010164,"name":"危地马拉咖啡","num":1,"price":null}],
        // "totalNumber":4,"totalAmount":null}

        //每个商品的信息格式
        product = {
            id:0,
            name:"",
            num:0,
            price:0.00,
            productCode:'',
            supplierId:'',
            supplierName:''
        };

        //订单详情
        $rootScope.orderdetail = {
            username:"",
            phone:"",
            address:"",
            zipcode:"",
            totalNumber:0,
            totalAmount:0.00
        };

        //商品列表
        $rootScope.allProduct = function() {
            var ShoppingCart = localStorage.getItem("ShoppingCart");
            var productlist = null;
            if (ShoppingCart) {
                var jsonstr = JSON.parse(ShoppingCart.substr(1, ShoppingCart.length));
                productlist = jsonstr.productlist;
                $rootScope.orderdetail.totalNumber = jsonstr.totalNumber;
                $rootScope.orderdetail.totalAmount = jsonstr.totalAmount ? parseFloat(jsonstr.totalAmount).toFixed(2) : 0;
            }
            //获取所有商品的总个数
            var allNum = 0
            if(productlist instanceof Array){
                for (var i = 0;i<productlist.length;i++){
                    allNum += productlist[i].num
                }
            }
            $scope.allNum = allNum;

            return productlist;
        }

        $rootScope.carts = ($rootScope.allProduct()!=null) ? $rootScope.allProduct():[];

        //删除商品
        $rootScope.prodRemove = function(id) {
            //$rootScope.carts.remove(index);

            var ShoppingCart = localStorage.getItem("ShoppingCart");
            var jsonstr = JSON.parse(ShoppingCart.substr(1,ShoppingCart.length));
            var productlist = jsonstr.productlist;
            var list=[];
            for(var i in productlist){
                if(productlist[i].id==id){
                    jsonstr.totalNumber=parseInt(jsonstr.totalNumber)-parseInt(productlist[i].num);
                    jsonstr.totalAmount=parseFloat(jsonstr.totalAmount)-parseInt(productlist[i].num)*parseFloat(productlist[i].price);
                }else{
                    list.push(productlist[i]);
                }
            }
            jsonstr.productlist = list;
            $rootScope.orderdetail.totalNumber = jsonstr.totalNumber;
            $rootScope.orderdetail.totalAmount = jsonstr.totalAmount;
            localStorage.setItem("ShoppingCart","'"+JSON.stringify(jsonstr));

            $rootScope.carts = ($rootScope.allProduct()!=null) ? $rootScope.allProduct():[];
            sharedData.saveCarts($rootScope.carts);
        }

        //清空购物车
        $rootScope.clearCart = function(){
            localStorage.removeItem('ShoppingCart');
            $rootScope.carts = ($rootScope.allProduct()!=null) ? $rootScope.allProduct():[];
            sharedData.saveCarts($rootScope.carts);
        }

        //添加商品
        $rootScope.prodPush = function(p,num) {
            //$rootScope.carts.push(p);
            if(p.special_price == null){
                //-1 表示没有特殊价格
                p.special_price = -1
            }
            var ShoppingCart = localStorage.getItem("ShoppingCart");
            if(ShoppingCart==null||ShoppingCart==""){
                //第一次加入商品
                var jsonstr = {"productlist":[{"id":p.prodId,"name":p.productName,"num":num,"price":p.price,"image":p.imgUrl,
                    'specialPrice': p.special_price,productCode: p.prodCode, supplierId: p.bizId, supplierName: p.bizName,unitOfMeasure: p.unitOfMeasure}],"totalNumber":num,"totalAmount":(p.price*num)};
                localStorage.setItem("ShoppingCart","'"+JSON.stringify(jsonstr));
                Toast('已添加到购物车!');
            }else{
                var jsonstr = JSON.parse(ShoppingCart.substr(1,ShoppingCart.length));
                var productlist = jsonstr.productlist;
                var result=false;
                //查找购物车中是否有该商品
                for(var i in productlist){
                    if(productlist[i].id==p.prodId){
                        productlist[i].num=parseInt(productlist[i].num)+parseInt(num);
                        //productlist[i].num = 1;
                        result = true;
                    }
                }
                if(!result){
                    //没有该商品就直接加进去
                    productlist.push({"id":p.prodId,"name":p.productName,"num":num,"price":p.price,"image":p.imgUrl,
                        'specialPrice': p.special_price,productCode: p.prodCode, supplierId: p.bizId, supplierName: p.bizName,unitOfMeasure: p.unitOfMeasure});

                    Toast('已添加到购物车!');
                }
                //重新计算总价
                jsonstr.totalNumber=parseInt(jsonstr.totalNumber)+parseInt(num);
                jsonstr.totalAmount=parseFloat(jsonstr.totalAmount)+(parseInt(num)*parseFloat(p.price));
                $rootScope.orderdetail.totalNumber = jsonstr.totalNumber;
                $rootScope.orderdetail.totalAmount = jsonstr.totalAmount;
                //保存购物车
                localStorage.setItem("ShoppingCart","'"+JSON.stringify(jsonstr));
            }

            $rootScope.carts = ($rootScope.allProduct()!=null) ? $rootScope.allProduct():[];
            sharedData.saveCarts($rootScope.carts);
        }

        //更新某商品数量
        $rootScope.updateProductNum = function(id,num) {
            var ShoppingCart = localStorage.getItem("ShoppingCart");
            var jsonstr = JSON.parse(ShoppingCart.substr(1,ShoppingCart.length));
            var productlist = jsonstr.productlist;

            for(var i in productlist){
                if(productlist[i].id==id){
                    jsonstr.totalNumber=parseInt(jsonstr.totalNumber)+(parseInt(num)-parseInt(productlist[i].num));
                    jsonstr.totalAmount=(parseFloat(jsonstr.totalAmount)+((parseInt(num)*parseFloat(productlist[i].price))-parseInt(productlist[i].num)*parseFloat(productlist[i].price))).toFixed(2);;
                    productlist[i].num=parseInt(num);

                    $rootScope.orderdetail.totalNumber = jsonstr.totalNumber;
                    $rootScope.orderdetail.totalAmount = jsonstr.totalAmount;
                    localStorage.setItem("ShoppingCart","'"+JSON.stringify(jsonstr));
                    // $rootScope.carts = ($rootScope.allProduct()!=null) ? $rootScope.allProduct():[];
                    break;
                }
            }
        }

        $rootScope.refreshCarts = function () {
            $rootScope.carts = ($rootScope.allProduct()!=null) ? $rootScope.allProduct():[];
            sharedData.saveCarts($rootScope.carts);
        };

        //更新某个商品的特殊价格
        $rootScope.updateSpecialPrice = function(id,specialPrice){
            var ShoppingCart = localStorage.getItem("ShoppingCart");
            var jsonstr = JSON.parse(ShoppingCart.substr(1,ShoppingCart.length));
            var productlist = jsonstr.productlist;

            for(var i in productlist){
                if(productlist[i].id==id){
                    productlist[i].specialPrice = specialPrice;
                    localStorage.setItem("ShoppingCart","'"+JSON.stringify(jsonstr));
                    $rootScope.carts = ($rootScope.allProduct()!=null) ? $rootScope.allProduct():[];
                    sharedData.saveCarts($rootScope.carts);
                    return;
                }
            }
        }

        //判断购物车中是否存在商品
        $rootScope.ifProductExist = function(id) {
            var ShoppingCart = localStorage.getItem("ShoppingCart");
            var jsonstr = JSON.parse(ShoppingCart.substr(1,ShoppingCart.length));
            var productlist = jsonstr.productlist;
            var result=false;
            for(var i in productlist){
                if(productlist[i].id==id){
                    result = true;
                }
            }
            return result;
        }


        $rootScope.$on('$routeChangeSuccess',function(){
            $('.product-label').hide();
            $rootScope.nowPath = $location.path();
        });


        $rootScope.toHome=function () {
            /*toHome($filter);*/
            window.location = '/'
        };

        $rootScope.toOrderInfo=function () {
            /*toOrderInfo($filter);*/
            window.location = 'indexApp.html#/orderInfo'
        };

        if($httpService.getCookie('isLogin') == '1'){
            $rootScope.isLogin = true;
        }else{
            $rootScope.isLogin = false;
        }

        $scope.showLabel = function () {
            $('.product-label').toggle();
        }

        $(document).ready(function(){
            if($("#scrollDiv").length>0){
                $("#scrollDiv").Scroll({
                    line:1,
                    speed:500,
                    timer:3000,
                    up:"but_up",
                    down:"but_down"
                });
            }
        });


    }]);