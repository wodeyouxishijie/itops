;define('app/person/vacation/vacation.js', function (require, exports, module) {
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
    var ve = require('editor/ve');
    var editorObj;
    var cacheData;
    var op = 0;
    var dateFormat = { dateFormat : "yy-mm-dd" };
    var slidewrap;
    var container;
    var currentTab = 'new_report';
    
    event.addCommonEvent('click', {
        'edit_vacation': function (evt) {
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
                app_util.fillKeyValueSelect(7, $('#vacation_type'), dt.ftype);
                editorObj =new ve.Create({
                    container:$("#editToobar")[0],
                    height:'300px',
                    width:'600px'
                });
                editorObj.setContent(dt.note);
                
                $( "#ipt_start_time" ).datepicker(dateFormat);
                app_util.renderRoleSelect($('#ipt_apply_user'), dt.apply_user);
                cstatus = dt.cstatus || 76;
                    
                
                saveEvent();
            });
            return false;
        }
    });
    
    function init() {
        addEvents();
        if (currentTab) {
            $('.nav-tabs li').removeClass('active');
            $('.nav-tabs li a[cmd="' + currentTab + '"]').parent().addClass('active');
        }
    }
    
    function addEvents() {
        container.find('a[cmd="addNew"]').unbind('click').click(function () {
            op = 0;
            app_util.getLoginInfo(function (info) {
                slidewrap = slidepanel.show({con:util.tmpl(<Template.edit>, {data: {id: '', note:'',user_cn_name: info[0].cnname,user_dept_name: info[0].deptname }, op:op }) } ) ;
                
                app_util.fillKeyValueSelect(7, $('#vacation_type'));
                
                editorObj =new ve.Create({
                    container:$("#editToobar")[0],
                    height:'150px',
                    width:'600px'
                });
                
                $( "#ipt_start_time" ).datepicker(dateFormat);
                app_util.renderRoleSelect($('#ipt_apply_user'));
                saveEvent();
            });
            return false;
        }); 
    }
    
    function saveEvent( ) {
        slidewrap.find('a[cmd="save"]').unbind('click').click(function () {
            var title = $('#iptTitle').val();
            var leadertype = $('#vacation_type').val();
            var note = editorObj.getContent();
            var user_id = $('#iptUserID').val();
            var apply_user = $('#ipt_apply_user').val();
            var user_dept = $('#iptUserDept').val();
            var start_time = $('#ipt_start_time').val();
            
            if (title == '') {
                alert ('标题不能为空');
                return;
            }
            var params = {
                title: title,
                start_time: start_time,
                ftype: leadertype,
                note: note,
                apply_user: apply_user,
                cstatus: 76
            };
            if (op ==1 ) {
                params.id = $('#currentId').val();
            }
            manager.setVacation(params, function (d) {
                dialog.create ('操作成功', 400, 200, {isMaskClickHide: 0, title: '操作结果', button: {
                    '确定': function() {
                        dialog.hide();
                    }
                }});
                slidepanel.hide();
                wrap.render();
            });
            return false;
        });
        
        slidewrap.find('button[cmd="del"]').unbind('click').click(function (evt) {
            var id = $(this).attr('deptid');
            dialog.create ('确定要删除改故障单么，删除后不可恢复，确定吗？', 400, 200, {isMaskClickHide: 0, title: '操作确认', button: {
                '确定': function() {
                    dialog.hide();
                    manager.delVacation({id: id}, function () {
//                        alert ('删除成功');
                        slidepanel.hide();
                        wrap.render();
                    });
                }
            }}); 
            
            return false;
        });
    }
    
    function initTable(param) {
         manager.getVacation(param, function (data) {
            cacheData = data;
            for (var i = 0; i < data.length; i++) {
                data[i].typename = util.getInfoById(sysbase, data[i].ftype)._value;
                data[i].start_time = (data[i].start_time || '').replace(/T[\s\S]*$/, '');
            }
            container.html(util.tmpl(<Template.list wrap="'">, {data: cacheData}));
            init ();
        });
    }
    
    var wrap = {
        render: function () {
            container = $('#mainContainer');
            var param = {};
            currentTab = 'new_report';
            initTable({cstatus: 76});
        }
    };
    module.exports = wrap;
});