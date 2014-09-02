;define('app/userservice/software_report/software_report', function (require, exports, module) {
    var $ = require('$');
    var login = require('login');
    var event = require('event');
    var util = require('util');
    var dialog = require('dialog');
    var manager = require('manager');
    var slidepanel = require('widget/slidepanel/slidepanel');
    var app_util = require('main/app_util');
    var dept = require('app/dept/dept');
    var user = require('app/user/user');
    var cacheData;
    var op = 0;
    var dateFormat = { dateFormat : "yy-mm-dd" };
    var slidewrap;
    var container;
    
    
    
    event.addCommonEvent('click', {
        'edit_software_report': function (evt) {
            var aitem = evt.target;
            if (aitem.nodeName != 'A') {
                return false;
            }
            op = 1;
            var id = $(evt.target).attr('reportid');
            app_util.getLoginInfo(function (info) {
                var dt = util.getInfoById(cacheData, id);
                $.extend(dt, {
                    user_cn_name: info[0].cnname,
                    user_dept_name: info[0].deptname, 
                    user_dept: info[0].deptid,
                    user_id: info[0].id
                });
                slidewrap = slidepanel.show({con:util.tmpl(<Template.edit>, {data: dt, op:op }) } ) ;
                
                initCtl(dt);
                saveEvent();
            });
            return false;
        }
    });

    function init() {
        addEvents();
    }
    
    function initCtl(dt) {
        dt = dt || {};
        $( "#iptApplyTime" ).datepicker(dateFormat);
        app_util.deptTypeAhead($( "#iptApplyDept" ), function (item, dv, txt, seldata) {
            $( "#applyDept" ).val(dv);
            $( "#iptApplyDept" ).val(seldata.name);
        });
        app_util.userTypeAhead($( "#iptApplyUser" ), function (item, dv, txt, seldata) {
            $( "#applyUser" ).val(dv);
            $( "#iptApplyUser" ).val(seldata.cnname);
        });
    };
    function addEvents() {
        container.find('a[cmd="addNew"]').click(function () {
            op = 0;
            app_util.getLoginInfo(function (info) {
                slidewrap = slidepanel.show({con:util.tmpl(<Template.edit>, {data: {id: '',name: '', note:'',power: '',user_cn_name: info[0].cnname,user_dept_name: info[0].deptname, user_dept: info[0].deptid,user_id: info[0].id,cstatus:0 }, op:op }) } ) ;
                
                initCtl();
                saveEvent();
                
            });
            return false;
        });  
    }
    
    function saveEvent( ) {
        slidewrap.find('a[cmd="save"]').click(function () {
            var title = $('#iptTitle').val();
            var iptApplyTime = $('#iptApplyTime').val();
            var iptApplyDept = $('#applyDept').val();
            var iptApplyUser = $('#applyUser').val();
            var iptRelatedApp = $('#iptRelatedApp').val();
            var result = $('#iptResult').val();
            var note = $('#iptNote').val();
            var chkStatus = +$('#chkStatus')[0].checked;
            if (title == '') {
                alert ('标题不能为空');
                return;
            }
            var params = {
                title: title,
                apply_dept: iptApplyDept,
                apply_user: iptApplyUser,
                apply_time: iptApplyTime,
                note: note,
                result: result,
                cstatus: chkStatus,
                related_app: iptRelatedApp
            };
            if (op ==1 ) {
                params.id = $('#currentId').val();
            }
            manager.setSoftwareReport(params, function (d) {
                dialog.create ('操作成功', 400, 200, {isMaskClickHide: 0, title: '操作结果', button: {
                    '确定': function() {
                        dialog.hide();
                    }
                }});
                slidepanel.hide();
                moduleWrap.render();
            });
            return false;
        });
        slidewrap.find('button[cmd="del"]').unbind('click').click(function (evt) {
            var id = $(this).attr('deptid');
            dialog.create ('确定要删除改故障单么，删除后不可恢复，确定吗？', 400, 200, {isMaskClickHide: 0, title: '操作确认', button: {
                '确定': function() {
                    dialog.hide();
                    manager.delFailureReport({id: id}, function () {
                        alert ('删除成功');
                        slidepanel.hide();
                        moduleWrap.render();
                    });
                }
            }}); 
            
            return false;
        });
    }
    
    var moduleWrap = {
        render: function () {
            container = $('#mainContainer');
            var param = {};
            manager.getSoftwareReport(param, function (data) {
                cacheData = data;
                for (var i = 0; i < data.length; i++) {
                    data[i].create_time = util.formatDate(data[i].create_time);
                    data[i].apply_time = util.formatDate(data[i].apply_time);
//                    data[i].statusname = data[i].cstatus == 1 ? '已完成' : '未完成';
                    data[i].statusname = {'0': '未完成', '1': '已完成', '2': '上级已同意','4':'上级已驳回'}[data[i].cstatus];
                }
                container.html(util.tmpl(<Template.list wrap="'">, {data: cacheData}));
                init ();
            });
        }
    };
    module.exports = moduleWrap;
});