;define('app/role/role.js', function (require, exports, module) {
    var $ = require('$');
    var login = require('login');
    var event = require('event');
    var util = require('util');
    var manager = require('manager');
    var slidepanel = require('widget/slidepanel/slidepanel');
    var cacheData;
    var op = 0;
    var slidewrap;
    var menudata;
    
    event.addCommonEvent('click', {
        'edit_role': function (evt) {
            var aitem = evt.target;
            if (aitem.nodeName != 'A') {
                return false;
            }
            op = 1;
            var id = $(evt.target).attr('roleid');
            slidewrap = slidepanel.show({con:util.tmpl(<Template.edit>, {data: getInfoById(id), op: op }) } ) ;
            initPowerList(id);
            clickEvt();
            return false;
        }
    });
    
    function getInfoById (id) {
        return util.getInfoById(cacheData, id);
    };
    
    function init( ) {
        container.find('a[cmd="addNew"]').click(function () {
            op = 0;
            slidewrap = slidepanel.show({con:util.tmpl(<Template.edit>, {data: {id: '',name: '', note:'',power: ''}, op:op }) } ) ;
            initPowerList();
            clickEvt();
            return false;
        });    
    }

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
    
    var pickTopMenu = function (menudata) {
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


    var initTreeList = (function () {
        var level = 0, root = {
            '0': {
                'menuname': 'root', 
                'menuid': 46,
                menuparent: 0, 
                items: []  
            } 
        }, mydata;

        function pick(pid) {
            var ar = [];
            for (var i = 0; i < mydata.length; ) {
                if (pid == mydata[i].menuparent) {
                    ar.push(mydata[i]);
                    mydata.splice(i, 1);
                    i--;
                }
                else {
                    i++;
                }
            }
            return ar;
        };

        function init(data) {
            var root = {};
            for (var i = 0; i < data.length; i++) {
                root[data[i].menuid] = $.extend({}, data[i]);
                var chlds = pick(data[i].menuid);
                if (chlds.length) {
                    root[data[i].menuid].items = arguments.callee(chlds);
                }
            }
            return root;
        }

        return function (data) {
            mydata = [].concat(data);
            return init(mydata);
        }
    }) ();

    function initPowerList(id) {
        var menuCon = $('#menuPowerList');
        var oridata;
        var callback = function (data) {
            var o;
            menudata = data;
            oridata = [].concat(data);
            if (id) {
                o = getInfoById(id);
            }
            if (o) {
                var pw = o.power;
                for (var i = 0; i < data.length; i++) {
                    if ((',' + pw + ',').indexOf(',' + data[i].menuid + ',') > -1) {
                        data[i].checked = 1;
                    }
                }
            }
            // 形成树形关系
            var treeList = initTreeList(data), li = [], l = 0;
            function genHtml(d, lev) {
                for (var i in d) {
                    li.push('<li style="list-style:none;float:none;margin:0 0 0 ' + (lev * 20)+ 'px;"><label><input value="' + d[i].menuid + '" type="checkbox" ' + (d[i].checked ? 'checked': '') + ' />' + d[i].menuname + '</label>');    
                    if (d[i].items) {
                        genHtml(d[i].items, lev + 1);
                    }
                }
            }
            genHtml(treeList, l);
            menuCon.html('<ul class="role_power_ul">' + li.join('') + '</ul>');
            // menudata = oridata;
            var chkbox = slidewrap.find('.role_power_ul :checkbox');
            chkbox.unbind('click').change (function () {
                var chk = $(this);
                var chld = pickChildById(chk.val());
                for (var i = 0; i < chld.length; i++) {
                    chkbox.each(function (j, n) {
                        if (n.value == chld[i].menuid) {
                            n.checked = chk[0].checked;
                            $(n).change();
                        } 
                    });
                }
            });
        };
        // if (menudata) {
        //     return callback(menudata);
        // }
        manager.getMenu({all: 'all'}, callback);
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
    
    function clickEvt () {
        slidewrap.find('a[cmd="save"]').unbind('click').click(function () {
            var menuCon = $('#menuPowerList'), checklist = [];
            menuCon.find('input[type="checkbox"]').each(function (i, n) {
                if (n.checked) {
                    checklist.push(n.value);
                } 
            });
            $('#iptPower').val(checklist.join(','));
            var name = $('#iptName').val();
            var power = checklist.join(',');
            var note = $('#iptNote').val();
            if (name == '') {
                alert ('请输入正确的名称');
                return;
            }
//            if (menuLink == '') {
//                alert ('请输入正确的菜单地址');
//                return;
//            }
            manager.setRole($.extend({
                name: name,
                power: power,
                note: note
            }, op == 1 ? {id: $('#currentId').val()}: {}), function (d) {
                slidepanel.hide();
                role.render();
            });
        });
        
        slidewrap.find('button[cmd="del"]').unbind('click').click(function (evt) {
            var id = $(this).attr('deptid');
            manager.delRole({id: id}, function () {
                slidepanel.hide();
                role.render();
            });
            return false;
        });
    }
    
    function getMenuNames(menus) {
        var menulist = menus.split(','), ar = [];
        for (var i = 0; i < menulist.length; i++) {
            var o = getMenuById(menulist[i]);
            ar.push(o.menuname);
        }
        return ar.join(',');
    }
    
    var role = {
        render: function (wrap) {
            var param = {};
            manager.getRole(param, function (data) {
                manager.getMenu({all: 'all'}, function (mdata) {
                    menudata = mdata;
                    for (var i = 0; i < data.length; i++) {
                        data[i].power_names = getMenuNames(data[i].power);
                    }
                    cacheData = data;
                    container = $('#mainContainer');
                    container.html(util.tmpl(<Template.list wrap="'">, {data: cacheData}));
                    init ();
                });
                
            });
        },
        
        getData: function (callback) {
            manager.getRole(param, function (data) {
                callback(data);
            });
        }
    };
    module.exports = role;
    
});