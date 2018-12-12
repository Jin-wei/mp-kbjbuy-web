app.controller('tvController', ['$rootScope','$scope','$location','$httpService','$hostService','$filter',
    function($rootScope,$scope,$location,$httpService,$hostService,$filter) {
        $scope.products = [];
        $scope.product="";
        $scope.imageDes = $hostService.imageApi+'/images/';
        var IMAGE_TYPE_DESCRIPTION = 'description';
        //获取商品列表
        $scope.productRequest = function() {
            var url = $hostService.productApi+'/prods';
            $httpService.get(url).then(function(data){
                if (data.success) {
                    $scope.products = data.result;
                    window.setTimeout(function(){
                        $('#productSelect').val($scope.products[0].prodId);
                        $scope.getProductDetail()
                    },200);
                }else{
                    $scope.products = [];
                }
            }).catch(function(data){
                ErrorBox('服务器内部错误');
            });
        }


        //商品详情
        $scope.getProductDetail=function(){
            $scope.imgData=[];
            var product=$('#productSelect').val();
            var url=$hostService.productApi+'/biz/0/prods/'+product;
            if(product!=''){
                $httpService.get(url).then(function(data){
                    if(data.success) {
                        for(var i in data.result.images){
                            var image = data.result.images[i];
                           if(image.img_type == IMAGE_TYPE_DESCRIPTION){
                                $scope.imgData.push(data.result.images[i])
                            }
                        }
                    } else {
                        WarningBox(data.msg);
                    }
                }).catch(function(error){
                    ErrorBox('服务器内部错误');
                });
            }
        }
        $scope.productRequest();

        $(function () {
            setPageTitle('','','');
        })

    }]);