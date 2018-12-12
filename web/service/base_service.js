function _BaseBox(boxClass,iconClass,msg,setting) {
    setting = setting || {};
    var box = $('<div class="col-xs-12" style="">');

    var content = '';
    content += '<button type="button" class="close" data-dismiss="alert"><i class="fa fa-remove fa-2x"></i></button>';
    content += '<strong style="position: absolute;margin-top: -2px;"><i class="'+iconClass+'"></i></strong>';
    content += '<span style="display:inline-block;max-width:500px;margin:0px 0px 0px 35px;font-size: 18px;">';
    content += msg;
    content += '</span>';

    box.html(content);
    $(document).find('body').append(box);

    box.addClass(boxClass);
    box.css({position:'fixed','z-index':9999,display:'none',top:'0px'});
    //var rect = GetBoxPosition(box);
    //console.log(rect);
    //box.css(rect);
    box.fadeIn(500);

    var timeout = 3000;
    if(setting.timeout)
        timeout = setting.timeout;

    box.children('.close').click(function(){
        if(this && this.parentNode) {
            box[0].outerHTML = ''
        }
    });

    if(!setting.stick) {
        if(timeout>0) {
            setTimeout(function(){
                box.fadeOut(1000,function(){
                    if(this.parentNode)
                        this.outerHTML = '';
                });
            },timeout);
        }
    }
}
function WarningBox(msg,setting) {
    var boxClass = 'alert alert-block alert-warning center';
    var iconClass = 'fa fa-warning fa-2x';
    setting = setting || {};
    if(!setting.timeout)
        setting.timeout = 10000;
    _BaseBox(boxClass,iconClass,msg,setting);
}
function ErrorBox(msg,setting) {
    var boxClass = 'alert alert-block alert-danger center';
    var iconClass = 'fa fa-frown-o fa-2x';
    setting = setting || {};
    if(!setting.timeout)
        setting.timeout = 10000;
    _BaseBox(boxClass,iconClass,msg,setting);
}
function InfoBox(msg,setting) {
    var boxClass = 'alert alert-block alert-info center';
    var iconClass = 'fa fa-bullhorn fa-2x';
    _BaseBox(boxClass,iconClass,msg,setting);
}
function SuccessBox(msg,setting) {
    var boxClass = 'alert alert-block alert-success center';
    var iconClass = 'fa fa-check fa-2x';
    setting = setting || {};
    if(!setting.timeout)
        setting.timeout = 10000;
    _BaseBox(boxClass,iconClass,msg,setting);
}


function _BaseDialog(msg,confirmCallback) {
    bootbox.dialog({
        message: msg,
        buttons:
        {
            "click" :
            {
                "label" : "确认",
                "className" : "btn-sm btn-primary",
                "callback": confirmCallback
            },
            "button" :
            {
                "label" : "取消",
                "className" : "btn-sm"
            }
        }
    });
}

function DelConfirm(confirmCallback) {
    _BaseDialog("确认删除数据?",confirmCallback);
}
function Confirm(msg,confirmCallback) {
    _BaseDialog(msg,confirmCallback);
}

//date format yyyy-mm-dd HH:mm
function dateFormat(date){
    var newTime = new Date(date);
    //var utc8 = d.getTime();
    //var newTime = new Date(utc8);
    var Year = newTime.getFullYear();
    var Month = newTime.getMonth()+1;
    var myDate = newTime.getDate();
    var minute = newTime.getMinutes();
    if(minute<10){
        minute="0"+minute;
    }
    if(myDate<10){
        myDate="0"+myDate;
    }
    if(Month<10){
        Month="0"+Month;
    }
    var hour = newTime.getHours()+":"+minute;
    var time = Year+"-"+Month+"-"+myDate+" "+hour;

    return time;
};

//date format yyyy-mm-dd
function dateFormat2(date){
    var d = new Date(date);
    var utc8 = d.getTime();
    var newTime = new Date(utc8);
    var Year = newTime.getFullYear();
    var Month = newTime.getMonth()+1;
    var myDate = newTime.getDate();

    if(myDate<10){
        myDate="0"+myDate;
    }
    if(Month<10){
        Month="0"+Month;
    }
    var time = Year+"-"+Month+"-"+myDate;

    return time;
};

//check IDCardNo
function isCardNo(idNo) {
    var reg = /^(^[1-9]\d{7}((0\d)|(1[0-2]))(([0|1|2]\d)|3[0-1])\d{3}$)|(^[1-9]\d{5}[1-9]\d{3}((0\d)|(1[0-2]))(([0|1|2]\d)|3[0-1])((\d{4})|\d{3}[Xx])$)$/;
    return reg.test(idNo);
};

//check phoneNo
function isPhoneNo(phoneNo){
    var reg = /^1[3|4|5|7|8]\d{9}$/;
    return reg.test(phoneNo);
};

//check license plate
function isLicNo(licNo){
    var reg = /^[\u4e00-\u9fa5]{1}[A-Z]{1}[A-Z_0-9]{4}[A-Z_0-9_\u4e00-\u9fa5]{1}$/;
    return reg.test(licNo);
};

//object to string
function objToStr(obj){
    var paramStr="";
    if(obj !=null){
        var keyStr = Object.keys(obj);
        for(var i=0; i<keyStr.length;i++){
            paramStr+="&"+keyStr[i]+"="+obj[keyStr[i]];
        }
        paramStr = paramStr.substr(1,paramStr.length);
        paramStr = "?"+paramStr;
    }
    return paramStr;
};

function removeOldAddNewClassToId(id, oldClass, newClass) {
    $(id).removeClass(oldClass);
    $(id).addClass(newClass);
}

//自定义弹框
function Toast(msg,duration){
    duration=isNaN(duration)?2000:duration;
    var m = document.createElement('div');
    m.innerHTML = msg;
    m.style.cssText="width:50%; max-width:150px; background:#000; opacity:0.5; height:40px; color:#fff; line-height:40px;" +
        " text-align:center; border-radius:5px; position:fixed; top:40%; left:45%; z-index:999999; font-weight:bold;";
    document.body.appendChild(m);
    setTimeout(function() {
        var d = 0.5;
        m.style.webkitTransition = '-webkit-transform ' + d + 's ease-in, opacity ' + d + 's ease-in';
        m.style.opacity = '0';
        setTimeout(function() { document.body.removeChild(m) }, d * 1000);
    }, duration);
}

//筛选分类数据结构
function sortCategory(array){
    var finalArray = [];//[[],[],[],....]的存储格式
    var bigCategories = [];
    var smallCategories = [];

    //分离大类和小类
    for(var i in array){
        var c = array[i];
        if(c.parentTypeId == null){
            bigCategories.push(c);
        }else{
            smallCategories.push(c);
        }
    }

    //生成分类数组
    for(var i in bigCategories){
        finalArray.push([]);
    }

    //筛选相同大类
    for(var i in smallCategories){
        var c = smallCategories[i];
        for(var k in bigCategories){
            var bc = bigCategories[k];
            if(c.parentTypeId == bc.typeId){
                finalArray[k].push(c);
            }
        }
    }

    var categories = [];//[{id:大类id,name:大类名字,value:小类数组},{},....]
    for(var i in bigCategories){
        var obj = {
            id:bigCategories[i].typeId,
            name:bigCategories[i].name,
            displayOrder:bigCategories[i].displayOrder,
            types:finalArray[i]
        };
        categories.push(obj);
    }
    //排序
    categories.sort(function(a,b){
        return a.displayOrder-b.displayOrder
    });
    for(var i=0;i< categories.length;i++){
        categories[i].types.sort(function(a,b){
            return a.displayOrder-b.displayOrder
        });

    }
    console.log(categories);
    return categories;
}

//检查平台
function checkPlatform(){
    var isMobile = false;
    if(/android/i.test(navigator.userAgent)){
        isMobile = true;//这是Android平台下浏览器
    }
    if(/(iPhone|iPad|iPod|iOS)/i.test(navigator.userAgent)){
        isMobile = true;//这是iOS平台下浏览器
    }
    if(/Linux/i.test(navigator.userAgent)){
        //这是Linux平台下浏览器
    }
    if(/Linux/i.test(navigator.platform)){
        //这是Linux操作系统平台
    }
    if(/MicroMessenger/i.test(navigator.userAgent)){
        //这是微信平台下浏览器
    }
    return isMobile;
}

//获取项目的tenant
function getTenant() {
    var hostName = window.location.hostname;
    hostName = hostName.replace(/www./,'');
    var splitArray = hostName.split('.');
    var defaultTenant = sys_config.defaultTenant;
    //本地调试
    if(hostName.indexOf('localhost')>=0){
        return defaultTenant;
    }
    //staging环境的ip i.e. 59.111.97.208
    if(splitArray.length == 4 && !(isNaN(splitArray[0]) || isNaN(splitArray[1]) || isNaN(splitArray[2]) || isNaN(splitArray[3])))
    {
        return defaultTenant;
    }
    //product环境
    if(splitArray.length == 3){//tenant.domain.com
        return splitArray[0];
    }

    return defaultTenant;
}

function initHeaer() {
    $('.navbar-responsive-collapse').collapse('hide');
}

function GetCenterPosition(dom) {
    return {
        left:($(window).width() - dom.outerWidth())/2,
        top:($(window).height() - dom.outerHeight())/2
    };
}

function toHome($filter) {
   /* var homeLink = $filter('translate')('homeLink');
    if (homeLink != 'homeLink') {
        window.location = '/' + homeLink
    } else {
        window.location = '/'
    }*/
    window.location = '/'
}

function configLogin($filter,path) {
    /*var login = $filter('translate')('isLogin');
    if (login!='false') {
        window.location.href = 'indexApp.html#/login?whereCome='+path;
        return true
    }else{
        return false
    }*/
    window.location.href = 'indexApp.html#/login?whereCome='+path;

}

function toOrderInfo($filter,params) {
    /*var orderInfoLink = $filter('translate')('orderInfoLink');
    var paramsString='';
    if(params){
        paramsString=params
    }
    if (orderInfoLink != 'orderInfoLink') {
        window.location = '/' + orderInfoLink+paramsString
    } else {
        window.location = '/orderInfo'+paramsString
    }*/
    window.location = '/orderInfo'+params
}


function CloseWebPage(){
    window.location.href="about:blank";
    if (navigator.userAgent.indexOf("MSIE") > 0) {
        if (navigator.userAgent.indexOf("MSIE 6.0") > 0) {
            window.opener = null;
            window.close();
        } else {
            window.open('', '_top');
            window.top.close();
        }
    }
    else if (navigator.userAgent.indexOf("Firefox") > 0) {
        window.location.href = 'about:blank ';
    } else {
        window.opener = null;
        window.open('', '_self', '');
        window.close();
    }
}

//百度搜索资源平台主动推送链接
function baiduLinkSubmit() {
    (function () {
        if (sys_config.seoIsOpen === 'true') {
            var bp = document.createElement('script');
            var curProtocol = window.location.protocol.split(':')[0];
            if (curProtocol === 'https') {
                bp.src = 'https://zz.bdstatic.com/linksubmit/push.js';
            }
            else {
                bp.src = 'http://push.zhanzhang.baidu.com/push.js';
            }
            var s = document.getElementsByTagName("script")[0];
            s.parentNode.insertBefore(bp, s);
        }
    })();
}


function setPageTitle(title,description,keyword) {
    if(title){
        $('#html-title').text(title+"_咖布集");
    }else {
        $('#html-title').text("咖布集官网_咖啡行业一站式直供平台(kbjbuy.com)");
    }
    if(description){
        $('#header-description').attr('content',description)
    }else {
        $('#header-description').attr('content','咖布集是一家咖啡行业一站式直供平台')
    }
    if(keyword){
        $('#header-keywords').attr('content',keyword)
    }else {
        $('#header-keywords').attr('content','咖布集、咖啡行业一站式直供平台、咖啡原料、水吧台、器具、设备原料批发、经营连锁培训实战基地、kbjbuy')
    }
}


