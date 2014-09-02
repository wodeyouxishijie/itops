define('main/app_util', function(require, exports, module) {
    var $ = require('$');
    var util = require('util');
    var manager = require('manager');
//    var failure_grade = require('app/userservice/failure_grade/failure_grade');
//    var failure_type = require('app/userservice/failure_type/failure_type');
//    var failure_status = require('app/userservice/failure_status/failure_status');
    var user = require('app/user/user');
    var pinyin = require('hotoo/pinyin/2.1.2/pinyin-debug');
    var userData;
    module.exports = {
        getLoginInfo: function (callback) {
            var user_id = util.cookie.get('user');
            manager.getUserInfo({}, function (data) {
                callback(data.user, data.roleData);
            });
        },
        
        fillKeyValueSelect: function (type, sel, val, callback) {
            var ar = [], ds = {};
            if (sysbase) {
                for (var i = 0; i < sysbase.length; i++) {
                    if (type == sysbase[i].type) {
                        ar.push('<option value="' + sysbase[i].id + '">' + sysbase[i]._value + '</option>');
                    }
                }
                sel.html('').append(ar.join(''));
                val && sel.val(val);
                callback && callback(ar)
            }
        },
        
        
        renderRoleSelect: function (sel, val, callback) {
            manager.getRole({}, function (list) {
                for (var i = 0; i < list.length; i++) {
                    sel.append('<option value="' + list[i].id + '">' + list[i].name + '</option>');
                }
                val && sel.val(val);
                if (typeof callback == 'function') {
                    callback(list);
                }
            });
        },
        
        deptTypeAhead: (function () {
            var deptData;
            var loading = 0;
            var args = [];
            return function (ipt, onchange) {
                var fn = function (data) {
                    for (var i = 0; i < args.length; i++){
                        args[i][0].typeahead({
                            source: data,
                            display: 'codes,name',
                            item: '<li><a href="#" class="hide" style="display:none;"></a><a href="#"></a></li>',
                            itemSelected: (function (_onchange) {
                                return function (item, dv, txt, seldata) {
                                    if (typeof _onchange == 'function') {
                                        _onchange(item, dv, txt, seldata);
                                    }
                                }
                            }) (args[i][1])
                        });
                    }
                    loading = 0;
                };
                args.push([ipt, onchange]);
                if (loading) {
                    return;
                }
                if (deptData) {
                    fn(deptData);
                    return;
                }
                manager.getDept({}, function (data) {
                    deptData = data;
                    fn(data);
                });
                loading = 1;
            }
        }) (),
        
        userTypeAhead: (function () {
            var userData;
            var loading = 0;
            var callbacks = [];
            return function (ipt, onchange) {
                var fn = function (data) {
                    $.each(data, function (i, n) {
                        n.py = pinyin(n.cnname.replace (/^\s+/, ''), {style: pinyin.STYLE_FIRST_LETTER }).join('').toUpperCase();
                        n.py_pull = pinyin(n.cnname.replace (/^\s+/, ''), {style: pinyin.STYLE_NORMAL  }).join('').toUpperCase();
                    });
                    while(callbacks.length) {
                        var arg = callbacks.shift();
                        arg[0].typeahead({
                            source: data,
                            display: 'user_id,py,cnname', 
                            item: '<li><a href="#" class="hide" style="display:none;"></a><a href="#" class="hide" style="display:none;"><a href="#"></a></li>',
                            val_replace: function (val) {
                                var py = pinyin(val.replace (/^\s+/, ''), {style: pinyin.STYLE_FIRST_LETTER }).join('').toUpperCase();
                                return py;
                            },
                            items: 20,
                            itemSelected: (function (_onchange) {
                                return function (item, dv, txt, seldata) {
                                    if (typeof _onchange == 'function') {
                                        _onchange(item, dv, txt, seldata);
                                    }
                                }
                            }) (arg[1])
                        });
                    }
                    loading = 0;
                };
                callbacks.push([ipt, onchange]);
                if (loading) {
                    return;
                }
                if (userData) {
                    fn(userData);
                    return;
                }
                manager.getUser({}, function (data) {
                    userData = data;
                    fn(data);
                });
                loading = 1;
            }
        }) (),
        
        changeColor: function (grade) {
            return {
                '一般': '<font size="3" color="#2b4490">一般</font>',
                '紧急': '<font size="4" color="#ef5b9c ">紧急</font>',
                '非常紧急': '<font size="5" color="red">非常紧急</font>',
                '不紧急': '<font color="">不紧急</font>'
            }[grade];
        }
    }
});
