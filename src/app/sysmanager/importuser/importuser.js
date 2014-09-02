;define('app/sysmanager/importuser/importuser.js', function (require, exports, module) {
    var $ = require('$');
    var login = require('login');
    var event = require('event');
    var util = require('util');
    var manager = require('manager');
    var dialog = require('dialog');
    var slidepanel = require('widget/slidepanel/slidepanel');
    var cacheData;
    var op = 0;
    var slidewrap;
    var pinyin = require('hotoo/pinyin/2.1.2/pinyin-debug');
//    alert (pinyin("重点", {
//          style: pinyin.STYLE_INITIALS ,
//        }));
    function initEvent() {
        container.find('button[cmd="importUser"]').click(function () {
            var txt = $('#userRows').val();
            if (!txt) {
                dialog.create ('输入内容', 400, 200, {isMaskClickHide: 0, title: '操作结果', button: {
                    '确定': function() {
                        dialog.hide();
                    }
                }});
                return;
            }
            var rst = [];
            var ar = txt.split('\n');
            var job = {};
            
//            manager.setUser($.extend({
//                user_id: name,
//                cnname: cnname,
//                role_id: role_id,
//                dept_id: dept_id
////                note: note
//            }, op == 1 ? {id: $('#currentId').val()}: {}), function (d) {
//                slidepanel.hide();
//                user.render();
//            });
//          
            manager.getKeyValue({type: 5}, function (jobdata) {
                manager.getDept({}, function (deptdata) {
                    function matchjob (name) {
                        if (name == '男' || name == '女' || !name) {
                            return 73;
                        }
                        for (var i = 0; i < jobdata.length; i++) {
                            if (jobdata[i]._value == name) {
                                return jobdata[i].id;
                            }
                        }
                    }
                    function matchdept(name) {
                        name = name.split('/');
                        name = name[1] || name[0];
                        for (var i = 0; i < deptdata.length; i++) {
                            if (deptdata[i].name == name) {
                                return deptdata[i].id;
                            }
                        }
                    }
                    for (var i = 0; i < ar.length; i++) {
                        
                        var gender = ar[i].indexOf('男') > -1 ? 1 : 0;
                        
                        ar[i] = ar[i].replace(/\t?[男女]/g, '');
                        var r = ar[i].split(/\s/);
                        var jobname = r.pop();
                        rst.push({
                            user_id: r[2],
                            cnname: r[0],
                            gender: gender,
                            telno: r[r.length - 1] || '',    
                            dept_id: matchdept(r[1]),
                            jobs: matchjob(jobname)
                            
                        });
                    }
                    
                    
                    
                    
                    (function () {
                        if (rst.length == 0) {
                            return;
                        }
                        var row = rst.shift();
                        var fn = arguments.callee;
                        manager.setUser({
                            user_id: row.user_id,
                            cnname: row.cnname,
                            role_id: 52,
                            dept_id: row.dept_id,
                            jobs: row.jobs,
                            telno: row.telno
            //                note: note
                        }, function (d) {
                            fn();
                        });
                    }) ();
                            
                            
                });
            });
            
            
            
            
            
            console.log(job);
        });
        
        container.find('button[cmd="importDept"]').click(function () {
            var txt = $('#deptRows').val();
            if (!txt) {
                dialog.create ('输入内容', 400, 200, {isMaskClickHide: 0, title: '操作结果', button: {
                    '确定': function() {
                        dialog.hide();
                    }
                }});
                return;
            }
            var rst = [];
            var ar = txt.split('\n');
            for (var i = 0; i < ar.length; i++) {
                var r = ar[i].split(/\t/);
                rst.push({
                    name: r[0].replace(/^\s+/, ''), 
                    parent: 53, 
                    tel1: r[4] || '',
                    tel2: r[5] || '',
                    fax: r[6] || '',
                    code: pinyin(r[0].replace (/^\s+/, ''), {style: pinyin.STYLE_FIRST_LETTER }).join('').toUpperCase()
                });
            }
            var i = 0;
            (function () {
                if (rst.length == 0) {
                    return;
                }
                var row = rst.shift();
                var fn = arguments.callee;
                manager.setDept({
                    name: row.name,
                    codes: row.code,
                    parent: row.parent,
                    tel1:row.tel1,
                    tel2:row.tel2,
                    fax:row.fax,
                    ext: ''
                }, function (data) {
                    $('#iptdepttips').html('导入' + i + '条！');
                    fn();
                });
            }) ();
        });
    }
    
    var wrap = {
        render: function () {
            container = $('#mainContainer');
            container.html(<Template.ui>);
            initEvent();
        }
    };
    module.exports = wrap;
});