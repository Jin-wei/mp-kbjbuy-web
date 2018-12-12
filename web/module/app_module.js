var app = angular.module("app_module", ['ngRoute','scroll-trigger','pascalprecht.translate']);
app.config(['$httpProvider','ScrollTriggerProvider','$translateProvider',
    function($httpProvider,ScrollTriggerProvider,$translateProvider) {
    $httpProvider.defaults.headers.common["auth-token"] = $.cookie("auth-token");
    ScrollTriggerProvider.offset(200);

   /*var tenant = getTenant();
   var staticContentURL=sys_config.staticContent.url;

    //i18n
   $translateProvider.useStaticFilesLoader({
        prefix: staticContentURL+'/i18n/',
        suffix: '.json'
    });

    $translateProvider.preferredLanguage('zh-'+tenant);*/

}]);