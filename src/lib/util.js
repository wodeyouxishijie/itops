/**
 * 工具库
 * @module lib
 * @class util
 */
define('lib/util', function(require, exports, module) {
    var $ = require('$');
    var csrfCode = '';
    window.console = window.console || {log:function(){}};

    var util = {
        cookie: {
            get: function(name) {
                var r = new RegExp("(?:^|;+|\\s+)" + name + "=([^;]*)"),
                    m = document.cookie.match(r);

                return !m ? "" : m[1];
            },
            set: function(name, value, domain, path, hour) {
                if (hour) {
                    var expire = new Date();
                    expire.setTime(expire.getTime() + 36E5 * hour);
                }
                document.cookie = name + "=" + value + "; " + (hour ? "expires=" + expire.toGMTString() + "; " : "") +
                    (path ? "path=" + path + "; " : "path=/; ") + (domain ? "domain=" + domain + ";" : "domain=" + document.domain + ";");

                return true;
            },
            del: function(name, domain, path) {
                document.cookie = name + "=; expires=Mon, 26 Jul 1997 05:00:00 GMT; " +
                    (path ? "path=" + path + "; " : "path=/; ") +
                    (domain ? "domain=" + domain + ";" : "domain=" + document.domain + ";");
            }
        },
        /**
         * html 模板生成器
         * @method tmpl
         * @param {String} str html 模板字符串
         * @param {Object} data 用于生成模板的数据对象
         * @return {String} 返回 html 字符串
         */
        tmpl: function(){
            var cache = {};
            function _getTmplStr(rawStr, mixinTmpl) {
                if(mixinTmpl) {
                    for(var p in mixinTmpl) {
                        var r = new RegExp('<%#' + p + '%>', 'g');
                        rawStr = rawStr.replace(r, mixinTmpl[p]);
                    }
                }
                return rawStr;
            }
            return function tmpl(str, data, opt) {
                opt = opt || {};
                var key = opt.key, mixinTmpl = opt.mixinTmpl, strIsKey = !/\W/.test(str);
                key = key || (strIsKey ? str : null);
                var fn = key ? cache[key] = cache[key] || tmpl(_getTmplStr(strIsKey ? document.getElementById(str).innerHTML : str, mixinTmpl)) :
                new Function("obj", "var _p_=[],print=function(){_p_.push.apply(_p_,arguments);};with(obj){_p_.push('" + str
                    .replace(/[\r\t\n]/g, " ")
                    .split("\\'").join("\\\\'")
                    .split("'").join("\\'")
                    .split("<%").join("\t")
                    .replace(/\t=(.*?)%>/g, "',$1,'")
                    .split("\t").join("');")
                    .split("%>").join("_p_.push('")
                + "');}return _p_.join('');");
                return data ? fn( data ) : fn;
            };
        }(),
        /**
         * 获取防CSRF串
         * @method getACSRFToken
         * @return {String} 验证串
         */
        getACSRFToken:function(){
            return csrfCode || this.cookie.get('csrf_code');
        },
        setACSRFToken:function(code){
            csrfCode = code;
        },
        getUin:function(){
//            return parseInt(this.cookie.get("uin").replace(/\D/g,""),10) || '';
            return this.cookie.get('user');
        },
        /**
         * 将 URL 参数格式转化成对象
         *
         * @for ex.util
         * @method paramsToObject
         * @param {String} [queryString] 要转换的 key-value 字符串，默认为 location.search
         * @return {Object}
         */
        paramsToObject: function (queryString) {
            var _result = {}, _pairs, _pair, _query, _key, _value;

            if (typeof(queryString) === 'object') { return queryString; }

            _query = queryString || window.location.search;
            _query = _query.replace('?', '');
            _pairs = _query.split('&');

            $(_pairs).each(function (i, keyVal) {
                _pair = keyVal.split('=');
                _key = _pair[0];
                _value = _pair.slice(1).join('=');
                _result[decodeURIComponent(_key)] = decodeURIComponent(_value);
            });

            return _result;
        },
        /**
         * JSON对象转url字符串
         * @method objectToParams
         * @param  {Object} obj JSON对象
         * @return {String}    url字符串
         */
        objectToParams: function (obj) {
            return $.param(obj);
        },
        /**
         * 是否移动手机
         * @method isMobile
         * @return {boolean} true|false
         */
        isMobile: function () {
            return this.isAndroid() || this.isIOS();
        },

        /**
         * 是否android
         * @method isAndroid
         * @return {boolean} true|false
         */
        isAndroid: function () {
            return /android/i.test(window.navigator.userAgent);

        },

        /**
         * 是否ios
         * @method isIOS
         * @return {boolean} true|false
         */
        isIOS: function () {
            return /iPod|iPad|iPhone/i.test(window.navigator.userAgent)
        },

        /**
         * 是否旧版本IE
         * @method isOldIe
         * @param  {boolean} excludeIe9 是否排除ie9
         * @return {boolean} true|false
         */
        isOldIe: function (excludeIe9) {
            var oldIe = /msie [\w.]+/.test(navigator.userAgent.toLowerCase());
            if (excludeIe9) {
                var docMode = document.documentMode;
                oldIe = oldIe && (!docMode || docMode < 9);
            }
            return oldIe;
        },

        /**
         * 获取a标签href相对地址
         * @method getHref
         * @param  {Object} item dom节点
         * @return {String} href
         */
        getHref: function (item) {
            var href = item.getAttribute('href', 2);
            href = href.replace('http://' + location.host, '');
            return href;
        },

        //获取当前时间
        getCurrentTime: function (needtime) {
            var date = new Date(),
                year = date.getFullYear(),
                month = date.getMonth() + 1,
                day = date.getDate(),
                hour = date.getHours(),
                minu = date.getMinutes(),
                secon =  date.getSeconds(),
                add_zero = function (num){
                    return (num>=10) ? num : '0' + num;
                };

            var str = year + "-" + add_zero(month) + "-" + add_zero(day);
            if (needtime) {
                str += ' ' + add_zero(hour) + ':' + add_zero(minu) + ':' + add_zero(secon);
            }
            return str;
        },

        //格式化时间字符串
        formatTime: function (str) {
            var _formatTime = '';
            if (str) {
                _formatTime = str.substring(0,10);
            }
            return _formatTime;
        },

        //格式化时间字符串
        formatDate: function (dt) {
            if (!dt) {
                return ''
            }
            var date = new Date(dt),
                year = date.getFullYear(),
                month = date.getMonth() + 1,
                day = date.getDate(),
                hour = date.getHours(),
                minu = date.getMinutes(),
                secon =  date.getSeconds(),
                add_zero = function (num){
                    return (num>=10) ? num : '0' + num;
                };

            var str = year + "-" + add_zero(month) + "-" + add_zero(day);
            str += ' ' + add_zero(hour) + ':' + add_zero(minu) + ':' + add_zero(secon);
            return str;
        },

        //获取修改时间
        getModifyTime: function (str) {
            var time = this.formatTime(str);
            if (!time) {
                time = this.getCurrentTime();
            }
            return time;
        },

        /**
         * 深度拷贝对象
         *
         * @method type
         * @param  {Object} obj 任意对象
         * @return {Object} 返回新的拷贝对象
         */
        cloneObject: function (obj) {
            var o = obj.constructor === Array ? [] : {};
            for (var i in obj) {
                if (obj.hasOwnProperty(i)) {
                    o[i] = typeof obj[i] === "object" ? this.cloneObject(obj[i]) : obj[i];
                }
            }
            return o;
        },

        /**
         * 插入内部样式
         *
         * @method insertStyle
         * @param  {Array} rules 样式数组对象
         * @id  {string} id 样式节点Id
         */
        insertStyle: function (rules, id) {
            var _insertStyle = function () {
                var doc = document,
                    node = doc.createElement("style");
                node.type = 'text/css';
                id && (node.id = id);
                document.getElementsByTagName("head")[0].appendChild(node);
                if (rules) {
                    if (typeof(rules) == 'object') {
                        rules = rules.join('');
                    }
                    if (node.styleSheet) {
                        node.styleSheet.cssText = rules;
                    } else {
                        node.appendChild(document.createTextNode(rules));
                    }
                }
            };
            if (id) {
                !document.getElementById(id) && _insertStyle();
            } else {
                _insertStyle();
            }
        },

        getQuery: function (url, key) {
            if (arguments.length == 1) {
                key = url;
                url = location.search;
            }
            var parts = (url.split('?')[1] || '').split('&'), query = {};
            for (var i = 0; i < parts.length; i++) {
                var items = parts[i].split('=');
                query[items[0]] = items[1];
            }
            return query[key];
        },

        getCosImgPath: function (posturl, dirname) {
            var accessid = this.getQuery(posturl, 'accessId'), 
                bucketid = this.getQuery(posturl, 'bucketId'), 
                filename = this.getQuery(posturl, 'cosFile'),
                dirname = dirname || 'pic',
                path = ['http://cos.myqcloud.com', accessid, bucketid, dirname, filename].join('/');
            return path
        },
            
        getCosImgPathPrefix: function (url, prefix) {
            if (!/^http\:\/\/cos\.myqcloud\.com/.test(url)) {
                return url;
            }
            var parts = url.split('/');
            var file = parts.pop();
            if (/^(?:s|cover|b)*_/.test(file)) {
                parts.push(file);
            }
            else {
                parts.push([prefix || 's_', file].join(''));
            }
            return parts.join('/');
        },

        listenInput: function (evtKey, fun, editorCmd) {
            require.async('event', function(evt) {
                var ipt = $('<input type="text">')[0];
                var evtMap = {};
                evtMap[evtKey] = fun;
                if ('oninput' in ipt) {
                    evt.addCommonEvent('input', evtMap);
                } else {
                    evt.addCommonEvent('keyup', evtMap);
                }
                if (editorCmd) {//响应富文本执行命令
                    $(document).off('editorExecCommand', editorCmd)
                               .on('editorExecCommand', editorCmd);
                }
                
            });
        },
            
        getInfoById: function (data, id) {
            var ar = [];
            for (var i = 0; i < data.length; i++) {
                if (id == data[i].id) {
                    return data[i];
                }
            }
            return {};
        },

        genId: function () {
            return [+new Date, Math.ceil(1000000 * Math.random() * Math.random())].join('');
        }
    };

    module.exports = util;
});
