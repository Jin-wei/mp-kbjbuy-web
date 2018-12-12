var tenant = getTenant();
app.config(['$routeProvider','$locationProvider', function($routeProvider,$locationProvider) {
    /*$locationProvider.html5Mode(true);*/
    $routeProvider
        .when('/', {
            templateUrl:'../indexApp.html',
            controller:'homeController'
        })
        .when('/home', {
            templateUrl:'../view/home.html',
            controller:'homeController'
        })
        .when('/login', {
            templateUrl:'../view/login-new.html',
            controller:'loginController'
        })
        .when('/register', {
            templateUrl:'../view/register.html',
            controller:'registerController'
        })
        .when('/forgottenPassword', {
            templateUrl:'../view/forgotten-password.html',
            controller:'forgottenPasswordController'
        })
        .when('/changePhone', {
            templateUrl:'../view/change-phone.html',
            controller:'changePhoneController'
        })
        .when('/product_filter', {
            templateUrl:'../view/product-filter-grid.html',
            controller:'productFilterController'
        })
        .when('/product_filter/:typeId/type/:type', {
            templateUrl:'../view/product-filter-grid.html',
            controller:'productFilterController'
        })
        .when('/product_filter_list', {
            templateUrl:'../view/product-filter-list.html',
            controller:'productFilterController'
        })
        .when('/product_filter_list/:typeId/type/:type', {
            templateUrl:'../view/product-filter-list.html',
            controller:'productFilterController'
        })
        .when('/product',{
           templateUrl:'../view/product-detail.html',
           controller: 'productDetailController'
         })
        .when('/product/:productId/bizId/:bizId',{
            templateUrl:'../view/product-detail.html',
            controller: 'productDetailController'
        })
        .when('/shoppingcart',{
            templateUrl:'../view/shoppingcart.html',
            controller: 'shoppingcartController'
        })
        .when('/orderInfo',{
            templateUrl:'../view/orderInfo.html',
            controller: 'orderInfoController'
        })
        .when('/order_address',{
            templateUrl:'../view/order-address.html',
            controller: 'orderAddressController'
        })
        .when('/order_pay',{
            templateUrl:'../view/order-pay.html',
            controller: 'orderPayController'
        }).when('/my_orders',{
            templateUrl:'../view/my-orders.html',
            controller: 'myOrdersController'
        }).when('/my_collections',{
            templateUrl:'../view/my-collection.html',
            controller: 'myCollectionController'
        }).when('/comment',{
            templateUrl:'../view/comment.html',
            controller: 'commentController'
        })
        .when('/alipay',{
            templateUrl:'../view/alipay.html',
            controller: 'alipayController'
        }).when('/logistics_tracking',{
            templateUrl:'../view/logistics-tracking.html',
            controller: 'logisticTrackingController'
        }).when('/aboutUs',{
            templateUrl:'../view/about-us.html',
            controller: 'aboutUsController'
        }).when('/pay_success',{
            templateUrl:'../view/pay-success.html',
            controller: 'paySuccessController'
        }).when('/serviceRegulation',{
            templateUrl:'../view/service-regulation.html',
            controller: 'serviceRegulationController'
        }).when('/register_protocol',{
            templateUrl:'../view/service-regulation.html',
            controller: 'serviceRegulationController'
        }).when('/user_register_guide',{
            templateUrl:'../view/footer/user-register.html',
            controller: 'serviceRegulationController'
        }).when('/purchase_guide',{
            templateUrl:'../view/footer/purchase-process.html',
            controller: 'serviceRegulationController'
        }).when('/online_payment_guide',{
            templateUrl:'../view/footer/online-payment.html',
            controller: 'serviceRegulationController'
        }).when('/cod_guide',{
            templateUrl:'../view/footer/cod.html',
            controller: 'serviceRegulationController'
        }).when('/distribution_notice_guide',{
            templateUrl:'../view/footer/distribution-notice.html',
            controller: 'serviceRegulationController'
        }).when('/distribution_range_guide',{
            templateUrl:'../view/footer/distribution-range.html',
            controller: 'serviceRegulationController'
        }).when('/server_info_guide',{
            templateUrl:'../view/footer/service-info.html',
            controller: 'serviceRegulationController'
        }).when('/server_detail_guide',{
            templateUrl:'../view/footer/service-detail.html',
            controller: 'serviceRegulationController'
        }).when('/biz_settled_guide',{
            templateUrl:'../view/footer/biz-settled.html',
            controller: 'serviceRegulationController'
        }).when('/contact_us_guide',{
            templateUrl:'../view/footer/contact-us.html',
            controller: 'serviceRegulationController'
        }).when('/registration_agreement',{
            templateUrl:'../view/registration-agreement.html',
            controller: 'serviceRegulationController'
        }).when('/email_active',{
            templateUrl:'../view/email.html',
            controller: 'emailController'
        }).when('/my_prodList',{
            templateUrl:'../view/my-prodList.html',
            controller: 'myProdListController'
        }).when('/personal_center',{
            templateUrl:'../view/personal_center.html',
            controller: 'personalCenterController'
        })
        .when('/tv',{
            templateUrl:'../view/TV.html',
            controller: 'tvController'
        })
        .when('/home2', {
            templateUrl:'../view/home2.html',
            controller:'home2Controller'
        })
        .when('/orderInfo2',{
            templateUrl:'../view/orderInfo2.html',
            controller: 'orderInfo2Controller'
        })
        .when('/setCookie',{
            templateUrl:'../view/setCookie.html',
            controller: 'setCookieController'
        })
        .when('/cityPartner',{
            templateUrl:'../view/city-partner.html',
            controller: 'serviceRegulationController'
        })
        .when('/supplierRecruitment',{
            templateUrl:'../view/supplier-recruitment.html',
            controller: 'serviceRegulationController'
        })
        .otherwise({
            templateUrl: '/view/NotFound.html'
        });
}]);
