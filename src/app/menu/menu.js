;define('app/menu/menu.js', function (require, exports, module) {
    var $ = require('$');
    var login = require('login');
    var event = require('event');
    var util = require('util');
    var router = require('router');
    var manager = require('manager');
    var container;
    var menudata;
    
    
    
    router.onComplete = function (action, params) {
        var lastact;
        params.length > 0 && $('.menu_list').find('a').each(function (i, n) {
            if (n.href.indexOf('/' + params.join('/')) > -1) {
                lastact = $(n).parent();
                return false;
            }
        });
        lastact && lastact.addClass('active');
        
        var toplast;
        $('#topmenu').find('a').each(function (i, n) {
            if (n.href.indexOf('/' + action) > -1) {
                toplast = $(n).parent();
                return false;
            }
        });
        toplast && toplast.addClass('active current');
    }
    event.addCommonEvent('click', {
        'top_menu': function (evt) {
            if (menudata) {
                var aitem = evt.target;
                if (aitem.nodeName != 'A') {
                    return false;
                }
                router.navigate(util.getHref(aitem));
            }
            return false;
        },
        'nav': function (evt) {
            if (menudata) {
                var aitem = evt.target;
                if (aitem.nodeName != 'A') {
                    return false;
                }
                router.navigate(util.getHref(aitem));
            }
            return false;
        }
    });
    
    function pickChildByModule(menumodule) {
        var menu = getMenuByModule(menumodule);
        var pid = menu.menuid;
        var ar = [];
        for (var i = 0; i < menudata.length; i++) {
            if (pid == menudata[i].menuparent) {
                ar.push(menudata[i]);
            }
        }
        return ar;
    };
    
    function getMenuByModule(menumodule) {
        var ar = [], rootid;;
        for (var i = 0; i < menudata.length; i++) {
            if (menumodule == menudata[i].menulink) {
                return $.extend(menudata[i], {parentname: getMenuById(menudata[i].menuparent).menuname || 'ROOT'});
            }
        }
        return {};
    }
    
    function getMenuById (id) {
        var ar = [], rootid;;
        for (var i = 0; i < menudata.length; i++) {
            if (id == menudata[i].menuid) {
                return $.extend(menudata[i], {parentname: getMenuById(menudata[i].menuparent).menuname || 'ROOT'});
            }
        }
        return {};
    };
    
    function pickChildById(pid) {
        var ar = [];
        for (var i = 0; i < menudata.length; i++) {
            if (pid == menudata[i].menuparent) {
                ar.push(menudata[i]);
            }
        }
        return ar;
    };
    
    var pickTopMenu = function () {
        var ar = [], rootid;;
        for (var i = 0; i < menudata.length; i++) {
            if (0 == menudata[i].menuparent) {
                rootid = menudata[i].menuid;
                break;
            }
        }
        if (rootid) {
            for (var i = 0; i < menudata.length; i++) {
                if (rootid == menudata[i].menuparent) {
                    ar.push(menudata[i]);
                }
            }
        }
        return ar;
    };
    
    function initLeft(menumodule) { 
//        container = $('#manageMain');
        $('#manageMain').html(util.tmpl(<Template.main>, {type: 1, data: pickChildByModule(menumodule) }));
        $('.menu_list').each(function (i, n) {
            var chd = pickChildById($(n).attr('pid'));
            for (var i = 0;i < chd.length; i++) {
                if (/^(?:\/|http)/.test(chd[i].menulink)) {
                    $(n).append('<li><a href="' + chd[i].menulink + '" menuid="' + chd[i].menuid + '">' + chd[i].menuname + '</a></li>');
                }
                else {
                    $(n).append('<li><a href="/startup/' +menumodule + '/' + chd[i].menulink + '" menuid="' + chd[i].menuid + '">' + chd[i].menuname + '</a></li>');
                }
            }
        });

        var resizefn = function () {
            var w = $(window).width() - 200 - 80;
            $('#mainContainer').width(w);
        };
        setTimeout(resizefn, 100);
    }
    
    var menu = {
        render: function (action, callback) {
            var user_id = login.getLoginID();
            var param = {};
//            container = wrapEl;
            manager.getMenu(param, function (data) {
                menudata = data;
                $('#topmenu').html(util.tmpl(<Template.topmenu wrap="'">, {type: 1, data: pickTopMenu() }));
                initLeft(action);
                callback && callback();
                
            });
            if (user_id == 'admin') {
                
            }
        },
        
        onRender: function () {
            
        }
    };
    module.exports = menu;
});