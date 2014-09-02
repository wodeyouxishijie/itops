;define('app/dept/dept.js', function (require, exports, module) {
    var $ = require('$');
    var login = require('login');
    var event = require('event');
    var util = require('util');
    var dialog = require('dialog');
    var manager = require('manager');
    var app_util = require('app_util');
    var slidepanel = require('widget/slidepanel/slidepanel');
    var deptdata;
    var op = 0;
    function init() {
        $('#newDept').click(function () {
            op = 0;
            slidewrap = slidepanel.show({con:util.tmpl(<Template.newdept>, {data: {deptid: '',deptparent:0,deptname: '', deptnote:'',parentname:'root'},roothtml: getRootList(), op:op }) } ) ;
            clickEvt();
            return false;
        });
    
        event.addCommonEvent('click', {
            'dept-parent': function (evt) {
                var menu_id = $(evt.target).attr('deptid');
                var menu_name = $(evt.target).html();
                $(this).prev().html(menu_name + '&nbsp;<span class="caret"></span>').attr('parentid', menu_id);
//                $('#menuParent').val(menu_id);
            },
            'edit_dept': function (evt) {
                var aitem = evt.target;
                if (aitem.nodeName != 'A') {
                    return false;
                }
                op = 1;
                var id = $(evt.target).attr('deptid');
                slidewrap = slidepanel.show({con:util.tmpl(<Template.newdept>, {data: getDeptById(id),roothtml: getRootList(), op: op }) } ) ;
                clickEvt();
                return false;
            },
            'clear_leader': function (evt) {
                var a = $(evt.target);
                $('#' + a.attr('data-for')).val('');
                $('#' + a.attr('data-for') + 'Name').val('');
            }
        });
    }
    
    function clickEvt () {
        $('#saveDept').unbind('click').click(function () {
            var deptParent = $('#deptParent').attr('parentid');
            var name = $('#deptName').val();
            var codes = $('#deptCodes').val();
            var deptExt = $('#deptNote').val();
            if (deptName == '') {
                alert ('请输入正确的名称');
                return;
            }
//            if (menuLink == '') {
//                alert ('请输入正确的菜单地址');
//                return;
//            }
            manager.setDept($.extend({
                name: name,
                codes: codes,
                parent: deptParent,
                leader1: $('#deptLeader1').val(),
                leader2: $('#deptLeader2').val(),
                ext: deptExt
            }, op == 1 ? {id: $('#currentDeptId').val()}: {}), function (d) {
                dialog.miniTip('操作成功')
//                location.reload();
                slidepanel.hide();
                wrap.render();
            });
        });
        
        slidewrap.find('button[cmd="del"]').unbind('click').click(function (evt) {
            var id = $(this).attr('deptid');
            manager.delDept({id: id}, function () {
                alert ('删除成功');
                location.reload();
            });
            return false;
        });
        app_util.userTypeAhead($('#deptLeader1Name'), function (item, dv, txt, seldata) {
            $('#deptLeader1').val(dv);
            $('#deptLeader1Name').val(seldata.cnname);
        });
        app_util.userTypeAhead($('#deptLeader2Name'), function (item, dv, txt, seldata) {
            $('#deptLeader2').val(dv);
            $('#deptLeader2Name').val(seldata.cnname);
        });
    }

    function getDeptById (id) {
        var ar = [], rootid;
        for (var i = 0; i < deptdata.length; i++) {
            if (id == deptdata[i].id) {
                return $.extend(deptdata[i], {parentname: getDeptById(deptdata[i].parent).name || 'ROOT'});
            }
        }
        return {};
    };
    
    function pickTop() {
        var ar = [], rootid = 0;
        for (var i = 0; i < deptdata.length; i++) {
            if (rootid == deptdata[i].parent) {
                ar.push(deptdata[i]);
            }
        }
        return ar;
    };
    
    function pickChildById(pid) {
        var ar = [];
        for (var i = 0; i < deptdata.length; i++) {
            if (pid == deptdata[i].parent) {
                ar.push(deptdata[i]);
            }
        }
        return ar;
    };
    
    function getRootList () {
        var arli = [], clev = 0;
            
        function fill(r, lev) {
            arli.push('<li style=""><a href="#" deptid="' + r.id + '">' + new Array(lev + 1).join('--') + r.name + '</a></li>');
            var fn = arguments.callee;
            var children = pickChildById(r.id);
            if (children.length > 0) {
                lev++;
                for (var i = 0; i < children.length; i++) {
                    fill(children[i], lev);
                }
            }
        }
        
        for (var i = 0, ar = pickTop(); i < ar.length; i++) {
            fill(ar[i], 0);
        };
        return arli.join(''); 
    };
    var wrap = {
        render: function (wrap) {
            var param = {};
            manager.getDept(param, function (data) {
                deptdata = data;
                rst = data;
                for (var i = 0; i < rst.length; i++) {
                    rst[i].parentname = getDeptById(rst[i].parent).name;
                }
                container = $('#mainContainer');
                container.html(util.tmpl(<Template.list wrap="'">, {type: 1, data: rst}));
                init ();
            });
        },
        createDept: function () {
            return getRootList();
        },
        
        getDeptData: function (callback) {
            if (typeof callback == 'function') {
                manager.getDept({}, function (data) {
                    deptdata = data;
                    callback(data);
                });
            }
        }
    };
    module.exports = wrap;
});