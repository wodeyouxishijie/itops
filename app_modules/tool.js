var util = require('./mysql/util.js');
var conn = require('./mysql/conn.js');
var async = require('async');
var table = 'failure_report_list'
var sql = 'select id, note from ' + table;

var execs = function (sqls, callback) {
	var arfn = [], rsts = [];

	var createFn = function (sql, f) {
		var funcbody = 'return function (' + (f && 'n,' || '') + ' cb) {'
			+'conn.query(\'' + sql.replace(/'/g, '\\\'').replace(/[\r\n]/g, '<br/>') + '\', function (e, rst) {'
			+'	if (e) {'
			+'		cb (e);'
			+'	}'
			+'	else {'
			+'		rsts.push(rst);'
			+'		cb (null, rst);'
			+'	}'
			+'});'
			+'};';
		var fn = new Function ('conn', 'rsts', funcbody);

		return fn;
	};
	arfn.push((function (sql) {
		return createFn(sql)(conn, rsts);
	}) (sqls[0]));
	for (var i = 1; i < sqls.length; i++) {
		var fn = (function (sql) {
			return createFn(sql, 1)(conn, rsts);
		}) (sqls[i]);
		arfn.push(fn);
	}
	async.waterfall(arfn, function (err, rst) {
		callback(err, rsts, rst);
	});
}


conn.query(sql, function (err, rst) {
	if (err) {
		console.log(err);
	}
	else {
		var sqls = [];
		for (var i = 0; i < rst.length; i++) {
			var note = rst[i].note;
			var re = /src="([\s\S]*)"/gi, result;
			note = note.replace(re, function ($0, $1) {
				var extname;
				var base64Data = $1.replace(/^data:([^;]*);base64,/,function ($$0, $$1) {
					extname = $$1.split('/')[1];
					return "";
				});;
				

				
				var filename = ['pic', new Date().getTime(), Math.round(Math.random() * 1000000)].join('') + '.' + extname;
				require("fs").writeFile('../upfiles/' + filename, base64Data, 'base64', function(err) {
					// console.log(err);
				});
				return 'src="' + '/upfiles/' + filename + '"';
			});
			sqls.push(' update ' + table + ' set note=\'' + note + '\' where id='  + rst[i].id);
		}
		// console.log(sqls);
		execs(sqls, function (err, rst) {
			console.log(err, rst);
		});
	}
});