/**
 * Created by BaiBin on 16/7/7.
 */
app.controller('orderInfoController', ['$scope', '$rootScope', '$httpService', '$hostService', '$interval','$location','$filter', function ($scope, $rootScope, $httpService, $hostService, $interval,$location,$filter) {
    var userId = '';
    var bizId ='';
    var arrayStr = $location.search().reOrderItems;
    var reOrderItems = arrayStr ? JSON.parse(arrayStr) : null;
    $scope.selectItems = [];
    initHeaer();
    userId = $httpService.getCookie($httpService.USER_ID);
    bizId = $httpService.getCookie($httpService.BIZ_ID);
    if(userId == null || userId.length == 0 || bizId == null || bizId.length == 0){
        window.location.href = 'indexApp.html#/login?whereCome=orderInfo';
        return;
    }

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
        $scope.selectItems = $scope.carts;
    }

    $scope.imageService = $hostService.imageApi + '/sizes/m/imageSets/';

    $rootScope.$watch('carts',function (newValue) {
        if ($rootScope.carts != null && $rootScope.carts.length > 0) {
            $scope.haveProduct = 1;
            getCustomerprices();
        } else {
            $scope.haveProduct = 0;
        }
    })


    $scope.step = 1;
    $scope.stepDescription = '检验 & 编辑你的产品';

    $scope.stepBack = function () {
        $scope.step--;
        changeStepDes();
    }

    function changeStepDes(){
        if($scope.step == 1){
            $scope.stepDescription = '检验 & 编辑你的产品';
        }else if($scope.step == 2){
            $scope.stepDescription = '航运和地址';
        }else{
            $scope.stepDescription = '请选择支付方式';
        }
    }

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

    function getCustomerprices() {
        //如果已经登录,则去查找产品的特殊价格
        if ($httpService.getCookie('isLogin')) {
            $httpService.get($hostService.bizApi + '/custs/' + userId + '/customerprices?bizId=' + bizId).then(function (data) {
                if (data.success) {

                    //更新购物车里的特殊价格
                    if($scope.carts){
                        for (var i = 0; i < $scope.carts.length; i++) {
                            for (var j = 0; j < data.result.length; j++) {
                                if ($scope.carts[i].id == data.result[j].prodId) {
                                    $rootScope.updateSpecialPrice($scope.carts[i].id, data.result[j].price);
                                }
                            }
                        }
                    }


                    if(!reOrderItems){
                        $scope.selectItems = $scope.carts;
                    }

                    calculatedPrice();
                } else {
                    WarningBox(data.message);
                }
            }).catch(function (error) {
                if (error.code != 'NotAuthorized') {
                    ErrorBox('服务器内部错误');
                }
            });
        }
    }

    var orderID = 0;
    $scope.stepForward = function () {
        if ($scope.step == 1) {
            $scope.step++;
        }
        else if ($scope.step == 2) {

            //先查看是否有收货地址
            $httpService.get($hostService.orderApi + '/users/' + userId + '/addresses').then(function (data) {
                if (data.success) {
                    if (data.result.length > 0) {
                        var isExit = false;
                        if(data.result.length == 1){
                            $scope.address = data.result[0]
                            createOrder();
                        }else{
                            for(var i=0;i<data.result.length;i++){
                                if(data.result[i].primaryFlag == 1){
                                    $scope.address = data.result[i]
                                    isExit = true;
                                    break;
                                }
                            }
                            if(isExit){
                                createOrder();
                            }else{
                                WarningBox('请选择一个地址使用!');
                            }
                        }

                    } else {
                        WarningBox('请添加收货地址!');
                    }
                }
            }).catch(function (error) {
                if (error.code != 'NotAuthorized') {
                    ErrorBox('服务器内部错误');
                }
            });

            $scope.showPayLater = false;
            //判断是否有货到付款权限
            $httpService.get($hostService.bizApi +'/custs/'+userId+'/biz').then(function(data){
                if(data.success) {
                    if (data.success) {
                        if(data.result.supportPayLater == 1){
                            $scope.showPayLater = true;

                            //如果有货到付款的权限，则默认设置为选择货到付款
                            $("#paylater").attr("checked","checked");
                            document.getElementById("paylater-div").click();

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
        else if ($scope.step == 3) {

            $httpService.setCookie($httpService.NOW_ORDER_ID, orderID);
            $httpService.setCookie($httpService.NOW_ORDER_PRICE, $scope.total);

            paymentType = $('input[name="pay"]:checked').val();
            if (paymentType == 1) {
                //清空购物车
                $rootScope.clearCart();
                //跳转到支付宝
                window.location.href = "indexApp.html#/alipay?orderId="+orderID;
            } else {
                updatePay(paymentType)
            }
        }
        changeStepDes();
    }

    function updatePay(paymentType) {
        var params = {
            "orderStatus": 'confirmed',
            "statusMsg": '货到付款'
        }
        $httpService.post($hostService.orderApi + '/users/' + userId + '/orders/' + orderID + '/status', params).then(function (data) {
            if (data.success) {
                //货到付款
                InfoBox('您的订单已经被商家接受,请耐心等待!');
                $rootScope.clearCart();
                $rootScope.toHome();
            }
        }).catch(function (error) {
            if (error.code != 'NotAuthorized') {
                ErrorBox('服务器内部错误');
            }
        });
    }

    $scope.changeNum = function (p) {
        // p.num = p.num ? p.num : 1;
        // changeSelectNum(p.id, p.num);
        // calculatedPrice();
        // $rootScope.updateProductNum(p.id, p.num);
    }

    $scope.inputBlur = function (p) {
        p.num = p.num ? p.num : 1;
        if(p.num >200){
            p.num = 200;
            WarningBox('购买的最大数量为200');
        }
        changeSelectNum(p.id, p.num);
        calculatedPrice();
        $rootScope.updateProductNum(p.id, p.num);
        $rootScope.refreshCarts();
    };

    //创建订单
    function createOrder() {//$scope.selectItems

        var itemArr = [];
        for (var i = 0; i < $scope.selectItems.length; i++) {
            var price = 0.0;
            if ($scope.selectItems[i].specialPrice != -1 && $scope.selectItems[i].specialPrice != null) {
                price = $scope.selectItems[i].specialPrice;
            } else {
                price = $scope.selectItems[i].price
            }

            var p = {
                'productId': $scope.selectItems[i].id,
                'productName': $scope.selectItems[i].name,
                'quantity': $scope.selectItems[i].num,
                'unitPrice': price,
                productCode: $scope.selectItems[i].productCode,
                supplierId: $scope.selectItems[i].supplierId,
                supplierName: $scope.selectItems[i].supplierName,
                unitOfMeasure: $scope.selectItems[i].unitOfMeasure
            }
            itemArr.push(p);
        }
        if ($scope.subtotal < 38) {
            var p = {
                'productId': '0',
                'productName': 'shipping',
                'quantity': 1,
                'unitPrice': 0.01,
                productCode: '',
                supplierId: '',
                supplierName: ''
            }
            itemArr.push(p);
        }
        var bizName = $httpService.getCookie($httpService.BIZ_NAME);
        var params = {
            "orders": [
                {
                    "bizId": bizId,
                    'bizName': bizName,
                    "name": $scope.address.name,
                    "phone": $scope.address.phone,
                    "address": $scope.address.address,
                    "city": $scope.address.city,
                    "state": $scope.address.state,
                    "zipcode": "",
                    "note":($scope.note?$scope.note:""),
                    "items": itemArr
                }
            ]
        }
        $httpService.setHeader("auth-token", $httpService.getCookie($httpService.COMMON_AUTH_NAME));
        $httpService.post($hostService.orderApi + '/users/' + userId + '/orders', params).then(function (data) {
            if (data.result != null && data.result.length > 0) {
                if(data.result[0].success){
                    orderID = data.result[0].id;
                    $scope.step++;
                    changeStepDes();
                    InfoBox('创建订单成功!');
                }
            } else {
                console.log(data);
                WarningBox(data.msg);
            }
        }).catch(function (error) {
            if (error.code != 'NotAuthorized') {
                ErrorBox('服务器内部错误');
            }
        });
    }

    //添加新地址
    $scope.showAddress == false;
    $scope.addAddress = function () {
        $scope.showAddress = !$scope.showAddress;
    }

    //关闭添加新地址
    $scope.closeAddress = function () {
        $scope.showAddress = !$scope.showAddress;
    }

    //获取省市区地址
    $.getJSON('../service/address.json', function (data) {
        $scope.provinceArr = data;
        $scope.cityArr = data[0].city;
        $scope.areaArr = data[0].city[0].area;
        //查找当前用户地址
        getAddress()
    })

    //选择省之后,更新市
    $('#province').change(function (e) {
        var index = $(this).children('option:selected').val();
        $scope.cityArr = $scope.provinceArr[index].city;
        $scope.areaArr = $scope.cityArr[0].area;
        $scope.$apply('cityArr');
        $scope.$apply('areaArr');
    });


    $scope.changeProvince = function(province){
        for(var i=0;i<$scope.provinceArr.length;i++){
            if($scope.provinceArr[i].name == province){
                $scope.nowCityArr = $scope.provinceArr[i].city
                break;
            }
        }
    }

    //新增保存地址
    $scope.saveAddressClick = function () {

        if (!validatemobile($scope.newPhone)) {
            WarningBox("请输入有效的手机号码！");
            return;
        }
        var provinceIndex = $('#province').children('option:selected').val();
        var cityIndex = $('#city').children('option:selected').val();

        var params = {
            "addresses": [
                {
                    "address": $scope.newAddress,
                    "city": $scope.cityArr[cityIndex].name,
                    "phone": $scope.newPhone,
                    "name": $scope.newName,
                    "state": $scope.provinceArr[provinceIndex].name,
                    "zipcode": ''
                }
            ]
        }
        $httpService.post($hostService.orderApi + '/users/' + userId + '/addresses', params).then(function (data) {
            if (data.success) {
                $scope.showAddress = !$scope.showAddress;
                getAddress();
            }
        }).catch(function (error) {
            if (error.code != 'NotAuthorized') {
                ErrorBox('服务器内部错误');
            }
        });

    }

    //删除地址
    $scope.deleteAddressClick = function(addressId){
        var params = {
            "addresses": [
                {
                    "addressId": addressId
                }
            ]
        }
        $httpService.delete($hostService.orderApi + '/users/' + userId + '/addresses', {'data':params}).then(function (data) {
            if (data.success) {
                InfoBox('删除地址成功!');
                getAddress();
            }
        }).catch(function (error) {
            if (error.code != 'NotAuthorized') {
                ErrorBox('服务器内部错误');
            }
        });
    }

    $scope.editAddressClick = function(address){
        //先查看是否又修改了未保存的地址
        for(var i=0;i<$scope.addressArr.length;i++){
            if($scope.addressArr[i].edit == true){
                WarningBox("请先保存修改地址！");
                return;
            }
        }
        //查找当前省下的所有市
        for(var i=0;i<$scope.provinceArr.length;i++){
            if($scope.provinceArr[i].name == address.state){
                $scope.nowCityArr = $scope.provinceArr[i].city
                break;
            }
        }
        address.edit = !address.edit;
    }

    $scope.closeClick = function(address){
        getAddress()
        address.edit = !address.edit;
    }

    //设置默认地址
    $scope.useAddressClick = function(addressId){
        $httpService.post($hostService.orderApi + '/users/' + userId + '/addresses/'+addressId+'/primary', {}).then(function (data) {
            if (data.success) {
                InfoBox('使用成功!');
                getAddress();
            }
        }).catch(function (error) {
            if (error.code != 'NotAuthorized') {
                ErrorBox('服务器内部错误');
            }
        });
    }

    //判断手机号码是否有效
    function validatemobile(mobile) {
        var myreg = /^((1)+\d{10})$/;
        if (!myreg.test(mobile)) {
            return false;
        }
        return true;
    }

    //保存修改
    $scope.saveUpdateClick = function (address) {
        if(address.name == 'undefined' || address.name == null || address.name.length == 0){
            WarningBox("请输入收件人姓名");
            return;
        }
        if(address.address == 'undefined' || address.address == null || address.address.length == 0){
            WarningBox("请输入详细地址");
            return;
        }
        if (!validatemobile(address.phone)) {
            WarningBox("请输入有效的手机号码！");
            return;
        }
        var para = {
            "addresses": [
                {
                    "addressId": address.addressId,
                    "address": address.address,
                    "city": address.city,
                    "state": address.state,
                    "zipcode": "",
                    "phone": address.phone,
                    "name":address.name
                }
            ]
        }
        $httpService.put($hostService.orderApi + '/users/' + userId + '/addresses', para).then(function (data) {
            if (data.success) {
                InfoBox('修改地址成功!');
                getAddress();
            }
        }).catch(function (error) {
            if (error.code != 'NotAuthorized') {
                ErrorBox('服务器内部错误');
            }
        });
    }

    $scope.haveAddress = false
    function getAddress() {
        $httpService.get($hostService.orderApi + '/users/' + userId + '/addresses').then(function (data) {
            if (data.success) {
                for(var i=0;i<data.result.length;i++){
                    //在返回的数据里添加一个  是否为编辑状态的属性，默认为不是编辑状态
                    data.result[i].edit = false;
                }
                $scope.addressArr = data.result;
            }
        }).catch(function (error) {
            if (error.code != 'NotAuthorized') {
                ErrorBox('服务器内部错误');
            }
        });
    }

    //减号点击事件
    $scope.increaseClick = function (p) {
        // if (p.num == 1) {
        //     var index = 0;
        //     for (var i = 0; i < $scope.carts.length; i++) {
        //         var pp = $scope.carts[i];
        //         if (pp.id == p.id) {
        //             index = i;
        //         }
        //     }
        //     $scope.carts.splice(index, 1);
        //     $rootScope.prodRemove(p.id);
        //
        //     if ($scope.carts.length == 0) {
        //         $scope.haveProduct = 0;
        //     }
        // } else {
        //     p.num--;
        //     $rootScope.updateProductNum(p.id, p.num);
        // }
        if(p.num >1){
            p.num--;
            $rootScope.updateProductNum(p.id, p.num);
            changeSelectNum(p.id, p.num);
            calculatedPrice();
            $rootScope.refreshCarts();
        }
    }
    //加号点击事件
    $scope.plusClick = function (p) {
        p.num++;
        $rootScope.updateProductNum(p.id, p.num);
        changeSelectNum(p.id, p.num);
        calculatedPrice();
        $rootScope.refreshCarts();
    }
    //删除一个品相
    $scope.deleteItem = function (p) {
        $rootScope.prodRemove(p.id);
        // getAllSelect();
        // var index = $.inArray(p, $scope.selectItems);
        // $scope.selectItems.splice(parseInt(index), 1);
            deleteSelect(p);
            // getAllSelect();
            calculatedPrice();
        if ($scope.carts.length == 0) {
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
        for (var i = 0; i < $scope.selectItems.length; i++) {
            if ($scope.selectItems[i].specialPrice != -1 && $scope.selectItems[i].specialPrice != null) {
                totalPrice += ($scope.selectItems[i].specialPrice * $scope.selectItems[i].num);
            } else {
                totalPrice += ($scope.selectItems[i].price * $scope.selectItems[i].num);
            }
        }
        $scope.subtotal = totalPrice.toFixed(2);
        if (totalPrice >= 38) {
            $scope.freight = 0;
        } else if(totalPrice > 0) {
            $scope.freight = 10;
        } else {
            $scope.freight = 0;
        }
        $scope.total = (totalPrice + $scope.freight).toFixed(2);
    }

    calculatedPrice();

    $scope.goShopping = function () {
        $rootScope.toHome();
    }

    //百度搜索资源平台主动推送链接
    baiduLinkSubmit();
    $(function () {
        setPageTitle('购物车','','');
    })
}]);