;define('app/user/user.js', function (require, exports, module) {
    var $ = require('$');
    var login = require('login');
    var event = require('event');
    var util = require('util');
    var manager = require('manager');
    var slidepanel = require('widget/slidepanel/slidepanel');
//    var role = require('app/role/role');
    var cacheData;
    var op = 0;
    var pinyin = require('hotoo/pinyin/2.1.2/pinyin-debug');
    var slidewrap;
    var container;
    
    event.addCommonEvent('click', {
        'edit_user': function (evt) {
            var aitem = evt.target;
            if (aitem.nodeName != 'A') {
                return false;
            }
            op = 1;
            var id = $(evt.target).attr('userid');
            slidewrap = slidepanel.show({con:util.tmpl(<Template.edit>, {data: util.getInfoById(cacheData, id), op: op,  }) } ) ;
            initUserRole(id);
            initUserDept(id);
            clickEvt();
            return false;
        }
    });
    
    function init() {
        container.find('a[cmd="addNew"]').unbind('click').click(function () {
            op = 0;
            slidewrap = slidepanel.show({con:util.tmpl(<Template.edit>, {data: {id: '',name: '', note:'',power: ''}, op:op }) } ) ;
            initUserRole();
            initUserDept();
            clickEvt();
            return false;
        });  
      
        $('#search_user').unbind('click').click(function () {
            var val = $('#user_query').val();
            var rst = [];
            if (cacheData && val) {
                $.each(cacheData, function (i, n) {
                    $.each(n, function (u, v) {
                        if (String(v).indexOf(val) > -1) {
                            rst.push(n);
                            return false;
                        }
                        if (u == 'cnname') {
                            if (pinyin(v, {style: pinyin.STYLE_FIRST_LETTER }).join('').toUpperCase().indexOf(val.toUpperCase()) > -1) {
                                rst.push(n);
                                return false;
                            }
                        }
                    });
                });
            }
            initTable(rst.slice(0, 50));
            $('#show_tips').html('显示前' + Math.min(50, rst.length) + '条');
            return false;
        });
    }
    
    function initUserRole(id) {
        manager.getRole({}, function (data) {
            var o;
            if (id) {
                o = util.getInfoById(cacheData, id);
            }
            if (o) {
                var pw = o.role_id;
                for (var i = 0; i < data.length; i++) {
                    if ((',' + pw + ',').indexOf(',' + data[i].id + ',') > -1) {
                        data[i].checked = 1;
                    }
                }
            }
            $('#userRoleList').html(util.tmpl(<Template.rolelist>, {data: data}));
        });
    }
    
    function initUserDept(id) {
        manager.getDept({}, function (data) {
            var o;
            if (id) {
                o = util.getInfoById(cacheData, id);
            }
            if (o) {
                var pw = o.dept_id;
                for (var i = 0; i < data.length; i++) {
                    if ((',' + pw + ',').indexOf(',' + data[i].id + ',') > -1) {
                        data[i].checked = 1;
                    }
                }
            }
            $('#userDeptList').html(util.tmpl(<Template.rolelist>, {data: data}));
        });
    }
    
    function clickEvt () {
        slidewrap.find('a[cmd="save"]').unbind('click').click(function () {
            var roleCon = $('#userRoleList');
            var deptCon = $('#userDeptList');
            var rolechecklist = [], deptchecklist = [];
            roleCon.find('input[type="checkbox"]').each(function (i, n) {
                if (n.checked) {
                    rolechecklist.push(n.value);
                } 
            });
            deptCon.find('input[type="checkbox"]').each(function (i, n) {
                if (n.checked) {
                    deptchecklist.push(n.value);
                } 
            });
//            $('#iptPower').val(checklist.join('_'));
            var name = $('#iptUserID').val();
            var cnname = $('#iptCnName').val();
            var role_id = rolechecklist.join(',');
            var dept_id = deptchecklist.join(',');
            var job_id = $('#user_jobs').val();
            var telno = $('#iptTelno').val();
            var qq = $('#iptqq').val();
//            var note = $('#iptNote').val();
            if (name == '') {
                alert ('请输入正确的名称');
                return;
            }
//            if (menuLink == '') {
//                alert ('请输入正确的菜单地址');
//                return;
//            }
            manager.setUser($.extend({
                user_id: name,
                cnname: cnname,
                role_id: role_id,
                dept_id: dept_id,
                jobs: job_id,
                telno: telno,
                qq: qq
//                note: note
            }, op == 1 ? {id: $('#currentId').val()}: {}), function (d) {
                slidepanel.hide();
                user.render();
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
    var userDataCache;
    
    function initTable(data) {
        container.html(util.tmpl(<Template.list wrap="'">, {data: data}));
        init ();
    }
    
    var user = {
        render: function () {
            container = $('#mainContainer');
            var param = {};
            var cp = 0;
            var fn = function () {
                initTable([]);
            }
            if (!cacheData) {
                manager.getUser(param, function (data) {
                    cacheData = data;
                    fn();
                });
            }
            else {
                fn();
            }
        },
        getUserData: function (callback) {
            if (typeof callback == 'function') {
                if (userDataCache) {
                    callback(userDataCache);
                }
                else {
                    manager.getUser({}, function (data) {
                        userDataCache = data;
                        callback(data);
                    });
                }
            }
        }
    };
    module.exports = user;
});