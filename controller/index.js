var login = require('../app_modules/login');
var base = require('./base');
var xExtend = require('../util/xExtend');
var ResErr = require('../errors');
var map = require('./map');

var Controller = xExtend(base, {
	start: function () {
		var t = this,
			req = this.req,
			res = this.res;
		if (!req.query.user) {
			new ResErr(req, res, ResErr.PARAM_ERROR).print();
		}
		else {
		    login.creatSign(req.query.user, function (sign) {
		    	if (sign == req.cookies.sign && req.cookies.csrf_code == decodeURIComponent(req.query.csrfCode)) {
		    		var action = req.query.action;
	                var ctrl = map[action];
	                if (typeof ctrl == 'function') {
	                	var m = new ctrl(req, res);
	                	m.handler();
	            	}
	            	else if (typeof ctrl == 'string'){
	            		ctrl = ctrl.split(':');
	            		var cls = require(ctrl[0]);
	            		var instance = new cls(req, res);
	            		instance[ctrl[1]] ();
	            	}
	            	else {
	            		new ResErr(req, res, ResErr.NO_CONTROLLER).print();
	            	}
	                
	            }
	            else {
	                new ResErr(req, res, ResErr.NOT_LOGIN).print();
	            }
		    });
		}
	}
});

module.exports = Controller;