;define('app/menumanager/menumanager.js', function (require, exports, module) {
    var $ = require('$');
    var login = require('login');
    var event = require('event');
    var util = require('util');
    var router = require('router');
    var manager = require('manager');
    var menu = require()
    var slidepanel = require('widget/slidepanel/slidepanel');
    var container;
    var menudata;
    var inited;
    var slidewrap;
    var lastact;
    var menumanager = {
        render: function (menumodule) {
            var user_id = login.getLoginID();
            var param = {all: 'all'};
            
            manager.getMenu(param, function (data) {
                menudata = data;
//                initLeft(menumodule);
                rst = data;
                for (var i = 0; i < rst.length; i++) {
                    rst[i].parentname = getMenuById(rst[i].menuparent).menuname;
                }
                container = $('#mainContainer');
                container.html(util.tmpl(<Template.menumanager wrap="'">, {type: 1, data: rst}));
                init();
            });
        }
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
    
    function pickTopMenu() {
        var ar = [], rootid = 0;
//        for (var i = 0; i < menudata.length; i++) {
//            if (0 == menudata[i].menuparent) {
//                rootid = menudata[i].menuid;
//                break;
//            }
//        }
//        if (rootid) {
            for (var i = 0; i < menudata.length; i++) {
                if (rootid == menudata[i].menuparent) {
                    ar.push(menudata[i]);
                }
            }
//        }
        return ar;
    };
    
    function getMenuById (id) {
        var ar = [], rootid;;
        for (var i = 0; i < menudata.length; i++) {
            if (id == menudata[i].menuid) {
                return $.extend(menudata[i], {parentname: getMenuById(menudata[i].menuparent).menuname || 'ROOT'});
            }
        }
        return {};
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
    
    var getRootList = function () {
        var arli = [], clev = 0;
            
        function fill(r, lev) {
            arli.push('<li style=""><a href="#" menuid="' + r.menuid + '">' + new Array(lev + 1).join('--') + r.menuname + '</a></li>');
            var fn = arguments.callee;
            var children = pickChildById(r.menuid);
            if (children.length > 0) {
                lev++;
                for (var i = 0; i < children.length; i++) {
                    fill(children[i], lev);
                }
            }
        };
        
        for (var i = 0, ar = pickTopMenu(); i < ar.length; i++) {
            fill(ar[i], 0);
        };
        return arli.join(''); 
//        }
    };
    
    function clickEvt () {
        $('#saveMenu').unbind('click').click(function () {
            var menuParent = $('#menuParent').attr('parentid');
            var menuName = $('#menuName').val();
            var menuLink = $('#menuLink').val();
            var menuNote = $('#menuNote').val();
            if (menuName == '') {
                alert ('请输入正确的名称');
                return;
            }
//            if (menuLink == '') {
//                alert ('请输入正确的菜单地址');
//                return;
//            }
            manager.setMenu($.extend({
                name: menuName,
                link: menuLink,
                parent: menuParent,
                note: menuNote
            }, op == 1 ? {id: $('#currentMenuId').val()}: {}), function (d) {
                alert ('添加成功');
                location.reload();
            });
        });
        
        slidewrap.find('button[cmd="del"]').unbind('click').click(function (evt) {
            var id = $(this).attr('menuid');
            manager.delMenu({id: id}, function () {
                alert ('删除成功');
                location.reload();
            });
            return false;
        });
    }
    
    var op = 0;
    function init() {
        $('#newMenu').click(function () {
            if (menudata) {
                op = 0;
                slidewrap = slidepanel.show({con:util.tmpl(<Template.newmenu>, {data: {menuid: '',menuparent:0,menuname: '', menunote:'',parentname:'root'},roothtml: getRootList(), op:op }) } ) ;
                clickEvt();
            }
            return false;
        });
        event.addCommonEvent('click', {
            'parent': function (evt) {
                var menu_id = $(evt.target).attr('menuid');
                var menu_name = $(evt.target).html();
                $(this).prev().html(menu_name + '&nbsp;<span class="caret"></span>').attr('parentid', menu_id);
//                $('#menuParent').val(menu_id);
            },
            
            'edit_menu': function (evt) {
                var aitem = evt.target;
                if (aitem.nodeName != 'A') {
                    return false;
                }
                op = 1;
                var id = $(evt.target).attr('menuid');
                slidewrap = slidepanel.show({con:util.tmpl(<Template.newmenu>, {data: getMenuById(id),roothtml: getRootList(), op: op }) } ) ;
                clickEvt();
                return false;
            }
        });
    }
    module.exports = menumanager;
});