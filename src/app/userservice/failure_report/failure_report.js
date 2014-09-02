;define('app/userservice/failure_report/failure_report.js', function (require, exports, module) {
    var $ = require('$');
    var login = require('login');
    var event = require('event');
    var util = require('util');
    var dialog = require('dialog');
    var manager = require('manager');
    var slidepanel = require('widget/slidepanel/slidepanel');
    var app_util = require('main/app_util');
    var user = require('app/user/user');
    var ve = require('editor/ve');
    var cacheData;
    var op = 0;
    var dateFormat = { dateFormat : "yy-mm-dd " };
    var slidewrap;
    var container;
    var cstatus;
    var editorObj;
    var scoreEditObj;
    var newscored = {};
    var currentTab = 'new_report';
    
    event.addCommonEvent('click', {
        'edit_failure_report': function (evt) {
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
                slidewrap = slidepanel.show({con:util.tmpl(<Template.edit>, {data: dt, op:op,newscored: newscored }) } ) ;
                initCtl(dt);
                showProcess(dt);
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
    
    function initCtl (dt ) {
        dt = dt || {};
        app_util.fillKeyValueSelect(1, $('#report_grade'), dt.grade);
        app_util.fillKeyValueSelect(3, $('#report_type'), dt.ftype);
        app_util.fillKeyValueSelect(2, $('#report_status'), dt.ftype);
        $( "#iptProcessDate" ).datepicker(dateFormat);
        $( "#iptDoneDate" ).datepicker(dateFormat);
        app_util.userTypeAhead($('#iptProcessUser'), function (item, dv, txt, seldata) {
            $('#processUser').val(dv)
            $('#iptProcessUser').val(seldata.cnname)
        });
        app_util.userTypeAhead($('#iptDoneUser'), function (item, dv, txt, seldata) {
            $('#doneUser').val(dv)
            $('#iptDoneUser').val(seldata.cnname)
        });
        app_util.userTypeAhead($('#iptDutyUser'), function (item, dv, txt, seldata) {
            $('#dutyUser').val(dv)
            $('#iptDutyUser').val(seldata.cnname)
        });
        
        if (op == 1 && dt.process_user && dt.cstatus == 75) {
            $("#editFailureNote").html(dt.note);
        }
        else {
            editorObj =new ve.Create({
                container:$("#editFailureNote")[0],
                height:'300px',
                width:'600px'
            });
            editorObj.setContent(dt.note);
        }
        
        if ($("#score_note").size()) {
            scoreEditObj =new ve.Create({
                container:$("#score_note")[0],
                height:'100px',
                width:'600px'
            });
        }
    }
    
    function addEvents() {
        container.find('a[cmd="addNew"]').unbind('click').click(function () {
			var btn = this;
			
            op = 0;
            app_util.getLoginInfo(function (info) {
                slidewrap = slidepanel.show({con:util.tmpl(<Template.edit>, {data: {id: '',name: '', note:'',power: '',user_cn_name: info[0].cnname,user_dept_name: info[0].deptname, user_dept: info[0].deptid,user_id: info[0].id,tel: info[0].telno,clientip:clientIP }, op:op }) } ) ;
                initCtl();
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
    
    function showProcess() {
        var loaded = 0;
   
        !loaded && manager.getLog({
            target: 'failure_report',
            id:$('#currentId').val()
        }, function (data) {
            for (var i = 0; i < data.length; i++) {
                data[i].last_modify_time = util.formatDate(data[i].last_modify_time);
            }
            var html = util.tmpl(<Template.log_list>, {data: data});
            $('#process_wrap').html(html);
            loaded = 1;
        });
           
        var score_grade;
        $('#score_wrap input[type="radio"]').click(function (){
            score_grade = this.value;
            $('#score_note')[score_grade == 1 ? 'removeClass': 'addClass']('hide');
        });
        $('*[cmd="submit_score"]').unbind('click').click(function () {
            var param = {
                typeid: 'failure_report_list',
                grade: score_grade,
                mainid: $('#currentId').val(),
                note: score_grade == 1 ? scoreEditObj.getContent(): ''
            };
            console.log(param);
            
            manager.setScore(param, function () {
                newscored[$('#currentId').val()] = score_grade;
                $('#score_wrap').html('您已评论改故障单');
            });
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
            var dutyUser = $('#dutyUser').val();
            var iptProcessDate = $('#iptProcessDate').val();
            var iptDoneUser = $('#doneUser').val();
            var iptDoneDate = $('#iptDoneDate').val();
            var iptTelNo = $('#iptTelNo').val();
            if (title == '') {
                alert ('标题不能为空');
                return;
            }
            var params = {
                title: title,
                duty_user: 0,
                process_user: ProcessUser || 0,
                done_user: iptDoneUser || 0,
                repair_user: user_id || 0,
                repair_dept: user_dept || 0,
//                last_process_time: iptProcessDate,
//                done_time: iptDoneDate || ,
                grade: report_grade,
                ftype: report_type,
                note: note,
                tel: iptTelNo,
                clientip: clientIP,
                duty_user: dutyUser || 0,
                cstatus: 76
            };
            if (op ==1 ) {
                params.id = $('#currentId').val();
            }
			var btn = this;
			btn.disabled = true;
            manager.setFailureReport(params, function (d) {
                dialog.create ('操作成功', 400, 200, {isMaskClickHide: 0, title: '操作结果', button: {
                    '确定': function() {
                        dialog.hide();
                    }
                }});
                currentTab = 'new_report';
                slidepanel.hide();
				btn.disabled = false;
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
                        dialog.miniTip ('删除成功');
                        slidepanel.hide();
                        moduleWrap.render();
                    });
                }
            }}); 
            
            return false;
        });
        
        slidewrap.find('button[cmd="process"]').unbind('click').click(function () {
            manager.setFailureReport({
                id: $('#currentId').val(),
                cstatus:$('#report_status').val()
            }, function (d) {
                manager.setProcessLog({
                    src: 'failure_report_list', 
                    status_type: 2, 
                    cstatus: cstatus, 
                    main_id: $('#currentId').val(),
                    dest_status: $('#report_status').val(),
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
         manager.getFailureReport(param, function (data) {
            for (var i = 0; i < data.length; i++) {
                data[i].gradename = app_util.changeColor(util.getInfoById(sysbase, data[i].grade)._value);
                data[i].typename = util.getInfoById(sysbase, data[i].ftype)._value
                data[i].statusname = util.getInfoById(sysbase, data[i].cstatus)._value || '未处理';

                data[i].create_time = util.formatDate(data[i].create_time);
                data[i].last_process_time = util.formatDate(data[i].last_process_time);
                data[i].done_time = util.formatDate(data[i].done_time);
                data[i].end_time = util.formatDate(data[i].end_time);
            }
            cacheData = data;
            container.html(util.tmpl(<Template.list wrap="'">, {data: cacheData}));
            init ();
        });
    }
    
    var moduleWrap = {
        render: function () {
            container = $('#mainContainer');
            var param = {cstatus:76};
            currentTab = 'new_report';
            initTable(param);
        }
    };
    module.exports = moduleWrap;
});