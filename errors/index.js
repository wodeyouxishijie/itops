var xExtend = require('../util/xExtend');
var ResErr = xExtend(function () {}, {
	_constructor: function (req, res, type) {
		this.type = type;
		this.req = req;
		this.res = res;
	},
	print: function (format) {
		if (!format) {
			this.res.json(this.type);
		}
	},
	'static': {
		'PARAM_ERROR':	{retCode: '10000', msg: '参数错误'},
		'NOT_LOGIN':	{retCode: '10001', msg: '登录态验证失败'},
		'NO_CONTROLLER':	{retCode: '10002', msg: '没有找到控制器'}
	}
});
module.exports = ResErr;

