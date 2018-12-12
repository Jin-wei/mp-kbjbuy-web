/**
 * Created by BaiBin on 16/7/7.
 */


app.directive('header', function() {
    return {
        templateUrl: '../view/header.html',
        replace: true,
        transclude: false,
        restrict: 'E',
        controller: 'headerController'
    };
});

app.directive('header2', function() {
    return {
        templateUrl: '../view/header2.html',
        replace: true,
        transclude: false,
        restrict: 'E',
        controller: 'headerController'
    };
});

app.directive('headerJjc', function() {
    return {
        templateUrl: '../view/header-jjc.html',
        replace: true,
        transclude: false,
        restrict: 'E',
        controller: 'headerController'
    };
});
app.directive('setCookie', function() {
    return {
        templateUrl: '../view/setCookie.html',
        replace: true,
        transclude: false,
        restrict: 'E',
        controller: 'setCookieController'
    };
});



app.directive('footer', function() {
    return {
        templateUrl: '/view/footer.html',
        replace: true,
        transclude: false,
        restrict: 'E',
        link: function($scope, $element,$httpService,$rootScope){

        }
    };
});

app.directive('home2', function() {
    return {
        templateUrl: '../view/home2.html',
        replace: true,
        transclude: false,
        restrict: 'E',
        controller: 'home2Controller'
    };
});

app.directive('headerSearch', function() {
    return {
        templateUrl: '/view/header-search.html',
        replace: true,
        transclude: false,
        restrict: 'E',
        link: function($scope, $element,$httpService,$rootScope){
            $scope.clickShoppingcart = function(){
                window.location.href='/orderInfo';
            }
        }
    };
});

app.directive('headerNav', function() {
    return {
        templateUrl: '/view/header-nav.html',
        replace: true,
        transclude: false,
        restrict: 'E',
        link: function($scope, $element,$httpService,$rootScope){
            $(document).ready(function () {
                $('#leftView > li').click(function (e) {
                    e.preventDefault();
                    $('ul.nav > li').removeClass('active');
                    $(this).addClass('active');
                });
            });
        }
    };
});

app.directive("owlCarousel", function() {
    return {
        restrict: 'E',
        transclude: false,
        link: function (scope) {
            scope.initCarousel = function(element) {
                // provide any default options you want
                var defaultOptions = {
                };
                var customOptions = scope.$eval($(element).attr('data-options'));
                // combine the two options objects
                for(var key in customOptions) {
                    defaultOptions[key] = customOptions[key];
                }
                // init carousel
                $(element).owlCarousel(defaultOptions);

                // Custom Navigation Events
                jQuery(".next").click(function(){
                    $(element).trigger('owl.next');
                })
                jQuery(".prev").click(function(){
                    $(element).trigger('owl.prev');
                })
            };
        }
    };
})

app.directive('owlCarouselItem', [function() {
    return {
        restrict: 'A',
        transclude: false,
        link: function(scope, element) {
            // wait for the last item in the ng-repeat then call init
            if(scope.$last) {
                scope.initCarousel(element.parent());
            }
        }
    };
}]);

//app.directive('star', [function() {
//    return {
//        restrict: 'EA',
//        templateUrl: '../view/star.html',
//        scope:{
//            score:"="
//        },
//        transclude: false,
//        link: function($scope, $element) {
//
//        }
//    };
//}]);

/**
 * @Author : Ken
 * @Date : 2014-07-04
 * @directive name : starrating
 * @attributes:
 *   max        : the max of rating
 *   rating     : the rating
 *   starspace  : the space of every star
 * @example
 * [example 1]
 *   <starrating style="color:green;font-size:20px;" rating="3.5" starspace="3"></starrating>
 * */
app.directive('starrating',function() {
    return {
        restrict: "E",
        scope: false,
        replace: false,
        template: '<ul class="list-inline product-ratings"></ul>',
        link: function($scope,element,attrs) {

            var ul = element.children()[0];
            var max = attrs.max ? attrs.max : 5;
            attrs.$observe('rating',function(value){
                var rating = attrs.rating ? attrs.rating : 0;
                if(rating-parseInt(rating)<0.5)
                    rating = parseInt(rating);
                else
                    rating = parseInt(rating)+0.5;
                var starspace = attrs.starspace ? attrs.starspace : 2;
                var content = '';
                for(var i=1;i<=max;i++) {
                    var className = 'rating fa fa-star';
                    if(rating-i>=0) {
                        className = 'rating-selected fa fa-star';
                    }
                    content += '<li class="'+className+'" style="padding: 0px '+starspace+'px"></li>';
                }
                ul.innerHTML = (content);
            });
        }
    };
});

app.directive('star', function () {
    return {
        template: '<ul class="rating" ng-mouseleave="leave()">' +
        '<li ng-repeat="star in stars" class="rating fa fa-star" ng-class="star" ng-click="click($index + 1)" ng-mouseover="over($index + 1)">' +
        '</li>' +
        '</ul>',
        scope: {
            ratingValue: '=',
            max: '=',
            readonly: '@',
            onHover: '=',
            onLeave: '='
        },
        controller: function($scope){
            $scope.ratingValue = $scope.ratingValue || 0;
            $scope.max = $scope.max || 5;
            $scope.click = function(val){
                if ($scope.readonly && $scope.readonly === 'true') {
                    return;
                }
                $scope.ratingValue = val;
            };
            $scope.over = function(val){
                //$scope.onHover(val);
            };
            $scope.leave = function(){
                //$scope.onLeave();
            }
        },
        link: function (scope, elem, attrs) {
            elem.css("text-align", "center");
            var updateStars = function () {
                scope.stars = [];
                for (var i = 0; i < scope.max; i++) {
                    scope.stars.push({
                        filled: i < scope.ratingValue
                    });
                }
            };
            updateStars();

            scope.$watch('ratingValue', function (oldVal, newVal) {
                //if (newVal) {
                    updateStars();
                //}
            });
            scope.$watch('max', function (oldVal, newVal) {
                //if (newVal) {
                    updateStars();
                //}
            });
        }
    };
});


app.directive("starratingeditor", function () {
    return {
        restrict: 'E',
        require: '?ngModel',
        replace: false,
        template: '<ul style="margin:0px 0px 0px 5px"></ul>',
        scope: {
            model: '=ngModel'
        },
        link:function (scope,element,attrs,ngModel) {
            var ul = angular.element(element.children()[0]);
            if(!attrs.max) {
                attrs.max = 5;
            }
            var max = attrs.max;
            //calculate the class of star
            scope.starClass = function(rating) {
                var className = 'rating fa fa-star';
                if(scope.ratingSelected>=rating && scope.ratingOver==0 || scope.ratingOver>=rating)
                    className = 'rating-selected fa fa-star';
                else if(scope.ratingSelected>=rating && scope.ratingOver<rating)
                    className = 'rating-selected fa fa-star';
                return className;
            };
            attrs.$observe('max',function(value){
                var max = value;
                var starspace = attrs.starspace ? attrs.starspace : 2;
                var liContent = '';
                for(var i=0;i<max;++i){
                    liContent += '<li class="rating fa fa-star" rating="'+(i+1)+'" style="padding: 0px '+starspace+'px"></li>';
                }
                ul.html(liContent);
                var liArray = ul.children();
                liArray.on('mouseleave',function(){
                    scope.$apply(function(){
                        scope.ratingOver = 0;
                        ngModel.$modelValue.ratingOver = 0;
                    });
                });
                liArray.on('mouseenter',function(){
                    var rating = angular.element(this).attr('rating');
                    scope.$apply(function(){
                        scope.ratingOver = rating;
                        ngModel.$modelValue.ratingOver = rating;
                    });
                });
                function updateClass() {
                    liArray.removeClass();
                    for(var i=0;i<liArray.length;++i) {
                        angular.element(liArray[i]).addClass(scope.starClass(i+1));
                    }
                }
                liArray.on('click',function(){
                    var rating = angular.element(this).attr('rating');
                    updateClass();
                    scope.$apply(function(){
                        scope.ratingSelected = rating;
                        ngModel.$modelValue.rating = rating;
                    });
                });
                scope.$watch('ratingOver',function(to,from){
                    updateClass();
                });
                scope.$watch('model.rating',function(rating){
                    scope.ratingSelected = rating;
                    updateClass();
                });
            });
        }
    };
});

//微信分享
app.directive("mpWeChatShare", ['$rootScope','$location',function ($rootScope, $location) {
    var dialog_html = '\
        <div id="js-wechat-share" style="display:none;position: fixed;top:130px;width:312px;height:310px;border:1px solid grey;background-color: #eee;z-index:100;border-radius: 10px;box-shadow: 0px -1px 10px 2px #e4e4e4;">\
            <div class="col-xs-12 mp-dialog-header" style="border:0px solid green;">\
                <div class="col-xs-12 pull-right close" style="height:30px;width:30px;" onclick="$(\'#js-wechat-share\').hide()">\
                \<i class="glyphicon glyphicon-remove"></i>\
                </div>\
            </div>\
            <div class="col-xs-12 mp-dialog-content mp-clear text-center" style="border:0px solid green;padding:5px;">\
                <div class="qrcode"></div>\
                <div class="bigger-130" style="margin:5px 0px">打开微信，点击底部的“发现”，使用 “扫一扫” 即可将网页分享到我的朋友圈</div>\
            </div>\
        </div>\
        ';

    $('body').append(dialog_html);

    var dialog = $('#js-wechat-share');
    return {
        restrict: 'E',
        link:function(scope,element,attrs) {
            var qrcode = $('#js-wechat-share .qrcode');
            qrcode.html('');
            qrcode.qrcode({width:200,height:200,text:$location.absUrl()});

            element.on('click',function(){
                var rect = GetCenterPosition(dialog);
                dialog.css('left',rect.left+'px');
                dialog.show();
            });
        }
    };
}]);