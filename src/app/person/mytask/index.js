;define('app/person/mytask/mytask', function (require, exports, module) {
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
    var currViewUser;
    
    event.addCommonEvent('click', {
        'edit_mytasking': function (evt) {
            var aitem = evt.target;
            if (aitem.nodeName != 'A') {
                return false;
            }
            op = 1;
            var id = $(evt.target).attr('taskingid');
            var src = $(evt.target).attr('src');
            app_util.getLoginInfo(function (info) {
                var dt = util.getInfoById(cacheData, id);
                $.extend(dt, {
                    user_cn_name: info[0].cnname,
                    user_dept_name: info[0].deptname, 
                    user_dept: info[0].deptid,
                    user_id: info[0].id
                });
                slidewrap = slidepanel.show({con:util.tmpl(<Template.edit>, {data: dt, op: op, src: src}) } ) ;
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
    
    function initCtl(dt){
        dt = dt || {};
        app_util.fillKeyValueSelect(6, $('#mytask_type'), dt.ftype);
        $( "#iptApplyTime" ).datepicker(dateFormat);
    }
    function addEvents() {
        container.find('a[cmd="addNew"]').click(function () {
            op = 0;
            app_util.getLoginInfo(function (info) {
                slidewrap = slidepanel.show({con:util.tmpl(<Template.edit>, {data: {id: '',name: '', note:'',power: '',user_cn_name: info[0].cnname,user_dept_name: info[0].deptname, user_dept: info[0].deptid,user_id: info[0].id }, op:op, src: 'new' }) } ) ;
                
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
            var report_type = $('#mytask_type').val();
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
            manager.setMyTasking(params, function (d) {
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
            dialog.create ('确定要删除任务单么，删除后不可恢复，确定吗？', 400, 200, {isMaskClickHide: 0, title: '操作确认', button: {
                '确定': function() {
                    dialog.hide();
                    manager.delMyTasking({id: id}, function () {
                        dialog.miniTip('删除成功');
                        slidepanel.hide();
                        moduleWrap.render();
                    });
                }
            }}); 
            
            return false;
        });
        slidewrap.find('a[cmd="process"]').click(function () {
            manager.setMyTasking({
                id: $('#currentId').val(),
                cstatus: 1
            }, function (d) {
                manager.setProcessLog({
                    src: 'mytasking_list', 
                    status_type: 2, 
                    cstatus: 0, 
                    main_id: $('#currentId').val(),
                    dest_status: 1,
                    note: $('#iptProcessNote').val()
                }, function (d) {
                    dialog.create ('操作成功', 400, 200, {isMaskClickHide: 0, title: '操作结果', button: {
                        '确定': function() {
                            dialog.hide();
                            slidepanel.hide();
                            moduleWrap.render();
                        }
                    }});
                });
            });
        });

        var loaded = 0;
        $('a[cmd="show_process"]').unbind('click').click(function () {
            !loaded && manager.getLog({
                target: 'mytasking_list',
                id:$('#currentId').val()
            }, function (data) {
                var html = util.tmpl(<Template.log_list>, {data: data});
                $('#process_wrap').html(html);
                loaded = 1;
            });
            return false;
        });
    }
    
    function getEmployeeTasking(user, cnname) {
        manager.getEmployeeTask({uid: user}, function (data) {
            currViewUser = user;
            cacheData = cacheData.concat(data);
            for (var i = 0; i < data.length; i++) {
                data[i].typename = util.getInfoById(sysbase, data[i].ftype)._value

                data[i].last_modify_time = util.formatDate(data[i].last_modify_time);
                data[i].create_time = util.formatDate(data[i].create_time);
                data[i].statusname = {'1':'已完成', '0':'正在处理'}[data[i].cstatus];
            }
            $('#employeetasklist').html(util.tmpl(<Template.tasklist>, {data: data, user: user, cnname: cnname}))
        });
    }

    var moduleWrap = {
        render: function () {
            container = $('#mainContainer');
            var param = {};
            manager.getMyTasking(param, function (data) {
                cacheData = data;
                for (var i = 0; i < data.length; i++) {
                    data[i].typename = util.getInfoById(sysbase, data[i].ftype)._value
                    data[i].last_modify_time = util.formatDate(data[i].last_modify_time);
                    data[i].create_time = util.formatDate(data[i].create_time);
                }
                container.html(util.tmpl(<Template.list wrap="'">, {data: cacheData}));
                init ();
            });
            manager.getEmployee({}, function (data) {
                $('#employee_task_list').html(util.tmpl(<Template.employee>, {data: data}));
                var last;
                $('#employee_task_list').find('.user_list').click(function () {
                    if (last) {
                        last.removeClass('user_list_curr');
                    }
                    last = $(this).addClass('user_list_curr');
                    getEmployeeTasking($(this).data('id'), $(this).text());
                }).eq(0).click();
            });
        }
    };
    module.exports = moduleWrap;
});