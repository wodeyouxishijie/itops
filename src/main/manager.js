define('main/manager', function(require, exports, module) {
    var net = require('net');
    var config = require('config');
    var manager = {};
    
    var conf = config.all;
    var manager = {

        _errorHandler: function (ret) {
            var _code = ret.code;
            if (_code == 1001 || _code == 1008) {
    //                login.show();
            } else {
    //                dialog.miniTip(ret.msg || '后台返回错误！');
            }
        },
        _commonCb: function (ret, cb, fail) {
            var _self = this,
                _code = ret.code;
            if (_code == 0) {
                cb && cb(ret);
            } else {
                _self._errorHandler(ret);
                fail && fail(ret);
            }
        }
    };

    for (var i in conf) {
        manager[i] = function (key) {
            return function (data, cb, fail) {
                var _self = manager,
                    _cb = function (ret) {
                        var _code = ret.code;
                        if (_code == 0) {
                            cb && cb(ret.data, ret.page);
                        } else {
                            _self._errorHandler(ret);
                            fail && fail(ret);
                        }
                    };
                net.send(config.get(key), {
                    data: data,
                    cb: _cb
                }); 
            }
        } (i);
    }
    module.exports = manager;

});
