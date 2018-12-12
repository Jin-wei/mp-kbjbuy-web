/**
 * Created by BaiBin on 16/8/18.
 */
app.controller('commentController', ['$scope','$rootScope','$location','$anchorScroll','$httpService','$hostService', function($scope,$rootScope,$location,$anchorScroll,$httpService,$hostService) {
    var orderId = $location.search().orderId;
    var userId = $httpService.getCookie($httpService.USER_ID);
    initHeaer();
    $httpService.get($hostService.orderApi+'/users/' + userId + '/orderitems?orderId='+orderId).then(function(data){
        if(data.success){
            $scope.orderItems = [];
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
    });

    function getImg(orderItem){
        $httpService.get($hostService.productApi+'/biz/0/prods/'+orderItem.productId).then(function(data){
            if(data.result) {
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


    $scope.max = 5;
    $scope.readonly = false;

    $scope.submitCommentClick = function(){
        var commets = [];
        var userName = $httpService.getCookie($httpService.USER_NAME);
        var city = $httpService.getCookie($httpService.CITY);
        for (var i = 0; i < $scope.orderItems.length;i++){
           var starId = 'star'+i;
            var textareaId = 'textarea'+i;
            var rating = parseInt($('#'+starId).html());
            var comment = $('#'+textareaId).val();
            var productId = $scope.orderItems[i].productId
            var city = $httpService.getCookie($httpService.CITY);
            if(city == null){
                city = '';
            }
            var a = {
                'prodId':productId,
                'comment':comment,
                'rating':rating,
                'userName':userName,
                'active':1,
                'city':city
            }
            commets.push(a)
        }
        $httpService.post($hostService.productApi+'/biz/0/prodComments',{'prodComments':commets}).then(function(data){
            if(data.success){
                InfoBox('感谢您的评论');
                /*history.go(-1);
                location.reload();*/
                window.history.go(-1);
            }else{
                WarningBox(data.msg);
            }
        }).catch(function(error){
            if (error.code != 'NotAuthorized') {
                ErrorBox('服务器内部错误');
            }
        });
    }

    //百度搜索资源平台主动推送链接
    baiduLinkSubmit();
}]);