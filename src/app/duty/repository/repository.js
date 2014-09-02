;define('app/duty/repository/repository', function (require, exports, module) {
    var $ = require('$');
    var login = require('login');
    var event = require('event');
    var util = require('util');
    var dialog = require('dialog');
    var manager = require('manager');
    var slidepanel = require('widget/slidepanel/slidepanel');
    var app_util = require('main/app_util');
    var failure_grade = require('app/userservice/failure_grade/failure_grade');
    var failure_type = require('app/userservice/failure_type/failure_type');
    var dept = require('app/dept/dept');
    var user = require('app/user/user');
    var ve = require('editor/ve');
    var editorObj;
    var cacheData;
    var op = 0;
    var dateFormat = { dateFormat : "yy-mm-dd" };
    var slidewrap;
    var container;
    
    event.addCommonEvent('click', {
        'edit_repository': function (evt) {
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
                editorObj =new ve.Create({
                    container:$("#editToobar")[0],
                    height:'300px',
                    width:'600px'
                });
                editorObj.setContent(dt.note);
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
        app_util.fillKeyValueSelect(4, $('#report_type'), dt.ftype);
    }
    function addEvents() {
        container.find('a[cmd="addNew"]').click(function () {
            op = 0;
            app_util.getLoginInfo(function (info) {
                slidewrap = slidepanel.show({con:util.tmpl(<Template.edit>, {data: {id: '',name: '', note:'',power: '',user_cn_name: info[0].cnname,user_dept_name: info[0].deptname, user_dept: info[0].deptid,user_id: info[0].id }, op:op }) } ) ;
                
                initCtl();
                saveEvent();
                editorObj =new ve.Create({
                    container:$("#editToobar")[0],
                    height:'300px',
                    width:'600px'
                });
            });
            return false;
        });  
    }
    
    function saveEvent( ) {
        slidewrap.find('a[cmd="save"]').click(function () {
            var title = $('#iptTitle').val();
            var telno = $('#iptTelNo').val();
            var report_type = $('#report_type').val();
            var note = editorObj.getContent();//$('#iptNote').val();
            var user_id = $('#iptUserID').val();
            var user_dept = $('#iptUserDept').val();
            if (title == '') {
                alert ('标题不能为空');
                return;
            }
            var params = {
                add_user: user_id,
                title: title,
                ftype: report_type,
                note: note,
                cstatus: 0
            };
            if (op ==1 ) {
                params.id = $('#currentId').val();
            }
            manager.setRepository(params, function (d) {
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
                    manager.delRepository({id: id}, function () {
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
            var param = {}
            manager.getRepository(param, function (data) {
                cacheData = data;
                for (var i = 0; i < data.length; i++) {
                    data[i].typename = util.getInfoById(sysbase, data[i].ftype)._value
                    data[i].last_modify_time = (data[i].last_modify_time || '').replace(/T[\s\S]*$/, '');
                    data[i].create_time = data[i].create_time.replace(/T[\s\S]*$/, '');
                }
                container.html(util.tmpl(<Template.list wrap="'">, {data: cacheData}));
                init ();
            });
        }
    };
    module.exports = moduleWrap;
});