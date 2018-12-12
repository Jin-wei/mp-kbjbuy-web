/**
 * Created by BaiBin on 16/10/24.
 */
app.controller("serviceRegulationController",['$scope','$rootScope','$httpService','$location','$hostService', '$filter' ,function($scope,$rootScope,$httpService,$location,$hostService,$filter) {
    //百度搜索资源平台主动推送链接
    baiduLinkSubmit();

    $(function () {
        var currentTitle='';
        var currentPath=$location.url();
        if(currentPath=='/user_register_guide'){
            currentTitle='用户注册_';
        }else if(currentPath=='/purchase_guide'){
            currentTitle='购买流程_';
        }else if(currentPath=='/serviceRegulation'){
            currentTitle='使用规则_';
        }else if(currentPath=='/online_payment_guide'){
            currentTitle='在线支付_';
        }else if(currentPath=='/cod_guide'){
            currentTitle='货到付款_';
        }else if(currentPath=='/distribution_notice_guide'){
            currentTitle='配送须知_';
        }else if(currentPath=='/distribution_range_guide'){
            currentTitle='配送范围_';
        }else if(currentPath=='/server_info_guide'){
            currentTitle='服务说明_';
        }else if(currentPath=='/server_detail_guide'){
            currentTitle='服务细则_';
        }else if(currentPath=='/biz_settled_guide'){
            currentTitle='商家入驻_';
        }else if(currentPath=='/contact_us_guide'){
            currentTitle='联系我们_';
        }else if(currentPath=='/cityPartner'){
            currentTitle='城市合伙人_';
        }else if(currentPath=='/supplierRecruitment'){
            currentTitle='供应商入驻_';
        }
        setPageTitle(currentTitle,'','');
    })
}]);