/**
 * Created by BaiBin on 16/7/7.
 */
app.controller('orderInfo2Controller', ['$scope', '$rootScope', '$httpService', '$hostService', '$interval','$location','$filter', 'sharedData',function ($scope, $rootScope, $httpService, $hostService, $interval,$location,$filter,sharedData) {

    var userId = $httpService.getCookie($httpService.USER_ID);
    var bizId = $httpService.getCookie($httpService.BIZ_ID);
    var arrayStr = $location.search().reOrderItems;
    var reOrderItems = arrayStr ? JSON.parse(arrayStr) : null;
    var isloginConfig = $filter('translate')('isLogin');
    $scope.selectItems = [];
    $scope.roomsInfo=[];
    $scope.ncaOrderInfo=sharedData.getOrderInfo();
    $scope.chartsArr=[];
    if(userId == null || userId.length == 0 || bizId == null || bizId.length == 0){
        window.location.href = 'indexApp.html#/login?whereCome=orderInfo2';
        return;
    }

    //商品列表
    var allProduct = function() {
        var ShoppingCart = localStorage.getItem("ShoppingCart");
        var productlist = null;
        if (ShoppingCart) {
            var jsonstr = JSON.parse(ShoppingCart.substr(1, ShoppingCart.length));
            productlist = jsonstr.productlist;
        }
        return productlist;
    }

    $scope.chartsArr = (allProduct()!=null) ? allProduct():[];


    //获取空间f
    if($scope.ncaOrderInfo){
        $scope.roomsInfo=$scope.ncaOrderInfo.roomsInfo;
    }

    initHeaer();
   /* if(userId == null || userId.length == 0 || bizId == null || bizId.length == 0){
        var isLoginReturn=configLogin($filter,'orderInfo');
        if(isLoginReturn){
            return;
        }
    }*/

    if(reOrderItems){
        for(index in reOrderItems){
            var item = reOrderItems[index];
            var productData = {};
            productData.prodId = item.productId;
            productData.id = item.productId;
            productData.productName = item.productName;
            productData.name = item.productName;
            productData.price = item.unitPrice;
            productData.imgUrl = item.imgUrl ? item.imgUrl.split('/').slice(-1)[0] : null;//图片的imageId
            productData.special_price = item.unitPrice;//加入购物车用到
            productData.specialPrice = item.unitPrice;//计算总价时用到
            productData.productCode = item.productCode;
            productData.supplierId = item.bizId;
            productData.supplierName = item.supplierName;
            productData.unitOfMeasure = item.unitOfMeasure;
            productData.num = item.quantity;//计算总价时用到
            $rootScope.prodPush(productData,item.quantity);
            $scope.selectItems.push(productData);
        }
    }else {
        $scope.selectItems = $scope.chartsArr;
    }

    $scope.imageService = $hostService.imageApi + '/sizes/m/imageSets/';
    if ($scope.chartsArr != null && $scope.chartsArr.length > 0) {
        $scope.haveProduct = 1;
    } else {
        $scope.haveProduct = 0;
    }


    $scope.stepDescription = '检验 & 编辑你的产品';

    //设置购物车里的商品选中
    $scope.validateCheck = function (product) {
        var isFind = false;
        for (index in $scope.selectItems){
            var p = $scope.selectItems[index];
            if(product.id == p.id){
                isFind = true;
                break;
            }
        }
        return isFind;
    };
    //checkbox点击事件
    $scope.selectClick = function () {
        getAllSelect();
        calculatedPrice();
    };
    //获取所有选中的商品
    function getAllSelect() {
        var tem = [];
        $('input:checkbox[name=checkboxId]:checked').each(function(i){
            var ob = JSON.parse($(this).val());
            tem.push(ob);
        });
        $scope.selectItems = tem;
    }

    $scope.changeNum = function (p) {
        // p.num = p.num ? p.num : 1;
        // changeSelectNum(p.id, p.num);
        // calculatedPrice();
        // $rootScope.updateProductNum(p.id, p.num);
    }

    $scope.inputBlur = function (p) {
        p.num = p.num ? p.num : 1;
        /*if(p.num >200){
            p.num = 200;
            WarningBox('购买的最大数量为200');
        }*/
        changeSelectNum(p.id, p.num);
        calculatedPrice();
        $rootScope.updateProductNum(p.id, p.num);
        $rootScope.refreshCarts();
    };

    //创建订单
    var requestParams={};
    $scope.createOrder=function () {
        if($scope.ncaOrderInfo){
            if($scope.ncaOrderInfo.roomsInfo.length==0){
                InfoBox('空间信息不存在!');
                return
            }else if($scope.ncaOrderInfo.orderId==undefined){
                InfoBox('订单号不存在!');
                return
            }
            else if($scope.ncaOrderInfo.authorization==undefined){
                InfoBox('Token不存在!');
                return
            }
            var itemArr = [];
            for (var i = 0; i < $scope.selectItems.length; i++) {
                var price = 0.0;
                price = $scope.selectItems[i].price;
                var roomId=$('#shopList'+$scope.selectItems[i].productCode+' .romeSelect').val();

                if(roomId===''){
                    InfoBox('空间不能为空!');
                    return
                }

                var p = {
                    "materiel_amount":$scope.selectItems[i].num,
                    "materiel_code": $scope.selectItems[i].productCode,
                    "room_id":roomId
                }
                itemArr.push(p);
            }

            var params = {
                "order_id":$scope.ncaOrderInfo.orderId,
                "authorization":$scope.ncaOrderInfo.authorization,
                "materiels":itemArr
            }
            requestParams=params;
            console.log('requestParams');
            console.log(requestParams);
            $('#sure-dialog').modal('show');
        }else {
            InfoBox('订单信息不存在!');
        }
    }



    //减号点击事件
    $scope.increaseClick = function (p) {
        if(p.num >1){
            var temyArr=getSelecetRoom();
            p.num--;
            $rootScope.updateProductNum(p.id, p.num);
            changeSelectNum(p.id, p.num);
            calculatedPrice();
            $rootScope.refreshCarts();
            window.setTimeout(function () {
                setSelectRoom(temyArr);
            },200)
        }
    }
    //加号点击事件
    $scope.plusClick = function (p) {
        var temyArr=getSelecetRoom();
        p.num++;
        $rootScope.updateProductNum(p.id, p.num);
        changeSelectNum(p.id, p.num);
        calculatedPrice();
        $rootScope.refreshCarts();
        window.setTimeout(function () {
            setSelectRoom(temyArr);
        },200)
    }

    //记录选择的空间
    var getSelecetRoom=function () {
        var temyArr=[];
        for (var i = 0; i < $rootScope.carts.length; i++) {
            var roomId=$('#shopList'+$rootScope.carts[i].productCode+' .romeSelect').val();
            if(roomId!==''){
                var p = {
                    "productCode":$rootScope.carts[i].productCode,
                    "roomId":roomId
                }
                temyArr.push(p);
            }
        }
        return temyArr;
    };

    //设置已经选择的空间
    var setSelectRoom=function (data) {
        for(var i in data){
            $('#shopList'+data[i].productCode+' .romeSelect').val(data[i].roomId);
        }
    };


    //删除一个品相
    $scope.deleteItem = function (p) {
        $rootScope.prodRemove(p.id);
        // getAllSelect();
        // var index = $.inArray(p, $scope.selectItems);
        // $scope.selectItems.splice(parseInt(index), 1);
            deleteSelect(p);
            // getAllSelect();
            calculatedPrice();
        if ($scope.chartsArr.length == 0) {
            $scope.haveProduct = 0;
        }
    }

    function deleteSelect(p) {
        var index = null
        for(i in $scope.selectItems){
            var item = $scope.selectItems[i];
            if(p.id == item.id){
                // $scope.selectItems.splice(index, 1);
                index = i;
            }
        }
        if(index){
            $scope.selectItems.splice(parseInt(index), 1);
        }
    }

    function changeSelectNum(pId, pNum) {
        for(index in $scope.selectItems){
            var item = $scope.selectItems[index];
            if(item.id == pId){
                item.num = pNum
            }
        }
    }
    
///计算总价
    function calculatedPrice() {
        if(!$scope.selectItems){
            return
        }
        var totalPrice = 0;
        $scope.freight = 0;
        for (var i = 0; i < $scope.selectItems.length; i++) {
            if ($scope.selectItems[i].specialPrice != -1 && $scope.selectItems[i].specialPrice != null) {
                totalPrice += ($scope.selectItems[i].specialPrice * $scope.selectItems[i].num);
            } else {
                totalPrice += ($scope.selectItems[i].price * $scope.selectItems[i].num);
            }
        }
        $scope.subtotal = totalPrice.toFixed(2);
        $scope.total = (totalPrice + $scope.freight).toFixed(2);
    }

    $scope.stepForward=function () {
        $('#sure-dialog').modal('show');
    }

    $scope.onSure=function () {
        // var params=requestParams;
        // $httpService.post($hostService.productApi + '/sendNca', params).then(function (data) {
        //     if (data.errno===0) {
        //         $('#sure-dialog').modal('hide');
        //         InfoBox('选择成功!');
        //         $rootScope.clearCart();
        //         window.setTimeout(function () {
        //             $rootScope.toHome();
        //         },1000)
        //     } else {
        //         console.log(data);
        //         WarningBox(data.msg);
        //     }
        // }).catch(function (error) {
        //     if (error.code != 'NotAuthorized') {
        //         ErrorBox('服务器内部错误');
        //     }
        // });
        var params=requestParams;
        $httpService.post('/api/sendNca', params).then(function (data) {
            if (data.errno===0) {
                $('#sure-dialog').modal('hide');
                InfoBox('选择成功，3秒后此页面将关闭。');
                $rootScope.clearCart();
                $httpService.removeCookie($httpService.COMMON_AUTH_NAME);
                $httpService.removeCookie($httpService.USER_ID);
                $httpService.removeCookie($httpService.USER_NAME);
                $httpService.removeCookie($httpService.CITY);
                $httpService.removeCookie($httpService.BIZ_ID);
                $httpService.removeCookie($httpService.BIZ_NAME);
                $httpService.removeCookie($httpService.CITY);
                $httpService.setCookie('isLogin','0');
                $httpService.removeCookie('username');
                localStorage.removeItem('orderInfo');
                window.setTimeout(function () {
                    /*$rootScope.toHome();*/
                    CloseWebPage();
                },3000);
            } else {
                console.log(data);
                WarningBox(data.msg);
            }
        }).catch(function (error) {
            if (error.code !== 'NotAuthorized') {
                ErrorBox('服务器内部错误');
            } else {
                window.location.href = 'indexApp.html#/login?whereCome=orderInfo';
            }
        });
    };

    calculatedPrice();
    /*getPrice();*/

    $scope.goShopping = function () {
        $rootScope.toHome();
    }

    //百度搜索资源平台主动推送链接
    baiduLinkSubmit();

    $(function () {
        setPageTitle('购物车','','');
    })
}]);