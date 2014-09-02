
define('main/startup', function(require, exports) {
    var $ = require('$');
    var cEvent = require('event');
    var util = require('util');
    var router = require('router');
    var menu = require('app/menu/menu');
    var pagemanage = require('pagemanage');
//    var login = require('login');
//    var addPanel = require('addPanel');
    var dialog = require('dialog');
    dialog.enableLoadTip = 1;
    var startup = function () {
//        pagemanage.loadRoot('startup');
        //初始化路由
        router.init({
            'pushState': true,   
            'actionManage': pagemanage,
//            'domain': 'qcloud.com',
            'routes': {
                '/': 'loadRoot',
                '/:main(/*controller)(/*action)(/*p1)(/*p2)(/*p3)': 'loadView'
            }
        });

        //初始化登录
//        login.init($('#topNav')[0]);
        //全局点击
        cEvent.addCommonEvent('click', {
            'login': function () {
                
            },
            'logout': function () {
                location.href = '/login'
            }

        });

        //全局加载提示
        var delay = 300, $doc = $(document), isLoading = 0, timing;
        $doc.ajaxStart(function () {
            if (dialog.enableLoadTip) {
                clearTimeout(timing);
                isLoading = 1;
                timing = setTimeout(function () {
                    var flashMsg = $('#flashMsg');
                    //有其他提示存在, 不提示loading
                    if (flashMsg.length && flashMsg.html()){
                        return
                    }
                    if (isLoading) {
                        dialog.showMiniTip('正在加载...');
                    }
                }, delay);
            }
        });
        $doc.ajaxStop(function () {
            isLoading = 0;
            dialog.hideMiniTip();
        });
    };

    exports.startup = startup;
});
