app.factory('L',['$translate', function($translate){
    var L = {
        L:function(key) {
            if(key){
                return $translate.instant(key);
            }
            return key;
        }
    }
    return L;
}]);