;define('app/app.js', function (require, exports, module) {
    var $ = require('$');
    var util = require('util');
    var menu = require('app/menu/menu');
    module.exports = {
        render: function () {
            
            menu.render($('#manageMain'));
        }
    }
});
