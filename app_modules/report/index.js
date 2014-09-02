var util = require('../mysql/util.js');
var conn = require('../mysql/conn.js');
var table = 'failure_report_list';
var user = require('../user');
var utillib = require('../util');
var async = require('async');

module.exports = {
	get: function (query, callback) {
		var typeid = query.typeid;
		var day = query.day || 7;
		if (!typeid) {
			callback ({code: -1});
			return;
		}
		
		
		var sql = ' select * from failure_report_list where ftype= ' + typeid;
		if (query.day) {
			var stime = new Date().getTime() - query.day * 24 * 3600 * 1000;
			stime = utillib.formatDate(new Date(stime), 'yyyy-MM-dd');
			sql += ' and create_time > \'' + stime + '\'';
		}
		sql += ' order by create_time desc ';
		var d = {};
		conn.query(sql, function (err, rst) {
			if (err) {
				console.log(err);
				callback (err);
			}
			else {
				for (var i = 0; i < rst.length; i++) {
					var dt = utillib.formatDate(rst[i].create_time, 'yyyy年MM月dd日');
					if (!d[dt]) {
						d[dt] = 0;
					}
					d[dt]++;
				}
				callback (null, d);
			}
		});
	}
}