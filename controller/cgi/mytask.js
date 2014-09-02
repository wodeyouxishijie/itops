var controller = require('../base');
var xExtend = require('../../util/xExtend');
var mytasking = require('../../app_modules/mytasking');
var async = require('../../node_modules/async');
var ResErr = require('../../errors');

var Todo = xExtend(controller, {
	getEmployeeTask: function () {
		var search = {};
        var req = this.req, res = this.res;
        mytasking.get({where: ' add_user in (' + req.query.uid + ')'}, function (err, list) {
            if (err) {
                new ResErr(req, res, err).print();
            }
            else {
                res.json({code: 0, data:list});
            }
        });
	}
});

module.exports = Todo;

