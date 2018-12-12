/**
 * Created by ling xue on 2016/3/21.
 */

app.controller("alipayController",['$scope','$rootScope','$httpService','$location','$hostService', function($scope,$rootScope,$httpService,$location,$hostService) {
    $scope.paymentInfo = "正在跳转到支付宝";
    var orderId = $location.search().orderId;
    var paymentType = $location.search().paymentType;
    initHeaer();
    var param ={
        "payments": [
            {
                "orderId": orderId,
                "paymentType": paymentType,
            }
        ]
    }

    //$httpService.post($hostService.orderApi + '/order/' + orderId + '/alipay',param).then(function (data) {
    //    if (data) {
    //        document.write(data);
    //    } else {
    //        WarningBox(data.msg);
    //    }
    //}).catch(function (error) {
    //    ErrorBox('服务器内部错误');
    //});
    $httpService.get('/api/order/'+orderId+'/alipay').then(function (data) {
        if (data.success) {
            document.write(data.html);
        } else {
            WarningBox(data.msg);
        }
    }).catch(function (error) {
        if (error.code != 'NotAuthorized') {
            ErrorBox('服务器内部错误');
        }
    });
}]);