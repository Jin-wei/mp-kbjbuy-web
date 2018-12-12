app.factory('sharedData',function (){

    //存储nca orderInfo
    var _saveOrderInfo = function (data) {
        localStorage.setItem("orderInfo","'"+JSON.stringify(data));
    }

    var _getOrderInfo = function () {
        var  orderInfo=localStorage.getItem("orderInfo");
        var orderJson=null;
        if(orderInfo){
           orderJson=JSON.parse(orderInfo.substr(1, orderInfo.length));
        }
        return orderJson ? orderJson : null;
    }

    var _saveZyUser = function (data) {
        $.cookie('ZyUser',data);
    }

    var _getZyUser  = function () {
        return $.cookie('ZyUser')? $.cookie('ZyUser') : null;
    }

    //存储chart
    var _saveCarts = function (data) {
        sessionStorage.Carts = JSON.stringify(data);
    }

    var _getCarts = function () {
        return sessionStorage.Carts ? JSON.parse(sessionStorage.Carts) : null;
    }

    //清理session
    var _clearOrderData = function () {
        sessionStorage.clear();
    }

    return {
        saveOrderInfo: _saveOrderInfo,
        getOrderInfo: _getOrderInfo,
        clearOrderData: _clearOrderData,
        saveCarts:_saveCarts,
        getCarts:_getCarts,
        saveZyUser:_saveZyUser,
        getZyUser:_getZyUser
    }
})