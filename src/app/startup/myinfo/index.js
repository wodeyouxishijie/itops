define('app/startup/myinfo/myinfo', function (require, exports, module) {
    var $ = require('$');
    var util = require('util');
    var event = require('event');
    var manager = require('manager');
    var dialog = require('dialog');
    module.exports = {
        render: function (id) {
            var container = $('#mainContainer');
            manager.getUser({id: g_User.id}, function (data) {
                fn(data);
            });
            function fn(data) {
                container.html(util.tmpl(<Template.edit>, {data:data[0]}));
                container.find('*[cmd="save_user_base"]').click(function () {
                    var tel = $('#iptTelno').val();
                    var qq = $('#iptqq').val();
                    manager.setUser({
                        id: g_User.id,
                        telno: tel,
                        qq: qq
                    }, function () {
                        dialog.miniTip('修改信息成功');
                    });
                });
                
                container.find('*[cmd="change_pwd"]').click(function () {
                    var oldpwd = $('#iptOldPwd').val();
                    var pwd = $('#iptPwd1').val();
                    var pwd2 = $('#iptPwd2').val();
                    if (pwd.length < 6) {
                        container.find('.alert[cmd="alert_tip"]').removeClass('hide').html('密码长度不能少于6位');
                        return;
                    }
                    if (pwd != pwd2) {
                        container.find('.alert[cmd="alert_tip"]').removeClass('hide').html('两次密码不一致');
                        return;
                    }
                    container.find('.alert[cmd="alert_tip"]').addClass('hide');
                    manager.setUser({
                        id: g_User.id,
                        pwd: pwd,
                        oldpwd: oldpwd
                    }, function (data) {
                        if (data.affectedRows == 0) {
                            dialog.miniTip('旧密码输入错误，不能完成修改。');
                            return;
                        }
                        dialog.miniTip('修改密码成功');
                    });
                });
            }
        }
    }
});
