/**
 * Created by BaiBin on 16/8/17.
 */
app.controller('myOrdersController', ['$rootScope','$scope','$location','$httpService','$hostService','$filter', function($rootScope,$scope,$location,$httpService,$hostService,$filter) {
    initHeaer();
    var userId = $httpService.getCookie($httpService.USER_ID);
    if(userId == null || userId.length == 0){
       /* window.location.href = '/login?whereCome=my_orders';*/
        var isLoginReturn=configLogin($filter,'my_orders');
        if(isLoginReturn){
            return;
        }
    }

    //获取所有的订单状态
    $scope.statusArr = [];
    var statusArr = [];
    $httpService.get($hostService.orderApi+'/orderstatus').then(function(data){
        if(data.success) {
            $scope.statusArr.push('全部')
            for (var i =0;i <data.result.length; i++){
                var status = data.result[i];
                if(status == 'pending'){
                    $scope.statusArr.push('未付款');
                    statusArr.push(status);
                }else if(status == 'payed'){
                    $scope.statusArr.push('已付款');
                    statusArr.push(status);
                }else if(status == 'completed'){
                    $scope.statusArr.push('已完成');
                    statusArr.push(status);
                }else if(status == 'canceled'){
                    $scope.statusArr.push('取消');
                    statusArr.push(status);
                }
            }
            statusArr = statusArr;
            window.setTimeout(function(){
                changeActive();
            },100);
        } else {
            WarningBox(data.msg);
        }
    }).catch(function(error){
        if (error.code != 'NotAuthorized') {
            ErrorBox('服务器内部错误');
        }
    });

    var nowStatus = '';
    $scope.statusClick = function(index){
        if(index > 0){
            nowStatus = statusArr[index-1];
        }else{
            nowStatus = '';
        }
        getOrder();
    }

    function changeActive(){
        var li = $('#myTabs li');
        for(i=0;i<li.length;i++){
            li[i].onclick=function(){
                for(j=0;j<li.length;j++){
                    li[j].className="";
                }
                this.className="active";
            }
        }
    }

    var userId = $httpService.getCookie($httpService.USER_ID);
    var nowOrders = [];
    var start = 0;
    var size = 10;
    var isHaveNext = false;
    //第一页,设置上一页按钮不可用
    $('#preBtn').attr('disabled',true);
    getOrder();

    function  getOrder(){
        var url = $hostService.orderApi+'/users/' + userId + '/orders?start='+start+'&size=' + (size+1);
        if (nowStatus != null && nowStatus.length > 0){
            url += '&status='+nowStatus;
        }
        $httpService.get(url).then(function(data){
            if(data) {
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

                nowOrders.splice(0,nowOrders.length);
                nowOrders = data.result.slice(0,size);
                for (var i = 0 ; i < nowOrders.length; i++){
                    if (i == 0){
                        getOrderItem(nowOrders[0].orderId);
                    }
                    nowOrders[i].createdOn = new Date(nowOrders[i].createdOn).toLocaleString();
                    $scope.orders = nowOrders;
                }
            } else {
                WarningBox(data.msg);
            }
        }).catch(function(error){
            if(error.code != 'NotAuthorized'){
                ErrorBox('服务器内部错误');
            }
        });
    }

    //取消订单
    $scope.cancleOrderClick = function(orderId) {
        var para = {
            "orders": [
                {
                    "orderId": orderId,
                    "orderStatus": "canceled"
                }
            ]
        }
        //changeOrderStatus(para);
    }
    //确认收货  目前确认收货 是将每一个orderItem的状态更新一下
    $scope.confirmReceiptClick = function(orderId){
        var para = {
            "orderStatus": "completed",
            "statusMsg": ""
        }
        changeOrderStatus(para,orderId);
        for(var i=0;i<$scope.orderItems.length;i++){
            var itemId = $scope.orderItems[i].itemId
            changeOrderItemStatus(itemId,i);
        }
    }
    function changeOrderItemStatus(itemId,index){
        var url = $hostService.orderApi + '/users/'+userId+'/orderitems/'+itemId+'/status';
        var params = {'status':'received'}
        $httpService.post(url,params).then(function(data){
            if(data.success) {
                $scope.orderItems[index].status = 'received';
            } else {
                WarningBox(data.msg);
            }
        }).catch(function(error){
            if(error.code != 'NotAuthorized'){
                ErrorBox('服务器内部错误');
            }
        });
    }

    //改变订单状态
    function changeOrderStatus(para,orderId){
        $httpService.post($hostService.orderApi+'/users/'+userId+'/orders/'+orderId+'/status',para).then(function(data){
            if(data.success) {
                getOrder();
                InfoBox('您已确认收货,订单已完成!');
            } else {
                WarningBox(data.msg);
            }
        }).catch(function(error){
            if (error.code != 'NotAuthorized') {
                ErrorBox('服务器内部错误');
            }
        });
    }

    //点击订单详情
    $scope.orderDetailClick = function(orderId) {
        getOrderItem(orderId)
    }

    function getOrderItem(orderId){
        $httpService.get($hostService.orderApi+'/users/' + userId + '/orderitems?orderId='+orderId).then(function(data){
            if(data.success){
                $scope.orderItems=[]
                //$scope.orderItems = data.result;
                for(var i=0;i<data.result.length;i++){
                    if(data.result[i].productId == 0){
                        continue;
                    }
                    $scope.orderItems.push(data.result[i]);
                }
                //获取orderItem图片
                for(var i=0;i<$scope.orderItems.length;i++){
                    getImg($scope.orderItems[i]);
                }
            }else {
                WarningBox(data.msg);
            }
        }).catch(function(error){
            if (error.code != 'NotAuthorized') {
                ErrorBox('服务器内部错误');
            }
        });;
    }
    function getImg(orderItem){
        $httpService.get($hostService.productApi+'/biz/0/prods/'+orderItem.productId).then(function(data){
            if(data) {
                var smallImgUrl = $rootScope.staticContentURL+'/'+$rootScope.tenant+'/assets/images/prodDefault240.jpg';
                if(data.result.imgUrl != null){
                    smallImgUrl = $hostService.imageApi+'/sizes/s/imageSets/'+data.result.imgUrl;
                }
                orderItem.imgUrl = smallImgUrl;
            } else {
                //WarningBox(data.msg);
            }
        }).catch(function(error){
            if (error.code != 'NotAuthorized') {
                ErrorBox('服务器内部错误');
            }
        });
    }

    //取消订单
    $scope.cancleClick = function(orderId){
        var params = {
            "orderStatus": "canceled",
            "statusMsg": ""
        }
        $httpService.post($hostService.orderApi+'/users/' + userId + '/orders/'+orderId+'/status',params).then(function(data){
            if(data.success){
                InfoBox('取消订单成功!');
            }else {
                WarningBox(data.msg);
            }
        }).catch(function(error){
            if (error.code != 'NotAuthorized') {
                ErrorBox('服务器内部错误');
            }
        });
    }

    $scope.payClick = function(orderId){
        window.location.href = "indexApp.html#/alipay?orderId="+orderId;
    }

    $scope.reOrderClick = function (reOrderItems) {
        window.location.href = "indexApp.html#/orderInfo?reOrderItems="+JSON.stringify(reOrderItems);
       /* toOrderInfo($filter,'?reOrderItems='+JSON.stringify(reOrderItems));*/
    };

    //上一页
    $scope.previousPageClick = function(){
        if(start >= size){
            start -= size;
            getOrder();
        }
    }

    //下一页
    $scope.nextPageClick = function(){
        if (isHaveNext){
            start += size;
            getOrder();
        }
    }
    //评论
    $scope.commentClick = function(orderId){
        window.location.href = 'indexApp.html#/comment?orderId='+orderId;
    }

    $scope.goto = function(id){
        $location.hash(id);
        $anchorScroll();
    }

    $(function () {
        setPageTitle('订单详情','','');
    })
}]);



