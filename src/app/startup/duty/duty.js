define('app/startup/duty/duty', function (require, exports, module) {
    var $ = require('$');
    var menu = require('app/menu/menu.js');
    var menuinited;
    module.exports = {
        render: function (id) {
//            (!menuinited || !id) && (menu.render('duty'), menuinited = 1);
//            if ('undefined' == typeof id) {
//                return 
//            }
            
            obj = require('app/duty/' + id + '/' + id);
            obj && obj.render('duty', id);
        },
        
        onRender: function () {
            setTimeout(function () {
                $('#topmenu li:eq(3)').addClass('active current');
            }, 1000);
        }
    }
});