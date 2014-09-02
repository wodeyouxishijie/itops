;define('app/person/mytodo/mytodo', function (require, exports, module) {
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
    var failure_status = require('app/userservice/failure_status/failure_status');
    var dept = require('app/dept/dept');
    var user = require('app/user/user');
    var cacheData;
    var cacheSoftwareData;
    var op = 0;
    var dateFormat = { dateFormat : "yy-mm-dd" };
    var slidewrap;
    var container;
    var cstatus;
    var currData;
    var currentTab = 'process_report';
    var currentTab1 = 'process_software';
    
    event.addCommonEvent('click', {
        'edit_todo': function (evt) {
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
                currData = dt;
                slidewrap = slidepanel.show({con:util.tmpl(<Template.edit>, {data: dt, op:op }) } ) ;
//                fillGradeSelect(dt.grade);
//                fillTypeSelect(dt.ftype);
                initCtl(dt);
                showProcess();
                saveEvent();
            });
            return false;
        },
        
        'edit_software_report_todo': function (evt) {
            var aitem = evt.target;
            if (aitem.nodeName != 'A') {
                return false;
            }
            op = 1;
            var id = $(evt.target).attr('reportid');
            app_util.getLoginInfo(function (info) {
                var dt = util.getInfoById(cacheSoftwareData, id);
                $.extend(dt, {
                    user_cn_name: info[0].cnname,
                    user_dept_name: info[0].deptname, 
                    user_dept: info[0].deptid,
                    user_id: info[0].id
                });
                slidewrap = slidepanel.show({con:util.tmpl(<Template.sedit>, {data: dt, op:op }) } ) ;
                
                initCtl1(dt);
                saveEvent();
            });
            return false;
        }
    });
    
    function initCtl1(dt) {
        dt = dt || {};
        $( "#iptApplyTime" ).datepicker(dateFormat);
        app_util.deptTypeAhead($( "#iptApplyDept" ), function (item, dv, txt, seldata) {
            $( "#applyDept" ).val(dv);
            $( "#iptApplyDept" ).val(seldata.name);
        });
        app_util.userTypeAhead($( "#iptApplyUser" ), function (item, dv, txt, seldata) {
            $( "#applyUser" ).val(dv);
            $( "#iptApplyUser" ).val(seldata.name);
        });
    };
    
    function initCtl (dt ) {
        dt = dt || {};
        app_util.fillKeyValueSelect(3, $('#report_type'), dt.ftype);
        app_util.fillKeyValueSelect(1, $('#report_grade'), dt.grade);
        app_util.fillKeyValueSelect(2, $('#report_status'), dt.cstatus);
        $( "#iptProcessDate" ).datepicker(dateFormat);
        $( "#iptDoneDate" ).datepicker(dateFormat);
        
        app_util.userTypeAhead($('#iptProcessUser'), function (item, dv, txt, seldata) {
            $('#processUser').val(dv)
            $('#iptProcessUser').val(seldata.cnname)
        });
        
        app_util.userTypeAhead($('#iptChangeProcessUser'), function (item, dv, txt, seldata) {
            $('#changeProcessUser').val(dv)
            $('#iptChangeProcessUser').val(seldata.cnname)
        });
        
        app_util.userTypeAhead($('#iptDoneUser'), function (item, dv, txt, seldata) {
            $('#doneUser').val(dv)
            $('#iptDoneUser').val(seldata.cnname)
        });
        app_util.userTypeAhead($('#iptDutyUser'), function (item, dv, txt, seldata) {
            $('#dutyUser').val(dv)
            $('#iptDutyUser').val(seldata.cnname)
        });
        initUserRole();
    }
    
    function initUserRole(id) {
        manager.getRole({}, function (data) {
            var ar = [];
            for (var i = 0; i < data.length; i++) {
                ar.push('<option value="' + data[i].id+ '">' + data[i].name + '</option>');
            }
//            $('#sel_duty_user').html(ar.join(''));
//            $('#sel_duty_user').val(currData.duty_user)
        });
    }

    function init() {
        addEvents();
        if (currentTab) {
            $('.nav_tabs_mod1 li').removeClass('active');
            $('.nav_tabs_mod1 li a[cmd="' + currentTab + '"]').parent().addClass('active');
        }
    }
    
    function initSoftware() {
        addEvents();
        if (currentTab1) {
            $('.nav_tabs_mod2 li').removeClass('active');
            $('.nav_tabs_mod2 li a[cmd="' + currentTab1 + '"]').parent().addClass('active');
        }
    }
    
    function showProcess() {
        $('button[cmd="show_process"]').click(function () {
            $('#process_wrap').toggleClass('hide');
//            $('#btnWrap').toggleClass('hide');
            return false;
        });
    }
    
    function addEvents() {
        container.find('a[cmd="addNew"]').unbind('click').click(function () {
            op = 0;
            app_util.getLoginInfo(function (info) {
                slidewrap = slidepanel.show({con:util.tmpl(<Template.edit>, {data: {id: '',name: '', note:'',power: '',user_cn_name: info[0].cnname,user_dept_name: info[0].deptname, user_dept: info[0].deptid,user_id: info[0].id }, op:op }) } ) ;
                initCtl();
                saveEvent();
                
            });
            return false;
        }); 
        container.find('a[cmd="new_report"]').unbind('click').click(function () {
            currentTab = 'new_report';
            initTable({cstatus: 76,process_user: g_User.id});
            return false;
        });
        container.find('a[cmd="done_report"]').unbind('click').click(function () {
            currentTab = 'done_report';
            initTable({cstatus: 75,process_user: g_User.id}, {cstatus: 75});
            return false;
        });
        // 待处理任务
        container.find('a[cmd="process_report"]').unbind('click').click(function () {
            currentTab = 'process_report';
            initTable({cstatus: '76,74',process_user: g_User.id}, {cstatus: 76});
            return false;
        });
        
        // 处理中任务
        container.find('a[cmd="process_ing"]').unbind('click').click(function () {
            currentTab = 'process_ing';
            initTable({cstatus: 74,process_user: g_User.id}, {cstatus: 74});
            return false;
        });
        
        container.find('a[cmd="process_software"]').unbind('click').click(function () {
            currentTab1 = 'process_software';
            initTableSoftware({cstatus:0});
            return false;
        });
        container.find('a[cmd="done_software"]').unbind('click').click(function () {
            currentTab1 = 'done_software';
            initTableSoftware({cstatus:1});
            return false;
        });
    }
    
    function saveEvent( ) {
        slidewrap.find('a[cmd="save"]').unbind('click').click(function () {
            var title = $('#iptTitle').val();
            var telno = $('#iptTelNo').val();
            var report_type = $('#report_type').val();
            var report_grade = $('#report_grade').val();
            var note = $('#iptNote').val();
            var user_id = $('#iptUserID').val();
            var user_dept = $('#iptUserDept').val();
            var ProcessUser = $('#processUser').val();
            var iptProcessDate = $('#iptProcessDate').val();
            var iptDoneUser = $('#doneUser').val();
            var iptDoneDate = $('#iptDoneDate').val();
            if (title == '') {
                alert ('标题不能为空');
                return;
            }
            var params = {
                title: title,
                duty_user: 0,
                process_user: ProcessUser || 0,
                done_user: iptDoneUser || 0,
                repair_user: user_id,
                repair_dept: user_dept,
                apply_time: iptProcessDate,
                end_time: iptDoneDate,
                grade: report_grade,
                ftype: report_type,
                note: note,
                cstatus: 76
            };
            if (op ==1 ) {
                params.id = $('#currentId').val();
            }
            manager.setTasking(params, function (d) {
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
                    manager.delTasking({id: id}, function () {
                        dialog.miniTip('删除成功');
                        slidepanel.hide();
                        moduleWrap.render();
                    });
                }
            }}); 
            
            return false;
        });
        
        function p(st) {}
        slidewrap.find('button[cmd="start_exec"]').unbind('click').click(function () {
            if (!$('#iptProcessNote').val()) {
                alert ('请输入处理意见');
                return;
            }
            var changeUser = $('#changeProcessUser').val();
            
            manager.setTasking({
                id: $('#currentId').val(),
                duty_user: $('#sel_duty_user').val(),
                apply_time: $('#iptProcessDate').val(),
                process_user: changeUser || $('#processUser').val(),
                cstatus: changeUser ? 76 : 74
            }, function (d) {
                var action = 'set' + currData.task_src.replace('_list', '').replace(/(^\w)/, function(_0, _1) {return _1.toUpperCase()}).replace(/_(\w)/, function(_0, _1) {return _1.toUpperCase()});
                var complete = function () {
                    manager.sendMail({
                        to_user_id: $('#repaireUser').val(),
                        from_user_id: g_User.id,
                        content: changeUser ? '%from_user%给你分配了一张故障单，请进入系统进行处理': '%from_user%正在处理你的故障单，请登录系统查看'
                    });
                };
                var fn = manager[action];
                fn && fn({
                    id: currData.main_id,
                    process_user: changeUser || currData.user_id,
                    last_process_time: util.getCurrentTime(1),
                    cstatus: changeUser ? 76 : 74
                }, complete);
                manager.setProcessLog({
                    src: 'tasking_list', 
                    status_type: 2, 
                    cstatus: currData.cstatus, 
                    main_id: currData.main_id,
                    dest_status: changeUser ? 76 : 74,
                    from_table: currData.task_src,
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
        
        slidewrap.find('button[cmd="done_exec"]').unbind('click').click(function () {
            if (!$('#iptProcessNote').val()) {
                alert ('请输入处理意见');
                return;
            }
			var changeUser = $('#changeProcessUser').val();
			var params = {
                id: $('#currentId').val(),
                cstatus: 75,
                done_user: currData.user_id
            };
			if (changeUser) {
				delete params.cstatus;
				delete params.done_user;
				params.process_user = changeUser;
			}
            manager.setTasking(params, function (d) {
                var action = 'set' + currData.task_src.replace('_list', '').replace(/(^\w)/, function(_0, _1) {return _1.toUpperCase()}).replace(/_(\w)/, function(_0, _1) {return _1.toUpperCase()});
                var complete = function () {
                    manager.sendMail({
                        to_user_id: $('#repaireUser').val(),
                        from_user_id: g_User.id,
                        content: '%from_user%已经处理完你的故障申请，请登录系统产看详情并评分'
                    });
                };
                var fn = manager[action];
				var params = {
                    id: currData.main_id,
                    done_user: currData.user_id,
                    end_time: util.getCurrentTime(1),
                    cstatus: 75
                };
				if (changeUser) {
					delete params.cstatus;
					delete params.done_user;
					params.process_user = changeUser;
				}
                fn && fn(params, complete);
                params = {
                    src: 'tasking_list', 
                    status_type: 2, 
                    cstatus: currData.cstatus, 
                    main_id: currData.main_id,
                    dest_status: 75,
                    from_table: currData.task_src,
                    note: $('#iptProcessNote').val()
                };
				if (changeUser) {
					delete params.cstatus;
				}
                manager.setProcessLog(params, function (d) {
                    dialog.create ('操作成功', 400, 200, {isMaskClickHide: 0, title: '操作结果', button: {
                        '确定': function() {
                            dialog.hide();
                            slidepanel.hide();
                            initTable({cstatus: '76,74',process_user: g_User.id}, {cstatus: 76});
                        }
                    }});
                });
            });
        });
        
        slidewrap.find('a[cmd="save_software_todo"]').unbind('click').click(function () {
            var result = $('#iptResult').val();
            var chkStatus = +$('#chkStatus')[0].checked;
            var params = {
                id: $('#currentSoftwareId').val(),
                result: result,
                cstatus: '2' // 状态未2转入下一个流程
            };
            manager.setSoftwareReport(params, function (d) {
                dialog.create ('操作成功', 400, 200, {isMaskClickHide: 0, title: '操作结果', button: {
                    '确定': function() {
                        dialog.hide();
                        slidepanel.hide();
                    }
                }});
                manager.setProcessLog({
                    src: 'software_report_list', 
                    status_type: 2, 
                    cstatus: 0, 
                    main_id: $('#currentSoftwareId').val(),
                    dest_status: 2,
                    from_table: 'software_report_list',
                    note: result
                }, function () {});
                initTableSoftware({cstatus: 0});
            });
            return false;
        });
        slidewrap.find('a[cmd="refuse_software_todo"]').unbind('click').click(function () {
            var result = $('#iptResult').val();
            var chkStatus = +$('#chkStatus')[0].checked;
            var params = {
                id: $('#currentSoftwareId').val(),
                result: result,
                cstatus: '4' // 状态未4驳回
            };
            manager.setSoftwareReport(params, function (d) {
                dialog.create ('操作成功', 400, 200, {isMaskClickHide: 0, title: '操作结果', button: {
                    '确定': function() {
                        dialog.hide();
                        slidepanel.hide();
                    }
                }});
                manager.setProcessLog({
                    src: 'software_report_list', 
                    status_type: 2, 
                    cstatus: 0, 
                    main_id: $('#currentSoftwareId').val(),
                    dest_status: 4,
                    from_table: 'software_report_list',
                    note: result
                }, function () {});
                initTableSoftware({cstatus: 0});
            });
            return false;
        });
        slidewrap.find('a[cmd="complete_software_todo"]').unbind('click').click(function () {
            var result = $('#iptResult').val();
            var chkStatus = +$('#chkStatus')[0].checked;
            var params = {
                id: $('#currentSoftwareId').val(),
                result: result,
                cstatus: '1' // 已完成流程结束
            };
            manager.setSoftwareReport(params, function (d) {
                dialog.create ('操作成功', 400, 200, {isMaskClickHide: 0, title: '操作结果', button: {
                    '确定': function() {
                        dialog.hide();
                        slidepanel.hide();
                    }
                }});
                manager.setProcessLog({
                    src: 'software_report_list', 
                    status_type: 2, 
                    cstatus: 0, 
                    main_id: $('#currentSoftwareId').val(),
                    dest_status: 1,
                    from_table: 'software_report_list',
                    note: result
                }, function () {});
                initTableSoftware({cstatus: 0});
            });
            return false;
        });
        slidewrap.find('a[cmd="change_process_user"]').unbind('click').click(function () {
            slidewrap.find('div.change_process_user').removeClass('hide');
            return false;
        });
    }
    function initTable(param, param2) {
        cacheData = [];
        var processdata = function (d) {
            for (var i = 0; i < cacheData.length; i++) {
                if (cacheData[i].id == d.id) {
                    return;
                }
            }
            d.gradename = app_util.changeColor(util.getInfoById(sysbase, d.grade)._value);
            d.typename = util.getInfoById(sysbase, d.ftype)._value
            d.statusname = util.getInfoById(sysbase, d.cstatus)._value || '未处理';


            d.last_process_time = util.formatDate(d.last_process_time);
            d.create_time = util.formatDate(d.create_time);
            d.done_time = util.formatDate(d.done_time);
            d.apply_time = util.formatDate(d.apply_time);
            d.end_time = util.formatDate(d.end_time);

            cacheData.push(d);
        };
        var loadnum = [];
        manager.getTasking(param, function (data) {
//            cacheData = data;
            for (var i = 0; i < data.length; i++) {
                if (data[i].process_user == g_User.id) {
                    processdata(data[i]);
                }
            }
            loadnum.push('1');
        });
        // 获取我的角色和故障单类型的对应关系
        manager.getTasking(param2, function (list) {
            manager.getFailureTypeRole({role_id: g_User.role_id}, function (relations) {
                var ar = [];
                for (var i = 0; i < relations.length; i++) {
                    ar.push(relations[i].failure_type);
                }
                
                $.each(list, function (i, n) {
                    if ((',' + ar.join(',') + ',').indexOf(String(n.ftype)) > -1) {
                        processdata(n);
                    }
                });
                loadnum.push('1');
            });
        });
        var timer;
        var fn = function () {
            if (loadnum.length == 2) {
                $('#failure_todo_list').html(util.tmpl(<Template.list1 wrap="'">, {data: cacheData}));
                init ();
                return;
            }
            timer = setTimeout(fn, 100);
        };
        fn();
        setTimeout(function () {
            clearTimeout(timer);
        }, 5000);
    }
    
    function initTableSoftware(param) {
        if (g_User.job_id == 91 && param.cstatus == 0 ) {
            param.cstatus = 2;
        }
        
        function dataLoaded(data) {
            $('#software_todo_list').html(util.tmpl(<Template.list2 wrap="'">, {software_data: data}));
            initSoftware();
        }
        manager.getSoftwareTodo(param, function (software_data) {
            cacheSoftwareData = software_data;
            for (var i = 0; i < software_data.length; i++) {

                software_data[i].create_time = util.formatDate(software_data[i].create_time);
                software_data[i].apply_time = util.formatDate(software_data[i].apply_time);

                software_data[i].statusname = {'0': '未完成', '1': '已完成', '2': '上级已同意'}[software_data[i].cstatus];
            }
            
            dataLoaded(software_data);
            
        });
    }
    
    var moduleWrap = {
        render: function () {
            container = $('#mainContainer');
            var param = {};
            currentTab = 'process_report';
            currentTab1 = 'process_software';
            container.html(<Template.list wrap="'">);
            initTable({cstatus: '76,74',process_user: g_User.id}, {cstatus: 76});
            initTableSoftware({cstatus:0});
        }
    };
    module.exports = moduleWrap;
});