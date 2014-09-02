/**
 * 网络请求
 * @module lib
 * @class net
 **/
define('lib/net', function(require, exports, module) {
    var $ = require('$');
    var util = require('util');
    var requestQueue = {};
    var net = {
        /**
         * 发起请求
         * @method send
         * @param  {Object} cgiConfig 配置
         * @param  {Object} opt       选参
         */
        send: function (cgiConfig, opt) {
            var _self = this,
                _cgiConfig = cgiConfig,
                _data = opt.data || {},
                _url = "",
                _startTime = null,
                _cb = null;

            if (!_cgiConfig) {
                _cgiConfig = {
                    url: opt.url,
                    method: opt.method
                };
            }

            if (_cgiConfig) {
                _startTime = new Date();

                // 成功回调
                _cb = function (ret) {
                    //返回码上报日后实现
                    //var _endTime = new Date(),
                        //_code = ret.code || ret.ecode;
                    //ex.reporter.retCode(_url, _code, _endTime - _startTime);

                    if (typeof(ret) == 'string') {
                        ret = eval('('+ret+')');
                    }
                    opt.cb && opt.cb(ret);
                    
                };

                _url = this._addParam(_cgiConfig.url, {
                            user: util.getUin(),
                            csrfCode: util.getACSRFToken(),
                            t: new Date().getTime()
                        });

                if (_cgiConfig.method && _cgiConfig.method.toLowerCase() == "post") {
                    this.post(_url, _data, _cb);
                } else {
                    this.get(_url, _data, _cb);
                }

            }
        },
        _addParam: function (url,p) {
            var s = /\?/.test(url)?'&':'?';
            url += s+util.objectToParams(p);
            return url;
        },
        /**
         * GET请求
         * @method get
         * @param  {String}   url  URL
         * @param  {Object}   data 参数
         * @param  {Function} cb   回调函数
         */
        get: function (url, data, cb) {
            if (requestQueue[url]) {

            }
            else {
                $.get(url, data, cb);
                requestQueue[url] = [cb];
            }
        },
        /**
         * POST请求
         * @method post
         * @param  {String}   url  URL
         * @param  {Object}   data 参数
         * @param  {Function} cb   回调函数
         */
        post: function (url, data, cb) {
            $.ajax({
              type: "POST",
              url: url,
              data: data,
              success: cb
            });
        }
    };
    module.exports = net;
});