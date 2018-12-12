/**
 * Created by BaiBin on 16/6/30.
 */
app.controller('shoppingcartController',['$scope','$rootScope','$httpService','$hostService','$filter', function($scope,$rootScope,$httpService,$hostService,$filter) {

    $rootScope.headerSearch = 1;
    $rootScope.headerNav = 1;
    initHeaer();
    //var a = 1;
    $scope.clickAllSelected = function(){

        //if(a == 1){
        //    $("[name='productBox']").attr("checked",'true');//全选
        //    a = 2;
        //}else{
        //    $("[name='productBox']").removeAttr("checked");
        //    a = 1;
        //}

        if($("#selectAll").attr("checked")){
            $("[name='productBox']").removeAttr("checked");
        }else{
            $("[name='productBox']").attr("checked",'true');//全选
        }
    }

    $scope.goPay = function(){
        var userId = $httpService.getCookie($httpService.USER_ID);
        var params = {
            "orderId":1,
            "bizId":1,
            "userId": userId,
            "orderAmount": 500,
            "orderQuantity": 5,
            "items": [
                {
                    "id":1,
                    "orderId":1,
                    "productId": 4,
                    "productName": "咖啡豆",
                    "amount": 50,
                    "quantity": 2,
                    "unitPrice": 25
                }
            ]
        };

        $httpService.post($hostService.orderApi+'/user/' + userId + '/order',params).then(function(data){
            if(data.success) {
                InfoBox('创建订单成功!');
                /*toOrderInfo($filter);*/
                window.location.href = "indexApp.html#/orderInfo";
            } else {
                console.log(data);
                WarningBox(data.message);
            }
        }).catch(function(error){
            if (error.code != 'NotAuthorized') {
                ErrorBox('服务器内部错误');
            }
        });
    };

    //百度搜索资源平台主动推送链接
    baiduLinkSubmit();
}]);