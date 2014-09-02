define('app/startup/startup', function(require, exports, module) {
    var login = require('login');
    var event = require('event');
    var $ = require('$');
    var util = require('util');
    var app_util = require('main/app_util');
    var menu = require('app/menu/menu');
    event.addCommonEvent('click', {
        'logout': function () {
            util.cookie.del('user');
            util.cookie.del('csrf_code');
            util.cookie.del('sign');
            util.cookie.del('role_id');
            util.cookie.del('role_name');
            location.href = '/login';
            return false;
        }
    });

    $('body').mouseover(function (evt) {
        var fn = function (e) {
            if (e.nodeName == 'TD') {
                e.title = $(e).text();
                return e;
            }
            if (e.nodeName == 'BODY') {
                return;
            }
            fn(e.parentNode);
        }
        fn (evt.target);
    });
    
    var resizefn = function () {
        var w = $(window).width() - 200 - 80;
        $('#mainContainer').width(w);
    };
    $(window).resize(resizefn);
//    pagemanage.loadRoot('startup');
    
    module.exports = {
        render: function () {
            if (!login.isLogin()) {
                login.toLogin('/');
                return;
            }
            app_util.getLoginInfo(function (data, roledata) {
                var rolename;
                $.each(roledata, function (i, n) {
                    if (n.id == util.cookie.get('role_id')) {
                        rolename = n.name;
                        return false;
                    }
                });
                g_User.role_id = util.cookie.get('role_id');
                g_User.role_name = rolename;
                $('#login_user').html('<a href="/startup/myinfo" class="navbar-link" title="点击修改个人信息">' + data[0].cnname + '</a>' + '[' + data[0].deptname + ']' + [roledata.length > 1 ?'<a href="/selrole">':'', rolename, roledata.length > 1 ? '</a>' : ''].join(''));
            });
            
            
//            $('#topmenu li').removeClass('active current');
        }
    }
});