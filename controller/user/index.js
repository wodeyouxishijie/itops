var controller = require('../base');
var dept = require('../../app_modules/dept');
var user = require('../../app_modules/user');
var xExtend = require('../../util/xExtend');
var ResErr = require('../../errors');
var async = require('../../node_modules/async');
var User = xExtend(controller, {
	handler: function () {
		this.res.end(this.req.cookies.uid);
	},

	getEmployee: function () {
		var req = this.req,
			res = this.res,
			op_user = req.cookies.uid;
		
		async.waterfall([
			function (cb) {
				var ar = [];
				dept.getDept({}, function (err, rst) {
					// 负责人
					for (var i = 0; i < rst.length; i++) {
						if (op_user == rst[i].leader1_id || op_user == rst[i].leader2_id) {
							ar.push(rst[i]);
						}
					}
					cb(null, ar);
				});
			},
			function (dept, cb) {
				var dept_ids = [];

				for (var i = 0; i < dept.length; i++) {
					dept_ids.push(dept[i].id);
				}
				user.getUser({where: ' dept_id in (' + dept_ids.join(',') + ')'}, cb);
			}
		], function (err, rst) {
			if (err) {
				new ResErr(req, res, err).print();
			}
			else {
				res.json({code: 0, data: rst});
			}
		});
	},
	getEmployeeTask: function () {
		
	}
});
module.exports = User;