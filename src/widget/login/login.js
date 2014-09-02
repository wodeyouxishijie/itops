define('widget/login/login', function (require, exports, module) {
    var util = require('util');
    module.exports = {
        isLogin: function () {
            return !!this.getLoginID();
        },
        
        getLoginID: function () {
            return util.cookie.get("user");
        },
        
        toLogin: function (dir) {
            location = '/login?ret' + encodeURIComponent(dir);
        },
        
        logout: function () {}
    }
});