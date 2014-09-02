;define('app/duty/taskassign/taskassign.js', function (require, exports, module) {
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
    var ve = require('editor/ve');
    var cacheData;
    var op = 0;
    var dateFormat = { dateFormat : "yy-mm-dd" };
    var slidewrap;
    var container;
    var cstatus;
    var currData;
    var currentTab = 'new_report';
    var editorObj;
    var currQuery;
    
    event.addCommonEvent('click', {
        'edit_tasking': function (evt) {
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
                    user_id: info[0].id,
                    current_time: util.getCurrentTime(1)
                });
                currData = dt;
                slidewrap = slidepanel.show({con:util.tmpl(<Template.edit>, {data: dt, op:op }) } );
                initCtl(dt);
                showProcess();
                saveEvent();
            });
            return false;
        },

        'tasking-page': function (evt) {
            var aitem = evt.target;
            if (aitem.nodeName != 'A') {
                return false;
            }
            var cp = $(aitem).data('page');
            if (typeof cp != 'undefined') {
                currQuery.cp = cp;
                initTable(currQuery);
                $('.pagination').find('li').removeClass('active');
                $(this).parent().addClass('active');
            }
        }
    });
    
    function initCtl (dt ) {
        dt = dt || {};
		
		var type_change = function () {
			var type_id = $('#report_type').val();
			manager.getFailureTypeRole({type_id: type_id}, function (data) {
				if (op == 0) {
					var ar = [];
					for (var i = 0; i < data.length; i++) {
						ar.push('<option value="' + data[i].id + '">' + data[i].cnname + '</option>');
					}
					$('#sel_duty_user').html(ar.join('')).change(function () {
						$('#processUser').val($(this).val());
					}).show();
					$('#processUser').val($('#sel_duty_user').val());
					if (ar.length > 0) {  
						$('#iptProcessUser').hide();
					}
					else {
						$('#iptProcessUser').show();
						$('#sel_duty_user').hide();
					}
				}
			});
		};
		
		$('#report_type').change(type_change);
		
		
        app_util.fillKeyValueSelect(3, $('#report_type'), dt.ftype, type_change);
        app_util.fillKeyValueSelect(1, $('#report_grade'), dt.grade);
        app_util.fillKeyValueSelect(2, $('#report_status'), dt.cstatus);
        $( "#iptProcessDate" ).datepicker(dateFormat);
        $( "#iptDoneDate" ).datepicker(dateFormat);
        
        app_util.userTypeAhead($('#iptProcessUser'), function (item, dv, txt, seldata) {
            $('#processUser').val(dv);
            $('#iptProcessUser').val(seldata.cnname);
        });
        app_util.userTypeAhead($('#iptRepairUserName'), function (item, dv, txt, seldata) {
            $('#iptRepairUser').val(dv);
            $('#iptTelNo').val(seldata.telno);
            $('#iptRepairDeptName').val(seldata.deptname);
            $('#iptRepairDept').val(seldata.deptid);
            $('#iptRepairUserName').val(seldata.cnname);
        });
        
        app_util.deptTypeAhead($('#iptRepairDeptName'), function (item, dv, txt, seldata) {
            $('#iptRepairDept').val(dv);
            $('#iptRepairDeptName').val(txt);
        });
		
		
//		type_change.call($('#report_type')[0]);
        
        if (op == 0) {
            editorObj =new ve.Create({
                container:$("#editFailureNote")[0],
                height:'300px',
                width:'600px'
            });
        }
        
//        initUserRole();
    }
    
    function initUserRole(id) {
        manager.getRole({}, function (data) {
            var ar = [];
            for (var i = 0; i < data.length; i++) {
                ar.push('<option value="' + data[i].id+ '">' + data[i].name + '</option>');
            }
            $('#sel_duty_user').html(ar.join(''));
        });
    }

    function init() {
        addEvents();
        if (currentTab) {
            $('.nav-tabs li').removeClass('active');
            $('.nav-tabs li a[cmd="' + currentTab + '"]').parent().addClass('active');
        }
    }
    
    function showProcess() {
        $('button[cmd="show_process"]').click(function () {
            $('#process_wrap').toggleClass('hide');
//            $('#btnWrap').toggleClass('hide');
            return false;
        });

        var loaded = 0;
   
        !loaded && manager.getLog({
            target: $('#currentTable').val(),
            id:$('#currentMainId').val()
        }, function (data) {
            for (var i = 0; i < data.length; i++) {
                data[i].last_modify_time = util.formatDate(data[i].last_modify_time);
            }
            var html = util.tmpl(<Template.log_list>, {data: data});
            $('#process_log_wrap').html(html);
            loaded = 1;
        });
    }
    
    function addEvents() {
        container.find('a[cmd="addNew"]').unbind('click').click(function () {
            op = 0;
            app_util.getLoginInfo(function (info) {
                slidewrap = slidepanel.show({con:util.tmpl(<Template.edit>, {data: {id: '',name: '',tel:info[0].telno,user_cn_name: info[0].cnname,user_dept_name: info[0].deptname, user_dept: info[0].deptid,user_id: info[0].id,cstatus:76,current_time:util.getCurrentTime(1),clientip:clientIP }, op:op }) } ) ;
                initCtl();
                saveEvent();
            });
            return false;
        }); 
        container.find('a[cmd="new_report"]').unbind('click').click(function () {
            currentTab = 'new_report';
            initTable(currQuery = {cstatus: 76});
            return false;
        });
        container.find('a[cmd="done_report"]').unbind('click').click(function () {
            currentTab = 'done_report';
            initTable(currQuery = {cstatus: 75});
            return false;
        });
        container.find('a[cmd="process_report"]').unbind('click').click(function () {
            currentTab = 'process_report';
            initTable(currQuery = {cstatus: 74});
            return false;
        });
    }
    
    function saveEvent( ) {
        slidewrap.find('a[cmd="save"]').unbind('click').click(function () {
            var title = $('#iptTitle').val();
            var telno = $('#iptTelNo').val();
            var report_type = $('#report_type').val();
            var report_grade = $('#report_grade').val();
            var note = editorObj.getContent();//$('#iptNote').val();
            var user_id = $('#iptUserID').val();
            var user_dept = $('#iptUserDept').val();
            var ProcessUser = $('#processUser').val();
            var iptProcessDate = $('#iptProcessDate').val();
            var iptDoneUser = $('#doneUser').val();
            var iptDoneDate = $('#iptDoneDate').val();
            var repair_user = $('#iptRepairUser').val();
            var repair_dept = $('#iptRepairDept').val();
            var iptTel = $('#iptTelNo').val();
            if (title == '') {
                alert ('标题不能为空');
                return;
            }
            var params = {
                title: title,
                duty_user: 0,
                process_user: ProcessUser || 0,
                repair_user: repair_user || user_id,
                repair_dept: repair_dept || user_dept,
//                end_time: iptDoneDate,
                grade: report_grade,
                ftype: report_type,
                note: note,
                task_src: 'failure_report_list',
                tel:iptTel,
                clientip: clientIP,
                cstatus: 74
            };
            if (op ==1 ) {
                params.id = $('#currentId').val();
            }
//            manager.setTasking(params, function (d) {
                manager.setFailureReport(params, function (ret) {
                    manager.sendMail({
                        to_user_id: ProcessUser,
                        from_user_id: g_User.id,
                        content: '%from_user%给你分配了一张故障单，请进入系统进行处理'
                    });
                    dialog.create ('操作成功', 400, 200, {isMaskClickHide: 0, title: '操作结果', button: {
                        '确定': function() {
                            dialog.hide();
                            slidepanel.hide();
                            moduleWrap.render();
                        }
                    }});
                    
                });
                
//            });
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
			var btn = this;
			btn.disabled = true;
			var ProcessUser = $('#processUser').val();
            manager.setTasking({
                id: $('#currentId').val(),
                duty_user: $('#sel_duty_user').val() || ProcessUser,
                apply_time: $('#iptProcessDate').val(),
                process_user: $('#sel_duty_user').val() || ProcessUser,
                cstatus: 74
            }, function (d) {
                var action = 'set' + currData.task_src.replace('_list', '').replace(/(^\w)/, function(_0, _1) {return _1.toUpperCase()}).replace(/_(\w)/, function(_0, _1) {return _1.toUpperCase()});
                var fn = manager[action];
                var complete = function () {
                    manager.sendMail({
                        to_user_id: ProcessUser,
                        from_user_id: g_User.id,
                        content: '%from_user%给你分配了一张故障单，请进入系统进行处理'
                    });
                };
                fn && fn({
                    id: currData.main_id,
                    process_user: currData.user_id,
                    last_process_time: util.getCurrentTime(1),
                    cstatus: 74
                },complete);
                manager.setProcessLog({
                    src: 'tasking_list', 
                    status_type: 2, 
                    cstatus: currData.cstatus, 
                    main_id: currData.main_id,
                    dest_status: 76,
                    from_table: currData.task_src,
                    note: $('#iptProcessNote').val()
                }, function (d) {
                    dialog.create ('操作成功', 400, 200, {isMaskClickHide: 0, title: '操作结果', button: {
                        '确定': function() {
                            dialog.hide();
                            slidepanel.hide();
                            moduleWrap.render();
							btn.disabled = false;
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
            manager.setTasking({
                id: $('#currentId').val(),
                cstatus: 75
            }, function (d) {
                var action = 'set' + currData.task_src.replace('_list', '').replace(/(^\w)/, function(_0, _1) {return _1.toUpperCase()}).replace(/_(\w)/, function(_0, _1) {return _1.toUpperCase()});
                var fn = manager[action];
                fn && fn({
                    id: currData.main_id,
                    done_user: currData.user_id,
                    end_time: util.getCurrentTime(1),
                    cstatus: 75
                });
                
                manager.setProcessLog({
                    src: 'tasking_list', 
                    status_type: 2, 
                    cstatus: currData.cstatus, 
                    main_id: currData.main_id,
                    dest_status: 75,
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
    }
    
    function initTable(param) {
        manager.getTasking(param, function (data, page) {
            cacheData = data;
            for (var i = 0; i < data.length; i++) {
                data[i].gradename = app_util.changeColor(util.getInfoById(sysbase, data[i].grade)._value);
                data[i].typename = util.getInfoById(sysbase, data[i].ftype)._value
                data[i].statusname = util.getInfoById(sysbase, data[i].cstatus)._value || '未处理';

                data[i].create_time = util.formatDate(data[i].create_time);
                data[i].last_process_time = util.formatDate(data[i].last_process_time);
                data[i].done_time = util.formatDate(data[i].done_time) ;
                data[i].apply_time = util.formatDate(data[i].apply_time) ;
                data[i].end_time =util.formatDate(data[i].end_time);
            }
            container.html(util.tmpl(<Template.list wrap="'">, {data: cacheData, page: page}));
            init ();
        });
    }
    
    var moduleWrap = {
        render: function () {
            container = $('#mainContainer');
            var param = {};
            currentTab = 'new_report';
            initTable({cstatus: 76});
        }
    };
    module.exports = moduleWrap;
});