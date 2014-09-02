;define('dest/login', function (require, exports, module) {
    var util = require('util');
    var $ = require('$');
    function addEvents () {
        $('form.form-signin').on('submit', function () {
            var userID = $('#user_id').val();
            var userPwd = $('#user_pwd').val();
            if (userID && userPwd) {
                this.action = '/login';
                return true;
            }
            
            return false;
        });
    }
    
    function initPage() {
        var loc = '';
        var errno = util.getQuery('err');
        switch (errno) {
            // 密码错误
            case '1':
                $('.ui-widget').removeClass('hide').find('.err_text').html('用户名密码错误！');
                break;
        }
    }
    
    function showErr() {
        
    }
    var loginModule = {
        init: function () {
            addEvents();
            initPage();
        },
        
        doLogin: function () {}
    }
    loginModule.init();
});

seajs.use('dest/login');
    