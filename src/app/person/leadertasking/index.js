;define('app/person/leadertasking/leadertasking', function (require, exports, module) {
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
        'edit_leadertasking': function (evt) {
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
                app_util.fillKeyValueSelect(6, $('#leadertask_type'), dt.ftype);
                editorObj =new ve.Create({
                    container:$("#editToobar")[0],
                    height:'300px',
                    width:'600px'
                });
                editorObj.setContent(dt.note);
                
                app_util.deptTypeAhead($('#iptRelatedDept'), function (item, dv, txt, seldata) {
                    $( "#relatedDept" ).val(dv);
                    $('#iptRelatedDept').val(seldata.name);
                });
                $( "#ipt_start_time" ).datepicker(dateFormat);
                app_util.renderRoleSelect($('#ipt_related_user'), dt.task_for);
                app_util.fillKeyValueSelect(1, $('#leadertask_grade'), dt.grade);
                cstatus = dt.cstatus || 76;
                app_util.fillKeyValueSelect(2, $('#leadertask_status'), dt.cstatus, function () {
                    
                });
                
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
                slidewrap = slidepanel.show({con:util.tmpl(<Template.edit>, {data: {id: '',name: '', note:'',power: '',user_cn_name: info[0].cnname,user_dept_name: info[0].deptname, user_dept: info[0].deptid,user_id: info[0].id }, op:op }) } ) ;
                $( "#iptApplyTime" ).datepicker(dateFormat);
                
                app_util.fillKeyValueSelect(6, $('#leadertask_type'));
                
                editorObj =new ve.Create({
                    container:$("#editToobar")[0],
                    height:'150px',
                    width:'600px'
                });
                
                app_util.deptTypeAhead($('#iptRelatedDept'), function (item, dv, txt, seldata) {
                    $( "#relatedDept" ).val(dv);
                    $('#iptRelatedDept').val(seldata.name);
                });
                $( "#ipt_start_time" ).datepicker(dateFormat);
                app_util.renderRoleSelect($('#ipt_related_user'));
                app_util.fillKeyValueSelect(1, $('#leadertask_grade'));
                saveEvent();
            });
            return false;
        }); 
        container.find('a[cmd="new_report"]').unbind('click').click(function () {
            currentTab = 'new_report';
            initTable({cstatus: 76});
            return false;
        });
        container.find('a[cmd="done_report"]').unbind('click').click(function () {
            currentTab = 'done_report';
            initTable({cstatus: 75});
            return false;
        });
        container.find('a[cmd="process_report"]').unbind('click').click(function () {
            currentTab = 'process_report';
            initTable({cstatus: 74});
            return false;
        });
    }
    
    function saveEvent( ) {
        slidewrap.find('a[cmd="save"]').unbind('click').click(function () {
            var title = $('#iptTitle').val();
            var telno = $('#iptTelNo').val();
            var leadertype = $('#leadertask_type').val();
            var grade = $('#leadertask_grade').val();
            var note = editorObj.getContent();
            var user_id = $('#iptUserID').val();
            var user_dept = $('#iptUserDept').val();
            var ProcessUser = $('#processUser').val();
            var start_time = $('#ipt_start_time').val();
            var iptDoneUser = $('#doneUser').val();
            var iptDoneDate = $('#iptDoneDate').val();
            var relatedDept = $('#relatedDept').val();
            var relatedFor = $('#ipt_related_user').val();
            if (title == '') {
                alert ('标题不能为空');
                return;
            }
            var params = {
                title: title,
                tel: telno,
                done_user: iptDoneUser || 0,
                repair_user: user_id,
                repair_dept: user_dept,
                start_time: start_time,
                end_time: iptDoneDate,
                grade: grade,
                ftype: leadertype,
                note: note,
                task_for_type: 1,
                task_for: relatedFor,
                related_dept: relatedDept,
                cstatus: 76
            };
            if (op ==1 ) {
                params.id = $('#currentId').val();
            }
            manager.setLeaderTasking(params, function (d) {
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
                    manager.delLeaderTasking({id: id}, function () {
//                        alert ('删除成功');
                        slidepanel.hide();
                        wrap.render();
                    });
                }
            }}); 
            
            return false;
        });
        
        slidewrap.find('button[cmd="process"]').unbind('click').click(function () {
            manager.setLeaderTasking({
                id: $('#currentId').val(),
                cstatus:$('#leadertask_status').val()
            }, function (d) {
                manager.setProcessLog({
                    src: 'leader_tasking_list', 
                    status_type: 2, 
                    cstatus: cstatus, 
                    main_id: $('#currentId').val(),
                    dest_status: $('#leadertask_status').val(),
                    note: $('#iptProcessNote').val()
                }, function (d) {
                    dialog.create ('操作成功', 400, 200, {isMaskClickHide: 0, title: '操作结果', button: {
                        '确定': function() {
                            dialog.hide();
                            slidepanel.hide();
                            wrap.render();
                        }
                    }});
                });
            }); 
        });
        
        $('button[cmd="show_process"]').unbind('click').click(function () {
            $('#leader_process_wrap').toggleClass('hide');
//            $('#btnWrap').toggleClass('hide');
            return false;
        });
    }
    
    
    function initTable(param) {
         manager.getLeaderTasking(param, function (data) {
            cacheData = data;
            for (var i = 0; i < data.length; i++) {
                data[i].typename = util.getInfoById(sysbase, data[i].ftype)._value
                data[i].start_time = util.formatDate(data[i].start_time);
                data[i].create_time = util.formatDate(data[i].create_time);
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