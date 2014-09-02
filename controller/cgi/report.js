var controller = require('../base');
var xExtend = require('../../util/xExtend');
var report = require('../../app_modules/report');
var async = require('../../node_modules/async');
var ResErr = require('../../errors');

module.exports = xExtend(controller, {
    'getReportData': function () {
        var req = this.req, res = this.res;
        report.get(req.query, function (err, rst) {
            console.log(err, rst);
            if (err) {
                res.json({code: -1});
            }
            else {
                res.json({code: 0, data: rst});
            }
        });
    }
});

