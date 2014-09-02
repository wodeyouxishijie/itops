define('app/startup/person/person', function (require, exports, module) {
    var $ = require('$');
    var util = require('util');
    var router = require('router');
    var manager = require('manager');
    var menu = require('app/menu/menu.js');
    var menuinited;
    module.exports = {
        render: function (id) {
//            (!menuinited || !id) && (menu.render('person'), menuinited = 1);
//            if ('undefined' == typeof id) {
//                return 
//            }
            var obj = require('app/' + id + '/' + id);
            if (!obj) {
                obj = require('app/person/' + id + '/' + id);
            }
            obj && obj.render('person', id);
        }
    }
});