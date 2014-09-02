var xExtend = require('../util/xExtend');
var ResErr = require('../errors');
// var map = require('./map');

var instancelist = [];

var ControllerBase = xExtend(function () {}, {
	_constructor: function ControllerBase(req, res) {
		this.req = req;
		this.res = res;
		instancelist.push(this);
	},
	/**
	 * 父类方法，子类实现
	 */
	handler: function (action) {
	},

	'static': {
		getInstance: function () {}
	}
});
module.exports = ControllerBase;
// console.log(module)


