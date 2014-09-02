/**
 * 对话框
 * @module widget
 * @class dialog
 **/
define('widget/dialog/dialog', function(require, exports, module) {
    var $ = require('$');
    var dialog = {
        el: null,
        contentEl: null,
        mask: null,
        mTipTime: null,
        enableLoadTip: 1,
        /**
         * 创建对话框
         * @method create
         * @param  {String} html   html字符串
         * @param  {Number} width  宽
         * @param  {Number} height 高
         * @param  {Object} option 选参
         */
        create: function (html,width,height,option) {
            option = option || {};
            var _self = this;
            var config = {
                'button': null,
                'title': '',
                'closeIcon': false,
                'mask': true,
                'class': 'mod_popup',
                'isMaskClickHide': 1
            };
            var $body = $('body');

            option = $.extend({}, config, option);

            if(!this.el){
                var dialogWrap = $('<div/>').css({
                    'position': 'absolute',
                    'display': 'none',
                    'zIndex': '999'
                });

                var dialogContent = $('<div/>');
                dialogWrap.append(dialogContent);

                $body.append(dialogWrap);

                this.el = dialogWrap;
                this.contentEl = dialogContent;
            }

            this.el.attr('class', option['class']);
            
            var win = $(window),
                winWidth = win.width(),
                winHeight = win.height();


            //标题
            this.el.find('> .title').remove();
            if (option.title || option.closeIcon) {
                var dialogTitle = $('<div/>').addClass('title');
                if (option.title) {
                    option.closeIcon = 1;
                    dialogTitle.html(option.title);
                }
                if (option.closeIcon) {
                    dialogTitle.append('<a title="关闭" class="close" href="javascript:;"><i class="icon_cancel"></i></a>');
                }
                dialogTitle.off().on('click', '.close', function(){
                  _self.hide();
                });
                this.el.prepend(dialogTitle);

                this.contentEl.addClass('content');
            } else {
                //无标题时, 让样式更干净
                this.contentEl.removeClass('content');
            }

            //内容
            this.contentEl.html(html);

            var ifr = this.el.find("iframe")[0];

            if (ifr) {
                ifr.callback = option.callback||function(){}
            }

            //按钮
            this.el.find('> .bottom').remove();
            if (option.button) {
                var dialogButton = $('<div/>').addClass('bottom');
                for (var key in option.button) {
                    var btn = $('<a/>').addClass('button button_primary').attr('href', 'javascript:;').text(key);
                    var btnFun = option.button[key];
                    (function (_btn, _btnFun) {
                        _btn.on('click', function () {
                            (typeof(_btnFun) == 'function') && _btnFun(_btn, _self.el)
                        });
                    })(btn, btnFun);
                    
                    dialogButton.append(btn).append(' ');
                }
                var cancelbtn = $('<a/>').addClass('button').attr('href', 'javascript:;').text('取消');
                dialogButton.append(cancelbtn);
                cancelbtn.on('click', function(){
                  _self.hide();
                });
                this.el.append(dialogButton);
            }
            
            //位置
            var _top = (option.top || parseInt((winHeight - (height || this.el.height()))/2))+document.body.scrollTop;
            this.el.css({
                'width': width,
                'height': height,
                'left': option.left || parseInt((winWidth - width)/2),
                'top': _top
            });

            //显示
            this.el.show();

            //mask
            if(option.mask){
                if(!this.mask){
                    var dialogMask = $('<div/>').css({
                        'position': 'absolute',
                        'background': '#000',
                        'opacity': 0,
                        'width': '100%',
                        'height': '100%',
                        'left': 0,
                        'top': 0,
                        'zIndex': '900',
                        'transition': 'opacity 0.2s ease',
                        'visibility': 'hidden'
                    });

                    $body.append(dialogMask);
                    

                    this.mask = dialogMask;
                }

                this.mask.css({
                    'visibility': 'visible',
                    'opacity': '0.5'
                });

                this.ieMaskOpacity(true);
                
                if (option.isMaskClickHide == 1) {
                    this.mask.off('click').on('click', function () {
                        _self.hide();
                    });
                }
                else {
                    this.mask.unbind('click');
                }
            }

            if(option.time){
                setTimeout(function(){
                    _self.hide();
                },option.time);
            }

            if(option.onload){
                option.onload.call(this,this.el)
            }

            if (option.owner) {
                this.owner = option.owner;
            } else {
                this.owner = null;
            }

        },
        /**
         * 显示对话框
         * @method show
         */
        show: function () {
            this.el && this.el.show();
        },
        /**
         * 隐藏对话框
         * @method hide
         */
        hide: function () {
            this.el && this.el.hide();
            if(this.mask){
                this.mask.css({
                    'visibility': 'hidden',
                    'opacity': '0'
                });
                this.ieMaskOpacity(false);
            }
            this.owner = null;
            $(document).trigger('dialogHide');
        },
        ieMaskOpacity: function (opacity) {
            if (!$.support['opacity']) {
                opacity = opacity ? '50' : '0';
                this.mask.get(0).style.filter = "alpha(opacity=" +opacity+ ")";
            }
        },

        miniTip: function (str, duration) {
            var _self = this;
            _self.showMiniTip(str);

            var t = setTimeout(function () {
                _self.hideMiniTip(1);
            }, duration || 4000);

            _self.mTipTime = t;
        },

        showMiniTip: function (str) {
            clearTimeout(this.mTipTime);
            this.mTipTime = null;
            
            var flashMsg = $('#flashMsg');
			$('#msgbox').remove();
            if (!flashMsg.length) {
                var msgBox = $('<div/>').addClass('msgbox').attr('id', 'msgbox');
                flashMsg = $('<div/>').addClass('flash-message').attr('id', 'flashMsg');
                msgBox.append(flashMsg);
                msgBox.appendTo('body');
            }
            flashMsg.html(str).fadeIn(500);
        },

        hideMiniTip: function (fromTiming) {
            var _self = this;
            var _hideTip = function () {
                $('#flashMsg').fadeOut(function () {
                    !_self.mTipTime && $(this).html('');
                })
                _self.mTipTime = null;
            }
            if (fromTiming) {
                _hideTip();
            } else {
                //从loading过来场景, 有其他提示存在则不隐藏
                !_self.mTipTime && _hideTip();
            }
        },

        setLoadTip: function (_bool) {
            this.enableLoadTip = _bool;
        },

        getTitleHeight: function () {
            return 55;
        },
        
        getBottomHeight: function () {
            return 60;
        }
    };
    module.exports = dialog;
});

define('widget/login/login', function (require, exports, module) {
    var util = require('util');
    module.exports = {
        isLogin: function () {
            return !!this.getLoginID();
        },
        
        getLoginID: function () {
            return util.cookie.get("user");
        },
        
        toLogin: function (dir) {
            location = '/login?ret' + encodeURIComponent(dir);
        },
        
        logout: function () {}
    }
});
define('widget/pager/pager', function (require, exports, module) {
    var util = require('util');
    var $ = require('$');
    var def = {
        per: 20,
        renderTo: $('body')
    };
    module.exports = {
        render: function (data, opt) {
        }
    }
});
/**
 * 侧边栏滑动
 * @module widget
 * @class slide
 **/
define('widget/slidepanel/slidepanel', function(require, exports, module) {
    var $ = require('$')
        , util = require('util')
        , defOpt = {
            left: '30%',
            con: ''
        };

    var slide = {}, 
        tpl = '    <div id="slideWrapper" style="position:fixed;left:0;top:0;height:100%;width:100%;overflow-x:hidden;;">        <div class="slide-mask" style="position:absolute;left:0;top:0;z-index:99;background:#000;width:100%;height:100%"></div>        <div class="slide-panel mod_slider_g" style="overflow:auto; height:100%;left:100%;position:absolute;z-index:100;width:100%;background:#fff;">            <a href="javascript:;" class="mod_edit_left_toggle" style="position:absolute;left:0;width:40px; height:100%;display:block;border-right:1px solid #ccc;"><i class="icon-remove" style="display:block;width:14px;height:14px;position:absolute;left:50%;margin-left:-7px;top:50%;margin-top:-7px;"></i></a>            <div class="mod" style=";margin-left:40px;height:100%;overflow-y:auto;"><%=content%></div>        </div>    </wid>',
        wrapper,
        main,
        mask;
    slide.show = function (opt) {
        opt = $.extend({}, defOpt, opt);
        var $body = $('body');
        var content = util.tmpl(tpl, {'content': opt.con});
        wrapper = $(content);
        main = wrapper.find('.slide-panel');
        mask = wrapper.find('.slide-mask');

        mask.css('opacity', 0.4);
        $body.append(wrapper);

        setTimeout(function() {
            main.css('left', opt.left);
            main.css('width', $(window).width() - parseInt(main.css('left')));
        },50)

        wrapper.find('.mod_edit_left_toggle').click(function() {
            slide.hide();
        });
        mask.click(function() {
            slide.hide();
        });
        return wrapper;
    };
    slide.hide = function () {
        main.css({'left': '100%'});
        if (util.isOldIe()) {
             wrapper.remove();
        } else {
            setTimeout(function() {
                wrapper.remove();
            },300)
        }
    };
    module.exports = slide;
});

define('widget/upfile/upfile', function(require, exports, module) { //use sea
var $ = require('$');
var util = require('util');
var id = 'upfile_' + util.genId();
var formid = 'upform_' + util.genId();
function createForm() {
	return ['<html><head><meta http-equiv="Content-type" content="text/html; charset=utf-8"/></head><body><form action="/upfile" method="post" enctype="multipart/form-data"><input type="file" name="upfile" id="' + id + '"/></form>',
		'<script type="text/javascript">',
		'document.getElementById("' + id + '").onchange = function() {', 
			'if (this.value) {',
				'document.forms[0].submit();',
			'}',
		'};</script></body></html>'].join('');
}

function addEvt (el, opt) {
	el.find('input[type="file"]').change(function () {
		if (this.value) {
			$('#' + formid).get(0).submit();
			$('#tmpifrm').get(0).callback = function () {
				opt.callback.apply(null, arguments);
				$('#tmpifrm').remove();
			}
			this.value = '';
		}		
	});
}

var upfile = {
	bind: function (el, opt) {
		el.append(createForm());
		addEvt(el, opt);
		// el.unbind('click', clickfn(opt)).click(clickfn(opt));
	},

	form: function (callback) {
		return createForm();
	}
};
module.exports = upfile;});
define('main/app_util', function(require, exports, module) {
    var $ = require('$');
    var util = require('util');
    var manager = require('manager');
//    var failure_grade = require('app/userservice/failure_grade/failure_grade');
//    var failure_type = require('app/userservice/failure_type/failure_type');
//    var failure_status = require('app/userservice/failure_status/failure_status');
    var user = require('app/user/user');
    var pinyin = require('hotoo/pinyin/2.1.2/pinyin-debug');
    var userData;
    module.exports = {
        getLoginInfo: function (callback) {
            var user_id = util.cookie.get('user');
            manager.getUserInfo({}, function (data) {
                callback(data.user, data.roleData);
            });
        },
        
        fillKeyValueSelect: function (type, sel, val, callback) {
            var ar = [], ds = {};
            if (sysbase) {
                for (var i = 0; i < sysbase.length; i++) {
                    if (type == sysbase[i].type) {
                        ar.push('<option value="' + sysbase[i].id + '">' + sysbase[i]._value + '</option>');
                    }
                }
                sel.html('').append(ar.join(''));
                val && sel.val(val);
                callback && callback(ar)
            }
        },
        
        
        renderRoleSelect: function (sel, val, callback) {
            manager.getRole({}, function (list) {
                for (var i = 0; i < list.length; i++) {
                    sel.append('<option value="' + list[i].id + '">' + list[i].name + '</option>');
                }
                val && sel.val(val);
                if (typeof callback == 'function') {
                    callback(list);
                }
            });
        },
        
        deptTypeAhead: (function () {
            var deptData;
            var loading = 0;
            var args = [];
            return function (ipt, onchange) {
                var fn = function (data) {
                    for (var i = 0; i < args.length; i++){
                        args[i][0].typeahead({
                            source: data,
                            display: 'codes,name',
                            item: '<li><a href="#" class="hide" style="display:none;"></a><a href="#"></a></li>',
                            itemSelected: (function (_onchange) {
                                return function (item, dv, txt, seldata) {
                                    if (typeof _onchange == 'function') {
                                        _onchange(item, dv, txt, seldata);
                                    }
                                }
                            }) (args[i][1])
                        });
                    }
                    loading = 0;
                };
                args.push([ipt, onchange]);
                if (loading) {
                    return;
                }
                if (deptData) {
                    fn(deptData);
                    return;
                }
                manager.getDept({}, function (data) {
                    deptData = data;
                    fn(data);
                });
                loading = 1;
            }
        }) (),
        
        userTypeAhead: (function () {
            var userData;
            var loading = 0;
            var callbacks = [];
            return function (ipt, onchange) {
                var fn = function (data) {
                    $.each(data, function (i, n) {
                        n.py = pinyin(n.cnname.replace (/^\s+/, ''), {style: pinyin.STYLE_FIRST_LETTER }).join('').toUpperCase();
                        n.py_pull = pinyin(n.cnname.replace (/^\s+/, ''), {style: pinyin.STYLE_NORMAL  }).join('').toUpperCase();
                    });
                    while(callbacks.length) {
                        var arg = callbacks.shift();
                        arg[0].typeahead({
                            source: data,
                            display: 'user_id,py,cnname', 
                            item: '<li><a href="#" class="hide" style="display:none;"></a><a href="#" class="hide" style="display:none;"><a href="#"></a></li>',
                            val_replace: function (val) {
                                var py = pinyin(val.replace (/^\s+/, ''), {style: pinyin.STYLE_FIRST_LETTER }).join('').toUpperCase();
                                return py;
                            },
                            items: 20,
                            itemSelected: (function (_onchange) {
                                return function (item, dv, txt, seldata) {
                                    if (typeof _onchange == 'function') {
                                        _onchange(item, dv, txt, seldata);
                                    }
                                }
                            }) (arg[1])
                        });
                    }
                    loading = 0;
                };
                callbacks.push([ipt, onchange]);
                if (loading) {
                    return;
                }
                if (userData) {
                    fn(userData);
                    return;
                }
                manager.getUser({}, function (data) {
                    userData = data;
                    fn(data);
                });
                loading = 1;
            }
        }) (),
        
        changeColor: function (grade) {
            return {
                '一般': '<font size="3" color="#2b4490">一般</font>',
                '紧急': '<font size="4" color="#ef5b9c ">紧急</font>',
                '非常紧急': '<font size="5" color="red">非常紧急</font>',
                '不紧急': '<font color="">不紧急</font>'
            }[grade];
        }
    }
});

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

define('main/pagemanage', function(require, exports, module) {
    var $ = require('$');
    var router = require('router');
//    var login = require('login');
    var root = 'startup';
    var curr_timeout;
    //css依赖配置
    var cssConfig = {
//        'template': {
//            'cssFile' : ['dashboard/index_quick.css']
//        },
        'cms': {
            'cssFile' : ['webapp/style.css']
        },
        'msg_list': {
            'cssFile' : ['webapp/style.css']
        }
    };
    var pagemanage = {
        loadRoot: function () {
            this._loadView(root);
        },
        loadView: function () {
            var _self = this,
                arr = [].slice.call(arguments),
                controller = null,
                action = null,
                params = [],
                basePath = '';

//            arr = arr.slice(1);
            basePath = '';
            controller = arr[0];
            if (arr.length > 1) {
                if (arr[1].indexOf('?') == 0) {//直接传参,不按action解析
                    action = '';
                    var urlPara = arr[1].substring(1).split('&');
                    for (var i=0, item; item = urlPara[i]; i++) {
                        params.push(item.split('=')[1]);
                    }
                } else {
                    action =  arr[1];
                    params = arr.slice(2);
                }
            }
            _self._loadView(controller, action, params, basePath);
        },
        _loadView: function (controller, action, params, basePath) {
            var _self = this;
            if (_self.currentViewObj) {
                //全局销毁
                _self.globalDestroy();
                //销毁前一个
                var destroy = _self.currentViewObj.destroy;
                destroy && destroy.call(_self.currentViewObj);
                _self.currentViewObj = null;
            }   

            basePath = basePath || 'app/';
            params = params || [];
            var controllerUrl = basePath + controller + '/' + controller,
                actionUrl = basePath + controller + '/' + action + '/' + action,
                view = action || controller;

            //需加载的js资源
            var jsReqUrl = [controllerUrl];
            action && jsReqUrl.push(actionUrl);

            //需加载的css资源
            var cssReqUrl = _self.addCssReq(controller, action);

            //加载css
            cssReqUrl.length && require.async(cssReqUrl);   

            //加载js
            require.async(jsReqUrl, function(cObj, aObj) {
                if (!_self.fragment || _self.fragment.indexOf('/' + controller) < 0 || (controller == 'manage')) {//避免重复执行render
                    _self.fragment = router.fragment;
                    !action && (_self.pageInit = true);
                    _self.renderView(cObj, params, action);
                }
                if (action) {
                    _self.renderView(aObj, params, action);
                    _self.currentViewObj = aObj;
                } else {
                    _self.currentViewObj = cObj;
                    _self.renderView(cObj, params, action);
                }
                
                _self.changeNavStatus(view); 
                _self.pageInit = true;  
                
            });
        },

        addCssReq: function (controller, action) {
            var controllerCssReq = cssConfig[controller],
                actionCssReq = cssConfig[action],
                reqUrl = [],
                concatReqUrl = function (cssArr) {
                    for (var i = 0; i < cssArr.length; i++) {
                       cssArr[i] && (reqUrl = reqUrl.concat('csspath/' + cssArr[i]));
                    }
                }; 

            controllerCssReq && concatReqUrl(controllerCssReq['cssFile']);  
            actionCssReq && concatReqUrl(actionCssReq['cssFile']);
            return reqUrl;
        },

        renderView: function (obj, params, action) {
//                curr_timeout = setTimeout(function () {
            var menu = require('app/menu/menu.js');
            menu.render(action, function () {
                if (obj && obj.render) {
                    obj.render.apply(obj, params);
                    router.onComplete(action, params);
                } else {
                    this.render404();
                }
            });
                    
//                },10);
                
            
        },

        render404: function () {
            var notFound = '<h2 id="tt404" style="text-align:center;padding-top:100px;font-size:20px;line-height:1.5;color:#999"> <p>404</p> 您访问的页面没有找到! </h2>';
            var container = document.getElementById('manageMain') || document.getElementById('container');
            container && (container.innerHTML = notFound);
        },

        changeNavStatus: function (view) {
            var _self = this,
                navs = document.getElementById('topmenu'),
                aitem = navs && navs.getElementsByTagName('a'),
                sideBar = document.getElementById('sidebar'),
                locationHref = location.href;

            var changeNav = function (obj, type) {
                var currentName = (type == 1) ? 'currentSideNav' : 'currentNav';
                for (var i = 0, item; item = obj[i]; i++) {
                    var href = _self.getHref(item);
                    if ( (href == '/' && view == root) || (href != '/' && locationHref.indexOf(href) >= 0) ) {
                      _self[currentName] && _self[currentName].removeClass('active');
                      var itemParent = $(item).parent();
                      itemParent.addClass('current');
                      _self[currentName] = itemParent;
                      break;
                    }
                }
            };

            changeNav(aitem);

            if (sideBar) {
                var sideBarNavs = sideBar.getElementsByTagName('a');
                changeNav(sideBarNavs, 1);
            }
        },
        getHref: function (item) {
            var href = item.getAttribute('href', 2);
            href = href.replace('http://' + location.host, '');
            return href;
        },
        globalDestroy: function () {
            $(document).off('editorExecCommand');
            var vePanelContainer = $('#vePanelContainer');
            vePanelContainer && vePanelContainer.remove();
        }
    };

    module.exports = pagemanage;
});


define('main/router', function(require, exports, module) {
  var docMode = document.documentMode;
  var oldIE = (/msie [\w.]+/.test(navigator.userAgent.toLowerCase()) && (!docMode || docMode <= 7));
  var pushState = window.history.pushState;

  var router = {
    init: function (option) {

      this.option = {
        'pushState': true,
        'actionManage': null,
        'interval': 50,
        'domain': '',
        'routes': {}
      };

      option = option || {};

      for (var p in option) {
        this.option[p] = option[p];
      }

      this.option['pushState'] = (pushState && this.option['pushState']);

      var _self = this,
          evt = this.option['pushState'] ? 'popstate' : 'hashchange';

      var start = function () {
          var defaultPath = _self.getFragment() ? _self.getFragment() : '/';
          if (defaultPath == '/index.html') {
            defaultPath = '/';
          }
          if (/^\/\#/.test(defaultPath)) {
            //完整路径在低端浏览器打开则转化为锚点路径后跳转
            location.href = defaultPath;
            return;
          }
          _self.navigate(defaultPath);
      };

      if (oldIE) {

        //ie8以下创建iframe模拟hashchange
        var iframe = document.createElement('iframe');
        iframe.tabindex = '-1';
        if (this.option['domain']) {
          iframe.src = 'javascript:void(function(){document.open();'+
                       'document.domain = "' + this.option['domain'] + '";document.close();}());';
        } else {
          iframe.src = 'javascript:0';
        }
        
        iframe.style.display = 'none';
        iframe.onload = function () {
          iframe.onload = null;
          start();
          _self.checkUrlInterval = setInterval(function () {
            _self.checkUrl();
          }, _self.option['interval']);
        }

        document.body.appendChild(iframe);
        this.iframe = iframe.contentWindow;
       
      } else {

        //其他浏览器监听popstate或hashchange
        this.addEvent(window, evt, function () {
          _self.checkUrl();
        });

      }

      if (!this.iframe) {
        setTimeout(start, 10);
      }
     
    },
    addEvent: function (elem, event, fn) {
      if (elem.addEventListener) {
        elem.addEventListener(event, fn, false);
      } else if (elem.attachEvent) { 
        elem.attachEvent("on" + event, fn);
      } else {
        elem[event] = fn;
      }
    },
    getHash: function (win) {
      var match = (win || window).location.href.match(/#(.*)$/);
      return match ? match[1] : '';
    },
    getFragment: function () {
      var fragment, 
          locPathName = window.location.pathname + window.location.search;
      if (this.option['pushState']) {
        fragment = locPathName;
        //如果锚点路径在pushState环境打开 
        if (fragment == '/' && this.getHash()) {    
          fragment = this.getHash();
        }
      } else {
        fragment = this.getHash();
        //如果完整路径在hash环境打开
        if (location.href.indexOf('#') < 0 && locPathName !== '/' && locPathName !== '/index.html') { 
          fragment = '/#' + locPathName;
        }
      }
      return fragment;
    },
    checkUrl: function () {
      var current = this.getFragment();
      if (this.iframe) {
        current = this.getHash(this.iframe);
      }
      if (current == this.fragment) {
        return
      }
      current = this.iframe ? current : '';
      this.navigate(current);
    },
    stripHash: function (url) {
      return url.replace(/^\#+|\#+$/g, '');
    },
    stripSlash: function (url) {
      return url.replace(/^\/+|\/+$/g, '');
    },
    onComplete: function () {},
      
    navigate: function (url, slient) {
      var _self = this;
      if (url) {
        if (url !== '/') {
          //去除前后#号
          url = _self.stripHash(url);
          //去除前后斜杠
          url = _self.stripSlash(url);
          //基于根目录
          url = '/' + url; 
        };
        
        if (!slient) {//为true时，只路由不改变地址栏
          if (_self.option['pushState']) {
            history.pushState({}, document.title, url);
          } else {
            if (url !== '/') {
              location.hash = '#' + url
            } else {
              if (_self.getFragment()) {
                location.hash = '';
              }
            }
          }
        }

        if (_self.iframe) {
          _self.historySet(url, _self.getHash(_self.iframe));
        }

      } else {
        url = _self.getFragment() ? _self.getFragment() : '/';
      }

      _self.fragment = url;
      _self.loadUrl(url);

    },
    historySet : function(hash, historyHash) {
        var iframeDoc = this.iframe.document;

        if (hash !== historyHash) {
          iframeDoc.open();
          if (this.option['domain']) {
            iframeDoc.write('<script>document.domain="' + this.option['domain'] + '"</script>');
          }
          iframeDoc.close();
          this.iframe.location.hash = hash;
        }
    },
    redirect: function (url, slient) {
      if (!this.option.actionManage.pageInit) {
        //刷新页面时,中间模块不要跳转
        return
      }
      this.navigate(url, slient);
    },
    matchRoute: function (rule, url) {
      var optionalReg = /\((.*?)\)/g,
          paramReg = /(\(\?)?:\w+/g,
          astReg = /\*\w+/g,
          ruleToReg = function (rule) {
            rule = rule.replace(optionalReg, '(?:$1)?').replace(paramReg, '([^\/]+)').replace(astReg, '(.*?)');
            return new RegExp('^' + rule + '$');
          },
          route = ruleToReg(rule),
          result = route.exec(url),
          params = null;

      if (result) {
        var args = result.slice(1);
        params = [];
        for (var i = 0, p; p = args[i]; i++){      
           params.push(p ? decodeURIComponent(p) : ''); 
        }
      }
      return params;
    },
    loadUrl: function (url) {
      var _self = this,
          routes = _self.option.routes,
          obj = _self.option.actionManage,
          action = null,
          params = null;

      for (var rule in routes) {
          //匹配到路由规则
          if (params = _self.matchRoute(rule, url)) {
            action = routes[rule];
            obj[action] && obj[action].apply(obj, params);
            break;
          }
      } 
    }
  };

  module.exports = router;

});

seajs.config({
    base: '/dest/',
//	            map: [['http://qzs.qq.com/qcloud/app/web/dest/csspath/', 
//	                'http://qzonestyle.gtimg.cn/open_proj/proj_qcloud_v2/css/light/']
//	            ],
    alias: {
        '$': 'lib/jquery-1.10.2',
        'util': 'lib/util',
        'app_util': 'main/app_util',
        'net': 'lib/net',
        'event': 'lib/event',
        'simulator':'widget/simulator/simulator',
        'config': 'config/config',
        'router': 'main/router',
        'pagemanage': 'main/pagemanage',
        'manager': 'main/manager',
        'wxManager': 'app/weixin/config/manager',
        'startup': 'main/startup',
        'dialog': 'widget/dialog/dialog',
        'login': 'widget/login/login',
        'bdWexin': 'widget/bind_weixin/bind_weixin',
        'addPanel': 'widget/add_panel/add_panel',
        'comdata': 'main/comdata',
        'editor': 'editor/ve',
        'upfile': 'widget/upfile/upfile'
    }
});

define('main/startup', function(require, exports) {
    var $ = require('$');
    var cEvent = require('event');
    var util = require('util');
    var router = require('router');
    var menu = require('app/menu/menu');
    var pagemanage = require('pagemanage');
//    var login = require('login');
//    var addPanel = require('addPanel');
    var dialog = require('dialog');
    dialog.enableLoadTip = 1;
    var startup = function () {
//        pagemanage.loadRoot('startup');
        //初始化路由
        router.init({
            'pushState': true,   
            'actionManage': pagemanage,
//            'domain': 'qcloud.com',
            'routes': {
                '/': 'loadRoot',
                '/:main(/*controller)(/*action)(/*p1)(/*p2)(/*p3)': 'loadView'
            }
        });

        //初始化登录
//        login.init($('#topNav')[0]);
        //全局点击
        cEvent.addCommonEvent('click', {
            'login': function () {
                
            },
            'logout': function () {
                location.href = '/login'
            }

        });

        //全局加载提示
        var delay = 300, $doc = $(document), isLoading = 0, timing;
        $doc.ajaxStart(function () {
            if (dialog.enableLoadTip) {
                clearTimeout(timing);
                isLoading = 1;
                timing = setTimeout(function () {
                    var flashMsg = $('#flashMsg');
                    //有其他提示存在, 不提示loading
                    if (flashMsg.length && flashMsg.html()){
                        return
                    }
                    if (isLoading) {
                        dialog.showMiniTip('正在加载...');
                    }
                }, delay);
            }
        });
        $doc.ajaxStop(function () {
            isLoading = 0;
            dialog.hideMiniTip();
        });
    };

    exports.startup = startup;
});

;define('config/config', function (require, exports, module) {
    var items = ['menu', 'dept', 'role', 'user', 'keyValue', 'failureReport', 'SoftwareReport', 'Tasking', 'Repository', 'MyTasking', 'ProcessLog', 'leaderTasking', 'Vacation', 'FailureTypeRole', 'softwareTodo', 'score'];
    var all_net_config = {};
    for (var i = 0; i < items.length; i++) {
        var m = items[i].replace(/(^\w)/, function (_0, _1) {return _1.toUpperCase();} );
        all_net_config['get' + m] = {
            method: 'get',
            url: '/json?action=get' + m,
        };
        
        all_net_config['set' + m] = {
            method: 'post',
            url: '/post?action=set' + m,
        };
        
        all_net_config['del' + m] = {
            method: 'post',
            url: '/post?action=del' + m,
        };
    }
    all_net_config.getUserInfo = {
        url: '/json?action=getUserInfo',
        method: 'get'
    };
    all_net_config.setProcessLog = {
        url: '/post?action=setProcessLog',
        method: 'post'
    };
    all_net_config.sendMail = {
        url: '/post?action=sendMail',
        method: 'post'
    };
    all_net_config.getLog = {
        url: '/json?action=getLog',
        method: 'get'
    };
    all_net_config.getNewMyTasking = {
        url: '/json?action=getNewMyTasking',
        method: 'get'
    };

    all_net_config.getEmployee = {
        url: '/json?action=getEmployee',
        method: 'get'
    };

    all_net_config.getEmployeeTask = {
        url: '/json?action=getEmployeeTask',
        method: 'get'
    };
    all_net_config.getReportData = {
        url: '/json?action=getReportData',
        method: 'get'
    };
    var host = 'http://' + location.host + '/cgi';
    
    for (var i  in all_net_config) {
        var cur = all_net_config[i];
        if (cur && cur.url) {
            cur.url = host + cur.url;
        }
    };
    var config = {};
    config.get = function(argv){
	   return all_net_config[argv];
    };
    config.all = all_net_config;
    
    module.exports  = config;
});
;define('app/app.js', function (require, exports, module) {
    var $ = require('$');
    var util = require('util');
    var menu = require('app/menu/menu');
    module.exports = {
        render: function () {
            
            menu.render($('#manageMain'));
        }
    }
});

;define('app/dept/dept.js', function (require, exports, module) {
    var $ = require('$');
    var login = require('login');
    var event = require('event');
    var util = require('util');
    var dialog = require('dialog');
    var manager = require('manager');
    var app_util = require('app_util');
    var slidepanel = require('widget/slidepanel/slidepanel');
    var deptdata;
    var op = 0;
    function init() {
        $('#newDept').click(function () {
            op = 0;
            slidewrap = slidepanel.show({con:util.tmpl('<div class="drawer-wrapper" style="">    <div class="drawer-title"><i class="drawer-close"></i><span class="drawer-title-content">&nbsp;</span></div>    <input type="hidden" id="currentDeptId" value="<%=data.id%>"/>    <%if (op == 1) {%><button cmd="del" deptid="<%=data.id%>"><i class="icon-remove"></i>删除</button><%}%>    <div class="drawer">        <ul class="dialog">            <li class="clearfix">              <div class="btn-toolbar" style="margin: 0;">                  <div class="btn-group">                    <button id="deptParent" class="btn dropdown-toggle" data-toggle="dropdown" parentid="<%=data.parent%>"><%=data.parentname%> <span class="caret"></span></button>                    <ul class="dropdown-menu" data-event="dept-parent">                        <%=roothtml%>                    </ul>                                                  </div><!-- /btn-group -->                                </div>                <div class="input_tips">选择部门的上级部门</div>          </li>              <li class="clearfix">                <label class="bind-domain-title">部门名称</label>                <span class="input-text"><input class="input" value="<%=data.name%>" type="text" id="deptName" placeholder="输入部门名称"></span>                  <div class="input_tips">输入部门名称</div>            </li>                                    <li class="clearfix">                <label class="bind-domain-title">部门编码</label>                <span class="input-text"><input class="input" value="<%=data.codes%>" type="text" id="deptCodes" placeholder="输入部门编码"></span>                  <div class="input_tips">输入部门编码</div>            </li>                             <li class="clearfix">                <label class="bind-domain-title">部门负责人1</label>                <input value="<%=data.leader1_id%>" type="hidden" id="deptLeader1">                <span class="input-text"><input class="input" value="<%=data.leader1_cnname%>" type="text" id="deptLeader1Name" placeholder="部门负责人1"></span>  <a href="#" data-event="clear_leader" data-for="deptLeader1">清除</a>                <div class="input_tips">部门负责人1</div>            </li>                              <li class="clearfix">                <label class="bind-domain-title">部门负责人2</label>                <input value="<%=data.leader2_id%>" type="hidden" id="deptLeader2">                                <span class="input-text"><input class="input" value="<%=data.leader2_cnname%>" type="text" id="deptLeader2Name" placeholder="部门负责人2"></span>  <a href="#" data-event="clear_leader" data-for="deptLeader2">清除</a>                <div class="input_tips">部门负责人2</div>            </li>                               <li class="clearfix">                <label class="bind-domain-title"></label>                <textarea class="input" type="text" id="deptNote" placeholder="输入部门描述"><%=data.ext%></textarea>                  <div class="input_tips">输入部门描述</div>            </li>                <li class="current_status">                <a href="javascript:void 0;" id="saveDept" class="btn btn-primary">确定</a>              </li>        </ul></div></div>', {data: {deptid: '',deptparent:0,deptname: '', deptnote:'',parentname:'root'},roothtml: getRootList(), op:op }) } ) ;
            clickEvt();
            return false;
        });
    
        event.addCommonEvent('click', {
            'dept-parent': function (evt) {
                var menu_id = $(evt.target).attr('deptid');
                var menu_name = $(evt.target).html();
                $(this).prev().html(menu_name + '&nbsp;<span class="caret"></span>').attr('parentid', menu_id);
//                $('#menuParent').val(menu_id);
            },
            'edit_dept': function (evt) {
                var aitem = evt.target;
                if (aitem.nodeName != 'A') {
                    return false;
                }
                op = 1;
                var id = $(evt.target).attr('deptid');
                slidewrap = slidepanel.show({con:util.tmpl('<div class="drawer-wrapper" style="">    <div class="drawer-title"><i class="drawer-close"></i><span class="drawer-title-content">&nbsp;</span></div>    <input type="hidden" id="currentDeptId" value="<%=data.id%>"/>    <%if (op == 1) {%><button cmd="del" deptid="<%=data.id%>"><i class="icon-remove"></i>删除</button><%}%>    <div class="drawer">        <ul class="dialog">            <li class="clearfix">              <div class="btn-toolbar" style="margin: 0;">                  <div class="btn-group">                    <button id="deptParent" class="btn dropdown-toggle" data-toggle="dropdown" parentid="<%=data.parent%>"><%=data.parentname%> <span class="caret"></span></button>                    <ul class="dropdown-menu" data-event="dept-parent">                        <%=roothtml%>                    </ul>                                                  </div><!-- /btn-group -->                                </div>                <div class="input_tips">选择部门的上级部门</div>          </li>              <li class="clearfix">                <label class="bind-domain-title">部门名称</label>                <span class="input-text"><input class="input" value="<%=data.name%>" type="text" id="deptName" placeholder="输入部门名称"></span>                  <div class="input_tips">输入部门名称</div>            </li>                                    <li class="clearfix">                <label class="bind-domain-title">部门编码</label>                <span class="input-text"><input class="input" value="<%=data.codes%>" type="text" id="deptCodes" placeholder="输入部门编码"></span>                  <div class="input_tips">输入部门编码</div>            </li>                             <li class="clearfix">                <label class="bind-domain-title">部门负责人1</label>                <input value="<%=data.leader1_id%>" type="hidden" id="deptLeader1">                <span class="input-text"><input class="input" value="<%=data.leader1_cnname%>" type="text" id="deptLeader1Name" placeholder="部门负责人1"></span>  <a href="#" data-event="clear_leader" data-for="deptLeader1">清除</a>                <div class="input_tips">部门负责人1</div>            </li>                              <li class="clearfix">                <label class="bind-domain-title">部门负责人2</label>                <input value="<%=data.leader2_id%>" type="hidden" id="deptLeader2">                                <span class="input-text"><input class="input" value="<%=data.leader2_cnname%>" type="text" id="deptLeader2Name" placeholder="部门负责人2"></span>  <a href="#" data-event="clear_leader" data-for="deptLeader2">清除</a>                <div class="input_tips">部门负责人2</div>            </li>                               <li class="clearfix">                <label class="bind-domain-title"></label>                <textarea class="input" type="text" id="deptNote" placeholder="输入部门描述"><%=data.ext%></textarea>                  <div class="input_tips">输入部门描述</div>            </li>                <li class="current_status">                <a href="javascript:void 0;" id="saveDept" class="btn btn-primary">确定</a>              </li>        </ul></div></div>', {data: getDeptById(id),roothtml: getRootList(), op: op }) } ) ;
                clickEvt();
                return false;
            },
            'clear_leader': function (evt) {
                var a = $(evt.target);
                $('#' + a.attr('data-for')).val('');
                $('#' + a.attr('data-for') + 'Name').val('');
            }
        });
    }
    
    function clickEvt () {
        $('#saveDept').unbind('click').click(function () {
            var deptParent = $('#deptParent').attr('parentid');
            var name = $('#deptName').val();
            var codes = $('#deptCodes').val();
            var deptExt = $('#deptNote').val();
            if (deptName == '') {
                alert ('请输入正确的名称');
                return;
            }
//            if (menuLink == '') {
//                alert ('请输入正确的菜单地址');
//                return;
//            }
            manager.setDept($.extend({
                name: name,
                codes: codes,
                parent: deptParent,
                leader1: $('#deptLeader1').val(),
                leader2: $('#deptLeader2').val(),
                ext: deptExt
            }, op == 1 ? {id: $('#currentDeptId').val()}: {}), function (d) {
                dialog.miniTip('操作成功')
//                location.reload();
                slidepanel.hide();
                wrap.render();
            });
        });
        
        slidewrap.find('button[cmd="del"]').unbind('click').click(function (evt) {
            var id = $(this).attr('deptid');
            manager.delDept({id: id}, function () {
                alert ('删除成功');
                location.reload();
            });
            return false;
        });
        app_util.userTypeAhead($('#deptLeader1Name'), function (item, dv, txt, seldata) {
            $('#deptLeader1').val(dv);
            $('#deptLeader1Name').val(seldata.cnname);
        });
        app_util.userTypeAhead($('#deptLeader2Name'), function (item, dv, txt, seldata) {
            $('#deptLeader2').val(dv);
            $('#deptLeader2Name').val(seldata.cnname);
        });
    }

    function getDeptById (id) {
        var ar = [], rootid;
        for (var i = 0; i < deptdata.length; i++) {
            if (id == deptdata[i].id) {
                return $.extend(deptdata[i], {parentname: getDeptById(deptdata[i].parent).name || 'ROOT'});
            }
        }
        return {};
    };
    
    function pickTop() {
        var ar = [], rootid = 0;
        for (var i = 0; i < deptdata.length; i++) {
            if (rootid == deptdata[i].parent) {
                ar.push(deptdata[i]);
            }
        }
        return ar;
    };
    
    function pickChildById(pid) {
        var ar = [];
        for (var i = 0; i < deptdata.length; i++) {
            if (pid == deptdata[i].parent) {
                ar.push(deptdata[i]);
            }
        }
        return ar;
    };
    
    function getRootList () {
        var arli = [], clev = 0;
            
        function fill(r, lev) {
            arli.push('<li style=""><a href="#" deptid="' + r.id + '">' + new Array(lev + 1).join('--') + r.name + '</a></li>');
            var fn = arguments.callee;
            var children = pickChildById(r.id);
            if (children.length > 0) {
                lev++;
                for (var i = 0; i < children.length; i++) {
                    fill(children[i], lev);
                }
            }
        }
        
        for (var i = 0, ar = pickTop(); i < ar.length; i++) {
            fill(ar[i], 0);
        };
        return arli.join(''); 
    };
    var wrap = {
        render: function (wrap) {
            var param = {};
            manager.getDept(param, function (data) {
                deptdata = data;
                rst = data;
                for (var i = 0; i < rst.length; i++) {
                    rst[i].parentname = getDeptById(rst[i].parent).name;
                }
                container = $('#mainContainer');
                container.html(util.tmpl('<a class="btn" href="#" id="newDept">新增</a><table class="table table-condensed table-bordered table-striped" data-event="edit_dept">    <thead>      <tr>        <th>部门名称</th>        <th>部门编码</th>        <th>上级部门</th>      </tr>    </thead>    <tbody>        <%for (var i = 0; i < data.length; i++) {%>      <tr>        <td><a deptid="<%=data[i].id%>" href="#"><%=data[i].name%></a></td>        <td><%=data[i].codes%> </td>        <td><%=data[i].parentname%></td>      </tr>        <%}%>    </tbody></table>', {type: 1, data: rst}));
                init ();
            });
        },
        createDept: function () {
            return getRootList();
        },
        
        getDeptData: function (callback) {
            if (typeof callback == 'function') {
                manager.getDept({}, function (data) {
                    deptdata = data;
                    callback(data);
                });
            }
        }
    };
    module.exports = wrap;
});
;define('app/duty/repository/repository', function (require, exports, module) {
    var $ = require('$');
    var login = require('login');
    var event = require('event');
    var util = require('util');
    var dialog = require('dialog');
    var manager = require('manager');
    var slidepanel = require('widget/slidepanel/slidepanel');
    var app_util = require('main/app_util');
    var failure_grade = require('app/userservice/failure_grade/failure_grade');
    var failure_type = require('app/userservice/failure_type/failure_type');
    var dept = require('app/dept/dept');
    var user = require('app/user/user');
    var ve = require('editor/ve');
    var editorObj;
    var cacheData;
    var op = 0;
    var dateFormat = { dateFormat : "yy-mm-dd" };
    var slidewrap;
    var container;
    
    event.addCommonEvent('click', {
        'edit_repository': function (evt) {
            var aitem = evt.target;
            if (aitem.nodeName != 'A') {
                return false;
            }
            op = 1;
            var id = $(evt.target).attr('reportid');
            app_util.getLoginInfo(function (info) {
                var dt = util.getInfoById(cacheData, id);
                $.extend(dt, {
                    user_cn_name: info[0].cnname,
                    user_dept_name: info[0].deptname, 
                    user_dept: info[0].deptid,
                    user_id: info[0].id
                });
                slidewrap = slidepanel.show({con:util.tmpl('<div class="drawer-wrapper" style="">    <div class="drawer-title"><i class="drawer-close"></i><span class="drawer-title-content">&nbsp;</span></div>    <input type="hidden" id="currentId" value="<%=data.id%>"/>        <div class="drawer bs-docs-example form-horizontal">        <ul class="dialog">              <li>                <div class="control-group">                    <input class="input" value="<%=data.user_id%>" type="hidden" id="iptUserID">                      <input class="input" value="<%=data.user_dept%>" type="hidden" id="iptUserDept">                      <span class="input-text">录入者：<%=data.user_cn_name%>&nbsp;所在科室：<%=data.user_dept_name%></span>                </div>            </li>            <li>                <div class="control-group">                    <label class="control-label">所属类型</label>                    <div class="controls">                        <span class=""><select id="report_type" style="width:auto;"></select></span>                     </div>                </div>            </li>                                <li>                <div class="control-group">                    <label class="control-label">标题</label>                    <div class="controls">                        <input class="input-xlarge" value="<%=data.title%>" type="text" id="iptTitle" placeholder="任务标题">                    </div>                </div>            </li>                                        <li>                <div class="control-group">                    <label class="control-label">任务描述</label>                    <div class="controls">                        <div id="editToobar"></div>                        <textarea class="hide" rows="3" id="iptNote" placeholder="任务描述"><%=data.note%></textarea>                      </div>                </div>            </li>        </ul>    </div>    <div style="clear:both;">        <a href="javascript:void 0;" cmd="save" class="btn btn-primary">确定</a>        <%if (op == 1) {%><button cmd="del" class="btn" deptid="<%=data.id%>"><i class="icon-remove"></i>删除</button><%}%>    </div></div>', {data: dt, op:op }) } ) ;
                initCtl(dt);
                editorObj =new ve.Create({
                    container:$("#editToobar")[0],
                    height:'300px',
                    width:'600px'
                });
                editorObj.setContent(dt.note);
                saveEvent();
            });
            return false;
        }
    });
    
    function init() {
        addEvents();
    }
    
    function initCtl(dt) {
        dt = dt || {};
        $( "#iptApplyTime" ).datepicker(dateFormat);
        app_util.fillKeyValueSelect(4, $('#report_type'), dt.ftype);
    }
    function addEvents() {
        container.find('a[cmd="addNew"]').click(function () {
            op = 0;
            app_util.getLoginInfo(function (info) {
                slidewrap = slidepanel.show({con:util.tmpl('<div class="drawer-wrapper" style="">    <div class="drawer-title"><i class="drawer-close"></i><span class="drawer-title-content">&nbsp;</span></div>    <input type="hidden" id="currentId" value="<%=data.id%>"/>        <div class="drawer bs-docs-example form-horizontal">        <ul class="dialog">              <li>                <div class="control-group">                    <input class="input" value="<%=data.user_id%>" type="hidden" id="iptUserID">                      <input class="input" value="<%=data.user_dept%>" type="hidden" id="iptUserDept">                      <span class="input-text">录入者：<%=data.user_cn_name%>&nbsp;所在科室：<%=data.user_dept_name%></span>                </div>            </li>            <li>                <div class="control-group">                    <label class="control-label">所属类型</label>                    <div class="controls">                        <span class=""><select id="report_type" style="width:auto;"></select></span>                     </div>                </div>            </li>                                <li>                <div class="control-group">                    <label class="control-label">标题</label>                    <div class="controls">                        <input class="input-xlarge" value="<%=data.title%>" type="text" id="iptTitle" placeholder="任务标题">                    </div>                </div>            </li>                                        <li>                <div class="control-group">                    <label class="control-label">任务描述</label>                    <div class="controls">                        <div id="editToobar"></div>                        <textarea class="hide" rows="3" id="iptNote" placeholder="任务描述"><%=data.note%></textarea>                      </div>                </div>            </li>        </ul>    </div>    <div style="clear:both;">        <a href="javascript:void 0;" cmd="save" class="btn btn-primary">确定</a>        <%if (op == 1) {%><button cmd="del" class="btn" deptid="<%=data.id%>"><i class="icon-remove"></i>删除</button><%}%>    </div></div>', {data: {id: '',name: '', note:'',power: '',user_cn_name: info[0].cnname,user_dept_name: info[0].deptname, user_dept: info[0].deptid,user_id: info[0].id }, op:op }) } ) ;
                
                initCtl();
                saveEvent();
                editorObj =new ve.Create({
                    container:$("#editToobar")[0],
                    height:'300px',
                    width:'600px'
                });
            });
            return false;
        });  
    }
    
    function saveEvent( ) {
        slidewrap.find('a[cmd="save"]').click(function () {
            var title = $('#iptTitle').val();
            var telno = $('#iptTelNo').val();
            var report_type = $('#report_type').val();
            var note = editorObj.getContent();//$('#iptNote').val();
            var user_id = $('#iptUserID').val();
            var user_dept = $('#iptUserDept').val();
            if (title == '') {
                alert ('标题不能为空');
                return;
            }
            var params = {
                add_user: user_id,
                title: title,
                ftype: report_type,
                note: note,
                cstatus: 0
            };
            if (op ==1 ) {
                params.id = $('#currentId').val();
            }
            manager.setRepository(params, function (d) {
                dialog.create ('操作成功', 400, 200, {isMaskClickHide: 0, title: '操作结果', button: {
                    '确定': function() {
                        dialog.hide();
                    }
                }});
                slidepanel.hide();
                moduleWrap.render();
            });
            return false;
        });
        slidewrap.find('button[cmd="del"]').unbind('click').click(function (evt) {
            var id = $(this).attr('deptid');
            dialog.create ('确定要删除改故障单么，删除后不可恢复，确定吗？', 400, 200, {isMaskClickHide: 0, title: '操作确认', button: {
                '确定': function() {
                    dialog.hide();
                    manager.delRepository({id: id}, function () {
                        slidepanel.hide();
                        moduleWrap.render();
                    });
                }
            }}); 
            
            return false;
        });
    }
    
    var moduleWrap = {
        render: function () {
            container = $('#mainContainer');
            var param = {}
            manager.getRepository(param, function (data) {
                cacheData = data;
                for (var i = 0; i < data.length; i++) {
                    data[i].typename = util.getInfoById(sysbase, data[i].ftype)._value
                    data[i].last_modify_time = (data[i].last_modify_time || '').replace(/T[\s\S]*$/, '');
                    data[i].create_time = data[i].create_time.replace(/T[\s\S]*$/, '');
                }
                container.html(util.tmpl('<a class="btn" href="#" cmd="addNew">新增</a><table class="table table-condensed table-bordered table-striped" data-event="edit_repository">    <thead>      <tr>        <th>标题</th>        <th>所属类别</th>        <th>创建日期</th>        <th>录入者</th>        <th>最后更新日期</th>              </tr>    </thead>    <tbody>        <%for (var i = 0; i < data.length; i++) {%>      <tr>        <td><a reportid="<%=data[i].id%>" href="#"><%=data[i].title%></a></td>        <td><%=data[i].typename%></td>        <td><%=data[i].create_time%></td>        <td><%=data[i].adduser_cnname%> </td>        <td><%=data[i].last_modify_time%></td>              </tr>        <%}%>    </tbody></table>', {data: cacheData}));
                init ();
            });
        }
    };
    module.exports = moduleWrap;
});
;define('app/duty/taskassign/taskassign.js', function (require, exports, module) {
    var $ = require('$');
    var login = require('login');
    var event = require('event');
    var util = require('util');
    var dialog = require('dialog');
    var manager = require('manager');
    var slidepanel = require('widget/slidepanel/slidepanel');
    var app_util = require('main/app_util');
    var failure_grade = require('app/userservice/failure_grade/failure_grade');
    var failure_type = require('app/userservice/failure_type/failure_type');
    var failure_status = require('app/userservice/failure_status/failure_status');
    var dept = require('app/dept/dept');
    var user = require('app/user/user');
    var ve = require('editor/ve');
    var cacheData;
    var op = 0;
    var dateFormat = { dateFormat : "yy-mm-dd" };
    var slidewrap;
    var container;
    var cstatus;
    var currData;
    var currentTab = 'new_report';
    var editorObj;
    var currQuery;
    
    event.addCommonEvent('click', {
        'edit_tasking': function (evt) {
            var aitem = evt.target;
            if (aitem.nodeName != 'A') {
                return false;
            }
            op = 1;
            var id = $(evt.target).attr('reportid');
            app_util.getLoginInfo(function (info) {
                var dt = util.getInfoById(cacheData, id);
                $.extend(dt, {
                    user_cn_name: info[0].cnname,
                    user_dept_name: info[0].deptname, 
                    user_dept: info[0].deptid,
                    user_id: info[0].id,
                    current_time: util.getCurrentTime(1)
                });
                currData = dt;
                slidewrap = slidepanel.show({con:util.tmpl('<div class="drawer-wrapper" style="">    <div class="drawer-title"><i class="drawer-close"></i><span class="drawer-title-content">&nbsp;</span></div>    <input type="hidden" id="currentId" value="<%=data.id%>"/>    <%var canEdit = (op==0 || (op == 1 && data.task_src == "tasking_list" && data.op_user == g_User.id && data.cstatus == 76));%>    <div class="drawer bs-docs-example form-horizontal">        <input class="input" value="<%=data.user_id%>" type="hidden" id="iptUserID">          <input class="input" value="<%=data.user_dept%>" type="hidden" id="iptUserDept">        <ul class="dialog">            <li>                <label class="control-label"></label>                <div class="control-group">                    <% if (!canEdit) {%><span class="input-text">申请人科室：<%=data.dept_name%>&nbsp;申请人：<%=data.cnname%>&nbsp;<%=data.clientip%></span><%}%>                </div>            </li>              <%if (canEdit) {%>                            <li>                <div class="control-group">                    <label class="control-label">申请人</label>                    <div class="controls">                        <input class="input" type="hidden" id="iptRepairUser">                        <input class="input" type="text" id="iptRepairUserName" placeholder="申请人">                    </div>                </div>            </li>                            <li>                <div class="control-group">                    <label class="control-label">申请人科室</label>                    <div class="controls">                        <input class="input-xlarge" type="hidden" id="iptRepairDept">                        <input class="input-xlarge" type="text" id="iptRepairDeptName" readonly disabled placeholder="选择申请人后自动获取">                    </div>                </div>            </li>                                                                        <%}%>            <li>                <div class="control-group">                    <label class="control-label">标题</label>                    <div class="controls">                        <input class="input-xlarge" value="<%=data.title%>" <%= (!canEdit ? "readonly disabled": "")%> type="text" id="iptTitle" placeholder="任务标题">                    </div>                </div>            </li>                            <li>                <div class="control-group">                    <label class="control-label">联系电话</label>                    <div class="controls">                        <span class="input-text"><input class="input" <%= (!canEdit ? "readonly disabled": "")%> value="<%=data.tel%>" type="text" id="iptTelNo" placeholder="联系电话"></span>                      </div>                </div>            </li>            <li>                <div class="control-group">                    <label class="control-label">任务类型</label>                    <div class="controls">                        <span class=""><select <%= (!canEdit ? "readonly disabled": "")%> id="report_type" style="width:auto;"></select></span>                     </div>                </div>            </li>            <li>                <div class="control-group">                    <label class="control-label">紧急程度</label>                    <div class="controls">                        <span class=""><select <%= (!canEdit ? "readonly disabled": "")%> id="report_grade" style="width:auto;"></select></span>                      </div>                </div>            </li>                        <li>                <div class="control-group">                    <label class="control-label">任务描述</label>                    <div class="controls">                                                    <%if (canEdit) {%>                                <div id="editFailureNote"></div>                        <textarea rows="3" id="iptNote" class="hide" placeholder="任务描述" ></textarea>                             <%} else {%>                        <div><%=data.note%></div>                            <%}%>                    </div>                </div>            </li>        </ul>                    </div>    <div style="clear:both" class="form-horizontal">        <hr />                            <% if (data.cstatus == 76) {%>        <div id="process_wrap">            <div class="control-group">                <label class="control-label">处理人员</label>                <div class="controls">                    <span class="">                        <input type="hidden" id="processUser" />                        <input class="input-xlarge" type="text" id="iptProcessUser" placeholder="处理人">                        <select id="sel_duty_user" style="width:auto;display:none;"></select>                    </span>                 </div>            </div>            <div class="control-group">                <label class="control-label">处理时间</label>                <div class="controls">                    <span class="input-text"><input class="input-xlarge" value="<%=data.current_time%>" type="text" id="iptProcessDate" placeholder="处理时间"></span>                </div>            </div>                    <div class="control-group">                <label class="control-label">处理意见</label>                <div class="controls">                    <textarea rows="3" id="iptProcessNote" placeholder="处理意见"><%=data.process_note%></textarea>                  </div>            </div>        </div>            <%} %>    </div>    <div style="clear:both;">        <% if (canEdit) {%>                        <a href="javascript:void 0;" cmd="save" class="btn btn-primary">确定</a>        <%}%>        <%if (op == 1) {%>            <% if (data.cstatus == 76) {%>                <button cmd="start_exec" class="btn btn-primary" rid="<%=data.id%>">分派</button>            <%} else if (data.cstatus == 74) {%>                <button cmd="done_exec" class="btn btn-primary hide" rid="<%=data.id%>">完成</button>            <%}%>                <%if (canEdit) {%>            <button cmd="del" class="btn" deptid="<%=data.id%>"><i class="icon-remove"></i>删除</button>                    <%}%>        <%} %>    </div></div>', {data: dt, op:op }) } );
                initCtl(dt);
                showProcess();
                saveEvent();
            });
            return false;
        },

        'tasking-page': function (evt) {
            var aitem = evt.target;
            if (aitem.nodeName != 'A') {
                return false;
            }
            var cp = $(aitem).data('page');
            if (typeof cp != 'undefined') {
                currQuery.cp = cp;
                initTable(currQuery);
                $('.pagination').find('li').removeClass('active');
                $(this).parent().addClass('active');
            }
        }
    });
    
    function initCtl (dt ) {
        dt = dt || {};
		
		var type_change = function () {
			var type_id = $('#report_type').val();
			manager.getFailureTypeRole({type_id: type_id}, function (data) {
				if (op == 0) {
					var ar = [];
					for (var i = 0; i < data.length; i++) {
						ar.push('<option value="' + data[i].id + '">' + data[i].cnname + '</option>');
					}
					$('#sel_duty_user').html(ar.join('')).change(function () {
						$('#processUser').val($(this).val());
					}).show();
					$('#processUser').val($('#sel_duty_user').val());
					if (ar.length > 0) {  
						$('#iptProcessUser').hide();
					}
					else {
						$('#iptProcessUser').show();
						$('#sel_duty_user').hide();
					}
				}
			});
		};
		
		$('#report_type').change(type_change);
		
		
        app_util.fillKeyValueSelect(3, $('#report_type'), dt.ftype, type_change);
        app_util.fillKeyValueSelect(1, $('#report_grade'), dt.grade);
        app_util.fillKeyValueSelect(2, $('#report_status'), dt.cstatus);
        $( "#iptProcessDate" ).datepicker(dateFormat);
        $( "#iptDoneDate" ).datepicker(dateFormat);
        
        app_util.userTypeAhead($('#iptProcessUser'), function (item, dv, txt, seldata) {
            $('#processUser').val(dv);
            $('#iptProcessUser').val(seldata.cnname);
        });
        app_util.userTypeAhead($('#iptRepairUserName'), function (item, dv, txt, seldata) {
            $('#iptRepairUser').val(dv);
            $('#iptTelNo').val(seldata.telno);
            $('#iptRepairDeptName').val(seldata.deptname);
            $('#iptRepairDept').val(seldata.deptid);
            $('#iptRepairUserName').val(seldata.cnname);
        });
        
        app_util.deptTypeAhead($('#iptRepairDeptName'), function (item, dv, txt, seldata) {
            $('#iptRepairDept').val(dv);
            $('#iptRepairDeptName').val(txt);
        });
		
		
//		type_change.call($('#report_type')[0]);
        
        if (op == 0) {
            editorObj =new ve.Create({
                container:$("#editFailureNote")[0],
                height:'300px',
                width:'600px'
            });
        }
        
//        initUserRole();
    }
    
    function initUserRole(id) {
        manager.getRole({}, function (data) {
            var ar = [];
            for (var i = 0; i < data.length; i++) {
                ar.push('<option value="' + data[i].id+ '">' + data[i].name + '</option>');
            }
            $('#sel_duty_user').html(ar.join(''));
        });
    }

    function init() {
        addEvents();
        if (currentTab) {
            $('.nav-tabs li').removeClass('active');
            $('.nav-tabs li a[cmd="' + currentTab + '"]').parent().addClass('active');
        }
    }
    
    function showProcess() {
        $('button[cmd="show_process"]').click(function () {
            $('#process_wrap').toggleClass('hide');
//            $('#btnWrap').toggleClass('hide');
            return false;
        });
    }
    
    function addEvents() {
        container.find('a[cmd="addNew"]').unbind('click').click(function () {
            op = 0;
            app_util.getLoginInfo(function (info) {
                slidewrap = slidepanel.show({con:util.tmpl('<div class="drawer-wrapper" style="">    <div class="drawer-title"><i class="drawer-close"></i><span class="drawer-title-content">&nbsp;</span></div>    <input type="hidden" id="currentId" value="<%=data.id%>"/>    <%var canEdit = (op==0 || (op == 1 && data.task_src == "tasking_list" && data.op_user == g_User.id && data.cstatus == 76));%>    <div class="drawer bs-docs-example form-horizontal">        <input class="input" value="<%=data.user_id%>" type="hidden" id="iptUserID">          <input class="input" value="<%=data.user_dept%>" type="hidden" id="iptUserDept">        <ul class="dialog">            <li>                <label class="control-label"></label>                <div class="control-group">                    <% if (!canEdit) {%><span class="input-text">申请人科室：<%=data.dept_name%>&nbsp;申请人：<%=data.cnname%>&nbsp;<%=data.clientip%></span><%}%>                </div>            </li>              <%if (canEdit) {%>                            <li>                <div class="control-group">                    <label class="control-label">申请人</label>                    <div class="controls">                        <input class="input" type="hidden" id="iptRepairUser">                        <input class="input" type="text" id="iptRepairUserName" placeholder="申请人">                    </div>                </div>            </li>                            <li>                <div class="control-group">                    <label class="control-label">申请人科室</label>                    <div class="controls">                        <input class="input-xlarge" type="hidden" id="iptRepairDept">                        <input class="input-xlarge" type="text" id="iptRepairDeptName" readonly disabled placeholder="选择申请人后自动获取">                    </div>                </div>            </li>                                                                        <%}%>            <li>                <div class="control-group">                    <label class="control-label">标题</label>                    <div class="controls">                        <input class="input-xlarge" value="<%=data.title%>" <%= (!canEdit ? "readonly disabled": "")%> type="text" id="iptTitle" placeholder="任务标题">                    </div>                </div>            </li>                            <li>                <div class="control-group">                    <label class="control-label">联系电话</label>                    <div class="controls">                        <span class="input-text"><input class="input" <%= (!canEdit ? "readonly disabled": "")%> value="<%=data.tel%>" type="text" id="iptTelNo" placeholder="联系电话"></span>                      </div>                </div>            </li>            <li>                <div class="control-group">                    <label class="control-label">任务类型</label>                    <div class="controls">                        <span class=""><select <%= (!canEdit ? "readonly disabled": "")%> id="report_type" style="width:auto;"></select></span>                     </div>                </div>            </li>            <li>                <div class="control-group">                    <label class="control-label">紧急程度</label>                    <div class="controls">                        <span class=""><select <%= (!canEdit ? "readonly disabled": "")%> id="report_grade" style="width:auto;"></select></span>                      </div>                </div>            </li>                        <li>                <div class="control-group">                    <label class="control-label">任务描述</label>                    <div class="controls">                                                    <%if (canEdit) {%>                                <div id="editFailureNote"></div>                        <textarea rows="3" id="iptNote" class="hide" placeholder="任务描述" ></textarea>                             <%} else {%>                        <div><%=data.note%></div>                            <%}%>                    </div>                </div>            </li>        </ul>                    </div>    <div style="clear:both" class="form-horizontal">        <hr />                            <% if (data.cstatus == 76) {%>        <div id="process_wrap">            <div class="control-group">                <label class="control-label">处理人员</label>                <div class="controls">                    <span class="">                        <input type="hidden" id="processUser" />                        <input class="input-xlarge" type="text" id="iptProcessUser" placeholder="处理人">                        <select id="sel_duty_user" style="width:auto;display:none;"></select>                    </span>                 </div>            </div>            <div class="control-group">                <label class="control-label">处理时间</label>                <div class="controls">                    <span class="input-text"><input class="input-xlarge" value="<%=data.current_time%>" type="text" id="iptProcessDate" placeholder="处理时间"></span>                </div>            </div>                    <div class="control-group">                <label class="control-label">处理意见</label>                <div class="controls">                    <textarea rows="3" id="iptProcessNote" placeholder="处理意见"><%=data.process_note%></textarea>                  </div>            </div>        </div>            <%} %>    </div>    <div style="clear:both;">        <% if (canEdit) {%>                        <a href="javascript:void 0;" cmd="save" class="btn btn-primary">确定</a>        <%}%>        <%if (op == 1) {%>            <% if (data.cstatus == 76) {%>                <button cmd="start_exec" class="btn btn-primary" rid="<%=data.id%>">分派</button>            <%} else if (data.cstatus == 74) {%>                <button cmd="done_exec" class="btn btn-primary hide" rid="<%=data.id%>">完成</button>            <%}%>                <%if (canEdit) {%>            <button cmd="del" class="btn" deptid="<%=data.id%>"><i class="icon-remove"></i>删除</button>                    <%}%>        <%} %>    </div></div>', {data: {id: '',name: '',tel:info[0].telno,user_cn_name: info[0].cnname,user_dept_name: info[0].deptname, user_dept: info[0].deptid,user_id: info[0].id,cstatus:76,current_time:util.getCurrentTime(1),clientip:clientIP }, op:op }) } ) ;
                initCtl();
                saveEvent();
            });
            return false;
        }); 
        container.find('a[cmd="new_report"]').unbind('click').click(function () {
            currentTab = 'new_report';
            initTable(currQuery = {cstatus: 76});
            return false;
        });
        container.find('a[cmd="done_report"]').unbind('click').click(function () {
            currentTab = 'done_report';
            initTable(currQuery = {cstatus: 75});
            return false;
        });
        container.find('a[cmd="process_report"]').unbind('click').click(function () {
            currentTab = 'process_report';
            initTable(currQuery = {cstatus: 74});
            return false;
        });
    }
    
    function saveEvent( ) {
        slidewrap.find('a[cmd="save"]').unbind('click').click(function () {
            var title = $('#iptTitle').val();
            var telno = $('#iptTelNo').val();
            var report_type = $('#report_type').val();
            var report_grade = $('#report_grade').val();
            var note = editorObj.getContent();//$('#iptNote').val();
            var user_id = $('#iptUserID').val();
            var user_dept = $('#iptUserDept').val();
            var ProcessUser = $('#processUser').val();
            var iptProcessDate = $('#iptProcessDate').val();
            var iptDoneUser = $('#doneUser').val();
            var iptDoneDate = $('#iptDoneDate').val();
            var repair_user = $('#iptRepairUser').val();
            var repair_dept = $('#iptRepairDept').val();
            var iptTel = $('#iptTelNo').val();
            if (title == '') {
                alert ('标题不能为空');
                return;
            }
            var params = {
                title: title,
                duty_user: 0,
                process_user: ProcessUser || 0,
                repair_user: repair_user || user_id,
                repair_dept: repair_dept || user_dept,
//                end_time: iptDoneDate,
                grade: report_grade,
                ftype: report_type,
                note: note,
                task_src: 'failure_report_list',
                tel:iptTel,
                clientip: clientIP,
                cstatus: 74
            };
            if (op ==1 ) {
                params.id = $('#currentId').val();
            }
//            manager.setTasking(params, function (d) {
                manager.setFailureReport(params, function (ret) {
                    manager.sendMail({
                        to_user_id: ProcessUser,
                        from_user_id: g_User.id,
                        content: '%from_user%给你分配了一张故障单，请进入系统进行处理'
                    });
                    dialog.create ('操作成功', 400, 200, {isMaskClickHide: 0, title: '操作结果', button: {
                        '确定': function() {
                            dialog.hide();
                            slidepanel.hide();
                            moduleWrap.render();
                        }
                    }});
                    
                });
                
//            });
            return false;
        });
        
        slidewrap.find('button[cmd="del"]').unbind('click').click(function (evt) {
            var id = $(this).attr('deptid');
            dialog.create ('确定要删除改故障单么，删除后不可恢复，确定吗？', 400, 200, {isMaskClickHide: 0, title: '操作确认', button: {
                '确定': function() {
                    dialog.hide();
                    manager.delTasking({id: id}, function () {
                        dialog.miniTip('删除成功');
                        slidepanel.hide();
                        moduleWrap.render();
                    });
                }
            }}); 
            
            return false;
        });
        
        function p(st) {}
        slidewrap.find('button[cmd="start_exec"]').unbind('click').click(function () {
            if (!$('#iptProcessNote').val()) {
                alert ('请输入处理意见');
                return;
            }
			var btn = this;
			btn.disabled = true;
			var ProcessUser = $('#processUser').val();
            manager.setTasking({
                id: $('#currentId').val(),
                duty_user: $('#sel_duty_user').val() || ProcessUser,
                apply_time: $('#iptProcessDate').val(),
                process_user: $('#sel_duty_user').val() || ProcessUser,
                cstatus: 74
            }, function (d) {
                var action = 'set' + currData.task_src.replace('_list', '').replace(/(^\w)/, function(_0, _1) {return _1.toUpperCase()}).replace(/_(\w)/, function(_0, _1) {return _1.toUpperCase()});
                var fn = manager[action];
                var complete = function () {
                    manager.sendMail({
                        to_user_id: ProcessUser,
                        from_user_id: g_User.id,
                        content: '%from_user%给你分配了一张故障单，请进入系统进行处理'
                    });
                };
                fn && fn({
                    id: currData.main_id,
                    process_user: currData.user_id,
                    last_process_time: util.getCurrentTime(1),
                    cstatus: 74
                },complete);
                manager.setProcessLog({
                    src: 'tasking_list', 
                    status_type: 2, 
                    cstatus: currData.cstatus, 
                    main_id: currData.main_id,
                    dest_status: 76,
                    from_table: currData.task_src,
                    note: $('#iptProcessNote').val()
                }, function (d) {
                    dialog.create ('操作成功', 400, 200, {isMaskClickHide: 0, title: '操作结果', button: {
                        '确定': function() {
                            dialog.hide();
                            slidepanel.hide();
                            moduleWrap.render();
							btn.disabled = false;
                        }
                    }});
                });
            });
        });
        
        slidewrap.find('button[cmd="done_exec"]').unbind('click').click(function () {
            if (!$('#iptProcessNote').val()) {
                alert ('请输入处理意见');
                return;
            }
            manager.setTasking({
                id: $('#currentId').val(),
                cstatus: 75
            }, function (d) {
                var action = 'set' + currData.task_src.replace('_list', '').replace(/(^\w)/, function(_0, _1) {return _1.toUpperCase()}).replace(/_(\w)/, function(_0, _1) {return _1.toUpperCase()});
                var fn = manager[action];
                fn && fn({
                    id: currData.main_id,
                    done_user: currData.user_id,
                    end_time: util.getCurrentTime(1),
                    cstatus: 75
                });
                
                manager.setProcessLog({
                    src: 'tasking_list', 
                    status_type: 2, 
                    cstatus: currData.cstatus, 
                    main_id: currData.main_id,
                    dest_status: 75,
                    from_table: currData.task_src,
                    note: $('#iptProcessNote').val()
                }, function (d) {
                    dialog.create ('操作成功', 400, 200, {isMaskClickHide: 0, title: '操作结果', button: {
                        '确定': function() {
                            dialog.hide();
                            slidepanel.hide();
                            moduleWrap.render();
                        }
                    }});
                });
            });
        });
    }
    
    function initTable(param) {
        manager.getTasking(param, function (data, page) {
            cacheData = data;
            for (var i = 0; i < data.length; i++) {
                data[i].gradename = app_util.changeColor(util.getInfoById(sysbase, data[i].grade)._value);
                data[i].typename = util.getInfoById(sysbase, data[i].ftype)._value
                data[i].statusname = util.getInfoById(sysbase, data[i].cstatus)._value || '未处理';

                data[i].create_time = util.formatDate(data[i].create_time);
                data[i].last_process_time = util.formatDate(data[i].last_process_time);
                data[i].done_time = util.formatDate(data[i].done_time) ;
                data[i].apply_time = util.formatDate(data[i].apply_time) ;
                data[i].end_time =util.formatDate(data[i].end_time);
            }
            container.html(util.tmpl('<a class="btn" href="#" cmd="addNew">新增</a><ul class="nav nav-tabs">  <li class="active">    <a href="#" cmd="new_report">未处理</a>  </li>    <li>    <a href="#" cmd="process_report">已分派</a>  </li>  <li><a href="#" cmd="done_report">已完成</a></li></ul><table class="table table-condensed table-bordered table-striped" data-event="edit_tasking">    <thead>      <tr>        <th>标题</th>        <th>报修人</th>        <th>报修人科室</th>        <th>申报日期</th>        <th>处理人</th>        <th>完成人</th>        <th>完成时间</th>        <th>状态</th>        <th>紧急程度</th>        <th>故障类别</th>      </tr>    </thead>    <tbody>        <%for (var i = 0; i < data.length; i++) {%>      <tr>        <td><a reportid="<%=data[i].id%>" href="#"><%=data[i].title%></a></td>        <td><%=data[i].cnname%> </td>        <td><%=data[i].dept_name%></td>        <td><%=data[i].create_time%></td>        <td><%=data[i].process_cnname%></td>        <td><%=data[i].done_cnname%></td>        <td><%=data[i].end_time%></td>        <td><%=data[i].statusname%></td>        <td><%=data[i].gradename%></td>        <td><%=data[i].typename%></td>      </tr>        <%}%>    </tbody></table><div  class="pagination" data-event="tasking-page">  <ul>  <% if (page.pc > 0) {%>  <%  for (var i = 0; i < page.pc; i++) {%>        <% if (i == page.cp) {%>        <li class="active"><a href="#" ><%= (i + 1)%></a></li>        <%} else {%>        <li><a href="#"  data-page="<%=i%>"><%= (i + 1)%></a></li>        <%}%>  <%  }%>  <%}%></ul></div>', {data: cacheData, page: page}));
            init ();
        });
    }
    
    var moduleWrap = {
        render: function () {
            container = $('#mainContainer');
            var param = {};
            currentTab = 'new_report';
            initTable({cstatus: 76});
        }
    };
    module.exports = moduleWrap;
});
;define('dest/login', function (require, exports, module) {
    var util = require('util');
    var $ = require('$');
    function addEvents () {
        $('form.form-signin').on('submit', function () {
            var userID = $('#user_id').val();
            var userPwd = $('#user_pwd').val();
            if (userID && userPwd) {
                this.action = '/login';
                return true;
            }
            
            return false;
        });
    }
    
    function initPage() {
        var loc = '';
        var errno = util.getQuery('err');
        switch (errno) {
            // 密码错误
            case '1':
                $('.ui-widget').removeClass('hide').find('.err_text').html('用户名密码错误！');
                break;
        }
    }
    
    function showErr() {
        
    }
    var loginModule = {
        init: function () {
            addEvents();
            initPage();
        },
        
        doLogin: function () {}
    }
    loginModule.init();
});

seajs.use('dest/login');
    
;define('app/menu/menu.js', function (require, exports, module) {
    var $ = require('$');
    var login = require('login');
    var event = require('event');
    var util = require('util');
    var router = require('router');
    var manager = require('manager');
    var container;
    var menudata;
    
    
    
    router.onComplete = function (action, params) {
        var lastact;
        params.length > 0 && $('.menu_list').find('a').each(function (i, n) {
            if (n.href.indexOf('/' + params.join('/')) > -1) {
                lastact = $(n).parent();
                return false;
            }
        });
        lastact && lastact.addClass('active');
        
        var toplast;
        $('#topmenu').find('a').each(function (i, n) {
            if (n.href.indexOf('/' + action) > -1) {
                toplast = $(n).parent();
                return false;
            }
        });
        toplast && toplast.addClass('active current');
    }
    event.addCommonEvent('click', {
        'top_menu': function (evt) {
            if (menudata) {
                var aitem = evt.target;
                if (aitem.nodeName != 'A') {
                    return false;
                }
                router.navigate(util.getHref(aitem));
            }
            return false;
        },
        'nav': function (evt) {
            if (menudata) {
                var aitem = evt.target;
                if (aitem.nodeName != 'A') {
                    return false;
                }
                router.navigate(util.getHref(aitem));
            }
            return false;
        }
    });
    
    function pickChildByModule(menumodule) {
        var menu = getMenuByModule(menumodule);
        var pid = menu.menuid;
        var ar = [];
        for (var i = 0; i < menudata.length; i++) {
            if (pid == menudata[i].menuparent) {
                ar.push(menudata[i]);
            }
        }
        return ar;
    };
    
    function getMenuByModule(menumodule) {
        var ar = [], rootid;;
        for (var i = 0; i < menudata.length; i++) {
            if (menumodule == menudata[i].menulink) {
                return $.extend(menudata[i], {parentname: getMenuById(menudata[i].menuparent).menuname || 'ROOT'});
            }
        }
        return {};
    }
    
    function getMenuById (id) {
        var ar = [], rootid;;
        for (var i = 0; i < menudata.length; i++) {
            if (id == menudata[i].menuid) {
                return $.extend(menudata[i], {parentname: getMenuById(menudata[i].menuparent).menuname || 'ROOT'});
            }
        }
        return {};
    };
    
    function pickChildById(pid) {
        var ar = [];
        for (var i = 0; i < menudata.length; i++) {
            if (pid == menudata[i].menuparent) {
                ar.push(menudata[i]);
            }
        }
        return ar;
    };
    
    var pickTopMenu = function () {
        var ar = [], rootid;;
        for (var i = 0; i < menudata.length; i++) {
            if (0 == menudata[i].menuparent) {
                rootid = menudata[i].menuid;
                break;
            }
        }
        if (rootid) {
            for (var i = 0; i < menudata.length; i++) {
                if (rootid == menudata[i].menuparent) {
                    ar.push(menudata[i]);
                }
            }
        }
        return ar;
    };
    
    function initLeft(menumodule) { 
//        container = $('#manageMain');
        $('#manageMain').html(util.tmpl('<div class="row-fluid">    <div class="span2" style="width:200px" data-event="nav">        <% if (data.length > 0) {%>                        <% for (var i = 0; i < data.length; i++) {%>      <div class="well sidebar-nav" style="">          <!--这里是左边的菜单导航-->                <ul class="nav nav-list menu_list" pid="<%=data[i].menuid %>">                <li class="nav-header" style=""><%=data[i].menuname %></li>                  </ul>                          <!--左边导航结束-->      </div><!--/.well -->    <%}%>        <%} else if (type == 1){%>                     <%}%>    </div><!--/span-->    <div class="span10" id="mainContainer" style="margin-left:10px;">      <div class="hero-unit">            <h1>欢迎使用</h1>            <p>hello</p>            <p></p>          </div>    </div><!--/span-->  </div><!--/row-->  <hr>  <footer>    <p></p>  </footer>', {type: 1, data: pickChildByModule(menumodule) }));
        $('.menu_list').each(function (i, n) {
            var chd = pickChildById($(n).attr('pid'));
            for (var i = 0;i < chd.length; i++) {
                if (/^(?:\/|http)/.test(chd[i].menulink)) {
                    $(n).append('<li><a href="' + chd[i].menulink + '" menuid="' + chd[i].menuid + '">' + chd[i].menuname + '</a></li>');
                }
                else {
                    $(n).append('<li><a href="/startup/' +menumodule + '/' + chd[i].menulink + '" menuid="' + chd[i].menuid + '">' + chd[i].menuname + '</a></li>');
                }
            }
        });

        var resizefn = function () {
            var w = $(window).width() - 200 - 80;
            $('#mainContainer').width(w);
        };
        setTimeout(resizefn, 100);
    }
    
    var menu = {
        render: function (action, callback) {
            var user_id = login.getLoginID();
            var param = {};
//            container = wrapEl;
            manager.getMenu(param, function (data) {
                menudata = data;
                $('#topmenu').html(util.tmpl('<% for (var i in data ) {%><li><a href="/startup/<%=data[i].menulink %>" menuid="<%=data[i].menuid %>"><%=data[i].menuname %></a></li><%}%>', {type: 1, data: pickTopMenu() }));
                initLeft(action);
                callback && callback();
                
            });
            if (user_id == 'admin') {
                
            }
        },
        
        onRender: function () {
            
        }
    };
    module.exports = menu;
});
;define('app/menumanager/menumanager.js', function (require, exports, module) {
    var $ = require('$');
    var login = require('login');
    var event = require('event');
    var util = require('util');
    var router = require('router');
    var manager = require('manager');
    var menu = require()
    var slidepanel = require('widget/slidepanel/slidepanel');
    var container;
    var menudata;
    var inited;
    var slidewrap;
    var lastact;
    var menumanager = {
        render: function (menumodule) {
            var user_id = login.getLoginID();
            var param = {all: 'all'};
            
            manager.getMenu(param, function (data) {
                menudata = data;
//                initLeft(menumodule);
                rst = data;
                for (var i = 0; i < rst.length; i++) {
                    rst[i].parentname = getMenuById(rst[i].menuparent).menuname;
                }
                container = $('#mainContainer');
                container.html(util.tmpl('<a class="btn" href="#" id="newMenu">新增</a>    <table class="table table-condensed table-bordered table-striped" data-event="edit_menu">        <thead>          <tr>            <th>菜单名称</th>            <th>处理模块</th>            <th>上级菜单</th>          </tr>        </thead>        <tbody>            <%for (var i = 0; i < data.length; i++) {%>          <tr>            <td><a menuid="<%=data[i].menuid%>" href="#"><%=data[i].menuname%></a></td>            <td><%=data[i].menulink%> </td>            <td><%=data[i].parentname%></td>          </tr>            <%}%>        </tbody>      </table>', {type: 1, data: rst}));
                init();
            });
        }
    };
    
    function pickChildById(pid) {
        var ar = [];
        for (var i = 0; i < menudata.length; i++) {
            if (pid == menudata[i].menuparent) {
                ar.push(menudata[i]);
            }
        }
        return ar;
    };
    
    function pickTopMenu() {
        var ar = [], rootid = 0;
//        for (var i = 0; i < menudata.length; i++) {
//            if (0 == menudata[i].menuparent) {
//                rootid = menudata[i].menuid;
//                break;
//            }
//        }
//        if (rootid) {
            for (var i = 0; i < menudata.length; i++) {
                if (rootid == menudata[i].menuparent) {
                    ar.push(menudata[i]);
                }
            }
//        }
        return ar;
    };
    
    function getMenuById (id) {
        var ar = [], rootid;;
        for (var i = 0; i < menudata.length; i++) {
            if (id == menudata[i].menuid) {
                return $.extend(menudata[i], {parentname: getMenuById(menudata[i].menuparent).menuname || 'ROOT'});
            }
        }
        return {};
    };
    
    
    function getMenuByModule(menumodule) {
        var ar = [], rootid;;
        for (var i = 0; i < menudata.length; i++) {
            if (menumodule == menudata[i].menulink) {
                return $.extend(menudata[i], {parentname: getMenuById(menudata[i].menuparent).menuname || 'ROOT'});
            }
        }
        return {};
    }
    
    var getRootList = function () {
        var arli = [], clev = 0;
            
        function fill(r, lev) {
            arli.push('<li style=""><a href="#" menuid="' + r.menuid + '">' + new Array(lev + 1).join('--') + r.menuname + '</a></li>');
            var fn = arguments.callee;
            var children = pickChildById(r.menuid);
            if (children.length > 0) {
                lev++;
                for (var i = 0; i < children.length; i++) {
                    fill(children[i], lev);
                }
            }
        };
        
        for (var i = 0, ar = pickTopMenu(); i < ar.length; i++) {
            fill(ar[i], 0);
        };
        return arli.join(''); 
//        }
    };
    
    function clickEvt () {
        $('#saveMenu').unbind('click').click(function () {
            var menuParent = $('#menuParent').attr('parentid');
            var menuName = $('#menuName').val();
            var menuLink = $('#menuLink').val();
            var menuNote = $('#menuNote').val();
            if (menuName == '') {
                alert ('请输入正确的名称');
                return;
            }
//            if (menuLink == '') {
//                alert ('请输入正确的菜单地址');
//                return;
//            }
            manager.setMenu($.extend({
                name: menuName,
                link: menuLink,
                parent: menuParent,
                note: menuNote
            }, op == 1 ? {id: $('#currentMenuId').val()}: {}), function (d) {
                alert ('添加成功');
                location.reload();
            });
        });
        
        slidewrap.find('button[cmd="del"]').unbind('click').click(function (evt) {
            var id = $(this).attr('menuid');
            manager.delMenu({id: id}, function () {
                alert ('删除成功');
                location.reload();
            });
            return false;
        });
    }
    
    var op = 0;
    function init() {
        $('#newMenu').click(function () {
            if (menudata) {
                op = 0;
                slidewrap = slidepanel.show({con:util.tmpl('<div class="drawer-wrapper" style="">    <div class="drawer-title"><i class="drawer-close"></i><span class="drawer-title-content">&nbsp;</span></div>    <input type="hidden" id="currentMenuId" value="<%=data.menuid%>"/>    <%if (op == 1) {%><button cmd="del" menuid="<%=data.menuid%>"><i class="icon-remove"></i>删除</button><%}%>    <div class="drawer">        <ul class="dialog">            <li class="clearfix">              <div class="btn-toolbar" style="margin: 0;">                  <div class="btn-group">                    <button id="menuParent" class="btn dropdown-toggle" data-toggle="dropdown" parentid="<%=data.menuparent%>"><%=data.parentname%> <span class="caret"></span></button>                    <ul class="dropdown-menu" data-event="parent">                        <%=roothtml%>                    </ul>                                                  </div><!-- /btn-group -->                            </div>            <div class="input_tips">选择菜单的上级菜单</div>          </li>              <li class="clearfix">                <label class="bind-domain-title"></label>                <span class="input-text"><input class="input" value="<%=data.menuname%>" type="text" id="menuName" placeholder="输入菜单名称"></span>                  <div class="input_tips">输入菜单名称</div>            </li>                                    <li class="clearfix">                <label class="bind-domain-title"></label>                <span class="input-text"><input class="input" value="<%=data.menulink%>" type="text" id="menuLink" placeholder="输入菜单地址"></span>                  <div class="input_tips">输入菜单地址</div>            </li>                                    <li class="clearfix">                <label class="bind-domain-title"></label>                <textarea class="input" type="text" id="menuNote" placeholder="输入菜单描述"><%=data.menunonte%></textarea>                  <div class="input_tips">输入菜单描述</div>            </li>                <li class="current_status">                <a href="javascript:void 0;" id="saveMenu" class="btn btn-primary">确定</a>              </li>        </ul></div></div>', {data: {menuid: '',menuparent:0,menuname: '', menunote:'',parentname:'root'},roothtml: getRootList(), op:op }) } ) ;
                clickEvt();
            }
            return false;
        });
        event.addCommonEvent('click', {
            'parent': function (evt) {
                var menu_id = $(evt.target).attr('menuid');
                var menu_name = $(evt.target).html();
                $(this).prev().html(menu_name + '&nbsp;<span class="caret"></span>').attr('parentid', menu_id);
//                $('#menuParent').val(menu_id);
            },
            
            'edit_menu': function (evt) {
                var aitem = evt.target;
                if (aitem.nodeName != 'A') {
                    return false;
                }
                op = 1;
                var id = $(evt.target).attr('menuid');
                slidewrap = slidepanel.show({con:util.tmpl('<div class="drawer-wrapper" style="">    <div class="drawer-title"><i class="drawer-close"></i><span class="drawer-title-content">&nbsp;</span></div>    <input type="hidden" id="currentMenuId" value="<%=data.menuid%>"/>    <%if (op == 1) {%><button cmd="del" menuid="<%=data.menuid%>"><i class="icon-remove"></i>删除</button><%}%>    <div class="drawer">        <ul class="dialog">            <li class="clearfix">              <div class="btn-toolbar" style="margin: 0;">                  <div class="btn-group">                    <button id="menuParent" class="btn dropdown-toggle" data-toggle="dropdown" parentid="<%=data.menuparent%>"><%=data.parentname%> <span class="caret"></span></button>                    <ul class="dropdown-menu" data-event="parent">                        <%=roothtml%>                    </ul>                                                  </div><!-- /btn-group -->                            </div>            <div class="input_tips">选择菜单的上级菜单</div>          </li>              <li class="clearfix">                <label class="bind-domain-title"></label>                <span class="input-text"><input class="input" value="<%=data.menuname%>" type="text" id="menuName" placeholder="输入菜单名称"></span>                  <div class="input_tips">输入菜单名称</div>            </li>                                    <li class="clearfix">                <label class="bind-domain-title"></label>                <span class="input-text"><input class="input" value="<%=data.menulink%>" type="text" id="menuLink" placeholder="输入菜单地址"></span>                  <div class="input_tips">输入菜单地址</div>            </li>                                    <li class="clearfix">                <label class="bind-domain-title"></label>                <textarea class="input" type="text" id="menuNote" placeholder="输入菜单描述"><%=data.menunonte%></textarea>                  <div class="input_tips">输入菜单描述</div>            </li>                <li class="current_status">                <a href="javascript:void 0;" id="saveMenu" class="btn btn-primary">确定</a>              </li>        </ul></div></div>', {data: getMenuById(id),roothtml: getRootList(), op: op }) } ) ;
                clickEvt();
                return false;
            }
        });
    }
    module.exports = menumanager;
});
;define('app/person/leadertasking/leadertasking', function (require, exports, module) {
    var $ = require('$');
    var login = require('login');
    var event = require('event');
    var util = require('util');
    var dialog = require('dialog');
    var manager = require('manager');
    var slidepanel = require('widget/slidepanel/slidepanel');
    var app_util = require('main/app_util');
    var dept = require('app/dept/dept');
    var user = require('app/user/user');
    var ve = require('editor/ve');
    var editorObj;
    var cacheData;
    var op = 0;
    var dateFormat = { dateFormat : "yy-mm-dd" };
    var slidewrap;
    var container;
    var currentTab = 'new_report';

    event.addCommonEvent('click', {
        'edit_leadertasking': function (evt) {
            var aitem = evt.target;
            if (aitem.nodeName != 'A') {
                return false;
            }
            op = 1;
            var id = $(evt.target).attr('reportid');
            app_util.getLoginInfo(function (info) {
                var dt = util.getInfoById(cacheData, id);
                $.extend(dt, {
                    user_cn_name: info[0].cnname,
                    user_dept_name: info[0].deptname, 
                    user_dept: info[0].deptid,
                    user_id: info[0].id
                });
                slidewrap = slidepanel.show({con:util.tmpl('<div class="drawer-wrapper" style="">    <div class="drawer-title"><i class="drawer-close"></i><span class="drawer-title-content">&nbsp;</span></div>    <input type="hidden" id="currentId" value="<%=data.id%>"/>        <div class="drawer bs-docs-example form-horizontal">        <ul class="dialog">              <li>                <div class="control-group">                    <input class="input" value="<%=data.user_id%>" type="hidden" id="iptUserID">                      <input class="input" value="<%=data.user_dept%>" type="hidden" id="iptUserDept">                      <span class="input-text">录入者：<%=data.user_cn_name%>&nbsp;所在科室：<%=data.user_dept_name%></span>                </div>            </li>            <li>                <div class="control-group">                    <label class="control-label">所属类型</label>                    <div class="controls">                        <span class=""><select id="leadertask_type" style="width:auto;"></select></span>                     </div>                </div>            </li>            <li>                <div class="control-group">                    <label class="control-label">紧急程度</label>                    <div class="controls">                        <span class=""><select id="leadertask_grade" style="width:auto;"></select></span>                     </div>                </div>            </li>            <li>                <div class="control-group">                    <label class="control-label">相关科室</label>                    <div class="controls">                        <input value="<%=data.related_dept_id%>" type="hidden" id="relatedDept">                        <input class="input-small" value="<%=data.related_dept_name%>" type="text" id="iptRelatedDept" placeholder="输入部门编码">输入部门编码检索                    </div>                </div>            </li>              <li>                <div class="control-group">                    <label class="control-label">标题</label>                    <div class="controls">                        <input class="input-xlarge" value="<%=data.title%>" type="text" id="iptTitle" placeholder="任务标题">                    </div>                </div>            </li>                                        <li>                <div class="control-group">                    <label class="control-label">任务描述</label>                    <div class="controls">                        <div id="editToobar"></div>                        <textarea class="hide" rows="3" id="iptNote" placeholder="任务描述"><%=data.note%></textarea>                      </div>                </div>            </li>            <li>                <div class="control-group">                    <label class="control-label">任务时间</label>                    <div class="controls">                        <span class="input-text"><input class="input-xlarge" value="<%=data.start_time%>" type="text" id="ipt_start_time" placeholder="处理时间"></span>                    </div>                </div>            </li>            <li>                <div class="control-group">                    <label class="control-label">相关人员</label>                    <div class="controls">                        <span class="input-text"><select id="ipt_related_user" style="width:auto;"></select></span>                    </div>                </div>            </li>            <li>                <div class="control-group">                    <label class="control-label">联系方式</label>                    <div class="controls">                        <span class="input-text"><input class="input-xlarge" value="<%=data.telno%>" type="text" id="iptTelNo" placeholder="处理时间"></span>                    </div>                </div>            </li>        </ul>    </div>    <div style="clear:both" class="form-horizontal">        <hr />        <div id="leader_process_wrap" class="hide">            <div class="control-group">                <label class="control-label">状态</label>                <div class="controls">                    <span class=""><select id="leadertask_status" style="width:auto;"></select></span>                 </div>            </div>            <div class="control-group">                <label class="control-label">处理意见</label>                <div class="controls">                    <textarea rows="3" id="iptLeaderProcessNote" placeholder="处理意见"></textarea>                  </div>            </div>            <div class="control-group">                <label class="control-label"></label>                <div class="controls">                    <button cmd="process" class="btn btn-primary" rid="<%=data.id%>">处理</button>                 </div>            </div>                    </div>    </div>    <%if (data.cstatus != 75) {%>    <div style="clear:both;">        <a href="javascript:void 0;" cmd="save" class="btn btn-primary">确定</a>        <%if (op == 1) {%>            <button cmd="show_process" class="btn btn-primary">处理该单</button>            <button cmd="del" class="btn" deptid="<%=data.id%>"><i class="icon-remove"></i>删除</button>        <%}%>    </div>    <%}%></div>', {data: dt, op:op }) } ) ;
                app_util.fillKeyValueSelect(6, $('#leadertask_type'), dt.ftype);
                editorObj =new ve.Create({
                    container:$("#editToobar")[0],
                    height:'300px',
                    width:'600px'
                });
                editorObj.setContent(dt.note);
                
                app_util.deptTypeAhead($('#iptRelatedDept'), function (item, dv, txt, seldata) {
                    $( "#relatedDept" ).val(dv);
                    $('#iptRelatedDept').val(seldata.name);
                });
                $( "#ipt_start_time" ).datepicker(dateFormat);
                app_util.renderRoleSelect($('#ipt_related_user'), dt.task_for);
                app_util.fillKeyValueSelect(1, $('#leadertask_grade'), dt.grade);
                cstatus = dt.cstatus || 76;
                app_util.fillKeyValueSelect(2, $('#leadertask_status'), dt.cstatus, function () {
                    
                });
                
                saveEvent();
            });
            return false;
        }
    });
    
    
    function init() {
        addEvents();
        if (currentTab) {
            $('.nav-tabs li').removeClass('active');
            $('.nav-tabs li a[cmd="' + currentTab + '"]').parent().addClass('active');
        }
    }
    
    function addEvents() {
        container.find('a[cmd="addNew"]').unbind('click').click(function () {
            op = 0;
            app_util.getLoginInfo(function (info) {
                slidewrap = slidepanel.show({con:util.tmpl('<div class="drawer-wrapper" style="">    <div class="drawer-title"><i class="drawer-close"></i><span class="drawer-title-content">&nbsp;</span></div>    <input type="hidden" id="currentId" value="<%=data.id%>"/>        <div class="drawer bs-docs-example form-horizontal">        <ul class="dialog">              <li>                <div class="control-group">                    <input class="input" value="<%=data.user_id%>" type="hidden" id="iptUserID">                      <input class="input" value="<%=data.user_dept%>" type="hidden" id="iptUserDept">                      <span class="input-text">录入者：<%=data.user_cn_name%>&nbsp;所在科室：<%=data.user_dept_name%></span>                </div>            </li>            <li>                <div class="control-group">                    <label class="control-label">所属类型</label>                    <div class="controls">                        <span class=""><select id="leadertask_type" style="width:auto;"></select></span>                     </div>                </div>            </li>            <li>                <div class="control-group">                    <label class="control-label">紧急程度</label>                    <div class="controls">                        <span class=""><select id="leadertask_grade" style="width:auto;"></select></span>                     </div>                </div>            </li>            <li>                <div class="control-group">                    <label class="control-label">相关科室</label>                    <div class="controls">                        <input value="<%=data.related_dept_id%>" type="hidden" id="relatedDept">                        <input class="input-small" value="<%=data.related_dept_name%>" type="text" id="iptRelatedDept" placeholder="输入部门编码">输入部门编码检索                    </div>                </div>            </li>              <li>                <div class="control-group">                    <label class="control-label">标题</label>                    <div class="controls">                        <input class="input-xlarge" value="<%=data.title%>" type="text" id="iptTitle" placeholder="任务标题">                    </div>                </div>            </li>                                        <li>                <div class="control-group">                    <label class="control-label">任务描述</label>                    <div class="controls">                        <div id="editToobar"></div>                        <textarea class="hide" rows="3" id="iptNote" placeholder="任务描述"><%=data.note%></textarea>                      </div>                </div>            </li>            <li>                <div class="control-group">                    <label class="control-label">任务时间</label>                    <div class="controls">                        <span class="input-text"><input class="input-xlarge" value="<%=data.start_time%>" type="text" id="ipt_start_time" placeholder="处理时间"></span>                    </div>                </div>            </li>            <li>                <div class="control-group">                    <label class="control-label">相关人员</label>                    <div class="controls">                        <span class="input-text"><select id="ipt_related_user" style="width:auto;"></select></span>                    </div>                </div>            </li>            <li>                <div class="control-group">                    <label class="control-label">联系方式</label>                    <div class="controls">                        <span class="input-text"><input class="input-xlarge" value="<%=data.telno%>" type="text" id="iptTelNo" placeholder="处理时间"></span>                    </div>                </div>            </li>        </ul>    </div>    <div style="clear:both" class="form-horizontal">        <hr />        <div id="leader_process_wrap" class="hide">            <div class="control-group">                <label class="control-label">状态</label>                <div class="controls">                    <span class=""><select id="leadertask_status" style="width:auto;"></select></span>                 </div>            </div>            <div class="control-group">                <label class="control-label">处理意见</label>                <div class="controls">                    <textarea rows="3" id="iptLeaderProcessNote" placeholder="处理意见"></textarea>                  </div>            </div>            <div class="control-group">                <label class="control-label"></label>                <div class="controls">                    <button cmd="process" class="btn btn-primary" rid="<%=data.id%>">处理</button>                 </div>            </div>                    </div>    </div>    <%if (data.cstatus != 75) {%>    <div style="clear:both;">        <a href="javascript:void 0;" cmd="save" class="btn btn-primary">确定</a>        <%if (op == 1) {%>            <button cmd="show_process" class="btn btn-primary">处理该单</button>            <button cmd="del" class="btn" deptid="<%=data.id%>"><i class="icon-remove"></i>删除</button>        <%}%>    </div>    <%}%></div>', {data: {id: '',name: '', note:'',power: '',user_cn_name: info[0].cnname,user_dept_name: info[0].deptname, user_dept: info[0].deptid,user_id: info[0].id }, op:op }) } ) ;
                $( "#iptApplyTime" ).datepicker(dateFormat);
                
                app_util.fillKeyValueSelect(6, $('#leadertask_type'));
                
                editorObj =new ve.Create({
                    container:$("#editToobar")[0],
                    height:'150px',
                    width:'600px'
                });
                
                app_util.deptTypeAhead($('#iptRelatedDept'), function (item, dv, txt, seldata) {
                    $( "#relatedDept" ).val(dv);
                    $('#iptRelatedDept').val(seldata.name);
                });
                $( "#ipt_start_time" ).datepicker(dateFormat);
                app_util.renderRoleSelect($('#ipt_related_user'));
                app_util.fillKeyValueSelect(1, $('#leadertask_grade'));
                saveEvent();
            });
            return false;
        }); 
        container.find('a[cmd="new_report"]').unbind('click').click(function () {
            currentTab = 'new_report';
            initTable({cstatus: 76});
            return false;
        });
        container.find('a[cmd="done_report"]').unbind('click').click(function () {
            currentTab = 'done_report';
            initTable({cstatus: 75});
            return false;
        });
        container.find('a[cmd="process_report"]').unbind('click').click(function () {
            currentTab = 'process_report';
            initTable({cstatus: 74});
            return false;
        });
    }
    
    function saveEvent( ) {
        slidewrap.find('a[cmd="save"]').unbind('click').click(function () {
            var title = $('#iptTitle').val();
            var telno = $('#iptTelNo').val();
            var leadertype = $('#leadertask_type').val();
            var grade = $('#leadertask_grade').val();
            var note = editorObj.getContent();
            var user_id = $('#iptUserID').val();
            var user_dept = $('#iptUserDept').val();
            var ProcessUser = $('#processUser').val();
            var start_time = $('#ipt_start_time').val();
            var iptDoneUser = $('#doneUser').val();
            var iptDoneDate = $('#iptDoneDate').val();
            var relatedDept = $('#relatedDept').val();
            var relatedFor = $('#ipt_related_user').val();
            if (title == '') {
                alert ('标题不能为空');
                return;
            }
            var params = {
                title: title,
                tel: telno,
                done_user: iptDoneUser || 0,
                repair_user: user_id,
                repair_dept: user_dept,
                start_time: start_time,
                end_time: iptDoneDate,
                grade: grade,
                ftype: leadertype,
                note: note,
                task_for_type: 1,
                task_for: relatedFor,
                related_dept: relatedDept,
                cstatus: 76
            };
            if (op ==1 ) {
                params.id = $('#currentId').val();
            }
            manager.setLeaderTasking(params, function (d) {
                dialog.create ('操作成功', 400, 200, {isMaskClickHide: 0, title: '操作结果', button: {
                    '确定': function() {
                        dialog.hide();
                    }
                }});
                slidepanel.hide();
                wrap.render();
            });
            return false;
        });
        
        slidewrap.find('button[cmd="del"]').unbind('click').click(function (evt) {
            var id = $(this).attr('deptid');
            dialog.create ('确定要删除改故障单么，删除后不可恢复，确定吗？', 400, 200, {isMaskClickHide: 0, title: '操作确认', button: {
                '确定': function() {
                    dialog.hide();
                    manager.delLeaderTasking({id: id}, function () {
//                        alert ('删除成功');
                        slidepanel.hide();
                        wrap.render();
                    });
                }
            }}); 
            
            return false;
        });
        
        slidewrap.find('button[cmd="process"]').unbind('click').click(function () {
            manager.setLeaderTasking({
                id: $('#currentId').val(),
                cstatus:$('#leadertask_status').val()
            }, function (d) {
                manager.setProcessLog({
                    src: 'leader_tasking_list', 
                    status_type: 2, 
                    cstatus: cstatus, 
                    main_id: $('#currentId').val(),
                    dest_status: $('#leadertask_status').val(),
                    note: $('#iptProcessNote').val()
                }, function (d) {
                    dialog.create ('操作成功', 400, 200, {isMaskClickHide: 0, title: '操作结果', button: {
                        '确定': function() {
                            dialog.hide();
                            slidepanel.hide();
                            wrap.render();
                        }
                    }});
                });
            }); 
        });
        
        $('button[cmd="show_process"]').unbind('click').click(function () {
            $('#leader_process_wrap').toggleClass('hide');
//            $('#btnWrap').toggleClass('hide');
            return false;
        });
    }
    
    
    function initTable(param) {
         manager.getLeaderTasking(param, function (data) {
            cacheData = data;
            for (var i = 0; i < data.length; i++) {
                data[i].typename = util.getInfoById(sysbase, data[i].ftype)._value
                data[i].start_time = util.formatDate(data[i].start_time);
                data[i].create_time = util.formatDate(data[i].create_time);
            }
            container.html(util.tmpl('<a class="btn" href="#" cmd="addNew">新增</a><ul class="nav nav-tabs">  <li class="active">    <a href="#" cmd="new_report">未处理</a>  </li>    <li>    <a href="#" cmd="process_report">处理中</a>  </li>  <li><a href="#" cmd="done_report">已完成</a></li></ul><table class="table table-condensed table-bordered table-striped" data-event="edit_leadertasking">    <thead>      <tr>        <th>标题</th>        <th>所属类别</th>        <th>创建日期</th>        <th>相关科室</th>              </tr>    </thead>    <tbody>        <%for (var i = 0; i < data.length; i++) {%>      <tr>        <td><a reportid="<%=data[i].id%>" href="#"><%=data[i].title%></a></td>        <td><%=data[i].typename%></td>        <td><%=data[i].create_time%></td>        <td><%=data[i].related_dept_name%> </td>              </tr>        <%}%>    </tbody></table>', {data: cacheData}));
            init ();
        });
    }
    
    
    var wrap = {
        render: function () {
            container = $('#mainContainer');
            var param = {};
            currentTab = 'new_report';
            initTable({cstatus: 76});
        }
    };
    module.exports = wrap;
});
;define('app/person/mytask/mytask', function (require, exports, module) {
    var $ = require('$');
    var login = require('login');
    var event = require('event');
    var util = require('util');
    var dialog = require('dialog');
    var manager = require('manager');
    var slidepanel = require('widget/slidepanel/slidepanel');
    var app_util = require('main/app_util');
    var dept = require('app/dept/dept');
    var user = require('app/user/user');
    var ve = require('editor/ve');
    var editorObj;
    var cacheData;
    var op = 0;
    var dateFormat = { dateFormat : "yy-mm-dd" };
    var slidewrap;
    var container;
    var currViewUser;
    
    event.addCommonEvent('click', {
        'edit_mytasking': function (evt) {
            var aitem = evt.target;
            if (aitem.nodeName != 'A') {
                return false;
            }
            op = 1;
            var id = $(evt.target).attr('taskingid');
            var src = $(evt.target).attr('src');
            app_util.getLoginInfo(function (info) {
                var dt = util.getInfoById(cacheData, id);
                $.extend(dt, {
                    user_cn_name: info[0].cnname,
                    user_dept_name: info[0].deptname, 
                    user_dept: info[0].deptid,
                    user_id: info[0].id
                });
                slidewrap = slidepanel.show({con:util.tmpl('<div class="drawer-wrapper" style="">    <div class="drawer-title"><i class="drawer-close"></i><span class="drawer-title-content">&nbsp;</span></div>    <input type="hidden" id="currentId" value="<%=data.id%>"/>    <%var canEdit = (src == "employee" || data.cstatus == 1) ? " readonly disabled ": "";%>    <div class="drawer bs-docs-example form-horizontal">        <ul class="dialog">              <li <%if (src == "employee") {%> style="display:none;"<%}%>>                <div class="control-group">                    <input class="input" value="<%=data.user_id%>" type="hidden" id="iptUserID">                      <input class="input" value="<%=data.user_dept%>" type="hidden" id="iptUserDept">                      <span class="input-text">录入者：<%=data.user_cn_name%>&nbsp;所在科室：<%=data.user_dept_name%></span>                </div>            </li>            <li>                <div class="control-group">                    <label class="control-label">所属类型</label>                    <div class="controls">                        <span class=""><select id="mytask_type" style="width:auto;" <%=canEdit%>></select></span>                     </div>                </div>            </li>                                <li>                <div class="control-group">                    <label class="control-label">标题</label>                    <div class="controls">                        <input class="input-xlarge" value="<%=data.title%>" type="text" <%=canEdit%> id="iptTitle" placeholder="任务标题">                    </div>                </div>            </li>                        <li>                <div class="control-group">                    <label class="control-label">任务描述</label>                    <div class="controls">                        <div id="editToobar"></div>                        <textarea class="hide" rows="3" id="iptNote" placeholder="任务描述" <%=canEdit%>><%=data.note%></textarea>                      </div>                </div>            </li>        </ul>    </div>    <%if (src == "employee") {%>        <hr />        <div class="drawer bs-docs-example form-horizontal">            <div class="control-group">                <label class="control-label">处理意见</label>                <div class="controls">                    <textarea rows="3" id="iptProcessNote" style="width:500px;" placeholder="处理意见"><%=data.process_note%></textarea>                  </div>            </div>        </div>    <%}%>    <%if (data.cstatus==1) {%>    <a href="#" cmd="show_process">显示处理情况</a>     <div id="process_wrap">                </div>    <%}%>    <div style="clear:both;">        <%if (src == "employee") {%>            <%if (+data.cstatus == 0) {%>            <a href="javascript:void 0;" cmd="process" class="btn btn-primary">处理</a>            <%}%>        <%} else {%>        <a href="javascript:void 0;" cmd="save" class="btn btn-primary">确定</a>        <%}%>        <%if (op == 1) {%>            <%if ( src == "main") {%>            <button cmd="del" class="btn" deptid="<%=data.id%>"><i class="icon-remove"></i>删除</button>            <%}%>        <%}%>    </div></div>', {data: dt, op: op, src: src}) } ) ;
                initCtl(dt);
                editorObj =new ve.Create({
                    container:$("#editToobar")[0],
                    height:'300px',
                    width:'600px'
                });
                editorObj.setContent(dt.note);
                saveEvent();
            });
            return false;
        }
    });
    
    function init() {
        addEvents();
    }
    
    function initCtl(dt){
        dt = dt || {};
        app_util.fillKeyValueSelect(6, $('#mytask_type'), dt.ftype);
        $( "#iptApplyTime" ).datepicker(dateFormat);
    }
    function addEvents() {
        container.find('a[cmd="addNew"]').click(function () {
            op = 0;
            app_util.getLoginInfo(function (info) {
                slidewrap = slidepanel.show({con:util.tmpl('<div class="drawer-wrapper" style="">    <div class="drawer-title"><i class="drawer-close"></i><span class="drawer-title-content">&nbsp;</span></div>    <input type="hidden" id="currentId" value="<%=data.id%>"/>    <%var canEdit = (src == "employee" || data.cstatus == 1) ? " readonly disabled ": "";%>    <div class="drawer bs-docs-example form-horizontal">        <ul class="dialog">              <li <%if (src == "employee") {%> style="display:none;"<%}%>>                <div class="control-group">                    <input class="input" value="<%=data.user_id%>" type="hidden" id="iptUserID">                      <input class="input" value="<%=data.user_dept%>" type="hidden" id="iptUserDept">                      <span class="input-text">录入者：<%=data.user_cn_name%>&nbsp;所在科室：<%=data.user_dept_name%></span>                </div>            </li>            <li>                <div class="control-group">                    <label class="control-label">所属类型</label>                    <div class="controls">                        <span class=""><select id="mytask_type" style="width:auto;" <%=canEdit%>></select></span>                     </div>                </div>            </li>                                <li>                <div class="control-group">                    <label class="control-label">标题</label>                    <div class="controls">                        <input class="input-xlarge" value="<%=data.title%>" type="text" <%=canEdit%> id="iptTitle" placeholder="任务标题">                    </div>                </div>            </li>                        <li>                <div class="control-group">                    <label class="control-label">任务描述</label>                    <div class="controls">                        <div id="editToobar"></div>                        <textarea class="hide" rows="3" id="iptNote" placeholder="任务描述" <%=canEdit%>><%=data.note%></textarea>                      </div>                </div>            </li>        </ul>    </div>    <%if (src == "employee") {%>        <hr />        <div class="drawer bs-docs-example form-horizontal">            <div class="control-group">                <label class="control-label">处理意见</label>                <div class="controls">                    <textarea rows="3" id="iptProcessNote" style="width:500px;" placeholder="处理意见"><%=data.process_note%></textarea>                  </div>            </div>        </div>    <%}%>    <%if (data.cstatus==1) {%>    <a href="#" cmd="show_process">显示处理情况</a>     <div id="process_wrap">                </div>    <%}%>    <div style="clear:both;">        <%if (src == "employee") {%>            <%if (+data.cstatus == 0) {%>            <a href="javascript:void 0;" cmd="process" class="btn btn-primary">处理</a>            <%}%>        <%} else {%>        <a href="javascript:void 0;" cmd="save" class="btn btn-primary">确定</a>        <%}%>        <%if (op == 1) {%>            <%if ( src == "main") {%>            <button cmd="del" class="btn" deptid="<%=data.id%>"><i class="icon-remove"></i>删除</button>            <%}%>        <%}%>    </div></div>', {data: {id: '',name: '', note:'',power: '',user_cn_name: info[0].cnname,user_dept_name: info[0].deptname, user_dept: info[0].deptid,user_id: info[0].id }, op:op, src: 'new' }) } ) ;
                
                initCtl();
                saveEvent();
                editorObj =new ve.Create({
                    container:$("#editToobar")[0],
                    height:'300px',
                    width:'600px'
                });
            });
            return false;
        });  
    }
    
    function saveEvent( ) {
        slidewrap.find('a[cmd="save"]').click(function () {
            var title = $('#iptTitle').val();
            var telno = $('#iptTelNo').val();
            var report_type = $('#mytask_type').val();
            var note = editorObj.getContent();//$('#iptNote').val();
            var user_id = $('#iptUserID').val();
            var user_dept = $('#iptUserDept').val();
            if (title == '') {
                alert ('标题不能为空');
                return;
            }
            var params = {
                add_user: user_id,
                title: title,
                ftype: report_type,
                note: note,
                cstatus: 0
            };
            if (op ==1 ) {
                params.id = $('#currentId').val();
            }
            manager.setMyTasking(params, function (d) {
                dialog.create ('操作成功', 400, 200, {isMaskClickHide: 0, title: '操作结果', button: {
                    '确定': function() {
                        dialog.hide();
                    }
                }});
                slidepanel.hide();
                moduleWrap.render();
            });
            return false;
        });
        slidewrap.find('button[cmd="del"]').unbind('click').click(function (evt) {
            var id = $(this).attr('deptid');
            dialog.create ('确定要删除任务单么，删除后不可恢复，确定吗？', 400, 200, {isMaskClickHide: 0, title: '操作确认', button: {
                '确定': function() {
                    dialog.hide();
                    manager.delMyTasking({id: id}, function () {
                        dialog.miniTip('删除成功');
                        slidepanel.hide();
                        moduleWrap.render();
                    });
                }
            }}); 
            
            return false;
        });
        slidewrap.find('a[cmd="process"]').click(function () {
            manager.setMyTasking({
                id: $('#currentId').val(),
                cstatus: 1
            }, function (d) {
                manager.setProcessLog({
                    src: 'mytasking_list', 
                    status_type: 2, 
                    cstatus: 0, 
                    main_id: $('#currentId').val(),
                    dest_status: 1,
                    note: $('#iptProcessNote').val()
                }, function (d) {
                    dialog.create ('操作成功', 400, 200, {isMaskClickHide: 0, title: '操作结果', button: {
                        '确定': function() {
                            dialog.hide();
                            slidepanel.hide();
                            moduleWrap.render();
                        }
                    }});
                });
            });
        });

        var loaded = 0;
        $('a[cmd="show_process"]').unbind('click').click(function () {
            !loaded && manager.getLog({
                target: 'mytasking_list',
                id:$('#currentId').val()
            }, function (data) {
                var html = util.tmpl('<% for (var i=0;i<data.length;i++){%><div style="padding:5px 0;border-bottom:1px solid #ccc;">    <div><%=data[i].note%></div>    <div><i><%=data[i].op_user_cnname%></i>在<i><%=data[i].last_modify_time%></i>最后处理为<i><%=data[i].cstatusname%></i><%if (data[i].cstatus != 74 && i == data.length - 1) {%>,当前处理人为<i><%=data[i].process_user_cnname%></i><%}%></div></div><%}%>', {data: data});
                $('#process_wrap').html(html);
                loaded = 1;
            });
            return false;
        });
    }
    
    function getEmployeeTasking(user, cnname) {
        manager.getEmployeeTask({uid: user}, function (data) {
            currViewUser = user;
            cacheData = cacheData.concat(data);
            for (var i = 0; i < data.length; i++) {
                data[i].typename = util.getInfoById(sysbase, data[i].ftype)._value

                data[i].last_modify_time = util.formatDate(data[i].last_modify_time);
                data[i].create_time = util.formatDate(data[i].create_time);
                data[i].statusname = {'1':'已完成', '0':'正在处理'}[data[i].cstatus];
            }
            $('#employeetasklist').html(util.tmpl('<%if (data.length > 0) {%><table class="table table-condensed table-bordered table-striped table-nowrap" data-event="edit_mytasking">    <thead>      <tr>        <th>标题</th>        <th>所属类别</th>        <th>创建日期</th>        <th>录入者</th>        <th>最后更新日期</th>        <th>状态</th>      </tr>    </thead>    <tbody>        <%for (var i = 0; i < data.length; i++) {%>      <tr>        <td><a taskingid="<%=data[i].id%>" src="employee" href="#"><%=data[i].title%></a></td>        <td><%=data[i].typename%></td>        <td><%=data[i].create_time%></td>        <td><%=data[i].adduser_cnname%> </td>        <td><%=data[i].last_modify_time%></td>        <td><%=data[i].statusname%></td>      </tr>        <%}%>    </tbody></table><%} else {%><font size="5"><%=cnname%></font>还没有提交任何任务，您可以<a href="">邮件提醒</a><%}%>', {data: data, user: user, cnname: cnname}))
        });
    }

    var moduleWrap = {
        render: function () {
            container = $('#mainContainer');
            var param = {};
            manager.getMyTasking(param, function (data) {
                cacheData = data;
                for (var i = 0; i < data.length; i++) {
                    data[i].typename = util.getInfoById(sysbase, data[i].ftype)._value
                    data[i].last_modify_time = util.formatDate(data[i].last_modify_time);
                    data[i].create_time = util.formatDate(data[i].create_time);
                }
                container.html(util.tmpl('<a class="btn" href="#" cmd="addNew">新增</a><table class="table table-condensed table-bordered table-striped table-nowrap" data-event="edit_mytasking">    <thead>      <tr>        <th>标题</th>        <th>所属类别</th>        <th>创建日期</th>        <th>录入者</th>        <th>最后更新日期</th>              </tr>    </thead>    <tbody>        <%for (var i = 0; i < data.length; i++) {%>      <tr>        <td><a taskingid="<%=data[i].id%>" href="#" src="main"><%=data[i].title%></a></td>        <td><%=data[i].typename%></td>        <td><%=data[i].create_time%></td>        <td><%=data[i].adduser_cnname%> </td>        <td><%=data[i].last_modify_time%></td>              </tr>        <%}%>    </tbody></table><div id="employee_task_list"></div>', {data: cacheData}));
                init ();
            });
            manager.getEmployee({}, function (data) {
                $('#employee_task_list').html(util.tmpl('<div><%if (data.length > 0) {%><h4>相关任务</h4><div class="nav"><%for (var i = 0; i < data.length; i++) {%><span href="#" data-id="<%=data[i].id%>" class="user_list"><%=data[i].cnname%></span><%}%></div><div id="employeetasklist"></div><%}%></div>', {data: data}));
                var last;
                $('#employee_task_list').find('.user_list').click(function () {
                    if (last) {
                        last.removeClass('user_list_curr');
                    }
                    last = $(this).addClass('user_list_curr');
                    getEmployeeTasking($(this).data('id'), $(this).text());
                }).eq(0).click();
            });
        }
    };
    module.exports = moduleWrap;
});
;define('app/person/mytodo/mytodo', function (require, exports, module) {
    var $ = require('$');
    var login = require('login');
    var event = require('event');
    var util = require('util');
    var dialog = require('dialog');
    var manager = require('manager');
    var slidepanel = require('widget/slidepanel/slidepanel');
    var app_util = require('main/app_util');
    var failure_grade = require('app/userservice/failure_grade/failure_grade');
    var failure_type = require('app/userservice/failure_type/failure_type');
    var failure_status = require('app/userservice/failure_status/failure_status');
    var dept = require('app/dept/dept');
    var user = require('app/user/user');
    var cacheData;
    var cacheSoftwareData;
    var op = 0;
    var dateFormat = { dateFormat : "yy-mm-dd" };
    var slidewrap;
    var container;
    var cstatus;
    var currData;
    var currentTab = 'process_report';
    var currentTab1 = 'process_software';
    
    event.addCommonEvent('click', {
        'edit_todo': function (evt) {
            var aitem = evt.target;
            if (aitem.nodeName != 'A') {
                return false;
            }
            op = 1;
            var id = $(evt.target).attr('reportid');
            app_util.getLoginInfo(function (info) {
                var dt = util.getInfoById(cacheData, id);
                $.extend(dt, { 
                    user_cn_name: info[0].cnname,
                    user_dept_name: info[0].deptname, 
                    user_dept: info[0].deptid,
                    user_id: info[0].id
                });
                currData = dt;
                slidewrap = slidepanel.show({con:util.tmpl('<div class="drawer-wrapper" style="">    <div class="drawer-title"><i class="drawer-close"></i><span class="drawer-title-content">&nbsp;</span></div>    <input type="hidden" id="currentId" value="<%=data.id%>"/>        <div class="drawer bs-docs-example form-horizontal">        <ul class="dialog">              <li>                <div class="control-group hide">                    <input class="input" value="<%=data.user_id%>" type="hidden" id="iptUserID">                      <input class="input" value="<%=data.user_dept%>" type="hidden" id="iptUserDept">                      <span class="input-text">申请人：<%=data.user_cn_name%>&nbsp;所在科室：<%=data.user_dept_name%></span>                </div>            </li>            <li>                <label class="control-label"></label>                <div class="control-group">                    <input type="hidden" value="<%=data.repair_user %>" id="repaireUser" />                    <input type="hidden" value="<%=data.repair_dept %>" id="repaireDept" />                    <span class="input-text">申请人科室：<%=data.dept_name%>&nbsp;申请人：<%=data.cnname%></span>                </div>            </li>              <li>                <div class="control-group">                    <label class="control-label">标题</label>                    <div class="controls">                        <input class="input-xlarge" value="<%=data.title%>" type="text" id="iptTitle" placeholder="任务标题">                    </div>                </div>            </li>                            <li>                <div class="control-group">                    <label class="control-label">联系电话</label>                    <div class="controls">                        <span class="input-text"><input class="input" value="<%=data.tel%>" type="text" id="iptTelNo" placeholder="联系电话"></span>                      </div>                </div>            </li>            <li>                <div class="control-group">                    <label class="control-label">任务类型</label>                    <div class="controls">                        <span class=""><select id="report_type" style="width:auto;"></select></span>                     </div>                </div>            </li>            <li>                <div class="control-group">                    <label class="control-label">紧急程度</label>                    <div class="controls">                        <span class=""><select id="report_grade" style="width:auto;"></select></span>                      </div>                </div>            </li>                        <li>                <div class="control-group">                    <label class="control-label">任务描述</label>                    <div class="controls">                        <div id="iptNote"><%=data.note%></div>                        <textarea class="hide" rows="3" id="iptNote2" placeholder="任务描述"><%=data.note%></textarea>                      </div>                </div>            </li>        </ul>                        <ul class="dialog_right hide">            <li class="clearfix">                <div class="control-group">                    <label class="control-label">处理人</label>                    <div class="controls">                        <input type="hidden" readonly disabled id="processUser2" value="<%=data.user_id%>"/>                        <span class="input-text"><input class="input-xlarge" value="<%=data.user_cn_name%>" type="text" id="iptProcessUser2" placeholder="处理人"></span>                    </div>                </div>            </li>                        <li>                <div class="control-group">                    <label class="control-label">处理时间</label>                    <div class="controls">                        <span class="input-text"><input class="input-xlarge" value="<%=data.apply_time%>" type="text" id="iptProcessDate2" placeholder="处理时间"></span>                    </div>                </div>            </li>            <li>                <div class="control-group">                    <label class="control-label">完成人</label>                    <div class="controls">                        <input type="hidden" id="doneUser" value="<%=data.done_user%>"/>                        <span class="input-text"><input class="input-xlarge" value="<%=data.done_cnname%>" type="text" id="iptDoneUser" placeholder="完成人"></span>                    </div>                </div>            </li>                        <li>                <div class="control-group">                    <label class="control-label">完成时间</label>                    <div class="controls">                        <span class="input-text"><input class="input-xlarge" value="<%=data.end_time%>" type="text" id="iptDoneDate" placeholder="完成时间"></span>                    </div>                </div>            </li>        </ul>    </div>    <div style="clear:both" class="form-horizontal">        <hr />                        <%if (op == 1) {%>        <div id="process_wrap">            <div class="control-group">                <label class="control-label">处理人员</label>                <div class="controls">                                        <span class="">                        <input type="hidden" id="processUser" value="<%=data.user_id%>"/>                        <input class="input-xlarge" readonly disabled value="<%=data.user_cn_name%>" type="text" id="iptProcessUser" placeholder="处理人">                        <select id="_0_sel_duty_user" style="width:auto;display:none"></select>                    </span>                     <% if (data.cstatus == 76 || data.cstatus == 74) {%><a href="#" cmd="change_process_user">转处理人</a><%}%>                </div>                            </div>            <div class="control-group hide change_process_user" >                <label class="control-label">转给处理人员</label>                <div class="controls">                    <span class="">                        <input type="hidden" id="changeProcessUser" value=""/>                        <input class="input-xlarge" type="text" id="iptChangeProcessUser" placeholder="处理人">                    </span>                 </div>                            </div>            <div class="control-group">                <label class="control-label">处理时间</label>                <div class="controls">                    <span class="input-text"><input class="input-xlarge" value="<%=data.apply_time%>" type="text" id="iptProcessDate" placeholder="处理时间"></span>                </div>            </div>                    <div class="control-group">                <label class="control-label">处理意见</label>                <div class="controls">                    <textarea rows="3" id="iptProcessNote" placeholder="处理意见"><%=data.process_note%></textarea>                  </div>            </div>        </div>            <%}%>    </div>    <div style="clear:both;">                <%if (op == 1) {%>            <% if (data.cstatus == 76) {%>                <button cmd="start_exec" class="btn btn-primary" rid="<%=data.id%>">开始执行</button>            <%} else if (data.cstatus == 74) {%>                <button cmd="done_exec" class="btn btn-primary" rid="<%=data.id%>">完成</button>            <%}%>            <button cmd="del" class="btn hide" deptid="<%=data.id%>"><i class="icon-remove"></i>删除</button>        <%} else {%>            <a href="javascript:void 0;" cmd="save" class="btn btn-primary">确定</a>        <%}%>    </div></div>', {data: dt, op:op }) } ) ;
//                fillGradeSelect(dt.grade);
//                fillTypeSelect(dt.ftype);
                initCtl(dt);
                showProcess();
                saveEvent();
            });
            return false;
        },
        
        'edit_software_report_todo': function (evt) {
            var aitem = evt.target;
            if (aitem.nodeName != 'A') {
                return false;
            }
            op = 1;
            var id = $(evt.target).attr('reportid');
            app_util.getLoginInfo(function (info) {
                var dt = util.getInfoById(cacheSoftwareData, id);
                $.extend(dt, {
                    user_cn_name: info[0].cnname,
                    user_dept_name: info[0].deptname, 
                    user_dept: info[0].deptid,
                    user_id: info[0].id
                });
                slidewrap = slidepanel.show({con:util.tmpl('<div class="drawer-wrapper" style="">    <div class="drawer-title"><i class="drawer-close"></i><span class="drawer-title-content">&nbsp;</span></div>    <input type="hidden" id="currentSoftwareId" value="<%=data.id%>"/>        <div class="drawer bs-docs-example form-horizontal">        <ul class="dialog">              <li>                <div class="control-group">                    <input class="input" value="<%=data.user_id%>" type="hidden" id="iptUserID">                      <input class="input" value="<%=data.user_dept%>" type="hidden" id="iptUserDept">                      <span class="controls">申请人：<%=data.user_cn_name%>&nbsp;所在科室：<%=data.user_dept_name%></span>                </div>            </li>                             <li>                <div class="control-group">                    <label class="control-label">提出日期</label>                    <div class="controls">                        <input class="input-xlarge disabled" readonly disabled value="<%=data.apply_time%>" type="text" id="iptApplyTime" placeholder="提出日期">                    </div>                </div>            </li>            <li>                <div class="control-group">                    <label class="control-label">相关科室</label>                    <div class="controls">                        <input value="<%=data.apply_dept%>" type="hidden" id="applyDept">                        <input class="input-small" readonly disabled value="<%=data.dept_name%>" type="text" id="iptApplyDept" placeholder="输入部门编码">输入部门编码检索                    </div>                </div>            </li>            <li>                <div class="control-group">                    <label class="control-label">科室联系人</label>                    <div class="controls">                        <input value="<%=data.apply_user%>" type="hidden" id="applyUser">                        <input class="input-small" readonly disabled value="<%=data.cnname%>" type="text" id="iptApplyUser" placeholder="输入工号">输入工号检索                    </div>                </div>            </li>            <li>                <div class="control-group">                    <label class="control-label">标题</label>                    <div class="controls">                        <input class="input-xlarge" readonly disabled value="<%=data.title%>" type="text" id="iptTitle" placeholder="项目标题">                    </div>                </div>            </li>                        <li>                <div class="control-group">                    <label class="control-label">项目描述</label>                    <div class="controls">                        <textarea rows="3" readonly disabled id="iptNote" placeholder="项目描述"><%=data.note%></textarea>                      </div>                </div>            </li>            <li>                <div class="control-group">                    <label class="control-label">相关系统</label>                    <div class="controls">                        <input class="input-xlarge" readonly disabled value="<%=data.related_app%>" type="text" id="iptRelatedApp" placeholder="故障标题">                    </div>                </div>            </li>                        <li>                <div class="control-group">                    <label class="control-label">审核意见</label>                    <div class="controls">                        <textarea rows="3" id="iptResult" <% if (data.cstatus == 2) {%>disabled readonly<%}%> placeholder="审核意见"><%=data.result%></textarea>                     </div>                </div>            </li>            <li class="hide">                <div class="control-group">                    <label class="control-label">是否完成</label>                    <div class="controls">                        <input id="chkStatus" type="checkbox" <%=data.cstatus==1? "": ""%>/>                     </div>                </div>            </li>        </ul>    </div>    <div style="clear:both;">        <%if (data.cstatus == 0) {%>        <a href="javascript:void 0;" cmd="save_software_todo" class="btn btn-primary">审核</a>        <a href="javascript:void 0;" cmd="refuse_software_todo" class="btn btn-danger">驳回</a>        <%} else if (data.cstatus == 2) {%>            <a href="javascript:void 0;" cmd="complete_software_todo" class="btn btn-primary">完成</a>        <%}%>        <%if (op == 1 && 0) {%><button cmd="del" class="btn btn-danger" deptid="<%=data.id%>"><i class="icon-remove"></i>删除</button><%}%>    </div></div>', {data: dt, op:op }) } ) ;
                
                initCtl1(dt);
                saveEvent();
            });
            return false;
        }
    });
    
    function initCtl1(dt) {
        dt = dt || {};
        $( "#iptApplyTime" ).datepicker(dateFormat);
        app_util.deptTypeAhead($( "#iptApplyDept" ), function (item, dv, txt, seldata) {
            $( "#applyDept" ).val(dv);
            $( "#iptApplyDept" ).val(seldata.name);
        });
        app_util.userTypeAhead($( "#iptApplyUser" ), function (item, dv, txt, seldata) {
            $( "#applyUser" ).val(dv);
            $( "#iptApplyUser" ).val(seldata.name);
        });
    };
    
    function initCtl (dt ) {
        dt = dt || {};
        app_util.fillKeyValueSelect(3, $('#report_type'), dt.ftype);
        app_util.fillKeyValueSelect(1, $('#report_grade'), dt.grade);
        app_util.fillKeyValueSelect(2, $('#report_status'), dt.cstatus);
        $( "#iptProcessDate" ).datepicker(dateFormat);
        $( "#iptDoneDate" ).datepicker(dateFormat);
        
        app_util.userTypeAhead($('#iptProcessUser'), function (item, dv, txt, seldata) {
            $('#processUser').val(dv)
            $('#iptProcessUser').val(seldata.cnname)
        });
        
        app_util.userTypeAhead($('#iptChangeProcessUser'), function (item, dv, txt, seldata) {
            $('#changeProcessUser').val(dv)
            $('#iptChangeProcessUser').val(seldata.cnname)
        });
        
        app_util.userTypeAhead($('#iptDoneUser'), function (item, dv, txt, seldata) {
            $('#doneUser').val(dv)
            $('#iptDoneUser').val(seldata.cnname)
        });
        app_util.userTypeAhead($('#iptDutyUser'), function (item, dv, txt, seldata) {
            $('#dutyUser').val(dv)
            $('#iptDutyUser').val(seldata.cnname)
        });
        initUserRole();
    }
    
    function initUserRole(id) {
        manager.getRole({}, function (data) {
            var ar = [];
            for (var i = 0; i < data.length; i++) {
                ar.push('<option value="' + data[i].id+ '">' + data[i].name + '</option>');
            }
//            $('#sel_duty_user').html(ar.join(''));
//            $('#sel_duty_user').val(currData.duty_user)
        });
    }

    function init() {
        addEvents();
        if (currentTab) {
            $('.nav_tabs_mod1 li').removeClass('active');
            $('.nav_tabs_mod1 li a[cmd="' + currentTab + '"]').parent().addClass('active');
        }
    }
    
    function initSoftware() {
        addEvents();
        if (currentTab1) {
            $('.nav_tabs_mod2 li').removeClass('active');
            $('.nav_tabs_mod2 li a[cmd="' + currentTab1 + '"]').parent().addClass('active');
        }
    }
    
    function showProcess() {
        $('button[cmd="show_process"]').click(function () {
            $('#process_wrap').toggleClass('hide');
//            $('#btnWrap').toggleClass('hide');
            return false;
        });
    }
    
    function addEvents() {
        container.find('a[cmd="addNew"]').unbind('click').click(function () {
            op = 0;
            app_util.getLoginInfo(function (info) {
                slidewrap = slidepanel.show({con:util.tmpl('<div class="drawer-wrapper" style="">    <div class="drawer-title"><i class="drawer-close"></i><span class="drawer-title-content">&nbsp;</span></div>    <input type="hidden" id="currentId" value="<%=data.id%>"/>        <div class="drawer bs-docs-example form-horizontal">        <ul class="dialog">              <li>                <div class="control-group hide">                    <input class="input" value="<%=data.user_id%>" type="hidden" id="iptUserID">                      <input class="input" value="<%=data.user_dept%>" type="hidden" id="iptUserDept">                      <span class="input-text">申请人：<%=data.user_cn_name%>&nbsp;所在科室：<%=data.user_dept_name%></span>                </div>            </li>            <li>                <label class="control-label"></label>                <div class="control-group">                    <input type="hidden" value="<%=data.repair_user %>" id="repaireUser" />                    <input type="hidden" value="<%=data.repair_dept %>" id="repaireDept" />                    <span class="input-text">申请人科室：<%=data.dept_name%>&nbsp;申请人：<%=data.cnname%></span>                </div>            </li>              <li>                <div class="control-group">                    <label class="control-label">标题</label>                    <div class="controls">                        <input class="input-xlarge" value="<%=data.title%>" type="text" id="iptTitle" placeholder="任务标题">                    </div>                </div>            </li>                            <li>                <div class="control-group">                    <label class="control-label">联系电话</label>                    <div class="controls">                        <span class="input-text"><input class="input" value="<%=data.tel%>" type="text" id="iptTelNo" placeholder="联系电话"></span>                      </div>                </div>            </li>            <li>                <div class="control-group">                    <label class="control-label">任务类型</label>                    <div class="controls">                        <span class=""><select id="report_type" style="width:auto;"></select></span>                     </div>                </div>            </li>            <li>                <div class="control-group">                    <label class="control-label">紧急程度</label>                    <div class="controls">                        <span class=""><select id="report_grade" style="width:auto;"></select></span>                      </div>                </div>            </li>                        <li>                <div class="control-group">                    <label class="control-label">任务描述</label>                    <div class="controls">                        <div id="iptNote"><%=data.note%></div>                        <textarea class="hide" rows="3" id="iptNote2" placeholder="任务描述"><%=data.note%></textarea>                      </div>                </div>            </li>        </ul>                        <ul class="dialog_right hide">            <li class="clearfix">                <div class="control-group">                    <label class="control-label">处理人</label>                    <div class="controls">                        <input type="hidden" readonly disabled id="processUser2" value="<%=data.user_id%>"/>                        <span class="input-text"><input class="input-xlarge" value="<%=data.user_cn_name%>" type="text" id="iptProcessUser2" placeholder="处理人"></span>                    </div>                </div>            </li>                        <li>                <div class="control-group">                    <label class="control-label">处理时间</label>                    <div class="controls">                        <span class="input-text"><input class="input-xlarge" value="<%=data.apply_time%>" type="text" id="iptProcessDate2" placeholder="处理时间"></span>                    </div>                </div>            </li>            <li>                <div class="control-group">                    <label class="control-label">完成人</label>                    <div class="controls">                        <input type="hidden" id="doneUser" value="<%=data.done_user%>"/>                        <span class="input-text"><input class="input-xlarge" value="<%=data.done_cnname%>" type="text" id="iptDoneUser" placeholder="完成人"></span>                    </div>                </div>            </li>                        <li>                <div class="control-group">                    <label class="control-label">完成时间</label>                    <div class="controls">                        <span class="input-text"><input class="input-xlarge" value="<%=data.end_time%>" type="text" id="iptDoneDate" placeholder="完成时间"></span>                    </div>                </div>            </li>        </ul>    </div>    <div style="clear:both" class="form-horizontal">        <hr />                        <%if (op == 1) {%>        <div id="process_wrap">            <div class="control-group">                <label class="control-label">处理人员</label>                <div class="controls">                                        <span class="">                        <input type="hidden" id="processUser" value="<%=data.user_id%>"/>                        <input class="input-xlarge" readonly disabled value="<%=data.user_cn_name%>" type="text" id="iptProcessUser" placeholder="处理人">                        <select id="_0_sel_duty_user" style="width:auto;display:none"></select>                    </span>                     <% if (data.cstatus == 76 || data.cstatus == 74) {%><a href="#" cmd="change_process_user">转处理人</a><%}%>                </div>                            </div>            <div class="control-group hide change_process_user" >                <label class="control-label">转给处理人员</label>                <div class="controls">                    <span class="">                        <input type="hidden" id="changeProcessUser" value=""/>                        <input class="input-xlarge" type="text" id="iptChangeProcessUser" placeholder="处理人">                    </span>                 </div>                            </div>            <div class="control-group">                <label class="control-label">处理时间</label>                <div class="controls">                    <span class="input-text"><input class="input-xlarge" value="<%=data.apply_time%>" type="text" id="iptProcessDate" placeholder="处理时间"></span>                </div>            </div>                    <div class="control-group">                <label class="control-label">处理意见</label>                <div class="controls">                    <textarea rows="3" id="iptProcessNote" placeholder="处理意见"><%=data.process_note%></textarea>                  </div>            </div>        </div>            <%}%>    </div>    <div style="clear:both;">                <%if (op == 1) {%>            <% if (data.cstatus == 76) {%>                <button cmd="start_exec" class="btn btn-primary" rid="<%=data.id%>">开始执行</button>            <%} else if (data.cstatus == 74) {%>                <button cmd="done_exec" class="btn btn-primary" rid="<%=data.id%>">完成</button>            <%}%>            <button cmd="del" class="btn hide" deptid="<%=data.id%>"><i class="icon-remove"></i>删除</button>        <%} else {%>            <a href="javascript:void 0;" cmd="save" class="btn btn-primary">确定</a>        <%}%>    </div></div>', {data: {id: '',name: '', note:'',power: '',user_cn_name: info[0].cnname,user_dept_name: info[0].deptname, user_dept: info[0].deptid,user_id: info[0].id }, op:op }) } ) ;
                initCtl();
                saveEvent();
                
            });
            return false;
        }); 
        container.find('a[cmd="new_report"]').unbind('click').click(function () {
            currentTab = 'new_report';
            initTable({cstatus: 76,process_user: g_User.id});
            return false;
        });
        container.find('a[cmd="done_report"]').unbind('click').click(function () {
            currentTab = 'done_report';
            initTable({cstatus: 75,process_user: g_User.id}, {cstatus: 75});
            return false;
        });
        // 待处理任务
        container.find('a[cmd="process_report"]').unbind('click').click(function () {
            currentTab = 'process_report';
            initTable({cstatus: '76,74',process_user: g_User.id}, {cstatus: 76});
            return false;
        });
        
        // 处理中任务
        container.find('a[cmd="process_ing"]').unbind('click').click(function () {
            currentTab = 'process_ing';
            initTable({cstatus: 74,process_user: g_User.id}, {cstatus: 74});
            return false;
        });
        
        container.find('a[cmd="process_software"]').unbind('click').click(function () {
            currentTab1 = 'process_software';
            initTableSoftware({cstatus:0});
            return false;
        });
        container.find('a[cmd="done_software"]').unbind('click').click(function () {
            currentTab1 = 'done_software';
            initTableSoftware({cstatus:1});
            return false;
        });
    }
    
    function saveEvent( ) {
        slidewrap.find('a[cmd="save"]').unbind('click').click(function () {
            var title = $('#iptTitle').val();
            var telno = $('#iptTelNo').val();
            var report_type = $('#report_type').val();
            var report_grade = $('#report_grade').val();
            var note = $('#iptNote').val();
            var user_id = $('#iptUserID').val();
            var user_dept = $('#iptUserDept').val();
            var ProcessUser = $('#processUser').val();
            var iptProcessDate = $('#iptProcessDate').val();
            var iptDoneUser = $('#doneUser').val();
            var iptDoneDate = $('#iptDoneDate').val();
            if (title == '') {
                alert ('标题不能为空');
                return;
            }
            var params = {
                title: title,
                duty_user: 0,
                process_user: ProcessUser || 0,
                done_user: iptDoneUser || 0,
                repair_user: user_id,
                repair_dept: user_dept,
                apply_time: iptProcessDate,
                end_time: iptDoneDate,
                grade: report_grade,
                ftype: report_type,
                note: note,
                cstatus: 76
            };
            if (op ==1 ) {
                params.id = $('#currentId').val();
            }
            manager.setTasking(params, function (d) {
                dialog.create ('操作成功', 400, 200, {isMaskClickHide: 0, title: '操作结果', button: {
                    '确定': function() {
                        dialog.hide();
                    }
                }});
                slidepanel.hide();
                moduleWrap.render();
            });
            return false;
        });
        
        slidewrap.find('button[cmd="del"]').unbind('click').click(function (evt) {
            var id = $(this).attr('deptid');
            dialog.create ('确定要删除改故障单么，删除后不可恢复，确定吗？', 400, 200, {isMaskClickHide: 0, title: '操作确认', button: {
                '确定': function() {
                    dialog.hide();
                    manager.delTasking({id: id}, function () {
                        dialog.miniTip('删除成功');
                        slidepanel.hide();
                        moduleWrap.render();
                    });
                }
            }}); 
            
            return false;
        });
        
        function p(st) {}
        slidewrap.find('button[cmd="start_exec"]').unbind('click').click(function () {
            if (!$('#iptProcessNote').val()) {
                alert ('请输入处理意见');
                return;
            }
            var changeUser = $('#changeProcessUser').val();
            
            manager.setTasking({
                id: $('#currentId').val(),
                duty_user: $('#sel_duty_user').val(),
                apply_time: $('#iptProcessDate').val(),
                process_user: changeUser || $('#processUser').val(),
                cstatus: changeUser ? 76 : 74
            }, function (d) {
                var action = 'set' + currData.task_src.replace('_list', '').replace(/(^\w)/, function(_0, _1) {return _1.toUpperCase()}).replace(/_(\w)/, function(_0, _1) {return _1.toUpperCase()});
                var complete = function () {
                    manager.sendMail({
                        to_user_id: $('#repaireUser').val(),
                        from_user_id: g_User.id,
                        content: changeUser ? '%from_user%给你分配了一张故障单，请进入系统进行处理': '%from_user%正在处理你的故障单，请登录系统查看'
                    });
                };
                var fn = manager[action];
                fn && fn({
                    id: currData.main_id,
                    process_user: changeUser || currData.user_id,
                    last_process_time: util.getCurrentTime(1),
                    cstatus: changeUser ? 76 : 74
                }, complete);
                manager.setProcessLog({
                    src: 'tasking_list', 
                    status_type: 2, 
                    cstatus: currData.cstatus, 
                    main_id: currData.main_id,
                    dest_status: changeUser ? 76 : 74,
                    from_table: currData.task_src,
                    note: $('#iptProcessNote').val()
                }, function (d) {
                    dialog.create ('操作成功', 400, 200, {isMaskClickHide: 0, title: '操作结果', button: {
                        '确定': function() {
                            dialog.hide();
                            slidepanel.hide();
                            moduleWrap.render();
                        }
                    }});
                });
            });
        });
        
        slidewrap.find('button[cmd="done_exec"]').unbind('click').click(function () {
            if (!$('#iptProcessNote').val()) {
                alert ('请输入处理意见');
                return;
            }
			var changeUser = $('#changeProcessUser').val();
			var params = {
                id: $('#currentId').val(),
                cstatus: 75,
                done_user: currData.user_id
            };
			if (changeUser) {
				delete params.cstatus;
				delete params.done_user;
				params.process_user = changeUser;
			}
            manager.setTasking(params, function (d) {
                var action = 'set' + currData.task_src.replace('_list', '').replace(/(^\w)/, function(_0, _1) {return _1.toUpperCase()}).replace(/_(\w)/, function(_0, _1) {return _1.toUpperCase()});
                var complete = function () {
                    manager.sendMail({
                        to_user_id: $('#repaireUser').val(),
                        from_user_id: g_User.id,
                        content: '%from_user%已经处理完你的故障申请，请登录系统产看详情并评分'
                    });
                };
                var fn = manager[action];
				var params = {
                    id: currData.main_id,
                    done_user: currData.user_id,
                    end_time: util.getCurrentTime(1),
                    cstatus: 75
                };
				if (changeUser) {
					delete params.cstatus;
					delete params.done_user;
					params.process_user = changeUser;
				}
                fn && fn(params, complete);
                params = {
                    src: 'tasking_list', 
                    status_type: 2, 
                    cstatus: currData.cstatus, 
                    main_id: currData.main_id,
                    dest_status: 75,
                    from_table: currData.task_src,
                    note: $('#iptProcessNote').val()
                };
				if (changeUser) {
					delete params.cstatus;
				}
                manager.setProcessLog(params, function (d) {
                    dialog.create ('操作成功', 400, 200, {isMaskClickHide: 0, title: '操作结果', button: {
                        '确定': function() {
                            dialog.hide();
                            slidepanel.hide();
                            initTable({cstatus: '76,74',process_user: g_User.id}, {cstatus: 76});
                        }
                    }});
                });
            });
        });
        
        slidewrap.find('a[cmd="save_software_todo"]').unbind('click').click(function () {
            var result = $('#iptResult').val();
            var chkStatus = +$('#chkStatus')[0].checked;
            var params = {
                id: $('#currentSoftwareId').val(),
                result: result,
                cstatus: '2' // 状态未2转入下一个流程
            };
            manager.setSoftwareReport(params, function (d) {
                dialog.create ('操作成功', 400, 200, {isMaskClickHide: 0, title: '操作结果', button: {
                    '确定': function() {
                        dialog.hide();
                        slidepanel.hide();
                    }
                }});
                manager.setProcessLog({
                    src: 'software_report_list', 
                    status_type: 2, 
                    cstatus: 0, 
                    main_id: $('#currentSoftwareId').val(),
                    dest_status: 2,
                    from_table: 'software_report_list',
                    note: result
                }, function () {});
                initTableSoftware({cstatus: 0});
            });
            return false;
        });
        slidewrap.find('a[cmd="refuse_software_todo"]').unbind('click').click(function () {
            var result = $('#iptResult').val();
            var chkStatus = +$('#chkStatus')[0].checked;
            var params = {
                id: $('#currentSoftwareId').val(),
                result: result,
                cstatus: '4' // 状态未4驳回
            };
            manager.setSoftwareReport(params, function (d) {
                dialog.create ('操作成功', 400, 200, {isMaskClickHide: 0, title: '操作结果', button: {
                    '确定': function() {
                        dialog.hide();
                        slidepanel.hide();
                    }
                }});
                manager.setProcessLog({
                    src: 'software_report_list', 
                    status_type: 2, 
                    cstatus: 0, 
                    main_id: $('#currentSoftwareId').val(),
                    dest_status: 4,
                    from_table: 'software_report_list',
                    note: result
                }, function () {});
                initTableSoftware({cstatus: 0});
            });
            return false;
        });
        slidewrap.find('a[cmd="complete_software_todo"]').unbind('click').click(function () {
            var result = $('#iptResult').val();
            var chkStatus = +$('#chkStatus')[0].checked;
            var params = {
                id: $('#currentSoftwareId').val(),
                result: result,
                cstatus: '1' // 已完成流程结束
            };
            manager.setSoftwareReport(params, function (d) {
                dialog.create ('操作成功', 400, 200, {isMaskClickHide: 0, title: '操作结果', button: {
                    '确定': function() {
                        dialog.hide();
                        slidepanel.hide();
                    }
                }});
                manager.setProcessLog({
                    src: 'software_report_list', 
                    status_type: 2, 
                    cstatus: 0, 
                    main_id: $('#currentSoftwareId').val(),
                    dest_status: 1,
                    from_table: 'software_report_list',
                    note: result
                }, function () {});
                initTableSoftware({cstatus: 0});
            });
            return false;
        });
        slidewrap.find('a[cmd="change_process_user"]').unbind('click').click(function () {
            slidewrap.find('div.change_process_user').removeClass('hide');
            return false;
        });
    }
    function initTable(param, param2) {
        cacheData = [];
        var processdata = function (d) {
            for (var i = 0; i < cacheData.length; i++) {
                if (cacheData[i].id == d.id) {
                    return;
                }
            }
            d.gradename = app_util.changeColor(util.getInfoById(sysbase, d.grade)._value);
            d.typename = util.getInfoById(sysbase, d.ftype)._value
            d.statusname = util.getInfoById(sysbase, d.cstatus)._value || '未处理';


            d.last_process_time = util.formatDate(d.last_process_time);
            d.create_time = util.formatDate(d.create_time);
            d.done_time = util.formatDate(d.done_time);
            d.apply_time = util.formatDate(d.apply_time);
            d.end_time = util.formatDate(d.end_time);

            cacheData.push(d);
        };
        var loadnum = [];
        manager.getTasking(param, function (data) {
//            cacheData = data;
            for (var i = 0; i < data.length; i++) {
                if (data[i].process_user == g_User.id) {
                    processdata(data[i]);
                }
            }
            loadnum.push('1');
        });
        // 获取我的角色和故障单类型的对应关系
        manager.getTasking(param2, function (list) {
            manager.getFailureTypeRole({role_id: g_User.role_id}, function (relations) {
                var ar = [];
                for (var i = 0; i < relations.length; i++) {
                    ar.push(relations[i].failure_type);
                }
                
                $.each(list, function (i, n) {
                    if ((',' + ar.join(',') + ',').indexOf(String(n.ftype)) > -1) {
                        processdata(n);
                    }
                });
                loadnum.push('1');
            });
        });
        var timer;
        var fn = function () {
            if (loadnum.length == 2) {
                $('#failure_todo_list').html(util.tmpl('<ul class="nav nav-tabs nav_tabs_mod1">  <li class="active hide">    <a href="#" cmd="new_report">未处理</a>  </li><li class="active">    <a href="#" cmd="process_report">待处理</a>  </li>    <li class="hide">    <a href="#" cmd="process_ing">处理中/已分派</a>  </li>  <li><a href="#" cmd="done_report">已完成</a></li></ul><table class="table table-condensed table-bordered table-striped" data-event="edit_todo">    <thead>      <tr>        <th>标题</th>        <th>报修人</th>        <th>报修人科室</th>        <th>处理人员</th>        <th>完成人</th>        <th>提单时间</th>        <th>完成时间</th>        <th>状态</th>        <th>紧急程度</th>        <th>故障类别</th>      </tr>    </thead>    <tbody>         <%for (var i = 0; i < data.length; i++) {%>      <tr>        <td><a reportid="<%=data[i].id%>" href="#"><%=data[i].title%></a></td>        <td><%=data[i].cnname%> </td>        <td><%=data[i].dept_name%></td>        <td><%=data[i].process_cnname%></td>        <td><%=data[i].done_cnname%></td>        <td><%=data[i].create_time%></td>        <td><%=data[i].apply_time%></td>        <td><%=data[i].statusname%></td>        <td><%=data[i].gradename%></td>        <td><%=data[i].typename%></td>      </tr>        <%}%>    </tbody></table>', {data: cacheData}));
                init ();
                return;
            }
            timer = setTimeout(fn, 100);
        };
        fn();
        setTimeout(function () {
            clearTimeout(timer);
        }, 5000);
    }
    
    function initTableSoftware(param) {
        if (g_User.job_id == 91 && param.cstatus == 0 ) {
            param.cstatus = 2;
        }
        
        function dataLoaded(data) {
            $('#software_todo_list').html(util.tmpl('<ul class="nav nav-tabs nav_tabs_mod2">    <li class="active">        <a href="#" cmd="process_software">待处理</a>      </li>      <li><a href="#" cmd="done_software">已完成</a></li>    </ul>        <a class="btn hide" href="#" cmd="addNew">新增</a>    <table class="table table-condensed table-bordered table-striped" data-event="edit_software_report_todo">        <thead>          <tr>            <th>标题</th>            <th>提单者</th>            <th>相关科室</th>            <th>相关联系人</th>            <th>申请日期</th>            <th>状态</th>          </tr>        </thead>        <tbody>            <%for (var i = 0; i < software_data.length; i++) {%>          <tr>            <td><a reportid="<%=software_data[i].id%>" href="#"><%=software_data[i].title%></a></td>            <td><%=software_data[i].op_username%></td>            <td><%=software_data[i].dept_name%></td>            <td><%=software_data[i].cnname%></td>            <td><%=software_data[i].apply_time%></td>            <td><%=software_data[i].statusname%></td>          </tr>            <%}%>        </tbody>    </table>', {software_data: data}));
            initSoftware();
        }
        manager.getSoftwareTodo(param, function (software_data) {
            cacheSoftwareData = software_data;
            for (var i = 0; i < software_data.length; i++) {

                software_data[i].create_time = util.formatDate(software_data[i].create_time);
                software_data[i].apply_time = util.formatDate(software_data[i].apply_time);

                software_data[i].statusname = {'0': '未完成', '1': '已完成', '2': '上级已同意'}[software_data[i].cstatus];
            }
            
            dataLoaded(software_data);
            
        });
    }
    
    var moduleWrap = {
        render: function () {
            container = $('#mainContainer');
            var param = {};
            currentTab = 'process_report';
            currentTab1 = 'process_software';
            container.html('<p class="lead">故障列表</p><a class="btn hide" href="#" cmd="addNew">新增</a><div class="mod_page_wrap" id="failure_todo_list"></div><p class="lead">软件需求列表</p><div class="mod_page_wrap" id="software_todo_list">            </div>');
            initTable({cstatus: '76,74',process_user: g_User.id}, {cstatus: 76});
            initTableSoftware({cstatus:0});
        }
    };
    module.exports = moduleWrap;
});
define('app/person/report/report', function(require, exports, module) { // use sea

var $ = require('$');
var login = require('login');
var event = require('event');
var util = require('util');
var dialog = require('dialog');
var manager = require('manager');
var slidepanel = require('widget/slidepanel/slidepanel');
var app_util = require('main/app_util');
var dept = require('app/dept/dept');
var user = require('app/user/user');
var ve = require('editor/ve');

var query = {};
event.addCommonEvent('click', {
	'report-type-nav': (function () {
		var last;
		return function (evt) {
			var el = evt.target;
			if (el.nodeName != 'A') {
				return;
			}
			if (last) {
				last.parent().removeClass('active');
			}
			last = $(el);
			query.typeid = last.data('typeid');
			query.title = last.text();
			initReport(query, function () {
				last.parent().addClass('active');
			});
			return false;
		}
	}) (),

	'report-date-nav': (function () {
		var last;
		return function (evt) {
			var el = evt.target;
			if (el.nodeName != 'A') {
				return;
			}
			if (last) {
				last.parent().removeClass('active');
			}
			last = $(el);
			query.day = last.data('date');
			initReport(query, function () {
				last.parent().addClass('active');
			});
			return false;
		}
	}) ()
});

function initPage() {
	manager.getKeyValue({type: 3}, function (list) {
        initNav(list);
    });
}

function initNav(list) {
	var tpl = '<ul class="nav nav-pills" data-event="report-type-nav"><% for (var i = 0; i < list.length; i++) {%>  <li class=""><a href="#" data-typeid="<%=list[i].id%>"><%=list[i]._value%></a></li>  <%}%></ul><ul class="nav nav-pills" data-event="report-date-nav">  <li class=""><a href="#" data-date="7">近7天</a></li>  <li class=""><a href="#" data-date="31">近一个月</a></li>  <li class=""><a href="#" data-date="62">近两个月</a></li></ul><div id="report_chart" ></div>';
	var html = util.tmpl(tpl, {list: list});
	container.html(html);
}

function initReport(query, callback) {
	var reportContainer = $('report_chart');
	if ('undefined' == typeof Highcharts) {
		$.getScript('/dest/highcharts.src.js', getReportData);
	}
	else {
		getReportData ();
	}
	function getReportData() {
		var title = query.title;
		manager.getReportData(query, function (list) {
			var labels = [], vals = [];

			for (var i in list) {
				labels.push(i);
				vals.push(list[i]);
			}
			// labels = labels.slice(0, 7);
			// vals = vals.slice(0, 7);
			$('#report_chart').html('');
			chart = new Highcharts.Chart({ 
		        chart: { 
		            renderTo: 'report_chart',
		            zoomType: 'x'
		        }, 
		        title: { 
		            text: '统计图 - ' + title //图表标题 
		        }, 
		        subtitle: { 
		            text: 'IT运维系统'   //图表副标题 
		        }, 
		        credits: { 
		            enabled: false   //不显示LOGO 
		        }, 
		        xAxis: { //X轴标签 
		            categories: labels, 
		            labels: { 
		                rotation: -45,  //逆时针旋转45°，标签名称太长。 
		                align: 'right'  //设置右对齐 
		            } 
		        }, 
		        yAxis: { //设置Y轴-第二个（金额） 
		            title: {text: ''},//Y轴标题设为空 
		            labels: { 
		                formatter: function() {//格式化标签名称 
		                    return this.value;// + ' 万亿元'; 
		                }, 
		                style: { 
		                    color: '#4572A7' //设置标签颜色 
		                } 
		            } 
		 
		        }, 
		        tooltip: { //鼠标滑向数据区显示的提示框 
		            formatter: function() {  //格式化提示框信息 
		                return '' + this.x + ': ' + this.y + ' 次'; 
		            } 
		        }, 
		        legend: { //设置图例 
		            layout: 'vertical', //水平排列图例 
		            shadow: true,  //设置阴影 
		            align: 'left',
		            verticalAlign: 'top',
		            floating: true,
		            backgroundColor: '#ffffff'
		        }, 
		        series: [{  //数据列 
		            name: title, 
		            color: '#4572A7', 
		            type: 'column', 
		            data: vals 
		        }] 
		    }); 
			
			callback && callback();
		});
	}
}

var wrap = {
    render: function () {
        container = $('#mainContainer');
        var param = {};
        initPage();
    }
};
module.exports = wrap;});
;define('app/person/vacation/vacation.js', function (require, exports, module) {
    var $ = require('$');
    var login = require('login');
    var event = require('event');
    var util = require('util');
    var dialog = require('dialog');
    var manager = require('manager');
    var slidepanel = require('widget/slidepanel/slidepanel');
    var app_util = require('main/app_util');
    var dept = require('app/dept/dept');
    var user = require('app/user/user');
    var ve = require('editor/ve');
    var editorObj;
    var cacheData;
    var op = 0;
    var dateFormat = { dateFormat : "yy-mm-dd" };
    var slidewrap;
    var container;
    var currentTab = 'new_report';
    
    event.addCommonEvent('click', {
        'edit_vacation': function (evt) {
            var aitem = evt.target;
            if (aitem.nodeName != 'A') {
                return false;
            }
            op = 1;
            var id = $(evt.target).attr('reportid');
            app_util.getLoginInfo(function (info) {
                var dt = util.getInfoById(cacheData, id);
                $.extend(dt, {
                    user_cn_name: info[0].cnname,
                    user_dept_name: info[0].deptname, 
                    user_dept: info[0].deptid,
                    user_id: info[0].id
                });
                slidewrap = slidepanel.show({con:util.tmpl('<div class="drawer-wrapper" style="">    <div class="drawer-title"><i class="drawer-close"></i><span class="drawer-title-content">&nbsp;</span></div>    <input type="hidden" id="currentId" value="<%=data.id%>"/>        <div class="drawer bs-docs-example form-horizontal">        <ul class="dialog">              <li>                <div class="control-group">                    <input class="input" value="<%=data.user_id%>" type="hidden" id="iptUserID">                      <input class="input" value="<%=data.user_dept%>" type="hidden" id="iptUserDept">                      <span class="input-text">录入者：<%=data.user_cn_name%>&nbsp;所在科室：<%=data.user_dept_name%></span>                </div>            </li>            <li>                <div class="control-group">                    <label class="control-label">所属类型</label>                    <div class="controls">                        <span class=""><select id="vacation_type" style="width:auto;"></select></span>                     </div>                </div>            </li>            <li>                <div class="control-group">                    <label class="control-label">标题</label>                    <div class="controls">                        <input class="input-xlarge" value="<%=data.title%>" type="text" id="iptTitle" placeholder="任务标题">                    </div>                </div>            </li>                                        <li>                <div class="control-group">                    <label class="control-label">描述</label>                    <div class="controls">                        <div id="editToobar"></div>                        <textarea class="hide" rows="3" id="iptNote" placeholder="任务描述"><%=data.note%></textarea>                      </div>                </div>            </li>            <li>                <div class="control-group">                    <label class="control-label">任务时间</label>                    <div class="controls">                        <span class="input-text"><input class="input-xlarge" value="<%=data.start_time%>" type="text" id="ipt_start_time" placeholder="处理时间"></span>                    </div>                </div>            </li>            <li>                <div class="control-group">                    <label class="control-label">申请人员</label>                    <div class="controls">                        <span class="input-text"><select id="ipt_apply_user" style="width:auto;"></select></span>                    </div>                </div>            </li>        </ul>    </div>    <div style="clear:both;">        <a href="javascript:void 0;" cmd="save" class="btn btn-primary">确定</a>        <%if (op == 1) {%>            <button cmd="del" class="btn" deptid="<%=data.id%>"><i class="icon-remove"></i>删除</button>        <%}%>    </div></div>', {data: dt, op:op }) } ) ;
                app_util.fillKeyValueSelect(7, $('#vacation_type'), dt.ftype);
                editorObj =new ve.Create({
                    container:$("#editToobar")[0],
                    height:'300px',
                    width:'600px'
                });
                editorObj.setContent(dt.note);
                
                $( "#ipt_start_time" ).datepicker(dateFormat);
                app_util.renderRoleSelect($('#ipt_apply_user'), dt.apply_user);
                cstatus = dt.cstatus || 76;
                    
                
                saveEvent();
            });
            return false;
        }
    });
    
    function init() {
        addEvents();
        if (currentTab) {
            $('.nav-tabs li').removeClass('active');
            $('.nav-tabs li a[cmd="' + currentTab + '"]').parent().addClass('active');
        }
    }
    
    function addEvents() {
        container.find('a[cmd="addNew"]').unbind('click').click(function () {
            op = 0;
            app_util.getLoginInfo(function (info) {
                slidewrap = slidepanel.show({con:util.tmpl('<div class="drawer-wrapper" style="">    <div class="drawer-title"><i class="drawer-close"></i><span class="drawer-title-content">&nbsp;</span></div>    <input type="hidden" id="currentId" value="<%=data.id%>"/>        <div class="drawer bs-docs-example form-horizontal">        <ul class="dialog">              <li>                <div class="control-group">                    <input class="input" value="<%=data.user_id%>" type="hidden" id="iptUserID">                      <input class="input" value="<%=data.user_dept%>" type="hidden" id="iptUserDept">                      <span class="input-text">录入者：<%=data.user_cn_name%>&nbsp;所在科室：<%=data.user_dept_name%></span>                </div>            </li>            <li>                <div class="control-group">                    <label class="control-label">所属类型</label>                    <div class="controls">                        <span class=""><select id="vacation_type" style="width:auto;"></select></span>                     </div>                </div>            </li>            <li>                <div class="control-group">                    <label class="control-label">标题</label>                    <div class="controls">                        <input class="input-xlarge" value="<%=data.title%>" type="text" id="iptTitle" placeholder="任务标题">                    </div>                </div>            </li>                                        <li>                <div class="control-group">                    <label class="control-label">描述</label>                    <div class="controls">                        <div id="editToobar"></div>                        <textarea class="hide" rows="3" id="iptNote" placeholder="任务描述"><%=data.note%></textarea>                      </div>                </div>            </li>            <li>                <div class="control-group">                    <label class="control-label">任务时间</label>                    <div class="controls">                        <span class="input-text"><input class="input-xlarge" value="<%=data.start_time%>" type="text" id="ipt_start_time" placeholder="处理时间"></span>                    </div>                </div>            </li>            <li>                <div class="control-group">                    <label class="control-label">申请人员</label>                    <div class="controls">                        <span class="input-text"><select id="ipt_apply_user" style="width:auto;"></select></span>                    </div>                </div>            </li>        </ul>    </div>    <div style="clear:both;">        <a href="javascript:void 0;" cmd="save" class="btn btn-primary">确定</a>        <%if (op == 1) {%>            <button cmd="del" class="btn" deptid="<%=data.id%>"><i class="icon-remove"></i>删除</button>        <%}%>    </div></div>', {data: {id: '', note:'',user_cn_name: info[0].cnname,user_dept_name: info[0].deptname }, op:op }) } ) ;
                
                app_util.fillKeyValueSelect(7, $('#vacation_type'));
                
                editorObj =new ve.Create({
                    container:$("#editToobar")[0],
                    height:'150px',
                    width:'600px'
                });
                
                $( "#ipt_start_time" ).datepicker(dateFormat);
                app_util.renderRoleSelect($('#ipt_apply_user'));
                saveEvent();
            });
            return false;
        }); 
    }
    
    function saveEvent( ) {
        slidewrap.find('a[cmd="save"]').unbind('click').click(function () {
            var title = $('#iptTitle').val();
            var leadertype = $('#vacation_type').val();
            var note = editorObj.getContent();
            var user_id = $('#iptUserID').val();
            var apply_user = $('#ipt_apply_user').val();
            var user_dept = $('#iptUserDept').val();
            var start_time = $('#ipt_start_time').val();
            
            if (title == '') {
                alert ('标题不能为空');
                return;
            }
            var params = {
                title: title,
                start_time: start_time,
                ftype: leadertype,
                note: note,
                apply_user: apply_user,
                cstatus: 76
            };
            if (op ==1 ) {
                params.id = $('#currentId').val();
            }
            manager.setVacation(params, function (d) {
                dialog.create ('操作成功', 400, 200, {isMaskClickHide: 0, title: '操作结果', button: {
                    '确定': function() {
                        dialog.hide();
                    }
                }});
                slidepanel.hide();
                wrap.render();
            });
            return false;
        });
        
        slidewrap.find('button[cmd="del"]').unbind('click').click(function (evt) {
            var id = $(this).attr('deptid');
            dialog.create ('确定要删除改故障单么，删除后不可恢复，确定吗？', 400, 200, {isMaskClickHide: 0, title: '操作确认', button: {
                '确定': function() {
                    dialog.hide();
                    manager.delVacation({id: id}, function () {
//                        alert ('删除成功');
                        slidepanel.hide();
                        wrap.render();
                    });
                }
            }}); 
            
            return false;
        });
    }
    
    function initTable(param) {
         manager.getVacation(param, function (data) {
            cacheData = data;
            for (var i = 0; i < data.length; i++) {
                data[i].typename = util.getInfoById(sysbase, data[i].ftype)._value;
                data[i].start_time = (data[i].start_time || '').replace(/T[\s\S]*$/, '');
            }
            container.html(util.tmpl('<a class="btn" href="#" cmd="addNew">新增</a><table class="table table-condensed table-bordered table-striped" data-event="edit_vacation">    <thead>      <tr>        <th>标题</th>        <th>申请人</th>        <th>类别</th>        <th>开始时间</th>              </tr>    </thead>    <tbody>        <%for (var i = 0; i < data.length; i++) {%>      <tr>                <td><a reportid="<%=data[i].id%>" href="#"><%=data[i].title%></a></td>        <td><%=data[i].role_name%></td>        <td><%=data[i].typename%></td>        <td><%=data[i].start_time%></td>      </tr>        <%}%>    </tbody></table>', {data: cacheData}));
            init ();
        });
    }
    
    var wrap = {
        render: function () {
            container = $('#mainContainer');
            var param = {};
            currentTab = 'new_report';
            initTable({cstatus: 76});
        }
    };
    module.exports = wrap;
});
;define('app/role/role.js', function (require, exports, module) {
    var $ = require('$');
    var login = require('login');
    var event = require('event');
    var util = require('util');
    var manager = require('manager');
    var slidepanel = require('widget/slidepanel/slidepanel');
    var cacheData;
    var op = 0;
    var slidewrap;
    var menudata;
    
    event.addCommonEvent('click', {
        'edit_role': function (evt) {
            var aitem = evt.target;
            if (aitem.nodeName != 'A') {
                return false;
            }
            op = 1;
            var id = $(evt.target).attr('roleid');
            slidewrap = slidepanel.show({con:util.tmpl('<div class="drawer-wrapper" style="">    <div class="drawer-title"><i class="drawer-close"></i><span class="drawer-title-content">&nbsp;</span></div>    <input type="hidden" id="currentId" value="<%=data.id%>"/>    <%if (op == 1) {%><button cmd="del" deptid="<%=data.id%>"><i class="icon-remove"></i>删除</button><%}%>    <div class="drawer">        <ul class="dialog">                <li class="clearfix">                <label class="bind-domain-title"></label>                <span class="input-text"><input class="input" value="<%=data.name%>" type="text" id="iptName" placeholder="输入角色名称"></span>                  <div class="input_tips">输入角色名称</div>            </li>                                    <li class="clearfix">                <label class="bind-domain-title">角色权限：</label>                <div id="menuPowerList"></div>                <span class="input-text"></span>              </li>                                    <li class="clearfix">                <label class="bind-domain-title"></label>                <textarea class="input" type="text" id="iptNote" placeholder="输入角色描述"><%=data.note%></textarea>                  <div class="input_tips">输入角色描述</div>            </li>                <li class="current_status">                <a href="javascript:void 0;" cmd="save" class="btn btn-primary">确定</a>              </li>        </ul></div></div>', {data: getInfoById(id), op: op }) } ) ;
            initPowerList(id);
            clickEvt();
            return false;
        }
    });
    
    function getInfoById (id) {
        return util.getInfoById(cacheData, id);
    };
    
    function init( ) {
        container.find('a[cmd="addNew"]').click(function () {
            op = 0;
            slidewrap = slidepanel.show({con:util.tmpl('<div class="drawer-wrapper" style="">    <div class="drawer-title"><i class="drawer-close"></i><span class="drawer-title-content">&nbsp;</span></div>    <input type="hidden" id="currentId" value="<%=data.id%>"/>    <%if (op == 1) {%><button cmd="del" deptid="<%=data.id%>"><i class="icon-remove"></i>删除</button><%}%>    <div class="drawer">        <ul class="dialog">                <li class="clearfix">                <label class="bind-domain-title"></label>                <span class="input-text"><input class="input" value="<%=data.name%>" type="text" id="iptName" placeholder="输入角色名称"></span>                  <div class="input_tips">输入角色名称</div>            </li>                                    <li class="clearfix">                <label class="bind-domain-title">角色权限：</label>                <div id="menuPowerList"></div>                <span class="input-text"></span>              </li>                                    <li class="clearfix">                <label class="bind-domain-title"></label>                <textarea class="input" type="text" id="iptNote" placeholder="输入角色描述"><%=data.note%></textarea>                  <div class="input_tips">输入角色描述</div>            </li>                <li class="current_status">                <a href="javascript:void 0;" cmd="save" class="btn btn-primary">确定</a>              </li>        </ul></div></div>', {data: {id: '',name: '', note:'',power: ''}, op:op }) } ) ;
            initPowerList();
            clickEvt();
            return false;
        });    
    }

    function pickChildByModule(menumodule) {
        var menu = getMenuByModule(menumodule);
        var pid = menu.menuid;
        var ar = [];
        for (var i = 0; i < menudata.length; i++) {
            if (pid == menudata[i].menuparent) {
                ar.push(menudata[i]);
            }
        }
        return ar;
    };
    
    function getMenuByModule(menumodule) {
        var ar = [], rootid;;
        for (var i = 0; i < menudata.length; i++) {
            if (menumodule == menudata[i].menulink) {
                return $.extend(menudata[i], {parentname: getMenuById(menudata[i].menuparent).menuname || 'ROOT'});
            }
        }
        return {};
    }
    
    function getMenuById (id) {
        var ar = [], rootid;;
        for (var i = 0; i < menudata.length; i++) {
            if (id == menudata[i].menuid) {
                return $.extend(menudata[i], {parentname: getMenuById(menudata[i].menuparent).menuname || 'ROOT'});
            }
        }
        return {};
    };
    
    var pickTopMenu = function (menudata) {
        var ar = [], rootid;;
        for (var i = 0; i < menudata.length; i++) {
            if (0 == menudata[i].menuparent) {
                rootid = menudata[i].menuid;
                break;
            }
        }
        if (rootid) {
            for (var i = 0; i < menudata.length; i++) {
                if (rootid == menudata[i].menuparent) {
                    ar.push(menudata[i]);
                }
            }
        }
        return ar;
    };


    var initTreeList = (function () {
        var level = 0, root = {
            '0': {
                'menuname': 'root', 
                'menuid': 46,
                menuparent: 0, 
                items: []  
            } 
        }, mydata;

        function pick(pid) {
            var ar = [];
            for (var i = 0; i < mydata.length; ) {
                if (pid == mydata[i].menuparent) {
                    ar.push(mydata[i]);
                    mydata.splice(i, 1);
                    i--;
                }
                else {
                    i++;
                }
            }
            return ar;
        };

        function init(data) {
            var root = {};
            for (var i = 0; i < data.length; i++) {
                root[data[i].menuid] = $.extend({}, data[i]);
                var chlds = pick(data[i].menuid);
                if (chlds.length) {
                    root[data[i].menuid].items = arguments.callee(chlds);
                }
            }
            return root;
        }

        return function (data) {
            mydata = [].concat(data);
            return init(mydata);
        }
    }) ();

    function initPowerList(id) {
        var menuCon = $('#menuPowerList');
        var oridata;
        var callback = function (data) {
            var o;
            menudata = data;
            oridata = [].concat(data);
            if (id) {
                o = getInfoById(id);
            }
            if (o) {
                var pw = o.power;
                for (var i = 0; i < data.length; i++) {
                    if ((',' + pw + ',').indexOf(',' + data[i].menuid + ',') > -1) {
                        data[i].checked = 1;
                    }
                }
            }
            // 形成树形关系
            var treeList = initTreeList(data), li = [], l = 0;
            function genHtml(d, lev) {
                for (var i in d) {
                    li.push('<li style="list-style:none;float:none;margin:0 0 0 ' + (lev * 20)+ 'px;"><label><input value="' + d[i].menuid + '" type="checkbox" ' + (d[i].checked ? 'checked': '') + ' />' + d[i].menuname + '</label>');    
                    if (d[i].items) {
                        genHtml(d[i].items, lev + 1);
                    }
                }
            }
            genHtml(treeList, l);
            menuCon.html('<ul class="role_power_ul">' + li.join('') + '</ul>');
            // menudata = oridata;
            var chkbox = slidewrap.find('.role_power_ul :checkbox');
            chkbox.unbind('click').change (function () {
                var chk = $(this);
                var chld = pickChildById(chk.val());
                for (var i = 0; i < chld.length; i++) {
                    chkbox.each(function (j, n) {
                        if (n.value == chld[i].menuid) {
                            n.checked = chk[0].checked;
                            $(n).change();
                        } 
                    });
                }
            });
        };
        // if (menudata) {
        //     return callback(menudata);
        // }
        manager.getMenu({all: 'all'}, callback);
    }
    
    function getMenuById (id) {
        var ar = [], rootid;;
        for (var i = 0; i < menudata.length; i++) {
            if (id == menudata[i].menuid) {
                return $.extend(menudata[i], {parentname: getMenuById(menudata[i].menuparent).menuname || 'ROOT'});
            }
        }
        return {};
    };
    
    function pickChildById(pid) {
        var ar = [];
        for (var i = 0; i < menudata.length; i++) {
            if (pid == menudata[i].menuparent) {
                ar.push(menudata[i]);
            }
        }
        return ar;
    };
    
    function clickEvt () {
        slidewrap.find('a[cmd="save"]').unbind('click').click(function () {
            var menuCon = $('#menuPowerList'), checklist = [];
            menuCon.find('input[type="checkbox"]').each(function (i, n) {
                if (n.checked) {
                    checklist.push(n.value);
                } 
            });
            $('#iptPower').val(checklist.join(','));
            var name = $('#iptName').val();
            var power = checklist.join(',');
            var note = $('#iptNote').val();
            if (name == '') {
                alert ('请输入正确的名称');
                return;
            }
//            if (menuLink == '') {
//                alert ('请输入正确的菜单地址');
//                return;
//            }
            manager.setRole($.extend({
                name: name,
                power: power,
                note: note
            }, op == 1 ? {id: $('#currentId').val()}: {}), function (d) {
                slidepanel.hide();
                role.render();
            });
        });
        
        slidewrap.find('button[cmd="del"]').unbind('click').click(function (evt) {
            var id = $(this).attr('deptid');
            manager.delRole({id: id}, function () {
                slidepanel.hide();
                role.render();
            });
            return false;
        });
    }
    
    function getMenuNames(menus) {
        var menulist = menus.split(','), ar = [];
        for (var i = 0; i < menulist.length; i++) {
            var o = getMenuById(menulist[i]);
            ar.push(o.menuname);
        }
        return ar.join(',');
    }
    
    var role = {
        render: function (wrap) {
            var param = {};
            manager.getRole(param, function (data) {
                manager.getMenu({all: 'all'}, function (mdata) {
                    menudata = mdata;
                    for (var i = 0; i < data.length; i++) {
                        data[i].power_names = getMenuNames(data[i].power);
                    }
                    cacheData = data;
                    container = $('#mainContainer');
                    container.html(util.tmpl('<a class="btn" href="#" cmd="addNew">新增</a><table class="table table-condensed table-bordered table-striped" data-event="edit_role">    <thead>      <tr>        <th>角色名称</th>        <th>拥有菜单</th>        <th>描述</th>      </tr>    </thead>    <tbody>        <%for (var i = 0; i < data.length; i++) {%>      <tr>        <td><a roleid="<%=data[i].id%>" href="#"><%=data[i].name%></a></td>        <td style="width:60%;"><%=data[i].power_names%> </td>        <td><%=data[i].note%></td>      </tr>        <%}%>    </tbody></table>', {data: cacheData}));
                    init ();
                });
                
            });
        },
        
        getData: function (callback) {
            manager.getRole(param, function (data) {
                callback(data);
            });
        }
    };
    module.exports = role;
    
});
define('app/startup/common/common', function (require, exports, module) {
    var $ = require('$');
    var login = require('login');
    var event = require('event');
    var util = require('util');
    var manager = require('manager');
    var menu = require('app/menu/menu.js');
    var cacheData;
    var op = 0;
    var type;
    var mod;
    var target;
    var slidewrap;
    var container;
    var wrap;
    var menuinited;
    
    var name_map = {
        '1': '硬件故障紧急程度',
        '2': '硬件故障单状态',
        '3': '故障类型',
        '4': '业务知识库类别',
        '5': '岗位',
        '6': '个人工作任务类别',
        '7': '值班休假类别'
    };
    function init() {
        addEvents();
    }
    
    function addEvents() {
        container.find('a[cmd="addNew"]').click(function () {
            op = 0;
            container.find('div[cmd="new_con"]').toggleClass('hide');
            return false;
        }); 
        
        var saveBtn = container.find('button[cmd="save"]');
        var delBtn = container.find('button[cmd="del_row"]');
        saveBtn.click(function () {
            this.disabled = true;
            var btn = this;
            $(this).html('...').addClass('disabled');
            manager.setKeyValue({
                _key:'',
                _value: container.find('input[cmd="value"]').val(),
                type: type,
                typename : name_map[type] || '未知类别'
            }, function (data) {
                $(btn).html('确定').removeClass('disabled');
                btn.disabled = false;
                container.find('div[cmd="new_con"]').addClass('hide');
                wrap.render(mod, target, type);
            });
            return false; 
        });
        delBtn.click (function () {
            this.disabled = true;
            var btn = this;
            $(this).html('...').addClass('disabled');
            manager.delKeyValue({
                id: this.getAttribute('keyid')
            }, function (data) {
                $(btn).html('确定').removeClass('disabled');
                btn.disabled = false;
                container.find('div[cmd="new_con"]').addClass('hide');
                wrap.render(mod, target, type);
            });
            return false; 
        });
        container.find('.name_relative').mouseover(function ( ) {
            $(this).find('.edit_panel').removeClass('hide');
        })
        .mouseout(function ( ) {
            $(this).find('.edit_panel').addClass('hide');
        });
        container.find('.name_relative button[cmd="save_row"]').click(function () {
            this.disabled = true;
            var btn = this;
            $(this).html('...').addClass('disabled');
            var id = this.getAttribute('keyid');
            var _value = container.find('input[cmd="value_' + id + '"]').val(); 
            manager.setKeyValue({
                _key:'',
                _value: _value,
                type: type,
                typename : name_map[type] || '未知类别',
                id: id
            }, function (data) {
                container.find('span[cmd="txt_' + id + '"]').html(_value);
                $(btn).html('确定').removeClass('disabled');
                btn.disabled = false;
                $(btn).parent().addClass('hide');
            });
            return false; 
        });
    }
    var timeout;
    wrap = {
        render: function (id, _target, _type) {
            mod = id;
            target = _target;
            if (id == 'keyvalue' && _type) {
                type = _type;
                (!menuinited || !id) && (menu.render(target), menuinited = 1);
//                return;
                clearTimeout(timeout);
                timeout = setTimeout(function () {
                    if (!menuinited) {
                        var obj = require('app/' + id + '/' + id);
                        if (!obj) {
                            obj = require('app/' + target + '/' + id + '/' + id);
                        }
                        obj && obj.render(target, id);
                    }
                        
                        
                    container = $('#mainContainer');
                    var param = {type : type};
                    manager.getKeyValue(param, function (data) {
                        cacheData = data;
                        container.html(util.tmpl('<div><span class="label label-info"><%=typename%></span></div><a class="btn" href="#" cmd="addNew">新增</a><div cmd="new_con" class="hide new_con">    <form class="form-inline">      <input type="text" class="" cmd="value" placeholder="输入名称">      <button cmd="save" type="submit" class="btn btn-primary">保存</button></form></div><table class="table table-condensed table-bordered table-striped" data-event="key_value_list">    <thead>      <tr>        <th>id</th>        <th>值</th>      </tr>    </thead>    <tbody>        <%for (var i = 0; i < data.length; i++) {%>      <tr>        <td><%=data[i].id%></td>        <td><div class="name_relative">            <span class="text" cmd="txt_<%=data[i].id%>"><%=data[i]._value%></span>            <div class="form-inline edit_panel hide">                <input type="text" value="<%=data[i]._value%>" cmd="value_<%=data[i].id%>" placeholder="输入名称">                <button cmd="save_row" keyid="<%=data[i].id%>" type="submit" class="btn btn-primary">保存</button>                <button cmd="del_row" keyid="<%=data[i].id%>" type="submit" class="btn btn-danger">删除</button>            </div>        </div></td>      </tr>        <%}%>    </tbody></table>', {data: cacheData, typename: name_map[type]}));
                        init ();
                    });
                }, 400);
            }
        },
        
        getDataList: function (type, callback) {
            if (typeof callback == 'function') {
                if (cacheData) {
                    callback(cacheData);
                }
                else {
                    manager.getKeyValue({type : type}, function (data) {
                        cacheData = data;
                        callback(cacheData);
                    });
                }
            }
        }
    };
    module.exports = wrap;
});
define('app/startup/duty/duty', function (require, exports, module) {
    var $ = require('$');
    var menu = require('app/menu/menu.js');
    var menuinited;
    module.exports = {
        render: function (id) {
//            (!menuinited || !id) && (menu.render('duty'), menuinited = 1);
//            if ('undefined' == typeof id) {
//                return 
//            }
            
            obj = require('app/duty/' + id + '/' + id);
            obj && obj.render('duty', id);
        },
        
        onRender: function () {
            setTimeout(function () {
                $('#topmenu li:eq(3)').addClass('active current');
            }, 1000);
        }
    }
});
define('app/startup/myinfo/myinfo', function (require, exports, module) {
    var $ = require('$');
    var util = require('util');
    var event = require('event');
    var manager = require('manager');
    var dialog = require('dialog');
    module.exports = {
        render: function (id) {
            var container = $('#mainContainer');
            manager.getUser({id: g_User.id}, function (data) {
                fn(data);
            });
            function fn(data) {
                container.html(util.tmpl('<div class="drawer-wrapper" style="">    <div class="drawer-title"><i class="drawer-close"></i><span class="drawer-title-content">&nbsp;</span></div>    <input type="hidden" id="currentId" value="<%=data.id%>"/>    <div class="form-horizontal">        <ul class="dialog">          <li class="current_status">                <h4>基本信息</h4>              </li>            <li class="clearfix">                <div class="control-group">                    <label class="control-label">用户工号</label>                    <div class="controls"><input class="input" value="<%=data.user_id%>" readonly disabled type="text" id="iptUserID" placeholder="用户工号"></div>                      <div class="input_tips"></div>                </div>            </li>                             <li class="clearfix">                <div class="control-group">                    <label class="control-label">用户中文名</label>                    <div class="controls"><input class="input" value="<%=data.cnname%>" readonly disabled type="text" id="iptCnName" placeholder="用户中文名"></div>                      <div class="input_tips"></div>                </div>            </li>                        <li class="clearfix">                <div class="control-group">                    <label class="control-label">联系电话</label>                    <div class="controls"><input class="input" value="<%=data.telno%>" type="text" id="iptTelno" placeholder="联系电话"></div>                      <div class="input_tips"></div>                </div>            </li>            <li class="clearfix">                <div class="control-group">                    <label class="control-label">qq号</label>                    <div class="controls"><input class="input" value="<%=data.qq%>" type="text" id="iptqq" placeholder="qq号"></div>                      <div class="input_tips"></div>                </div>            </li>                          <li class="current_status">                  <div class="control-group">                    <label class="control-label"></label>                      <div class="controls">                        <a href="javascript:void 0;" cmd="save_user_base" class="btn btn-primary">确定</a>                    </div>                </div>              </li>                        <li class="current_status">                  <hr/>                <h4>修改密码</h4>              </li>                        <li class="clearfix">                <div class="control-group">                    <label class="control-label">原有密码</label>                    <div class="controls"><input class="input" type="text" id="iptOldPwd" placeholder="输入原有密码"></div>                      <div class="input_tips"></div>                </div>            </li>                        <li class="clearfix">                <div class="control-group">                    <label class="control-label">密码</label>                    <div class="controls"><input class="input" type="text" id="iptPwd1" placeholder="输入新密码"></div>                      <div class="input_tips"></div>                </div>            </li>            <li class="clearfix">                <div class="control-group">                    <label class="control-label">确认密码</label>                    <div class="controls"><input class="input" type="text" id="iptPwd2" placeholder="再次输入新密码"></div>                      <div class="input_tips"></div>                </div>            </li>            <li class="clearfix">                <div class="alert hide" cmd="alert_tip">                </div>            </li>              <li class="current_status">                  <div class="control-group">                    <label class="control-label"></label>                      <div class="controls">                        <a href="javascript:void 0;" cmd="change_pwd" class="btn btn-primary">确定</a>                    </div>                </div>              </li>        </ul></div></div>', {data:data[0]}));
                container.find('*[cmd="save_user_base"]').click(function () {
                    var tel = $('#iptTelno').val();
                    var qq = $('#iptqq').val();
                    manager.setUser({
                        id: g_User.id,
                        telno: tel,
                        qq: qq
                    }, function () {
                        dialog.miniTip('修改信息成功');
                    });
                });
                
                container.find('*[cmd="change_pwd"]').click(function () {
                    var oldpwd = $('#iptOldPwd').val();
                    var pwd = $('#iptPwd1').val();
                    var pwd2 = $('#iptPwd2').val();
                    if (pwd.length < 6) {
                        container.find('.alert[cmd="alert_tip"]').removeClass('hide').html('密码长度不能少于6位');
                        return;
                    }
                    if (pwd != pwd2) {
                        container.find('.alert[cmd="alert_tip"]').removeClass('hide').html('两次密码不一致');
                        return;
                    }
                    container.find('.alert[cmd="alert_tip"]').addClass('hide');
                    manager.setUser({
                        id: g_User.id,
                        pwd: pwd,
                        oldpwd: oldpwd
                    }, function (data) {
                        if (data.affectedRows == 0) {
                            dialog.miniTip('旧密码输入错误，不能完成修改。');
                            return;
                        }
                        dialog.miniTip('修改密码成功');
                    });
                });
            }
        }
    }
});

define('app/startup/person/person', function (require, exports, module) {
    var $ = require('$');
    var util = require('util');
    var router = require('router');
    var manager = require('manager');
    var menu = require('app/menu/menu.js');
    var menuinited;
    module.exports = {
        render: function (id) {
//            (!menuinited || !id) && (menu.render('person'), menuinited = 1);
//            if ('undefined' == typeof id) {
//                return 
//            }
            var obj = require('app/' + id + '/' + id);
            if (!obj) {
                obj = require('app/person/' + id + '/' + id);
            }
            obj && obj.render('person', id);
        }
    }
});
define('app/startup/startup', function(require, exports, module) {
    var login = require('login');
    var event = require('event');
    var $ = require('$');
    var util = require('util');
    var app_util = require('main/app_util');
    var menu = require('app/menu/menu');
    event.addCommonEvent('click', {
        'logout': function () {
            util.cookie.del('user');
            util.cookie.del('csrf_code');
            util.cookie.del('sign');
            util.cookie.del('role_id');
            util.cookie.del('role_name');
            location.href = '/login';
            return false;
        }
    });

    $('body').mouseover(function (evt) {
        var fn = function (e) {
            if (e.nodeName == 'TD') {
                e.title = $(e).text();
                return e;
            }
            if (e.nodeName == 'BODY') {
                return;
            }
            fn(e.parentNode);
        }
        fn (evt.target);
    });
    
    var resizefn = function () {
        var w = $(window).width() - 200 - 80;
        $('#mainContainer').width(w);
    };
    $(window).resize(resizefn);
//    pagemanage.loadRoot('startup');
    
    module.exports = {
        render: function () {
            if (!login.isLogin()) {
                login.toLogin('/');
                return;
            }
            app_util.getLoginInfo(function (data, roledata) {
                var rolename;
                $.each(roledata, function (i, n) {
                    if (n.id == util.cookie.get('role_id')) {
                        rolename = n.name;
                        return false;
                    }
                });
                g_User.role_id = util.cookie.get('role_id');
                g_User.role_name = rolename;
                $('#login_user').html('<a href="/startup/myinfo" class="navbar-link" title="点击修改个人信息">' + data[0].cnname + '</a>' + '[' + data[0].deptname + ']' + [roledata.length > 1 ?'<a href="/selrole">':'', rolename, roledata.length > 1 ? '</a>' : ''].join(''));
            });
            
            
//            $('#topmenu li').removeClass('active current');
        }
    }
});
define('app/startup/sysmanager/sysmanager', function (require, exports, module) {
    var $ = require('$');
    var util = require('util');
    var router = require('router');
    var manager = require('manager');
    var menu = require('app/menu/menu.js');
    var menuinited;
    module.exports = {
        render: function (id) {
//            (!menuinited || !id) && (menu.render('sysmanager'), menuinited = 1);
//            if ('undefined' == typeof id) {
//                return 
//            }
            var obj = require('app/' + id + '/' + id);
            if (!obj) {
                obj = require('app/sysmanager/' + id + '/' + id);
            }
            obj && obj.render('sysmanager', id);
        }
    }
});
define('app/startup/userservice/userservice', function (require, exports, module) {
    var $ = require('$');
    var util = require('util');
    var router = require('router');
    var manager = require('manager');
    var menu = require('app/menu/menu.js');
    var menuinited;
    module.exports = {
        render: function (id) {
//            (!menuinited || !id) && (menu.render('userservice'), menuinited = 1);
//            if ('undefined' == typeof id) {
//                return 
//            }
            var obj = require('app/userservice/' + id + '/' + id);
            obj && obj.render('userservice', id);
        }
    }
});
;define('app/sysmanager/importuser/importuser.js', function (require, exports, module) {
    var $ = require('$');
    var login = require('login');
    var event = require('event');
    var util = require('util');
    var manager = require('manager');
    var dialog = require('dialog');
    var slidepanel = require('widget/slidepanel/slidepanel');
    var cacheData;
    var op = 0;
    var slidewrap;
    var pinyin = require('hotoo/pinyin/2.1.2/pinyin-debug');
//    alert (pinyin("重点", {
//          style: pinyin.STYLE_INITIALS ,
//        }));
    function initEvent() {
        container.find('button[cmd="importUser"]').click(function () {
            var txt = $('#userRows').val();
            if (!txt) {
                dialog.create ('输入内容', 400, 200, {isMaskClickHide: 0, title: '操作结果', button: {
                    '确定': function() {
                        dialog.hide();
                    }
                }});
                return;
            }
            var rst = [];
            var ar = txt.split('\n');
            var job = {};
            
//            manager.setUser($.extend({
//                user_id: name,
//                cnname: cnname,
//                role_id: role_id,
//                dept_id: dept_id
////                note: note
//            }, op == 1 ? {id: $('#currentId').val()}: {}), function (d) {
//                slidepanel.hide();
//                user.render();
//            });
//          
            manager.getKeyValue({type: 5}, function (jobdata) {
                manager.getDept({}, function (deptdata) {
                    function matchjob (name) {
                        if (name == '男' || name == '女' || !name) {
                            return 73;
                        }
                        for (var i = 0; i < jobdata.length; i++) {
                            if (jobdata[i]._value == name) {
                                return jobdata[i].id;
                            }
                        }
                    }
                    function matchdept(name) {
                        name = name.split('/');
                        name = name[1] || name[0];
                        for (var i = 0; i < deptdata.length; i++) {
                            if (deptdata[i].name == name) {
                                return deptdata[i].id;
                            }
                        }
                    }
                    for (var i = 0; i < ar.length; i++) {
                        
                        var gender = ar[i].indexOf('男') > -1 ? 1 : 0;
                        
                        ar[i] = ar[i].replace(/\t?[男女]/g, '');
                        var r = ar[i].split(/\s/);
                        var jobname = r.pop();
                        rst.push({
                            user_id: r[2],
                            cnname: r[0],
                            gender: gender,
                            telno: r[r.length - 1] || '',    
                            dept_id: matchdept(r[1]),
                            jobs: matchjob(jobname)
                            
                        });
                    }
                    
                    
                    
                    
                    (function () {
                        if (rst.length == 0) {
                            return;
                        }
                        var row = rst.shift();
                        var fn = arguments.callee;
                        manager.setUser({
                            user_id: row.user_id,
                            cnname: row.cnname,
                            role_id: 52,
                            dept_id: row.dept_id,
                            jobs: row.jobs,
                            telno: row.telno
            //                note: note
                        }, function (d) {
                            fn();
                        });
                    }) ();
                            
                            
                });
            });
            
            
            
            
            
            console.log(job);
        });
        
        container.find('button[cmd="importDept"]').click(function () {
            var txt = $('#deptRows').val();
            if (!txt) {
                dialog.create ('输入内容', 400, 200, {isMaskClickHide: 0, title: '操作结果', button: {
                    '确定': function() {
                        dialog.hide();
                    }
                }});
                return;
            }
            var rst = [];
            var ar = txt.split('\n');
            for (var i = 0; i < ar.length; i++) {
                var r = ar[i].split(/\t/);
                rst.push({
                    name: r[0].replace(/^\s+/, ''), 
                    parent: 53, 
                    tel1: r[4] || '',
                    tel2: r[5] || '',
                    fax: r[6] || '',
                    code: pinyin(r[0].replace (/^\s+/, ''), {style: pinyin.STYLE_FIRST_LETTER }).join('').toUpperCase()
                });
            }
            var i = 0;
            (function () {
                if (rst.length == 0) {
                    return;
                }
                var row = rst.shift();
                var fn = arguments.callee;
                manager.setDept({
                    name: row.name,
                    codes: row.code,
                    parent: row.parent,
                    tel1:row.tel1,
                    tel2:row.tel2,
                    fax:row.fax,
                    ext: ''
                }, function (data) {
                    $('#iptdepttips').html('导入' + i + '条！');
                    fn();
                });
            }) ();
        });
    }
    
    var wrap = {
        render: function () {
            container = $('#mainContainer');
            container.html('<h2>导入用户信息</h2><p>输入导入内容：</p><textarea style="width:100%" rows="8" id="userRows" placeholder="姓名\\t科室名称\\t登录帐号\\t移动电话\\t性别\\t人员岗位"></textarea><button cmd="importUser" class="btn">导入</button><div id="iptusertips"></div><h2>导入部门信息</h2><p>输入导入内容：</p><textarea style="width:100%" rows="8" id="deptRows" placeholder="科室名称\\t所属机构\\t分管领导\\t负责人\\t办公电话1\\t办公电话2\\t传真\\t科室代码"></textarea><div id="iptdepttips"></div><button cmd="importDept" class="btn">导入</button>');
            initEvent();
        }
    };
    module.exports = wrap;
});
define("hotoo/pinyin/2.1.2/pinyin-debug", [ "./pinyin-dict-combo-debug" ], function(require, exports, module) {
    // 拼音词库。
    // 加载压缩合并的数据(118KB)。
    var dict_combo = require("./pinyin-dict-combo-debug");
    function buildPinyinCache(dict_combo) {
        var hans;
        var uncomboed = {};
        for (var py in dict_combo) {
            hans = dict_combo[py];
            for (var i = 0, han, l = hans.length; i < l; i++) {
                han = hans.charAt(i);
                if (!uncomboed.hasOwnProperty(han)) {
                    uncomboed[han] = py;
                } else {
                    uncomboed[han] += "," + py;
                }
            }
        }
        return uncomboed;
    }
    var DICT = buildPinyinCache(dict_combo);
    dict_combo = null;
    delete dict_combo;
    // 加载未压缩的数据(334KB)。
    //var DICT = require("./pinyin-dict");
    // 声母表。
    var INITIALS = "zh,ch,sh,b,p,m,f,d,t,n,l,g,k,h,j,q,x,r,z,c,s,yu,y,w".split(",");
    // 韵母表。
    var FINALS = "ang,eng,ing,ong,an,en,in,un,er,ai,ei,ui,ao,ou,iu,ie,ve,a,o,e,i,u,v".split(",");
    var PINYIN_STYLE = {
        NORMAL: 0,
        // 普通风格，不带音标。
        TONE: 1,
        // 标准风格，音标在韵母的第一个字母上。
        TONE2: 2,
        // 声调中拼音之后，使用数字 1~4 标识。
        INITIALS: 3,
        // 仅需要声母部分。
        FIRST_LETTER: 4
    };
    // 带音标字符。
    var PHONETIC_SYMBOL = {
        "ā": "a1",
        "á": "a2",
        "ǎ": "a3",
        "à": "a4",
        "ē": "e1",
        "é": "e2",
        "ě": "e3",
        "è": "e4",
        "ō": "o1",
        "ó": "o2",
        "ǒ": "o3",
        "ò": "o4",
        "ī": "i1",
        "í": "i2",
        "ǐ": "i3",
        "ì": "i4",
        "ū": "u1",
        "ú": "u2",
        "ǔ": "u3",
        "ù": "u4",
        "ü": "v0",
        "ǘ": "v2",
        "ǚ": "v3",
        "ǜ": "v4",
        "ń": "n2",
        "ň": "n3",
        "": "m2"
    };
    var re_phonetic_symbol_source = "";
    for (var k in PHONETIC_SYMBOL) {
        re_phonetic_symbol_source += k;
    }
    var RE_PHONETIC_SYMBOL = new RegExp("([" + re_phonetic_symbol_source + "])", "g");
    var RE_TONE2 = /([aeoiuvnm])([0-4])$/;
    var DEFAULT_OPTIONS = {
        style: PINYIN_STYLE.TONE,
        // 风格
        heteronym: false
    };
    function extend(origin, more) {
        if (!more) {
            return origin;
        }
        var obj = {};
        for (var k in origin) {
            if (more.hasOwnProperty(k)) {
                obj[k] = more[k];
            } else {
                obj[k] = origin[k];
            }
        }
        return obj;
    }
    /**
   * 修改拼音词库表中的格式。
   * @param {String} pinyin, 单个拼音。
   * @param {PINYIN_STYLE} style, 拼音风格。
   * @return {String}
   */
    function toFixed(pinyin, style) {
        var tone = "";
        // 声调。
        switch (style) {
          case PINYIN_STYLE.INITIALS:
            return initials(pinyin);

          case PINYIN_STYLE.FIRST_LETTER:
            var first_letter = pinyin.charAt(0);
            if (PHONETIC_SYMBOL.hasOwnProperty(first_letter)) {
                first_letter = PHONETIC_SYMBOL[first_letter].charAt(0);
            }
            return first_letter;

          case PINYIN_STYLE.NORMAL:
            return pinyin.replace(RE_PHONETIC_SYMBOL, function($0, $1_phonetic) {
                return PHONETIC_SYMBOL[$1_phonetic].replace(RE_TONE2, "$1");
            });

          case PINYIN_STYLE.TONE2:
            var py = pinyin.replace(RE_PHONETIC_SYMBOL, function($0, $1) {
                // 声调数值。
                tone = PHONETIC_SYMBOL[$1].replace(RE_TONE2, "$2");
                return PHONETIC_SYMBOL[$1].replace(RE_TONE2, "$1");
            });
            return py + tone;

          case PINYIN_STYLE.TONE:
          default:
            return pinyin;
        }
    }
    /**
   * 单字拼音转换。
   * @param {String} han, 单个汉字
   * @return {Array} 返回拼音列表，多音字会有多个拼音项。
   */
    function single_pinyin(han, options) {
        if ("string" !== typeof han) {
            return [];
        }
        options = extend(DEFAULT_OPTIONS, options);
        var pys = DICT[han].split(",");
        if (!options.heteronym) {
            return [ toFixed(pys[0], options.style) ];
        }
        // 临时存储已存在的拼音，避免重复。
        var py_cached = {};
        var pinyins = [];
        for (var i = 0, py, l = pys.length; i < l; i++) {
            py = toFixed(pys[i], options.style);
            if (py_cached.hasOwnProperty(py)) {
                continue;
            }
            py_cached[py] = py;
            pinyins.push(py);
        }
        return pinyins;
    }
    /**
   * @param {String} hans 要转为拼音的目标字符串（汉字）。
   * @param {Object} options, 可选，用于指定拼音风格，是否启用多音字。
   * @return {Array} 返回的拼音列表。
   */
    function pinyin(hans, options) {
        if ("string" !== typeof hans) {
            return [];
        }
        options = extend(DEFAULT_OPTIONS, options);
        var py = [];
        for (var i = 0, han, nonhans = "", l = hans.length; i < l; i++) {
            han = hans[i];
            if (DICT.hasOwnProperty(han)) {
                if (nonhans.length > 0) {
                    py.push([ nonhans ]);
                }
                py.push(single_pinyin(han, options));
                nonhans = "";
            } else {
                nonhans += han;
            }
        }
        if (nonhans.length > 0) {
            py.push([ nonhans ]);
        }
        return py;
    }
    /**
   * 声母(Initials)、韵母(Finals)。
   * @param {String/Number/RegExp/Date/Function/Array/Object}
   * @return {String/Number/RegExp/Date/Function/Array/Object}
   */
    function initials(pinyin) {
        for (var i = 0, l = INITIALS.length; i < l; i++) {
            if (pinyin.indexOf(INITIALS[i]) === 0) {
                return INITIALS[i];
            }
        }
        return "";
    }
    module.exports = pinyin;
    module.exports.STYLE_NORMAL = PINYIN_STYLE.NORMAL;
    module.exports.STYLE_TONE = PINYIN_STYLE.TONE;
    module.exports.STYLE_TONE2 = PINYIN_STYLE.TONE2;
    module.exports.STYLE_INITIALS = PINYIN_STYLE.INITIALS;
    module.exports.STYLE_FIRST_LETTER = PINYIN_STYLE.FIRST_LETTER;
});

define("hotoo/pinyin/2.1.2/pinyin-dict-combo-debug", [], {
    "yā,ā": "吖",
    "ā,ē": "阿",
    "hē,a,kē": "呵",
    "shà,á": "嗄",
    "ā,á,ǎ,à,a": "啊",
    "ā,yān": "腌",
    "ā": "锕錒",
    "ǎi": "矮蔼霭毐昹譪藹躷靄",
    "ài": "爱碍艾嫒瑷隘暧砹僾伌壒塧嬡懓愛曖璦硋皧瞹礙薆譺賹鑀靉馤餲鱫鴱",
    "āi,ái": "挨",
    "āi": "哎埃哀锿溾鎄銰",
    "ái": "癌捱皑凒嘊啀溰皚",
    "āi,ài": "唉",
    "dāi": "呆呔懛獃",
    "yì,ài": "嗌",
    "ǎi,ài,āi": "嗳噯",
    "yì": "乂醷硛呹轶邑饐阣屹幆褹鮨篒绎繹肄义義蜴浥鄓亿易亦益翼译异谊翌抑艺役逸疫臆裔毅忆意议诣溢怿癔镒熠驿翊峄懿劓殪瘗羿弈佾刈缢悒弋翳埸奕挹薏亄呓伇镱伿俋兿劮億勚勩匇呭唈圛坄囈垼嬑嫕寱帟帠嶧廙怈憶懌敡晹曀曎杙枍棭槸榏檍歝殔殹浂湙浳潩澺炈瀷焲熤燚熼燡燱獈玴痬異瘱瘞瞖穓竩繶耴縊肊膉艗芅苅萟蓺藙蘙虉藝螠衪袣裛襼訲訳詍詣誼讛譯豙議豛豷貖贀跇釴鈠鐿隿霬鎰駅骮驛鶂鶍鶃鷊鷁鷧鷾鸃鹝黓鹢齸",
    "nǎi": "乃嬭奶氖艿倷廼疓迺釢",
    "nǐ,yì": "儗",
    "kǎi": "剴剀鍇锴凯慨垲铠恺蒈凱塏愷暟輆鎧闓闿颽",
    "ài,yǐ": "叆",
    "è": "呃呝阸阨頞饿扼遏厄鄂谔垩锷萼阏苊轭鳄颚腭愕鹗噩偔匎卾咢堮堊岋崿廅悪搹搤擜戹歞櫮湂琧歺砈砐硆蕚蚅蝁覨諤讍豟軶軛遌遻鑩鍔顎餓餩鰐鰪鱷齃鶚齶鈪",
    "yī": "噫乊揖渏黳吚一衣依医伊壹铱漪咿黟壱夁嫛嬄弌撎檹毉洢瑿畩稦祎禕繄蛜衤譩辷郼醫銥鷖鹥",
    "è,ài,yè": "堨",
    "qí,jī": "奇其丌",
    "xī,āi": "娭",
    "ǎi,ái,è": "娾",
    "kǎi,ái": "嵦",
    "ài,yì,nǐ": "懝",
    "ái,zhú": "敱敳",
    "kài,ài": "欬",
    "èi,ǎi": "欸",
    "ǎi,kài,kè": "濭",
    "huí,huǐ": "烠",
    "wò,ài": "焥",
    "wèi,ái,gài": "磑",
    "gǎi,ǎi": "絠",
    "xǐ,shāi,āi": "諰",
    "hé": "閡阂盒釛毼曷菏詥魺頜河荷禾涸劾盍翮阖啝姀峆敆柇楁渮澕熆皬盇盉篕籺粭萂覈訸郃鉌闔鞨鑉餄饸鹖麧齕龁龢",
    "qí,gāi,ái": "隑",
    "sì": "騃鈶洠佀寺四肆饲嗣巳耜驷兕汜泗姒笥祀亖価儩娰孠柶榹涘瀃牭禩泤竢洍肂蕼覗貄鈻釲飤飼駟",
    "jiù": "鯦咎就旧救舅厩臼疚僦柩桕倃鹫匓匛匶廏廐廄慦捄柾殧舊麔鷲欍齨",
    "yá": "崖岈牙芽涯衙蚜琊睚伢厓堐崕漄玡笌齖",
    "ān": "安鞍氨庵谙鹌侒桉媕峖盫盦腤菴萻蓭誝諳葊鞌韽馣鮟鶕鵪偣",
    "àn": "按岸暗案胺黯堓荌豻貋錌闇隌屵",
    "ǎn": "俺揞铵埯垵唵罯銨",
    "chǎng,ān,hàn": "厂",
    "guǎng,ān": "广",
    "hān,àn": "犴",
    "án,àn": "儑",
    "kē,qià": "匼",
    "hàn,àn": "厈屽",
    "è,àn": "咹",
    "ān,án": "啽",
    "hàn": "垾憾扞捍釬汉旱焊翰撼撖悍菡瀚傼颔暵晘涆漢猂皔睅莟蔊蛿蜭螒譀銲鋎雗顄頷駻鶾輚",
    "nüè": "婩硸虐",
    "àn,ǎn,yǎn": "晻",
    "àn,yàn,è": "洝",
    "án,gān": "玵",
    "gān,gàn": "干",
    "ān,yè,è": "痷",
    "zhēn": "碪浈箴甄葴鍼蓁真针臻砧斟珍侦祯贞榛胗桢偵寊帪搸樼殝潧澵獉珎瑧楨湞眞禛蒖薽禎轃貞酙遉錱鉁針鱵帧幀",
    "yǎn,ān": "裺",
    "qián": "鉗钳乹亁鈐钤偂前葥銭錢钱黚仱潜黔箝掮虔墘媊岒拑歬榩橬濳灊潛軡鎆騚騝鰬",
    "yīn": "隂陰阴氤洇齗因音茵堙姻喑铟侌凐噾囙垔婣愔慇栶溵濦瘖禋秵筃絪緸蒑裀蔭諲陻銦闉阥霒霠鞇韾駰骃",
    "án": "雸",
    "yǎn": "遃顩黬萒弇沇眼演掩衍厣琰魇兖罨偃俨郾鼹乵儼兗噞厴孍嵃巚愝巘戭扊抁曮揜椼檿渷甗蝘褗躽酓隒鰋魘鶠黡黤黭黶齴鼴龑",
    "hān": "頇顸酣憨蚶鼾哻谽馠魽",
    "yàn": "鴳敥彦烻厌厭宴堰验艳雁砚唁焰谚滟焱赝餍谳晏酽偐喭嚥墕妟姲嬊嬿彥暥曕灎灔灩焔灧熖燄牪猒硯艶艷覎觾觃讌讞諺豔豓贋贗軅酀醼釅騐饜験騴驠鬳驗鳫鴈鷃鷰齞曣嚈",
    "áng": "昂岇昻",
    "āng": "肮骯",
    "àng": "盎枊醠",
    "yǎng,áng": "仰卬",
    "yān": "醃懨淊焑烟淹阉焉菸恹胭鄢崦嫣剦嶖懕樮漹煙珚篶臙閹黫",
    "āo,wā": "凹",
    "ǎo": "袄媪媼芺襖镺艹",
    "ào": "傲澳懊坳鏊岙垇墺奡岰嫯嶴擙驁",
    "ào,yù": "奥奧澚隩",
    "áo": "翱敖骜廒嗷遨聱螯獒鳌厫鏖嗸滶獓璈翶翺蔜謷謸隞鼇鰲鷔",
    "xiāo": "嚣嚻囂硝踃櫹蛸綃绡颵翛揱萧销消宵霄魈骁枵哓逍潇侾枭箫婋宯嘵彇庨歊毊梟灱灲烋焇瀟猇獢痚痟硣窙簘膮虈簫虓蕭蟂蟏蟰蠨髐髇驍鴞銷鴵鷍鸮",
    "āo,áo": "熬",
    "ǎo,ào,niù": "拗抝",
    "ō": "噢",
    "qiāo,áo": "墽",
    "áo,ào": "嶅",
    "ào,áo": "慠",
    "bā,ào": "扷",
    "áo,qiáo": "摮",
    "āo,ào": "柪軪",
    "āo,yòu": "梎",
    "yōu,yòu,āo": "泑",
    "jiāo": "浇澆虠膠交焦胶娇骄郊蕉礁椒僬蛟跤茭鹪鲛峧嶕嶣嬌憍穚簥膲茮蟭轇驕鐎鮫鵁鷮鷦",
    "gùn,hùn": "棍",
    "lù,āo": "熝",
    "āo": "爊",
    "yǎo,āo,ǎo": "眑",
    "áo,qiāo": "磝",
    "hé,qiāo,qiào": "礉",
    "qiāo": "磽鐰勪蹻繑敲锹跷硗劁墝帩橇幧毃燆趬踍蹺郻鄡鄥頝鍫鍬",
    "yūn": "蝹贇赟氲奫氳蒀蒕",
    "xiáo,ǎo": "郩",
    "lù,áo": "鏕",
    "yāo": "鴁鴢妖幺夭腰邀吆喓楆殀祅葽訞",
    "bā": "八巴芭叭笆疤捌粑岜仈哵夿朳玐羓蚆豝釟丷巼",
    "bà": "爸坝霸鲅灞垻弝壩欛矲鮁",
    "bǎ,bà": "把",
    "bā,ba": "吧",
    "bá": "拔跋茇菝魃叐妭抜炦癹胈詙軷鼥",
    "bà,ba,pí": "罢罷",
    "bā,pá": "扒",
    "bǎ": "靶鈀",
    "bà,pá": "耙",
    "bǎ,pá": "钯",
    "pò,bā,bō": "哱",
    "fá": "坺墢笩茷罚乏伐阀筏垡姂傠栰瞂罸罰藅閥浌",
    "bó,bǎi,bà": "伯",
    "kè,bā": "峇",
    "bù,pū": "抪柨",
    "bǎi": "捭百摆佰栢擺竡粨襬",
    "bā,fú,pèi,bó,biē": "柭",
    "pá": "杷爬琶筢掱潖",
    "pài": "湃派哌沠蒎鎃渒",
    "quǎn,bá": "犮",
    "pā,bà": "皅",
    "hā": "紦鉿",
    "bà,pò": "覇",
    "bì": "萆薜痺鐴闭碧避必毕壁币蓖弊蔽敝毙庇毖陛痹畀嬖狴筚箅篦荜襞铋跸愎滗璧哔髀弼婢咇佖坒堛嗶奰妼幤幣廦弻彃愊怭斃梐滭煏熚湢獘潷獙珌疪畢皕箆篳粊綼縪繴罼腷苾萞蓽蜌袐襅襣觱詖诐貱贔蹕赑躃躄邲鄨鄪鏎鉍閇閉閟韠饆飶馝駜驆魓鮅鷝鷩鼊睤",
    "bà,páo": "跁",
    "bā,bà": "魞鲃",
    "bá,fú": "颰",
    "bó,bà": "鮊鲌",
    "bái": "白",
    "bǎi,bó,bò": "柏",
    "bài": "败稗拜拝敗粺薭贁韛",
    "bei,bài": "呗唄",
    "bài,tīng": "庍",
    "bāi": "挀掰",
    "bài,pí": "猈",
    "pái,pǎi": "排",
    "bǎi,mò": "絔",
    "bèi": "鞁鞴倍备辈贝钡焙狈惫褙悖蓓鐾孛碚俻偝偹僃備邶愂昁憊梖牬犕琲珼狽禙糒苝蛽軰貝鄁輩鋇郥",
    "bàn": "半办伴扮瓣绊姅怑秚絆辦鉡靽",
    "bān": "班般搬斑扳癍颁瘢攽斒肦螁螌褩辬頒",
    "bàn,pàn": "拌",
    "bǎn": "版板坂钣舨阪岅昄瓪粄蝂鈑魬",
    "bìng": "並鮩病摒倂併傡垪栤窉竝誁靐",
    "pǎn,bàn": "坢",
    "ní": "埿倪霓铌尼猊坭怩鲵屔淣籾蚭觬蜺貎跜輗郳鈮馜齯鯢麑聣",
    "fēn,fèn": "分",
    "pán,bān,pó": "搫",
    "bīn": "彬豳宾濒斌滨缤傧镔椕濵濱瀕虨繽賔賓豩邠霦鑌顮頻",
    "fén,bān": "朌",
    "pán,bàn": "柈跘",
    "bàn,pán": "湴",
    "fān,pān,biān": "籓",
    "fěng": "覂唪讽諷",
    "biàn": "辧辨辩辯变遍卞辫忭汴苄弁変峅徧抃昪汳艑覍變辡辮釆玣諚",
    "bǎn,pàn": "闆",
    "bān,fén": "鳻",
    "bāng": "帮邦梆浜垹幚幇幫捠邫鞤",
    "bàng": "棒镑傍谤塝蒡玤稖艕蜯謗鎊",
    "bǎng": "绑膀牓綁髈",
    "bàng,páng": "磅",
    "bǎng,bàng": "榜",
    "bàng,bèng": "蚌",
    "bēng,pǎng": "嗙",
    "běng": "埲琫菶鞛",
    "páng": "嫎徬螃鰟鳑舽逄厐庞龐龎",
    "xiù": "峀溴綉绣锈嗅袖秀岫珛琇璓繍繡螑褏褎鏥銹鏽齅",
    "gǎng,gāng": "崗",
    "péng,bāng": "彭",
    "bàng,péng": "挷搒",
    "bàng,pǒu,bèi,bēi": "棓",
    "páng,bàng": "旁",
    "mǎng,bàng": "硥",
    "fǎng": "紡纺仿访舫倣旊昉昘瓬眆訪髣鶭",
    "bāng,bàng": "縍",
    "fāng,bàng": "蚄",
    "máng,bàng": "蛖",
    "péng": "騯傰錋捀蘕鵬鹏袶棚蓬朋硼澎篷蟛膨倗塜塳憉弸椖樥稝纄竼芃蟚輣韸韼髼鬅鑝鬔",
    "bāo": "包褒苞胞龅孢煲佨勹笣蕔裦襃闁齙",
    "bào": "报抱爆豹鲍儤勽報忁曓菢虣蚫鉋鑤铇髱骲鮑犦",
    "bǎo": "饱保宝褓鸨葆堢寚寳媬寶珤緥藵賲靌飹駂鳵飽鴇",
    "bào,pù": "暴",
    "báo,bó,bò": "薄",
    "bāo,bō": "剥剝",
    "páo,bào": "刨",
    "báo": "雹窇",
    "bǎo,bǔ,pù": "堡",
    "páo,bāo,pào": "炮",
    "pù,bào": "瀑曝",
    "bào,bō": "趵",
    "xiāo,jiāo": "嘐憢",
    "bó,pào,bào": "嚗",
    "biáo": "嫑",
    "bǎo,bào": "怉",
    "bāo,fú": "枹",
    "pào": "砲靤疱奅礟皰麭礮",
    "bù,bó": "簿",
    "bào,páo,pào": "袌",
    "póu": "裒抔",
    "páo": "袍咆狍庖匏垉爮褜軳鞄麅",
    "mián": "宀绵棉眠婂嬵檰櫋矈矊緜綿芇矏蝒杣",
    "bó": "萡驳博搏脖帛渤舶铂箔膊礴亳鹁踣钹仢侼僰懪愽挬桲欂浡淿煿牔狛瓝秡簙糪艊胉葧袯襏襮郣鋍鈸鉑鎛鑮镈餺馛駮駁馞馎髆鵓謈",
    "bèi,pī": "被",
    "bēi": "杯悲碑卑鹎揹桮椑盃藣鵯庳",
    "bèi,bēi": "背",
    "běi,bèi": "北",
    "bì,bei": "臂",
    "bēi,pí,pō": "陂",
    "bǐ": "俾笔比彼鄙秕匕舭妣佊夶朼柀沘疕粃筆聛貏毞",
    "xí": "喺謵椺席袭习檄媳隰觋嶍漝習蓆襲趘郋鎴霫飁騱騽驨鰼鳛",
    "pí,pì": "埤",
    "fú": "怫茀幅踾帗艴袚祓紼绋髴芣扶浮福伏符氟俘弗涪辐袱苻蚨幞茯蜉菔蝠罘匐绂凫桴孚郛乀黻芙咈哹刜垘巿岪柫栿澓炥玸泭畉甶癁稪箙綍絥紱翇罦艀葍虙襆襥諨豧輻鉘鉜韍韨颫鮄鮲鴔鵩鳧鳬",
    "fèi,bèi": "杮",
    "bēi,pēi": "柸",
    "pái,bèi,pèi": "棑",
    "bō": "波拨播玻菠钵饽僠嶓撥癶砵盋礡碆缽蹳鉢餑驋鱍袰溊",
    "zōu": "箃齱鄒鄹郰邹騶驺陬諏诹棸緅齺鲰黀鯫",
    "fù": "萯复馥輹附鲋嬔富负付赴缚赋妇腹覆傅讣阜咐鳆蝮赙驸冨坿偩媍婦彿復椱禣竎祔緮縛蕧蚹蛗蝜袝複覄詂訃負賦賻鍑鍢駙鮒鰒",
    "pú": "菩葡蒲僕獛莆匍濮镤璞圤墣瞨穙菐蒱贌酺鏷",
    "bèi,bó": "誖",
    "pǐ,bēi": "諀",
    "fēi": "蜚非飞啡扉霏鲱绯婔婓暃渄猆緋裶靟飝飛餥馡騑騛鯡",
    "pī": "錍鈚陴坯批披霹砒丕邳噼伾伓憵岯炋狉狓磇礕秛秠礔耚豾鉟錃銔駓髬魾",
    "běi": "鉳",
    "běn": "本苯畚奙楍翉",
    "bēn": "锛犇錛",
    "bēn,bèn": "奔泍",
    "bèi,mó": "骳",
    "bì,bēn": "贲賁",
    "bèn": "倴笨坌捹撪渀逩",
    "hāng,bèn": "夯",
    "pèn,bēn": "喯",
    "tǐ,tī,bèn": "体",
    "tāo,běn": "夲",
    "bèn,fàn": "桳",
    "fén,bèn": "炃",
    "fén": "燌鐼岎蕡坟焚棼汾鼢墳妢幩枌燓羒羵蒶蚠蚡豶豮隫轒馩魵黂鼖",
    "fén,fèn": "獖",
    "fèi,bēn": "蟦",
    "fàn": "輽汎泛饭贩范犯畈梵奿嬎氾滼瀪盕笵範訉軬販飯飰",
    "bèng": "蹦迸泵甏塴逬鏰镚揼",
    "béng": "甭甮",
    "bēng,běng,bèng": "绷綳繃",
    "bēng": "崩嘣伻奟嵭閍",
    "fèng": "俸凤奉湗焨煈賵赗鳯鴌鳳",
    "běng,fēng": "埄",
    "péng,bèng": "堋",
    "pēng": "抨駍砰烹剻嘭匉怦恲梈軯",
    "píng": "平荓輧軿瓶评萍坪凭呯凴枰鲆塀岼帡帲幈慿洴憑焩甁玶竮箳簈缾蚲蛢蓱郱評鮃",
    "féng,péng": "漨",
    "péng,fēng": "熢莑",
    "běng,pěi": "琣",
    "bēng,péng": "痭",
    "bēng,bīng,pēng": "絣",
    "bēng,fāng": "祊",
    "pián,bèng": "跰",
    "bí": "鼻荸嬶",
    "bī": "逼偪屄楅毴豍鰏鲾鵖",
    "bì,pì": "辟濞睥",
    "mì,bì": "秘泌祕",
    "bì,pí": "裨芘禆朇",
    "pǐ,bǐ": "吡",
    "pǐ,pí": "仳",
    "xiōng": "匂哅兄胸凶汹兇忷恟匈芎胷訩讻詾洶",
    "fó,fú,bì,bó": "佛",
    "bǐ,tú": "啚",
    "pōu,bǐ": "娝",
    "pì": "媲鸊屁僻譬甓嫓澼疈闢鷿",
    "pí,bǐ": "崥",
    "pǐ": "庀匹痞癖圮噽嚭脴苉銢鴄",
    "bì,pī": "怶",
    "pī,pǐ": "悂劈",
    "pī,bì": "旇",
    "fú,bì": "拂畐鶝",
    "fú,fù": "服洑",
    "pī,mì": "枈",
    "pí": "枇腗脾魮鲏鮍蜱皮琵毗啤疲貔郫鼙罴蚍壀毘焷篺膍蚽螷羆蠯豼鈹阰隦鵧",
    "bì,bié": "柲",
    "bò": "檗蘗孹譒",
    "piǎo": "殍瞟皫醥顠",
    "bì,qí": "畁",
    "jí,bī": "皀",
    "pì,bì": "稫",
    "pí,bì": "笓",
    "pái,bēi": "箄",
    "piē": "瞥撆氕暼",
    "bō,bì": "紴",
    "pī,pí,bǐ": "紕纰",
    "pī,bì,pō": "翍",
    "pí,bǐ,bì": "肶",
    "fèi,bì": "胇",
    "xī": "肸糦饎郗螅昔谿蹊磎析菥犧牺錫锡邜觹觽觿西吸稀溪熄膝息惜嘻夕矽熙悉希晰硒烯汐犀蜥奚浠嬉兮穸翕僖淅舾醯欷皙蟋羲唏曦樨粞鼷熹俙凞卥唽厀嚱噏嬆屖嵠巇徆徯悕惁晞晳桸榽橀氥渓焁焈焟熈熺燨熻爔犠琋瘜睎瞦礂窸緆繥翖肹莃蒠蠵覡譆豨豀豯貕赥鄎酅釸鑴鏭隵餏饻鯑鸂鵗鐊",
    "bī,pí": "螕",
    "lǜ": "虑滤濾膟律氯勴垏嵂慮爈箻繂綠葎鑢",
    "fèi": "费費廢肺废沸吠狒镄剕厞廃屝俷昲曊櫠濷癈萉陫鐨靅鼣",
    "bǒ": "跛",
    "bī,bì,pī": "鎞",
    "hàn,bì": "閈闬",
    "bǐng,pí,bì,bēi": "鞞",
    "bì,bǐng": "鞸",
    "bì,pǒ": "髲",
    "miè": "鴓礣鑖灭篾蠛幭懱搣蔑滅薎衊鱴烕",
    "biāo": "髟标彪膘飑飙瘭飚镳镖儦墂幖標滮瀌熛爂猋脿臕蔈謤贆鏢颷颮鑣飇飆飊飈驫骉磦",
    "biān": "边编鞭砭蝙笾鳊煸炞甂箯籩編萹邉鍽邊鯾鯿",
    "biàn,pián": "便缏緶",
    "biǎn,piān": "扁",
    "biǎn": "贬匾碥褊窆惼揙稨藊貶鴘",
    "fēng": "封楓渢蜂丰枫疯峰锋葑酆烽仹偑凨沣僼凬砜凮妦寷崶峯沨檒犎猦灃琒盽瘋篈碸蘴豐鄷鋒鏠靊鎽飌麷堼蠭闏霻",
    "pàn,pīn,fān": "拚",
    "biān,miàn": "牑",
    "biān,piàn": "猵獱",
    "fá,biǎn": "疺",
    "zhěn": "稹枕疹縝缜诊轸畛姫屒弫抮昣眕縥聄萙袗裖覙診軫辴駗鬒",
    "biān,biǎn": "糄",
    "mián,biān": "臱",
    "jiàn,biǎn": "覵",
    "biàn,guān": "閞",
    "biān,yìng": "鞕",
    "yǔ": "頨羽萭齬龉屿禹宇窳俣伛庾圄瘐圉俁匬傴噳寙嶼挧敔斞楀瑀祤穥與貐鄅麌",
    "piān,biǎn": "鶣",
    "biǎo": "表婊裱褾諘錶",
    "sháo,biāo": "杓",
    "biào": "鳔俵",
    "piào,biāo": "骠僄",
    "piāo": "剽犥飘螵勡嘌慓旚翲飃魒飄",
    "piào": "徱驃鰾",
    "piáo,piāo": "嫖",
    "biāo,biǎo": "檦",
    "biāo,hǔ": "淲",
    "biào,biāo": "摽",
    "piāo,piǎo,piào": "漂",
    "huǒ,biāo": "灬",
    "biāo,pāo": "穮藨",
    "piǎo,biāo": "篻",
    "lù,biāo": "膔",
    "páo,biāo": "麃",
    "bié,biè": "别別",
    "biē": "憋鳖虌鼈龞鱉",
    "biē,biě": "瘪癟",
    "biè": "彆",
    "bié": "蹩徶莂蛂襒",
    "yà,jiá,qiè": "猰",
    "piē,piě": "撇",
    "chēng,chèn,chèng": "穪称稱",
    "biē,bié": "蟞",
    "bìn": "摈殡膑髌鬓擯殯臏髩鬂髕鬢",
    "bīn,bīng": "槟梹檳",
    "bīn,fēn": "玢",
    "bīn,bìn": "儐",
    "fèn,bīn": "份",
    "nèi": "氞內氝錗",
    "bīn,pà,pā": "汃",
    "bīn,pián": "瑸璸",
    "pīn,bīn,fēn": "砏",
    "pín": "蠙贫嫔颦嚬玭嬪矉薲貧顰娦",
    "fēn": "訜芬纷酚吩氛帉昐朆梤棻竕紛翂衯躮鈖雰餴饙馚哛兺",
    "pín,bīn": "频",
    "bìng,bīng": "并幷",
    "bīng": "兵冰仌冫掤氷蛃鋲仒",
    "bǐng": "丙饼秉柄炳禀邴怲抦昞昺棅稟苪鈵陃鞆餠餅",
    "píng,bǐng": "屏",
    "bǐng,bìng": "偋寎",
    "bìng,píng": "庰",
    "bēn,bīng": "栟",
    "fāng,bìng": "枋",
    "lán": "燷蘫蓝兰拦篮栏谰婪澜岚褴斓镧儖囒阑幱嵐攔斕欗欄灆瀾灡燣璼籣籃繿葻襕藍蘭襽襴襤讕譋躝鑭闌韊",
    "pín,bǐng": "琕",
    "lǐn": "癛癝廩廪懔凛檩僯凜撛懍檁澟",
    "xiǎn": "燹险險冼跣显藓蚬猃筅尠尟崄嶮幰攇毨櫶灦烍獫狝獮玁禒箲蘚蜆譣赻鍌韅険顕顯",
    "bǐng,fǎng": "眪",
    "gěng": "綆绠梗耿鲠哽峺挭埂莄郠骾鯁",
    "bǐng,píng": "鉼",
    "nè": "疒讷眲訥",
    "bó,pō": "泊",
    "bó,bèi": "勃",
    "pò": "魄湐昢破粕珀岶敀洦烞砶蒪",
    "bǔ,bo": "卜",
    bo: "啵蔔",
    "fán": "蕃襎凡烦樊钒矾燔蘩凢凣匥墦蹯杋柉棥煩璠瀿笲礬籵緐羳舤舧薠蠜鐇釩鷭鐢",
    "bò,bǒ": "簸",
    "bò,bāi": "擘",
    "fān,bo": "噃",
    "mù": "募幕毣暯艒木目牧墓穆暮慕睦钼沐凩仫苜幙楘慔炑蚞狇雮莯鉬霂",
    "xué,bó,jué": "壆",
    "zhuó,bó": "彴",
    "pà": "怕帕袙帊",
    "pāi": "拍",
    "pǐ,bò": "擗",
    "píng,bò": "檘",
    "fǒu,bó": "殕",
    "fú,fù,bó": "榑",
    "pō": "泼潑頗颇坡钋岥溌酦鏺釙",
    "pān": "潘萠攀眅",
    "pèi,fèi": "犻",
    "bó,pò": "猼",
    "bó,páo": "瓟",
    "fān,pān": "番畨",
    "lì,luò,bō": "皪",
    "fā": "發彂沷発冹",
    "pán,bō": "磻",
    "zhuō,bó": "穛",
    "pǒ": "箥笸叵钷尀駊鉕",
    "bó,dí": "肑",
    "pā,bó": "苩",
    "pó": "蔢嚩皤鄱婆櫇嘙",
    "pí,bǒ": "蚾",
    "niè": "蘖湼籋痆鑈镍聂孽涅镊啮陧嗫蹑臬颞噛嚙囁囓圼孼嵲嶭巕帇敜枿槷篞櫱糱糵聶臲蠥讘踂踙踗躡錜鎳钀鑷闑隉齧顳",
    "bó,mò": "袹",
    "hù": "豰嗀瓠乥户互护沪冱怙鹱笏戽扈祜岵嚛婟嫮嫭帍弖戸戶昈槴沍滬熩簄粐綔蔰護鍙鄠頀鱯鳠鳸鸌",
    "pǎo,páo": "跑",
    "bó,jué": "髉",
    "bù,fǒu": "不",
    "bǔ": "补捕哺卟補鸔喸",
    "bù": "布步部埠怖瓿钚佈勏吥咘埗廍悑歨歩篰荹蔀踄郶鈈餢",
    "pǔ,bù": "埔",
    "bū": "晡逋钸峬庯誧餔鈽鵏錻",
    "bú": "醭轐鳪",
    "pǒu,péi,bù": "婄",
    "fū": "尃孵敷肤趺跗稃麸呋伕娐怤懯旉玞砆糐筟綒膚荂荴衭邞鄜酜鈇麬麱麩",
    "bù,pú,zhì": "捗",
    "fǔ": "拊俯斧辅腐府抚甫釜脯腑黼滏俌俛呒弣撫椨焤盙簠蜅輔郙釡阝頫鬴乶",
    "fǔ,fù,bǔ": "捬",
    "pǔ": "擈溥谱圃浦镨普氆蹼圑暜檏樸烳諩譜鐠",
    "pū": "撲陠攵扑攴噗潽炇",
    "fù,pū": "秿",
    "póu,bù,fú,pú": "箁",
    "pū,bū": "鯆",
    "chāi,cā": "拆",
    "cā": "擦",
    "cā,chā": "嚓",
    "zá,cà": "囃",
    "cān,càn": "傪",
    "cǎ": "礤礸",
    "cā,sǎ": "攃",
    "zǐ": "橴茈吇紫籽子滓笫秭梓耔姉杍姊榟矷虸訿釨",
    "cà": "遪",
    "chěn": "磣硶碜墋夦贂趻踸鍖",
    "cài": "蔡菜縩",
    "cái": "才财材裁纔財",
    "cǎi,cài": "采寀埰",
    "cǎi": "踩睬倸啋彩婇棌採綵跴毝",
    "cāi": "猜",
    "cāi,sī": "偲",
    "zéi": "戝蠈鰂鱡鲗贼賊",
    "lè,lì,cái": "扐",
    "sāi,zǒng,cāi": "揌",
    "cán": "蚕残惭慙殘慚蝅蠺蠶",
    "cǎn": "惨黪憯慘黲",
    "chān,xiān,càn,shǎn": "掺摻",
    "cān,shēn,cēn,sān": "参叄參叅",
    "cān": "餐骖嬠湌爘驂飡",
    "càn": "灿璨粲儏澯燦薒謲",
    "chán,càn": "孱",
    "shān,càn": "嘇",
    "cān,sūn,qī": "喰",
    "zǎn": "噆攅趱昝儧儹寁趲",
    "zá,zàn,cān": "囋",
    "cēn": "嵾",
    "qiàn": "嬱欠歉倩芡茜俔椠儙伣刋壍悓棈槧皘篏篟縴蔳蒨輤",
    "chàn,cán": "摲",
    "jiān": "戔奸鰔菅靬尖兼肩煎歼坚艰笺缄鞯戋搛缣鲣蒹鹣湔冿囏堅姧姦幵惤椾樫櫼殱殲瀐瀸熞熸牋睷瑊礛箋縑緘菺葌艱蔪蕑蕳虃譼豜鑯韀韉餰馢鰜鳒鰹鵳鶼麉雃鵑礷",
    "cǎn,qián,jiàn": "朁",
    "qiǎn": "淺谴遣缱肷繾膁蜸譴鑓",
    "cǎn,shān,cēn": "穇",
    "cēn,zān,cǎn": "篸",
    "zàn": "蹔襸酂酇暂赞瓒錾瓉禶讃讚賛暫瓚鄼饡贊鏨",
    "sūn": "飱飧荪狲搎槂猻蕵薞蓀",
    "sǎn,qiāo,càn": "鏒",
    "shēn": "鯵鰺鲹身罙糂蔘曑葠伸深申绅砷呻娠诜侁兟堔妽屾峷扟柛燊氠珅甡甧眒穼籶籸罧蓡紳薓裑訷詵駪鯓鵢敒",
    "cáng,zàng": "藏",
    "cāng": "仓沧舱仺倉苍凔嵢濸獊滄螥蒼艙鸧",
    "cāng,chen": "伧傖",
    "zāng,cáng": "匨",
    "cáng": "欌鑶",
    "qiāng,cāng": "瑲篬玱",
    "chēng": "罉晿撑柽瞠蛏憆摚撐棦橕檉泟浾琤碀緽赪蟶赬阷鏿靗頳饓鐣",
    "zāng,zàng,cáng": "臧",
    "càng": "賶",
    "cāng,qiāng": "鶬",
    "zàng": "蔵脏塟葬弉臓銺臟",
    "cǎo": "草愺艸騲",
    "cāo": "操糙撡",
    "cáo": "曹槽嘈艚螬嶆漕曺蓸褿鏪",
    "zāo,cáo": "傮",
    "chè,cǎo": "屮",
    "cǎo,sāo": "慅",
    "cǎo,sāo,sào": "懆",
    "cào": "肏襙鄵鼜",
    "cáo,cóng": "慒",
    "zǎo": "澡早枣藻蚤栆璪薻棗",
    "zào": "造煰燥灶躁皂唣唕噪慥梍竃皁簉艁譟趮竈",
    "cè": "册测策厕恻冊厠廁敇憡惻測笧筞筴箣荝萴萗蓛夨",
    "cè,zè,zhāi": "侧側",
    "zé": "嫧帻幘齰襗则责箦舴迮啧赜則嘖択歵樍沢泎皟溭瞔矠礋蔶蠌簀謮鸅齚賾",
    "qī": "墄戚踦七漆柒欺凄沏桤萋嘁欹倛僛娸悽慼慽捿桼棲榿淒紪緀褄諆迉郪鏚霋魌鶈",
    "cè,sè,chuò": "拺",
    "cè,jì": "畟",
    "shān": "柵脠縿山衫删煽珊芟潸跚傓舢剼刪挻搧圸澘狦檆笘羴羶軕邖閊鯅",
    "zhà,shān,shi,cè": "栅",
    "cè,jí": "簎",
    "cè,sè": "粣",
    "shè": "赦渉涉滠灄摂社舍设慑厍麝弽慴厙懾欇涻舎蔎蠂騇設",
    "dāo": "刂刀氘忉舠釖魛鱽螩",
    "cén": "涔岑埁",
    "chén": "梣辰尘臣晨沉陈忱谌宸塵敐曟樄煁瘎茞莀莐蔯薼螴訦諶軙迧鷐霃陳麎鈂敶栕",
    "gàn,hán,cén": "汵",
    "cén,jìn,hán": "笒",
    "cūn": "膥村皴竴邨",
    "céng": "层嶒層驓",
    "zēng,céng": "曾橧曽",
    "cèng": "蹭",
    "sēng": "僧鬙",
    "cēng": "噌",
    "zēng": "增憎罾増璔矰磳譄鄫鱛",
    "céng,zēng": "竲",
    "chì": "硳勑斥翅赤炽饬瘛敕啻叱彳傺侙勅恜憏懘慗抶杘湁灻熾痸烾翄翤翨腟趩遫鉓雴飭鶒鷘",
    "zēng,zèng": "缯繒",
    "zhān": "岾沾詀噡詹飦枬粘鱣毡谵旃瞻惉旜栴氊氈薝蛅趈譫閚邅霑饘驙魙鸇鹯",
    "diǎn": "猠点碘典踮奌婰敟椣蒧蕇點嚸",
    "zhě": "乽褶鍺锗踷者赭襵",
    "chá,zhā": "查査",
    "chā": "插馇偛锸嗏扠挿揷臿疀艖芆銟鍤餷",
    "chā,chá,chǎ": "叉",
    "chá": "茶搽茬察槎檫垞嵖猹詧靫",
    "chà,chā,chāi,cī": "差",
    "chà": "岔诧衩汊姹侘奼詫",
    "chá,chā": "碴",
    "zhā,chá": "楂",
    "chà,shā": "刹剎",
    "chǎ": "镲蹅鑔",
    "chā,chà": "杈",
    "tuō,chà,duó": "仛",
    "tǔ": "土钍圡釷",
    "xī,chā,qì": "扱",
    "tú,shū,chá": "捈",
    "qì,jì,chá": "摖",
    "jié": "捷卩掶洁狤訐讦跲頡杢截劫竭杰睫桀羯鲒婕孑倢偼刦傑刼劼刧卪岊媫崨嵥巀嶻幯擮昅桝楶榤滐潔礍節蓵蛣蜐蠘莭蠞蠽衱袺誱詰踕鉣迼鍻鮚镼",
    "jiē": "接喼秸街皆阶喈嗟疖堦媘掲擑楬湝煯痎癤稭脻蝔謯階鞂鶛",
    "tú,chá": "梌",
    "xié": "斜奊鞋脇脋胁脅縀协谐携缬撷偕勰嗋垥協恊愶拹擕旪擷攜熁燲綊緳翓膎蝢衺襭讗諧鞵龤",
    "chá,ná": "秅",
    "chà,chǎ": "紁",
    "chāi": "肞釵钗",
    "lǎo": "荖狫老佬铑栳恅咾珯硓蛯轑銠鮱耂",
    "suǒ": "褨獕乺所锁琐索唢溑暛嗩琑瑣鎻鏁鎖",
    "jū,chá": "苴",
    "tú": "荼涂跿塗腯图途徒屠凃酴図圖圗峹嵞廜悇揬庩瘏筡蒤鈯鍎馟駼鵌鶟鷋鷵",
    "chài": "訍虿囆袃蠆",
    "cuō,chā": "鎈",
    "zhā,chā": "喳",
    "chái": "柴豺侪儕喍犲祡",
    "chài,cuó": "瘥",
    "cuō": "搓蹉磋瑳遳醝",
    "dì": "蔕蝭踶螮遰遞第递缔帝蒂谛睇娣碲俤偙僀埊墑嶳墬怟梊玓焍甋眱祶禘締菂腣蝃諦逓鉪",
    "chǎi": "茝",
    "zī": "龇齜姕澬滋茲趑赼齍緕纃玆资姿咨淄孜缁谘鲻锱孳赀髭訾嵫嗞辎崰孶栥椔湽禌秶紎茊葘緇趦諮貲資輺鄑鈭輜鍿鎡镃頾頿錙鰦鶅鼒鯔",
    "chǎn": "产阐铲蒇谄冁骣丳剷囅嵼旵浐滻灛產産簅蕆譂讇諂鏟閳闡",
    "chán": "缠谗蝉馋婵廛蟾潺躔澶劖嚵壥嬋巉棎毚湹潹瀍瀺煘獑磛緾纒纏艬蟬誗讒鄽酁鋋镵鑱饞蟐",
    "chān": "搀觇攙裧襜覘辿鋓",
    "chàn,zhàn": "颤",
    "dān,shàn,chán": "单單",
    "chàn": "羼忏懴懺硟韂顫",
    "xín": "镡枔襑鐔",
    "chán,shàn": "禅",
    "dǎn,dàn": "亶馾",
    "zhàn,diān": "佔",
    "zhàn,zhuàn,chán": "僝",
    "dàn": "僤但蛋淡氮诞旦萏啖啗啿嚪噉帎憺柦沊泹狚癚禫疍腅窞蜑觛訑贉誕霮餤駳髧鴠饏蓞",
    "chán,tǎn,shàn": "儃",
    "chán,chàn": "儳",
    "tù": "兎兔堍迌鵵",
    "chǎn,chàn": "刬剗幝",
    "dān": "単襌眈丹耽郸殚聃箪勯匰妉媅殫甔耼砃簞聸褝躭酖鄲頕",
    "tān,chǎn,tuō": "啴",
    "tān,chǎn": "嘽",
    "lí": "厘离離驪骊黧梨漓狸璃篱黎鹂犁缡蓠嫠藜鲡罹喱刕剓剺劙嚟囄孷廲悡梸棃灕犂琍瓈盠睝穲竰筣籬縭糎艃荲菞蔾蘺蟍蠫褵謧蟸貍醨鋫錅鏫鑗鯏鯬鵹鱺鸝",
    "shàn": "墠嬗蟺贍赡善膳汕缮蟮鄯擅鳝骟讪疝僐墡敾樿椫灗磰繕謆譱訕赸鐥饍鱓騸鱔歚",
    "tuán": "團团抟団慱檲摶糰鷒鏄鷻",
    "zhǎn,chán": "嶃崭嶄",
    "chān,chàn": "幨",
    "dàn,dá": "憚惮",
    "chǎn,sùn": "摌",
    "dǎn,shàn": "掸撣",
    "chǎn,jiè": "斺",
    "chān,yán": "梴",
    "zhǎn,niǎn,zhèn": "榐",
    "chán,zhàn": "欃",
    "jiàn,jiān": "渐漸溅濺鞬",
    "chǎn,dǎn,chàn": "燀",
    "shàn,chán": "禪",
    "chǎn,chán": "繟",
    "dàn,tán,chán": "繵",
    "tián,tǎn,chān": "緂",
    "zhàng": "胀脹帐仗丈账杖瘴障幛嶂墇扙涱帳痮瞕粀瘬賬",
    "chán,jiàn": "螹",
    "shān,shàn": "苫姍姗钐釤",
    "zhé": "袩矺摺讁謫谪蛰辙哲辄啠磔嚞蜇埑悊喆晢歽晣砓籷虴粍讋詟謺輙蟄鮿輒轍",
    "liǎn": "裣襝脸敛琏蔹嬚斂羷璉臉蘞蘝鄻",
    "chèn": "讖谶趁衬龀榇儭嚫櫬疢襯趂齓齔",
    "niǎn": "蹍焾撵碾辇撚涊攆簐蹨躎輦",
    "chǎn,chěn": "醦",
    "zuān": "鉆躜躦劗鑚鑽",
    "cháng,zhǎng": "长仧兏長",
    "chàng": "唱畅鬯怅悵暢焻畼誯韔",
    "cháng,chǎng": "场塲場",
    "cháng": "常尝肠偿嫦徜苌償嚐嘗瑺瓺甞膓腸萇镸鱨鲿仩",
    "chāng": "昌猖鲳菖阊伥娼倀淐椙琩裮錩锠閶鯧鼚",
    "chǎng": "敞氅惝昶僘厰廠鋹",
    "chàng,chāng": "倡",
    "cháng,shang": "裳",
    "tǎng,cháng": "倘",
    "tǎng": "儻伖躺傥耥戃曭爣矘鎲钂镋",
    "shàng": "尙尚绱恦丄緔",
    "chéng": "棖橙揨成城诚程惩呈承塍铖酲埕枨丞塖堘宬挰懲掁峸檙洆溗澂珵畻珹窚筬絾脭荿誠鋮郕鯎騬",
    "tǎng,chǎng": "淌",
    "chàng,yáng": "玚瑒",
    "shǎng": "鋿鏛垧赏晌鑜賞樉贘",
    "táng,tāng,chāng": "闛",
    "zhāo,cháo": "朝",
    "chāo": "抄超钞怊弨欩訬鈔",
    "chǎo,chāo": "吵",
    "cháo": "潮巢晁巣漅牊窲罺謿轈鄛鼂鼌",
    "chǎo": "炒巐煼眧麨",
    "jiǎo,chāo": "剿勦劋摷",
    "cháo,zhāo": "嘲",
    "chuò,chāo": "绰綽",
    "chào": "耖仦觘",
    "zhuō,chāo": "焯",
    "chào,miǎo": "仯",
    "lào,láo": "唠嘮憦",
    "yǒu,chǎo": "槱",
    "cháo,jiǎo,chāo": "樔",
    "chǎo,jù": "焣",
    "tāo": "涛濤轁掏绦饕韬滔嫍幍慆搯弢槄瑫縚絛縧詜謟鞱韜飸",
    "shā,chǎo": "粆",
    "shào": "綤紹绍哨邵劭潲卲袑",
    "chuō,chuò": "繛",
    "zhòu": "縐绉咮皱昼宙骤咒胄纣荮伷籀酎僽呪冑晝甃籒籕粙皺紂葤詋駎驟",
    "chuō,zhuó": "趠",
    "zhōu": "謅诌譸淍鵃鸼騆洲周州舟侜喌徟炿烐珘矪賙輈赒辀輖週郮銂霌駲",
    "qiáo": "趫乔侨僑嫶櫵橋蕎鞒鞽桥瞧荞樵谯憔槗犞硚礄荍藮譙鐈顦",
    "chē,jū": "车伡俥車",
    "chè": "撤掣彻澈坼勶徹烢瞮爡硩聅迠頙",
    "chě": "扯偖撦",
    "chǐ,chě": "尺",
    "chē": "砗唓莗硨蛼",
    "tiè,chè": "呫",
    "shà": "喢唼霎倽歃箑翜翣萐閯",
    "duō": "夛多剟哆掇咄裰嚉毲",
    "duǒ,chě": "奲",
    "zhái": "宅",
    "pì,chè": "揊",
    "chí": "池迟持驰弛踟茌墀篪漦竾筂箎荎蚳謘貾赿迡遅遟鍉遲馳",
    "xiè,chè": "焎烲",
    "niè,chè": "摰",
    "chēn": "郴抻嗔琛捵瞋諃賝謓",
    "zhèn,zhēn": "侲揕",
    "tián": "塡田甜恬阗畋屇沺湉璳甛畑碵磌胋闐鴫鷆鷏",
    "kān": "堪刊龛勘戡栞龕",
    "tián,zhèn": "填",
    "chén,xìn,dān": "愖",
    "lián": "帘涟漣莲联连怜廉蠊镰鲢奁臁濂裢亷劆匲嗹噒奩匳嫾憐濓熑燫籢簾籨縺聨翴聫聮聯蓮螊覝褳薕謰蹥鎌連鐮鬑鰱瀮",
    "chén,zhèn": "桭",
    "chēn,shēn": "棽",
    "zhàn": "棧湛譧站战栈蘸绽偡嶘戦桟戰菚虥虦綻轏驏",
    "shěn,chén": "沈",
    "jù": "烥巨具距锯剧拒惧聚俱踞炬倨醵屦犋窭飓遽倶讵钜劇勮埧姖壉埾岠屨愳懅拠懼怇昛歫洰澽秬窶簴粔耟虡豦詎蚷躆邭鉅鐻駏颶鮔",
    "shěn": "瀋谂諗宷审審婶矧渖哂嬸弞曋矤瞫覾訠讅谉邥頣魫",
    "diān,chēn": "瘨",
    "lín,chēn": "綝",
    "shèn": "胂涁渗滲葚肾慎侺蜃愼昚瘆瘮祳眘脤腎蜄鋠",
    "róng,chēn": "肜",
    "jiàn,chén": "跈",
    "chuǎng": "闖闯傸磢",
    "chéng,shèng": "乘乗娍椉",
    "shèng,chéng": "盛晟",
    "chèng": "秤",
    "chéng,dèng": "澄瀓",
    "chěng": "逞骋庱悜睈騁",
    "dāng,chēng": "铛鐺",
    "chěng,tǐng": "侱",
    "chéng,chěng": "裎",
    "chēng,chèn": "偁爯",
    "chēng,dēng": "僜",
    "qiāng,qiàng": "呛嗆戧跄戗",
    "zhēng,chéng": "埩",
    "jìng,chēng": "净淨凈",
    "shèng": "嵊圣胜剩剰墭勝晠榺橳琞蕂聖貹賸",
    "chěng,zhèng": "徎",
    "zhǐ,zhēng": "徴徵",
    "chéng,dèng,zhèng": "憕",
    "qiāng,qiǎng,chēng": "抢搶",
    "qiāng": "摤槍腔枪羌蜣戕锖锵啌嗴嶈斨溬猐牄獇羗謒蹡蹌鏘",
    "zhěng,chéng": "撜",
    "chéng,chēng": "朾",
    "táng": "樘踼堂糖塘搪唐棠螳膛瑭醣溏傏螗啺坣榶漟煻磄篖糃糛膅蓎赯禟鄌鎕隚餹饄鶶",
    "táng,chēng": "橖",
    "zhěng,chéng,zhèng": "氶",
    "yǐng,chéng,yíng": "浧",
    "jìng": "瀞竟静敬镜竞径境痉靖獍弪婧胫迳俓傹妌婙弳徑梷桱曔浄痙竸競竫莖誩踁脛逕鏡靚靜鵛",
    "chēng,chèng": "牚竀",
    "dīng": "盯虰叮玎疔仃耵帄靪",
    "nǐng,chēng": "矃",
    "zhēng": "脀鏳睁争征怔狰蒸峥凧铮筝佂崝姃媜徰崢炡爭眐烝猙篜癥睜聇踭箏鬇錚鉦",
    "cū": "觕粗麁麄麤",
    "tàng,tāng": "趟铴",
    "lèng": "踜倰",
    "yǐng": "郢頴颕影颖瘿颍巊廮摬梬潁矨癭穎鐛",
    "xǐng": "醒擤",
    "qiāng,chēng": "鎗",
    "chī": "吃痴媸哧蚩鸱眵螭魑笞嗤喫噄妛彨彲摛攡瓻癡瞝粚胵訵鵄鴟黐齝殦",
    "dǎng": "黨党谠攩欓譡讜",
    "chǐ": "耻侈齿豉褫卶叺呎垑恥歯肔胣蚇裭鉹齒伬",
    "chí,shi": "匙",
    "dǐ,chí": "坻柢",
    "yǐ,chì": "佁",
    "hǔ,chí": "俿",
    "jí": "卙堲伋及急即极级吉汲嫉棘辑籍集疾戢笈蒺瘠佶楫蕺殛岌亼偮卽叝塉姞嶯彶忣愱揤槉極檝湒潗皍箿級膌艥蕀蝍螏襋觙谻蹐躤踖轚輯郆銡鍓鏶雧霵齎亽",
    "xì": "呬阋鬩墍縘舃舄虩细隙饩禊係匸卌屃屭忥怬恄椞潟澙熂犔磶綌绤細蕮衋覤赩趇郤釳隟霼餼黖屓",
    "qì,zhī": "呮",
    "xiào": "啸嘨嘯歗笑效哮孝俲効傚嘋咲斅斆涍熽詨誟",
    "xǐ": "喜矖鉨鉩徙葸屣玺禧蓰壐憙枲橲歖漇璽縰葈蟢謑蹝躧鈢鱚",
    "jiào,qiào,chī": "噭",
    "dǐ": "坘軧抵邸诋骶砥厎呧弤拞掋牴菧觝詆阺鯳",
    "xiè,tì": "屟",
    "dī": "岻低滴堤羝仾啲埞彽樀磾袛趆隄鞮秪",
    "shē,chǐ,zhà": "奓",
    "tí,chí": "徲鶙鶗",
    "dì,chì": "慸",
    "tā,jiě": "她",
    "tuō,chǐ,yǐ": "扡",
    "tái": "抬骀炱跆鲐儓坮邰嬯薹擡炲檯籉臺颱鮐",
    "tuō": "拕拖鮵咜脫脱托侂咃汑莌袥託讬飥饦魠",
    "yí,chǐ,hài": "拸",
    "huò,chì": "捇",
    "chuāi": "搋",
    "tí,dī,dǐ": "提",
    "chū": "摴出初樗岀榋貙齣",
    "lí,chī": "樆",
    "chǐ,chuài": "欼",
    "zhì,chí": "歭",
    "nǐ,chì": "柅",
    "pìn": "汖聘牝",
    "yí,chí": "沶",
    "tuó": "沱驮酡橐詑陀驼跎坨佗鸵鼍堶岮砣槖砤碢紽阤陁駞騨驒驝駝鮀鴕鼉鼧",
    "zhī": "泜胝鳷隻祗支汁胑肢之芝蜘脂栀卮倁巵搘椥梔榰疷祬秓稙綕蘵衼鴲鼅",
    "zhì": "治滞滯痓騺陟挃窒至郅鯯雉忮穉寘璏鷙鸷制稚质炙痔志挚掷致置帜秩智帙桎蛭觯膣彘踬轾痣骘俧贽豸偫栉儨劕垁娡庢庤廌徏徝幟懥懫旘晊摯梽擲櫍洷櫛滍潌瀄狾熫猘瓆礩祑秷稺紩緻翐芖袠袟覟觗製豑觶貭豒誌跱質贄輊銍鋕躓铚鑕锧隲駤驇鴙騭",
    "zhí": "淔樴直职植侄执值摭絷踯埴跖値嬂執姪戠漐禃縶聀膱蟙職蹠軄釞躑馽",
    "yí,quán,chí": "狋",
    "zhì,chì": "瘈",
    "yí,chì": "眙",
    "zhǐ,qí": "祇",
    "yí": "移謻詒嶷螔饴遗遺洟鮧鴺咦仪姨胰沂宜彝颐夷痍怡圯贻侇冝儀匜宧宐寲峓嶬巸彜彛彞恞扅暆栘椬椸熪瓵簃籎羠萓蛦觺貽跠迻鏔頉頥顊頤",
    "chī,zhǐ": "絺",
    "sì,chí": "耛",
    "tái,chí": "箈",
    "xìn": "脪顖孞衅囟伩炘焮舋訫釁阠",
    "lì": "莉厲脷力立例利历砾傈荔俐痢粒吏沥栗励厉笠坜苈蜊粝呖枥砺篥猁疬溧戾唳轹詈俪雳莅蛎儮凓儷厤勵叓唎囇塛嚦厯娳壢婯岦屴悧悷搮慄暦曞朸栃栛曆檪櫔欐櫪歴沴歷涖濿瀝犡珕爏瑮瓑瓥癧盭瓅砅磿礫礰秝禲礪糲茘蒚蒞藶蛠蚸蜧蝷蠇蠣赲讈轣轢酈鉝靋靂鬁鴗鳨鷅麜浰睙",
    "qí": "芪萕祈棋璂萁蕲蘄褀鄿騎骑頎颀祁歧畦脐崎旗祺骐岐鳍蛴綦亓琪麒蜞琦淇剘埼岓嵜愭掑斉斊旂棊檱櫀濝猉玂疧碕碁禥簱簯籏粸竒綥肵艩藄臍蚑蜝蚚螧蠐軝錡锜釮騹騏鬿鬐鯕鲯鰭鵸麡鶀陭",
    "tái,zhī,chí": "菭",
    "chǐ,nuǒ": "袲",
    "chǐ,qǐ,duǒ,nuǒ": "袳",
    "èr": "誀二贰刵咡弍樲弐貮貳髶",
    "yí,chǐ,chì": "誃",
    "shé,yí": "蛇",
    "chī,lài": "誺",
    "xuè": "趐谑瞲坹岤桖瀥狘謔",
    "qū": "趍詘诎坥蛆屈鶌呿敺佉驱躯祛麴黢蛐伹岖匤抾岴憈嶇浀筁粬胠袪阹駆駈軀髷驅魼鰸鱋麹麯煀",
    "tuò": "跅嶞唾柝箨毤毻籜萚蘀",
    "dài,duò,duō,chí": "跢",
    "dié": "跮迭碟谍叠牒蝶瓞鲽堞耋垤蹀峌幉恎惵戜曡殜氎牃畳疂疉疊絰绖胅耊艓苵蜨褋詄諜镻鰈鴩",
    "xué": "踅學学穴澩泶乴峃嶨斈燢茓袕鷽鸴",
    "zhì,lì": "迣",
    "lí,chí": "邌",
    "chì,lì": "銐",
    "shì": "飾餝饰澨適市适示是事室试式士拭誓柿逝势世嗜噬仕释侍恃视铈舐轼贳筮弑亊丗谥冟卋勢呩奭嬕弒恀戺揓昰枾栻烒煶眎眡眂礻睗簭舓襫觢視試諡謚貰軾遾釈鈰鉃釋鉽餙鰘",
    "lài": "鵣癩癞赖濑籁赉唻睐瀬瀨籟睞藾賚賴顂頼",
    chi: "麶",
    "zhòng,chóng": "重",
    "chōng,chòng": "冲",
    "chóng": "虫崇崈爞褈蟲蝩隀",
    "chǒng": "宠寵",
    "chōng": "充艟舂忡憧茺嘃憃摏沖浺珫罿翀蹖衝",
    "yǒng,chōng": "涌",
    "zhǒng,zhòng,chóng": "种",
    "chòng": "铳銃",
    "zhòng,tóng": "偅",
    "zhǒng,chuáng": "喠",
    "yōng": "傭壅拥雍痈臃庸慵墉鳙邕饔嗈镛嫞廱擁滽灉牅癕癰郺鄘雝鏞鷛鱅",
    "chǒng,shǎng": "埫",
    "chòng,dǒng": "揰",
    "tóng,zhuàng": "僮",
    "zhǒng,chōng": "徸",
    "zhuāng": "樁庄装桩妆娤庒梉妝糚粧荘莊裝",
    "chóng,zhuàng": "漴",
    "tóng": "潼酮膧峝桐詷铜童彤瞳茼砼仝哃峂佟庝晍曈氃浵獞犝眮秱粡蚒赨鉖鉵餇鮦鲖銅",
    "zhú": "烛蓫逐笁逫爥燭蠾舳竹瘃躅劚曯欘斸灟炢笜茿蠋钃鱁",
    "téng,chóng": "痋",
    "zhòng": "祌众仲堹妕媑狆筗茽眾蚛衶諥衆",
    "chóng,zhòng": "緟",
    "zhōng": "盅蹱蜙泈钟忠终衷伀舯刣妐螽锺幒彸柊汷炂籦蔠終螤衳鈡鴤鼨鐘鍾",
    "zhǒng,zhòng": "種",
    "jiǎn": "茧减检剪简捡俭硷柬拣碱翦枧趼戬谫笕蹇謇裥睑锏倹儉堿彅弿戩挸揀撿梘検檢減湕瀽瑐瞼礆筧簡絸繭藆蠒襉襺襇詃譾謭鐗鐧鬋鰎鹸鹻鹼",
    "chōu": "抽瘳犫犨篘",
    "chóu": "愁稠绸酬筹畴踌俦惆雠儔嬦懤栦燽皗絒疇籌綢菗讐讎詶酧躊醻雔雦",
    "chòu,xiù": "臭",
    "chóu,qiú": "仇",
    "chǒu": "瞅丑丒吜杽矁醜魗",
    "chóu,dào": "帱幬",
    "hào": "侴暠浩澔耗昊颢灏皓傐哠恏昦暤晧暭曍淏灝皜皞皡皥聕薃號鄗鰝顥",
    "chǒu,qiào": "偢",
    "zhōu,chóu": "嚋盩诪",
    "zhōu,chōu": "婤",
    "zhèn": "圳甽震鎭镇鎮阵振朕赈鸩塦挋栚眹紖絼纼誫賑鋴陣鴆",
    "zhóu": "妯碡",
    "kuì": "媿膭謉嘳喟蕢愧馈愦聩篑嬇憒籄簣聵聭餽饋",
    "yóu,chóu": "怞",
    "zōu,zhōu,chōu": "掫",
    "niǔ": "扭鈕钮纽狃忸炄莥靵紐",
    "chōu,zǒu": "搊",
    "dǎo": "擣岛导祷蹈捣壔導嶋嶌嶹島搗槝禂禱陦隝隯",
    "yú": "揄踰窬逾乻旕臾齵褕余亐于伃謣雩魣餘馀鱼渔愚虞娱舆盂渝榆隅嵛妤觎舁谀瑜竽欤萸腴狳蝓偊堣堬娯嬩娛崳嵎扵旟楡楰歈歶歟湡澞漁牏玙玗璵睮籅羭艅茰萮蕍蘛虶螸衧諛覦轝輿邘酑鍝雓騟骬髃鮽鯲鰅魚鷠鸆",
    "niǔ,chǒu": "杻",
    "chóu,zhòu,diāo": "椆",
    "chóu,táo,dǎo": "檮",
    "chòu": "殠臰遚",
    "yòu,chōu": "牰",
    "zhì,chóu,shì": "畤",
    "dié,tì": "眣",
    "chōu,chóu": "紬",
    "chóu,zhòu": "薵",
    "chóu,dāo": "裯",
    "shū,chōu": "跾",
    "qiú,chōu": "醔",
    "chou,dài": "鮘",
    "tiáo": "鯈蜩髫笤萔龆鲦迢岧岹樤祒芀蓚蓨鋚鎥鞗齠鰷",
    "chǔ,chù": "处",
    "chú": "锄除橱滁厨躇雏刍蹰蜍幮廚櫉櫥犓篨耡蒢蒭芻蟵豠趎鉏躕鋤鶵雛",
    "chù": "触搐矗怵亍绌憷黜傗儊斶歜珿竌絀臅觸豖鄐閦",
    "chǔ": "楚础储杵楮儲椘檚濋礎璴禇處齭齼",
    "xù,chù": "畜慉",
    "chù,tì": "俶",
    "chù,chǔ": "処",
    "chù,tòu": "埱",
    "chú,zòu": "媰",
    "chù,xù,shòu": "嘼",
    "zhù,chú": "助",
    "zhù": "拀祝乼簗杼紵注住贮铸驻柱伫蛀翥苎箸炷疰壴佇墸坾嵀樦柷殶眝竚祩筯篫紸纻羜莇註跓鉒貯軴鋳鑄馵駐",
    "hù,chū": "摢",
    "chù,shōu": "敊",
    "xù": "槒絮勖聓卹昫煦蓄续叙婿旭绪序酗恤蓿洫溆伵侐勗垿壻敍朂敘欰殈汿沀潊烅漵烼獝珬盢瞁稸続緖聟續緒藚訹賉頊鱮",
    "níng": "柠凝狞咛儜聍嬣嚀橣檸獰聹鑏薴鬡鸋",
    "cū,chu": "橻",
    "lǜ,chū": "櫖",
    "chù,qù,xì": "欪",
    "chù,xù": "滀",
    "shū": "淑琡樞菽摅攄书输叔梳疏蔬枢抒殊纾舒姝毹殳倏儵倐婌掓書毺瀭焂疎綀紓軗踈輸鄃陎鮛鵨",
    "zhuō,chù": "炪",
    "liú": "硫蟉鏐镠流留刘瘤榴琉鎏镏浏旒骝嚠劉媹嵧旈橊瑠璢畱畄瀏瑬疁癅蒥蓅裗鐂飀飗駠駵飅驑騮鶹鰡鹠麍",
    "chù,qì": "竐",
    "qù,chú": "耝",
    "zōu,chù": "菆",
    "zhù,zhuó,zhe": "著",
    "zhū": "蕏蠩諸诸跦侏猪株珠蛛诛潴洙茱橥铢邾槠櫫櫧瀦硃秼絑蝫袾誅豬銖駯鮢鯺鴸鼄",
    "zhū,chú": "藸",
    "zhǔ": "褚鸀丶帾陼燝主煮嘱拄瞩渚麈劯宔囑濐煑矚罜詝",
    "chù,jí": "諔",
    "chuò": "踀龊辍娖嚽擉歠涰磭辵輟酫辶鑡齪餟",
    "xū": "歘許需戌鑐燸裇蝑綇虚须墟顼胥盱偦媭嬃楈欨歔疞縃蕦虗訏虛諝譃谞驉須鬚魆魖",
    "cuō,zuǒ": "撮",
    "xū,chuā": "欻",
    "chuǎi,chuài,chuāi,tuán,zhuī": "揣",
    "chuài": "膪踹",
    "chuò,chuài": "啜",
    "zuō": "嘬穝",
    "chuí": "腄垂锤棰槌倕埀捶搥桘陲菙箠錘顀鎚",
    "chuái": "膗",
    "chuán": "船椽遄舡剶暷篅舩輲",
    "chuān": "穿川氚巛瑏",
    "chuán,zhuàn": "传傳",
    "chuǎn": "喘舛僢堾荈踳",
    "chuàn": "串钏汌玔賗釧",
    "chuán,chuí": "圌",
    "zhuì": "惴缀綴腏錣坠赘缒甀礈畷諈膇墜縋醊贅鑆",
    "yuàn": "掾瑗苑院愿怨噮妴禐衏裫褑願",
    "chuàn,chuān": "猭",
    "zhuān": "甎叀鱄磗專嫥磚专砖専颛瑼蟤諯鄟顓",
    "chuǎn,chuán": "歂",
    "zhuān,chuán,chún,zhuǎn": "膞",
    "chuàn,zhì": "鶨",
    "cuān": "镩蹿汆撺攛躥鑹",
    "chuáng": "床噇牀",
    "chuāng": "窗疮刅摐牎牕瘡窻窓",
    "chuáng,zhuàng": "幢",
    "chuàng": "怆刱剙剏愴",
    "chuàng,chuāng": "创創",
    "cōng": "囪囱葱蔥匆聪璁苁骢忩悤怱暰樬漗瑽篵瞛繱聡聦茐聰蟌蓯騘驄鏦鍯鏓",
    "tóng,chuáng": "朣橦",
    "shuǎng": "漺爽塽慡縔鏯",
    "chuī": "吹炊龡",
    "zhuī,chuí": "椎",
    "chuò,chuì": "惙",
    "yóu": "郵莜游尢猶由油铀尤犹邮疣蚰鱿猷莸蝣偤庮怣沋秞肬訧蕕輏輶逰遊鈾駀鮋鲉魷",
    "duǒ": "鬌朵躲哚亸缍嚲埵崜朶綞趓躱軃",
    "tuí": "魋弚颓尵穨蘈蹪隤頽頹頺",
    "chūn": "春椿媋旾暙杶槆櫄橁蝽瑃箺萅輴鰆鶞",
    "chún": "唇纯醇莼鹑浱湻滣犉漘純脣蒓錞蓴陙鯙醕鶉",
    "chǔn": "蠢偆惷睶萶賰",
    "chún,zhūn": "淳",
    "qú,xù,chǔn": "朐",
    "shǔn,dùn": "楯",
    "dùn": "沌顿頓钝盾遁砘炖伅潡碷燉踲逇遯鈍",
    "zhūn,chún": "肫",
    "qú": "胊軥鴝鸜鸲爠籧蘧欔蠼蕖磲劬癯衢璩氍佢戵斪欋淭璖灈絇菃臞葋蟝蠷衐鑺躣鼩",
    "tún,chūn": "芚",
    "quán": "輇辁荃醛權蠸埢踡蜷啳权拳全颧泉痊筌诠鬈姾铨峑巏搼佺権洤湶楾牷犈硂縓葲觠瑔跧闎銓詮駩顴鰁騡鳈齤",
    "chuō": "戳踔逴",
    "cù": "促簇蔟醋猝蹙蹴媨憱瘄瘯縬脨誎趗踧蹵顣鼀踿",
    "chuò,lài": "娕",
    "xuè,chuò,jué": "吷",
    "chuò,nào": "婥",
    "ruò,chuò": "婼",
    "zhú,chuò": "孎",
    "zhuó": "斫謶镯鐲啄劅茁灼浊卓酌诼擢丵浞圴妰撯娺禚斮擆斵斱晫椓烵斲琸濁硺籗窡籱罬蠗蠿諁鵫鷟諑",
    "nào,chuò,zhuō": "淖",
    "yuē,yào,chuò": "箹",
    "duó": "踱剫夺奪铎凙痥鈬鐸",
    "zhuó,chuò": "鋜",
    "zú,chuò": "鏃",
    "zú": "镞族卆踤崪足哫箤",
    "cǐ": "此佌泚皉",
    "cì": "次赐刾佽庛朿栨絘茦莿蛓螆賜",
    "cí": "词瓷雌磁辞茨慈鹚祠糍垐嬨柌濨珁礠甆詞辤辝飺餈辭鶿鴜鷀",
    "cì,cī": "刺",
    "sì,cì": "伺",
    "cī": "疵偨蠀趀骴髊齹",
    "zī,cī": "呲",
    "zī,cí": "兹粢",
    "zǐ,cī": "呰",
    "zǐ,cǐ": "啙",
    "sī": "司纟斯撕丝私嘶蛳锶鸶咝厮缌俬澌凘噝媤恖廝楒泀燍禠禗絲糹罳緦蕬虒蜤蟴螄蟖鉰銯鐁颸鍶飔騦鼶鷥",
    "cuó": "嵳嵯蔖鹾痤矬蒫虘鹺",
    "sì,tái": "枱",
    "sè": "栜色涩瑟啬铯嗇穑懎擌歮渋澁濏濇澀瀒瘷璱穯繬穡譅轖鏼銫飋",
    "cuò": "措錯错挫厝锉剒剉夎莝蓌莡逪銼",
    "cī,cǐ": "玼跐",
    "cī,cuò,suǒ": "縒",
    "zì": "胔渍漬荢字自恣倳剚眦牸胾眥茡",
    "cí,zī": "薋",
    "jì,qí": "薺伎",
    "háo": "蚝獔嚎豪毫壕嗥濠儫嘷噑椃獆竓籇蠔譹毜",
    "jì": "荠茤魥既记计季寄际绩迹蓟技冀剂悸寂忌妓继洎鲚鲫稷暨跽霁髻骥觊芰兾剤勣劑坖垍廭彑徛惎懻旣暩旡曁梞檵檕漃漈瀱痵癠禝穄穊稩穧紀継繋繼績罽臮茍葪蔇薊蘮蘎蘻裚襀覬誋計記跡蹟際霽鬾魝驥鯚鰶鰿鱀鯽鱭鵋鷑齌塈",
    "cǐ,jì": "鮆",
    zi: "嗭",
    "cóng,zòng": "从從",
    "cóng": "丛琮淙婃叢孮従徖悰樷欉灇爜藂誴賨賩徔錝",
    "cōng,zōng": "枞樅",
    "zǒng": "偬燪総緫總总捴倊傯嵸惣搃摠縂蓗",
    "cōng,sōng": "棇",
    "sǒng,cōng": "楤",
    "còng": "憁謥",
    "cóng,sǒng": "漎",
    "cóng,zǒng": "潀",
    "cóng,zōng": "潈",
    "zǒng,cōng": "焧",
    "cōng,zǒng": "熜",
    "cōng,zòng": "潨",
    "zòng": "縦糭粽昮猔瘲疭糉",
    "zòng,zǒng": "縱纵",
    "zòng,cóng": "碂",
    "còu,zòu": "楱",
    "còu": "辏凑腠湊輳",
    "zòu": "奏揍",
    "sǒu": "薮藪叟瞍傁螋叜嗾櫢",
    "qū,cù": "趋趨",
    "qù,cù": "趣",
    "zú,cù": "卒",
    "cú": "徂殂",
    "zuò": "酢唑葃做作坐座祚胙侳岝岞糳阼葄袏蓙",
    "qiě,jū": "且",
    "cū,jù,zū": "怚",
    "cù,zā,hé": "噈",
    "zuó": "捽莋昨秨稓筰鈼",
    "zhā,cǔ": "皻",
    "lù": "蔍逯樚輅辂穋僇陆陸录路鹿戮赂潞禄麓渌簏辘漉璐鹭侓勎勠塶坴圥峍廘娽彔摝椂淕淥琭甪盝睩硉稑祿簶箓簬籙簵粶菉蕗螰虂踛賂蹗轆醁趢錄録錴鏴騄騼鯥鴼鵦鵱鷺",
    "qiū": "趥萩秋丘邱楸蚯鳅丠坵媝恘秌穐篍緧蘒蝵蟗蠤鞦鞧鰌鰍鶖鹙龝恷",
    "wěi": "踓嶉伪僞偽蒍煒屗骩骪骫伟纬萎苇艉鲔娓玮诿洧猥韪痿炜儰偉寪崣徫愇捤暐梶浘渨瑋腲芛緯荱蔿葦諉鍡韑頠韡韙颹鮪",
    "cuàn": "窜篡爨殩熶簒竄",
    "zhù,cū": "麆",
    "zǔn": "僔撙譐",
    "cuán": "巑櫕欑",
    "zǎn,cuán": "攒攢",
    "xīn": "昕廞鈊忄訢新心欣薪锌辛忻歆馨鑫俽噺妡嬜惞杺盺邤鋅馫",
    "zàn,cuán": "濽灒",
    "kuǎn,cuàn": "窾窽",
    "zhuàn,zuàn,suǎn": "篹",
    "cuán,zàn": "穳",
    "juān,jiān,cuān": "鋑",
    "cuī": "催崔摧榱凗墔慛磪脺鏙嵟",
    "cuì": "脆淬翠瘁悴粹萃毳伜啛忰焠疩竁紣綷翆粋脃膬臎膵顇襊",
    "shuāi,cuī": "衰",
    "cuì,qi": "啐",
    "cuǐ": "璀皠趡",
    "cuì,zú": "倅",
    "zú,cuì": "崒椊",
    "cuī,zhǐ": "槯",
    "suī,cuǐ": "熣",
    "cuǐ,cuī": "漼",
    "cuì,sè": "琗",
    "cuì,zuǐ": "濢",
    "cuī,suī,shuāi": "縗缞",
    "suì": "繀韢岁碎穗遂隧祟谇邃亗嵗嬘檖旞燧歳歲澻煫璲砕穂禭穟繐繸襚譢誶賥鐆鐩",
    "cùn": "寸籿",
    "cún": "存壿",
    "dūn": "蹲吨墩礅噸墪惇撉撴犜獤蜳蹾驐",
    "cún,jiàn": "侟",
    "cǔn": "忖刌",
    "dòu,cùn": "吋",
    "zūn,dūn": "墫",
    "cún,zùn": "拵",
    "jiàn": "洊件键贱箭建健荐剑涧鉴践舰饯牮谏腱毽楗踺俴僭剣剱劎劒劔劍墹寋徤擶旔澗珔瞷礀磵繝糋臶艦薦覸諓諫賎趝轞賤踐鍳鍵鐱鑑鑬鑒鑳餞譛",
    "cūn,cún": "澊",
    "jùn,xùn": "浚濬",
    "zhuī,cuī,wéi": "隹",
    "qūn": "踆囷夋逡",
    "cuǒ": "脞",
    "jī,cuò": "庴",
    "què": "棤搉却卻闋阕琷塙确鹊崅榷悫愨燩慤皵礭確鵲",
    "zuì": "最酻冣蕞槜錊醉罪嶵晬栬檇檌祽絊辠酔",
    "yíng": "營謍瀅熒鎣营迎蝇赢盈莹荧萤楹萦蓥茔滢潆嬴瀛僌営塋攍櫿溁溋濙濚濴瀯灐灜瀠盁籝籯縈萾藀蛍蝿螢蠅贏禜",
    "cuó,zhuài": "睉",
    "zé,zuò,zhǎ,cuò": "諎",
    "dà,dài,tài": "大",
    "dǎ,dá": "打",
    "dā": "搭哒耷褡咑噠墶撘鎝",
    "dá,da": "瘩",
    "dá,dā": "答",
    "dá": "笪达怛靼妲匒鞑垯炟燵畣羍荅荙薘蟽跶詚迏迖逹鐽達龖龘韃迚",
    "tǎ": "塔鮙鰨鳎獭墖獺",
    "dǎn": "疸胆赕刐伔撢玬瓭紞膽衴黕賧",
    "tà,dá": "沓",
    "tà,dā": "嗒",
    "dá,zhá": "剳",
    "dà": "亣眔",
    "dá,dàn": "呾",
    "tà": "搨橽躂踏挞蹋榻遢闼嚃嚺崉毾涾撻澾濌禢誻譶躢蹹錔闒阘遝鞳鞜闥粏",
    "tài,dà": "汏",
    "dá,tǎ": "溚",
    "dá,fú": "畗",
    "dā,xiá,nà": "笚",
    da: "繨",
    "tā": "塌趿鉈他它溻榙牠祂褟闧",
    "zhā": "觰渣哳偧揸抯齄挓摣樝皶譇齇",
    "dā,tà": "鎉",
    "dài": "带代戴逮袋贷怠殆迨玳岱甙黛绐埭侢垈帒帯廗叇曃帶柋瀻瑇簤緿艜紿蝳蹛軑軚軩轪襶霴靆鴏黱",
    "dài,dāi": "待",
    "dǎi": "歹傣",
    "dē,dēi": "嘚",
    "dú,dài": "毒",
    "guǎi,dài": "箉",
    "dì,dài,tì": "棣",
    "dài,dé": "蚮",
    "yí,dài": "诒",
    "dài,tè": "貸",
    "lì,dài": "隶隷隸",
    "tuó,duò": "駄馱沲媠柁",
    "tái,dài": "駘",
    "dàn,tán": "弹澹嘾弾彈",
    "dān,dàn,dǎn": "担",
    "dàn,dān": "瘅癉",
    "shí,dàn": "石",
    "jǐng": "丼頸澋井警肼阱刭憬儆坓剄宑幜暻汬汫璄璟璥穽蟼頚殌",
    "dān,dàn": "儋擔",
    "rǎn": "冄冉染苒媣姌珃蒅",
    "tán,tàn": "倓埮",
    "dàn,xián,yán": "唌",
    "tán": "坛壇潭燂檀顃谈痰谭锬郯昙墵壜婒墰憛榃曇罈罎藫談譚貚醰錟譠",
    "xiàn": "娊錎糮橌橺涀塪餡馅霰獻莧苋限线现献陷腺宪羡岘僩僴哯垷姭峴撊憲晛瀗現県睍粯絤綫線缐臔羨臽誢豏鋧陥麲鼸",
    "tán,dàn": "惔醈",
    "dǎn,shěn": "抌",
    "kǎn,qiàn": "欿",
    "yán": "檐蜒欕炏啱喦嵒炎顔颜沿盐言严岩延阎筵闫妍厳塩壛嚴壧娫姸娮嵓巌巖巗揅昖楌櫩狿琂碞簷莚蔅虤訁訮詽讠郔閆閻顏麣鹽",
    "gǎn": "澸赶感敢秆擀澉橄皯桿稈衦芉趕鱤鳡",
    "zhāo,zhǎn,dǎn": "皽",
    "shān,dàn": "膻",
    "dǎn,zhǎn": "黵",
    "dàn,shèn": "黮",
    "rén": "亻人仁壬忈忎朲秂芢魜鵀",
    "dāng,dàng": "当儅闣",
    "dǎng,dàng": "挡擋",
    "dàng": "荡档宕菪凼砀圵垱壋檔氹璗瓽瞊礑碭盪簜蘯蕩趤逿雼",
    "tǎng,dàng": "偒",
    "dāng": "裆噹澢珰璫筜簹艡蟷襠",
    "dàng,yáng": "婸",
    "yáng,dàng": "崵",
    "dàng,táng": "嵣",
    "dàng,shāng,táng,yáng": "愓",
    "dàng,xiàng": "潒",
    "dǎng,tǎng": "灙",
    "tàng": "烫燙摥鐋",
    "yáng": "瘍劷洋鴹扬杨阳佯疡炀徉蛘垟崸敭旸昜揚暘楊珜眻諹輰鍚钖阦陽霷鰑颺飏鸉",
    "dāng,dàng,dǎng": "當",
    "dào": "到道盗稻悼纛焘噵椡檤瓙燾稲盜翿菿衟軇衜艔",
    "dǎo,dào": "倒",
    "tāo,dāo": "叨",
    "shòu": "受瘦授兽售寿狩夀绶壽獣痩獸膄綬",
    "jiào,dǎo": "嘄",
    "zhōu,zhāo,tiào": "啁",
    "bǎo,shí": "宲",
    "huì": "屶絵繪绘嬒汇惠晦慧秽贿讳卉诲烩彗蕙喙恚蟪荟僡嘒匯嚖圚寭屷彚彙恵憓懳徻暳槥橞檅櫘泋滙潓獩燴璤瞺篲穢翙翽蔧薉薈詯誨諱譓譿賄鐬闠阓靧頮顪餯颒",
    "dáo": "捯",
    "tè": "特忑慝",
    "dāo,tiáo,mù": "朷",
    "táo": "洮陶逃桃淘萄鼗啕咷祹綯蜪裪绹迯醄鋾鞉鞀饀騊駣",
    "zhào,dào": "箌",
    "tiào,diào,dào": "絩",
    "dào,zhōu": "翢",
    "diāo": "虭雕刁碉叼鲷凋貂奝刟弴彫汈琱簓蛁錭鯛鮉鼦鵰",
    "niǎo,diǎo": "鳥",
    "niǎo": "鸟茑嬲嫋嬝蔦袅裊褭",
    "dí,dì,de": "的",
    "dì,de": "地",
    "dé,děi,de": "得",
    "dé": "德徳锝恴悳惪淂鍀",
    "dǐ,de": "底",
    "dé,zhé": "棏",
    "dēng": "登灯蹬嬁噔璒竳燈艠豋簦",
    "diè,dì": "哋",
    "dèn": "扥扽",
    "děng": "等戥",
    "dèng": "邓瞪凳磴镫嶝墱櫈覴鄧隥鐙",
    "dí": "敌涤嫡笛迪狄觌嘀荻镝籴唙啇嚁廸敵梑滌糴苖蔋藡覿蔐豴蹢靮頔馰髢鸐",
    "dì,tì,tuí": "弟",
    "dí,zhái": "翟",
    "dī,dǐ": "氐",
    "yù": "儥硲蜮魊鬻潏妪嫗粖肀醧遇豫鷸鹬諭谕艈熨茟御籲芌芋雤育欲愈狱玉誉域郁喻峪寓浴裕驭预鹆阈蓣煜钰聿昱燠饫毓俼喅喩堉嶎庽彧慾戫棛棜棫櫲欎欝淯滪澦灪焴燏爩獄琙癒瘉砡硢礇礖礜秗稢稶禦篽緎籞罭蒮蓹薁蘌蕷蜟袬譽軉輍逳遹鋊錥鈺鐭霱閾預饇飫驈馭鬰鬱鱊鳿鴥鴧鴪鵒鸒龥",
    "sháo": "勺芍韶玿",
    "dì,làn": "坔",
    "dì,fáng": "埅",
    "zhì,dì": "墆疐",
    "dì,tí": "媂珶苐遆",
    "dī,tì": "奃",
    "dié,dì": "嵽",
    "diào": "弔魡掉钓吊铞伄瘹窎窵竨訋釣鋽銱鑃鈟雿盄",
    "diǎo,dí,yuē,lì": "扚",
    "tì,dì": "揥",
    "dì,tú,zhí": "摕",
    "dì,dí,de": "旳",
    "dì,duò": "杕枤",
    "dì,dǐ,shì": "楴",
    "yōu,dí": "浟",
    "tí,dī,dì": "渧",
    "tí,dī": "碮",
    "zhú,dí": "篴",
    "yuē,yāo": "約约",
    "dǐ,zhì": "聜",
    "diào,tiáo,dí": "蓧",
    "diào,zhuó": "藋",
    "shì,dì": "諟",
    "tí": "蹏蹄題题罤媞禵褆謕鷤啼鹈缇偍厗嗁崹漽瑅稊蕛緹趧鍗騠鮷鯷鳀鵜睼",
    "dí,dī": "鏑",
    "dì,dài": "釱",
    "tì": "鬄倜笹剃替涕嚏惕屉逖悌嚔悐惖戻掦歒殢屜瓋籊薙褅逷髰鬀朑",
    "diǎ": "嗲",
    "diàn": "电店殿淀垫惦靛奠坫阽簟玷癜壂墊婝扂橂琔澱磹蜔鈿電驔",
    "diān": "颠掂滇巅傎癫厧嵮巓敁巔槇攧癲蹎顚顛齻",
    "diàn,tián": "佃钿",
    "diàn,tián,shèng": "甸",
    "niàn": "唸埝念廿卄艌惗",
    "niān": "拈蔫",
    "tán,diàn": "橝",
    "diān,zhěn,zhēn": "槙",
    "xián": "湺涎諴醎鹹輱藖闲嫌弦衔咸贤舷痫娴鹇啣娹婱嫺嫻挦撏澖甉癇癎絃胘蛝蚿衘誸贒賢鑦銜閑鷴鷼麙鷳",
    "tiǎn,diàn": "痶",
    "rèn": "腍认刃韧妊纫饪轫仭衽刄姙屻仞扨牣紝絍纴紉肕訒袵讱認鈓軔靱餁靭飪韌祍",
    "tíng": "蜓葶停亭庭廷莛霆婷嵉榳楟筳聤蝏諪邒鼮",
    "tiáo,diào,zhōu": "调",
    "diào,tiáo,yáo": "铫銚",
    "tiāo": "佻祧庣旫聎",
    "tiǎo": "嬥宨晀朓窱脁",
    "diǎo": "屌",
    "tiāo,tiǎo": "挑",
    "diāo,dōu": "瞗",
    "qì": "矵汽蟿泣气器弃迄讫憩汔碛葺咠唭噐夡憇暣棄欫気氣湇湆炁甈盵碶磜磧罊芞訖藒鐑",
    "tiào": "粜糶眺覜趒",
    "tiǎo,diào": "誂",
    "diào,tiáo": "調",
    "zhào": "赵趙櫂罩照兆肇诏垗笊旐曌枛燳狣罀瞾羄肁肈鮡詔",
    "tiào,táo": "跳",
    "yáo": "軺轺鱙窯顤姚滧爻摇窑谣遥瑶尧鳐珧肴徭倄傜嗂垚媱堯尭峣嶢嶤揺摿暚搖榣烑猺瑤磘窰蘨謡謠遙颻餆飖餚鰩邎",
    "biāo,diū": "颩",
    "diāo,zhāo": "鳭",
    "diē": "跌爹褺",
    "shé,dié,yè": "揲",
    "dié,xī": "咥",
    "yì,dié": "佚泆軼",
    "dié,zhá": "喋",
    "shà,jié,dié,tì": "啑",
    "tū,dié": "怢",
    "dié,shè": "挕",
    "dié,yì": "昳",
    "zhì,dié": "柣",
    "dié,yè": "楪",
    "shì,dié": "崼",
    "xí,dié": "槢",
    "xiè": "渫獬繲齛齥僁谢屑卸蟹泻懈械绁廨榭瀣亵榍邂薤燮伳躞偞偰卨噧塮媟夑屧徢暬洩澥灺炨炧瀉爕祄禼糏絏絬紲缷薢纈蠏褉謝褻韰齂齘靾",
    "dié,zhì": "眰螲",
    "dié,zhí": "臷",
    "dié,tú": "趃",
    "diǎn,tiē,dié": "跕",
    "tī": "踢鷉剔梯锑銻鷈",
    "tiě": "鐡鐵铁蛈鉄銕驖",
    "xiè,dié": "鞢",
    "dǐng": "顶鼎嵿艼薡鐤頂鼑",
    "dìng": "定订锭腚碇啶椗矴碠磸聢萣訂錠顁飣饤蝊",
    "dīng,zhēng": "丁",
    "dīng,dìng": "钉釘",
    "tǐng,dìng": "铤鋌",
    "tǐng,dīng": "町甼",
    "dīng,dǐng": "酊",
    "dìng,tìng": "忊",
    "dǐng,dīng,tiǎn": "奵",
    "zhěng,dìng": "掟",
    "dǐng,tìng": "濎",
    "tīng": "汀烃烴听厅厛庁廰廳綎耓聴聼聽鞓",
    "diū": "铥丟銩丢",
    "dōng": "东冬鸫氡岽倲咚埬崬昸東氭涷笗苳菄蝀鮗鯟鶫鼕鶇徚",
    "dòng": "动洞冻栋恫胨胴硐働凍動姛戙挏棟湩腖迵霘駧",
    "dǒng": "懂董嬞箽蕫諌",
    "dòng,tóng,tǒng": "侗",
    "tóng,dòng": "峒勭烔燑狪",
    "dòng,tóng": "垌",
    "tuǎn,dǒng": "墥",
    "dōng,dòng": "娻崠",
    "yǒng": "甬恿永蛹勇咏泳踊俑勈埇塎嵱彮怺惥愑愹悀柡栐湧慂詠踴鯒鲬",
    "tǒng": "筩筒捅桶统綂統",
    "tōng,tóng,dòng": "絧",
    "tòng": "衕痛恸憅慟",
    "zhǐ,zhōng": "夂",
    "dǒu,dòu": "斗",
    "dū,dōu": "都",
    "dòu": "豆逗痘窦斣梪浢脰竇荳酘郖閗餖饾鬥鬦鬪闘鬬鬭",
    "dǒu": "抖陡蚪乧鈄钭阧",
    "dú,dòu": "读渎瀆",
    "dōu": "兜篼蔸兠剅枓唗橷",
    "shù,dōu": "侸",
    "dú": "凟讀独犊椟牍黩髑匵嬻涜殰櫝犢牘瓄獨皾裻読讟豄贕錖鑟韇韣黷騳韥",
    "tóu": "投骰亠頭",
    "dòu,nuò": "毭",
    "lǘ": "氀膢驴榈闾櫚藘閭驢",
    "dōu,rú": "吺",
    "tōu,tù,dòu": "鋀",
    "dù,duó": "度",
    "dù": "渡杜镀蠹妒芏妬殬秺荰蠧螙鍍靯",
    "dù,dǔ": "肚",
    "dǔ": "赌睹堵笃琽篤覩賭",
    "dū": "督嘟厾醏",
    "dū,zhuó": "剢",
    "zhòu,zhuó": "噣",
    "yì,dù": "斁",
    "qǐ,dù": "晵",
    "shǔ,dǔ": "暏",
    "yì,zé,gāo": "睪",
    "zhú,dǔ": "竺",
    "shǔ": "襡襩蜀鼠黍薯暑曙署潻癙糬薥藷蠴鱪鱰鼡",
    "dū,shé": "闍阇",
    "duàn": "段断锻椴煅簖塅缎毈瑖斷籪腶緞葮躖碫鍛",
    "duǎn": "短",
    "duān": "端偳媏褍鍴",
    "zhì,duān": "剬",
    "tuàn": "彖褖",
    "duān,zhuān": "耑",
    "duì": "对队憝怼碓對対懟濧瀩祋綐薱譈譵陮轛",
    "duī": "堆镦垖塠痽磓鐜鐓鴭",
    "duì,ruì,yuè": "兑兊兌",
    "dūn,duì": "敦",
    "zhǔn": "埻凖準准",
    "duì,dùn,tūn": "憞",
    "shū,duì": "杸",
    "wěi,duì": "瀢濻",
    "ruì": "銳鋭锐枘瑞睿芮叡汭蚋蜹",
    "yǔn": "鈗阭允陨隕狁殒喗夽抎殞磒荺賱霣馻齫齳",
    "duì,zhuì": "隊",
    "duǐ": "頧",
    "zhuī,duī": "追",
    "dùn,tún": "囤庉",
    "dǔn": "趸盹躉",
    "jùn": "俊棞峻竣骏郡儁捃呁埈寯懏晙燇珺畯箟葰蜠餕馂陖駿鵔鵕鵘攟賐",
    "tún,zhūn,dùn": "忳",
    "tuí,dūn": "橔",
    "zhuàn": "腞襈譔撰馔饌赚僎篆堟灷瑑啭囀籑蒃",
    "tún": "豚蛌饨臀豘軘霕魨臋鲀黗飩",
    "duò": "舵剁跺惰刴墯尮憜挅桗跥陊陏飿饳鵽",
    "duǒ,duò": "垛垜挆",
    "duò,huī": "堕墮",
    "duó,zhà": "喥",
    "tuǒ": "嫷橢妥椭庹楕鰖鵎",
    "duó,duì": "敓敚",
    "duō,què": "敠敪",
    "yí,duò,lí": "柂",
    "zá": "杂砸沯襍雑雥韴雜",
    "duò,zuó,wù": "柮",
    "duǒ,chuán": "椯",
    "tuō,duó": "沰",
    "zhuì,chuí,duǒ": "硾",
    "nà": "貀郍纳钠衲捺肭笝納蒳豽軜鈉靹魶",
    "zé,shì": "澤泽啫",
    "huī,duò": "隓隳",
    "suí,duò": "隋",
    "ó,ò,é": "哦",
    "é": "额鹅俄讹峨娥锇莪囮峉峩涐珴皒睋磀訛譌誐迗鈋鋨頟額魤鵞鵝",
    "é,yǐ": "蛾",
    "è,wù,ě,wū": "恶惡",
    "ē": "婀屙妸妿",
    "yā,yà": "亞压壓铔",
    "gé": "佮輵格阁隔骼革塥镉嗝膈搿佫匌呄挌愅櫊滆槅臵觡轕諽閣鞷韐騔韚鮯",
    "yà": "亜亚垭埡齾轧冴覀讶砑娅氩迓俹揠劜圔圠婭椻犽氬稏聐襾訝",
    "kuǎ": "侉垮銙",
    "è,wù,wū": "僫",
    "é,huā": "吪",
    "yǎ": "唖雅痖厊庌瘂蕥",
    "hèng": "啈",
    "yǎ,yā": "哑啞",
    "ě": "噁砨騀鵈頋",
    "yàn,zá,niè": "囐",
    "è,yà": "姶",
    "ē,ě": "娿",
    "kē,è": "搕",
    "ě,è": "枙",
    "yā": "椏押圧鸭丫鸦桠孲庘枒錏鐚鴨鴉鵶",
    "luó": "玀罗锣骡箩螺萝逻椤脶镙儸猡攞欏籮羅腡覼蘿邏饠鑼鸁鏍騾驘",
    "wò": "硪渥握卧沃幄仴龌偓肟媉楃濣瓁瞃腛臥齷",
    "è,qì": "礘",
    "wù": "蘁鼿齀卼務霚霧勿婺痦阢杌物雾误悟务戊晤坞寤兀骛鋈鹜焐俉奦塢屼岉嵨忢悞悮扤溩熃矹窹粅誤隖靰騖鶩",
    "luò": "詻鵅駱骆珞洛荦雒摞峈犖笿纙洜",
    "xiǎ,kě": "閜",
    "è,yān": "閼",
    "gé,lì": "鬲鎘",
    "èn": "摁",
    "ēn": "蒽恩奀",
    "ň": "嗯",
    "ěn": "峎",
    "ēn,yūn": "煾",
    "ēng": "鞥",
    "wù,wú,ń": "唔",
    "ér": "而儿鲕鸸侕兒児峏栭洏粫胹袻輀荋轜陑隭髵鮞鴯",
    "ěr": "耳饵尔洱珥迩铒尒尓栮毦爾薾衈趰邇駬鉺餌",
    "èr,nài": "佴",
    "ér,wā": "唲",
    "rèn,ér": "杒梕",
    "rú": "濡渪邚嬬如儒茹蠕孺襦铷嚅颥侞帤曘薷桇筎繻蕠袽醹銣鱬顬鴑鴽蝡",
    "ér,nài": "耏",
    "ér,nǜ": "聏",
    "nào": "臑闹閙鬧",
    "ruǎn": "輭腝偄软阮朊瓀瑌礝軟碝",
    "réng": "陾",
    "fǎ": "法砝佱灋鍅峜",
    "fā,fà": "发",
    "fà": "珐琺蕟髪髮",
    "fá,fèi": "橃",
    "pō,fā": "醗醱",
    "fǎn": "反返仮橎",
    "fān": "翻帆藩幡勫嬏忛憣旛旙繙轓颿飜鱕",
    "fán,pó": "繁",
    "fù,fàn": "婏",
    "fǎn,fú": "払",
    "huān,fān": "犿",
    "fán,pán": "膰",
    "pán": "蟠縏蹒蹣盘磐爿媻幋槃洀瀊盤蒰鎜鞶丬",
    "pàn": "袢盼肨判畔叛胖襻泮冸沜溿炍牉詊鋬鑻頖鵥聁",
    "fàn,guǐ": "軓",
    "dào,biān": "辺",
    "quǎn": "犭犬绻畎烇綣虇",
    "fàng": "放",
    "fáng": "防房肪妨鲂魴",
    "fāng": "芳方钫邡匚堏淓牥錺鈁鴋",
    "fāng,fáng": "坊",
    "páng,fǎng": "彷",
    "fāng,pāng": "汸",
    "fāng,fàng,páng": "趽",
    "pāng": "雱乓滂胮膖霶",
    "féi": "肥腓淝蜰",
    "fěi": "匪诽篚悱翡榧奜棐蕜誹",
    "fēi,fěi": "菲",
    "fēi,pèi": "妃",
    "fěi,fēi": "斐",
    "fèi,fú": "芾",
    "fèi,féi": "痱疿",
    "fěi,kū": "朏胐",
    "shì,fèi": "柹",
    "fén,fèn,fèi": "橨",
    "fú,fèi": "笰砩",
    "zǐ,fèi": "胏",
    "péi": "裵裴錇锫陪赔培毰阫賠",
    "fèn": "奋愤忿粪瀵鲼偾僨奮弅憤秎瞓膹糞鱝",
    "fěn": "粉黺",
    "méi,fén": "坆",
    "pēn,pèn": "喷噴",
    "bèn,fèn": "坋",
    "mǐn": "愍敃惽泯蠠抿敏闽皿悯闵鳘僶冺刡勄敯憫潣笢笽簢閔閩鰵",
    "pēn": "歕",
    "fén,pēn": "濆",
    "pén": "葐盆湓瓫",
    "lún": "錀沦淪轮伦仑囵圇侖婨倫崘崙棆磮腀菕蜦踚陯鯩輪",
    "fēng,fěng": "风風",
    "féng": "逢堸綘艂",
    "féng,fèng": "缝縫",
    "féng,píng": "冯馮",
    "féng,fēng,páng": "夆",
    "pěng": "捧淎皏",
    "fēng,fèng": "桻",
    "féng,hóng": "浲溄",
    "féng,pěng": "摓",
    "pàng,fēng": "炐",
    "lǐ": "豊里李理礼鲤鳢锂澧蠡醴逦俚娌峛峲欚浬禮粴裏裡邐鋰鯉鱱鱧峢",
    "fiào": "覅",
    "fó": "仏梻坲",
    "fǒu,pǐ": "否",
    "yǎo,fó": "仸",
    "fǒu": "缶缹缻雬鴀",
    "póu,fú": "垺",
    "fǒu,pēi,pī": "妚",
    "páo,fǒu": "炰",
    "fóu": "紑",
    "pēi": "衃呸胚醅怌肧",
    "fù,pì": "副",
    "fū,fú": "夫姇粰",
    "fù,fǔ": "父蚥",
    "fú,piǎo": "莩",
    "jǐn,jìn": "仅僅嫤",
    "fǔ,": "嘸",
    "fū,yōu": "妋",
    "fù,niè": "峊",
    "mì,fú": "宓",
    "huái": "怀淮踝徊懐槐懷耲蘹褱褢",
    "póu,pōu,fū": "抙捊",
    "pǒu,póu": "掊",
    "fú,fū": "枎琈",
    "fū,fǔ,fù": "柎",
    "fú,sù": "棴",
    "tài": "汱太泰态酞汰肽冭夳钛忲態溙舦鈦",
    "mì,wù": "沕",
    "fú,páo": "烰",
    "lú,fū": "璷",
    "fū,fù": "紨",
    "pú,fú": "纀",
    "fū,fú,zhǒu": "胕",
    "qiū,xū,fū": "蓲",
    "fù,fú": "褔",
    "rǒng": "軵冗傇宂氄",
    "huán,hái": "还還",
    "wǔ": "陚五舞捂武侮伍午牾妩怃忤仵迕庑鹉乄倵儛啎娬嫵廡摀憮潕熓玝珷瑦甒碔逜躌鵡",
    "fū,guī": "鳺",
    "gá": "噶钆尜錷釓",
    "gē,gé": "胳搁擱",
    "jiā,jiá,gā,xiá": "夹夾",
    "gā,gá,gǎ": "嘎嘠",
    "kā,gā": "咖",
    "qié,jiā,gā": "伽",
    "gā": "旮",
    "gà": "尬魀",
    "gǎ": "尕玍",
    "xiā": "呷虾蝦虲瞎傄煆谺颬鰕",
    "yà,zhá,gá": "軋",
    "yóu,zhá": "甴",
    "gāi": "该垓陔赅侅姟峐晐畡豥荄祴賌賅該",
    "gǎi": "改忋",
    "gài,gě,hé": "盖蓋",
    "gài": "概溉丐戤乢匃钙匄漑瓂槪槩葢鈣",
    "jiè,gài": "芥",
    "ké,hāi": "咳",
    "gài,xì": "摡",
    "gū,gài": "杚",
    "hé,hú": "核",
    "gāi,hài": "絯",
    "hǎi": "胲海醢塰烸酼",
    "gāi,hái": "郂",
    "jiè": "鎅介骱借界届戒诫疥蚧丯堺屆岕庎徣楐玠琾畍砎犗蛶衸褯誡魪",
    "hái": "骸孩",
    "gān": "竿肝甘酐矸柑疳苷泔坩尴凲尶尲尷漧玕筸粓迀魐",
    "gān,gǎn": "杆",
    "gàn": "赣绀淦倝凎幹檊灨榦盰紺詌贑骭贛",
    "gàn,hàn": "旰",
    "gè,gě": "个各個",
    "qián,gān": "乾",
    "gǎn,hàn": "仠",
    "hān,gàn": "佄",
    "xián,gān": "咁",
    "gān,hàn": "忓攼",
    "hán": "浛虷含寒韩涵函邗邯焓凾娢圅晗崡梒嵅澏甝筨琀蜬鋡韓",
    "hàn,hán": "汗馯",
    "gě": "笴舸嗰",
    "gǎn,gàn": "簳",
    "gōng,gǎn,lǒng": "篢",
    "hǎn": "豃喊罕浫丆",
    "gān,hàn,yàn": "鳱",
    "gāng,gàng": "钢鋼",
    "gāng": "刚纲缸肛罡冈堽剛冮岡堈掆棡牨犅疘罁綱釭鎠摃",
    "gǎng,jiǎng": "港",
    "gǎng": "岗",
    "káng,gāng": "扛",
    "gàng": "筻槓焵焹",
    "gàng,zhuàng": "戆戅戇",
    "gàng,gāng": "杠",
    "kàng": "亢伉抗炕钪囥匟鈧",
    "gōu": "溝沟钩鞲缑篝簼緱褠袧鉤韝鈎痀",
    "kàng,gǎng": "犺",
    "náo,gāng": "碙",
    "gāng,qiāng,kòng": "矼",
    "wǎng": "罓枉罖罒往网辋魍惘罔彺徃棢菵網蛧蝄誷輞",
    "kēng": "阬坑劥铿牼硁硜誙銵鍞鏗",
    "háng": "頏颃航杭绗垳斻筕絎蚢貥迒苀魧裄",
    "gāo": "高篙羔糕睾槔槹櫜橰臯韟餻髙鷎鷱鼛",
    "gǎo": "搞稿镐杲槁藁缟夰槀檺稾稁縞菒藳",
    "gào": "告郜诰锆勂吿峼祮祰禞筶誥鋯",
    "gāo,gào": "膏",
    "gāo,háo": "皋",
    "zé,hào": "滜",
    "háo,gāo": "獋",
    "gāo,yáo": "皐",
    "měi,gāo": "羙",
    "hāo": "蒿嚆薅茠",
    "gǎo,hào": "鎬",
    "gē": "歌割哥戈鸽袼圪彁戓戨犵滒肐謌鎶鴚鴿",
    "kǎ,luò,gē": "咯",
    "gé,gě": "葛",
    "gé,há": "蛤",
    "gē,yì": "疙",
    "hé,gě": "合鲄",
    "luò,gè": "硌",
    "gè": "铬虼箇茖鉻",
    "hé,gé": "颌閤",
    "yì,gē": "仡",
    "hé,gē": "纥紇",
    "gě,jiā": "哿",
    "jiè,gè": "吤",
    "kě,kè": "可",
    "kǎi,gě": "嘅",
    "yě": "嘢野也冶埜壄漜",
    "gǔ,xì,gē,jié": "扢",
    "gé,guó,è": "敋",
    "gē,qiú": "牫",
    "xiē,hè,gé,hài": "猲",
    "kē": "牱頦颏蚵稞棵科颗柯磕蝌轲窠钶珂瞌髁疴嵙樖牁榼犐礚萪薖趷鈳顆醘",
    "gé,liè,xiē": "獦",
    "huō": "秴劐攉耠吙騞",
    "gé,luò": "蛒",
    "gé,jiē": "裓",
    "là,gé": "臈",
    "yè,tà,gé": "鎑",
    "jiǎ": "鉀钾甲岬胛叚婽斚斝榎槚檟玾",
    "hā,kē": "铪",
    "zhá": "閘闸霅札铡牐箚蚻譗鍘",
    "gé,tà,sǎ": "鞈",
    "luò,gé": "鮥",
    "qià": "髂洽胢恰冾圶帢殎硈",
    "jiā": "鴐加佳嘉葭迦浃镓跏笳痂枷珈袈傢抸梜毠泇犌猳耞糘腵浹豭貑鉫鎵麚乫",
    "gěi,jǐ": "给給",
    "gēn": "跟根",
    "gén,hěn": "哏",
    "gèn": "亘茛艮搄揯亙",
    "gēng,gèng": "更緪縆",
    "gēng": "耕庚赓刯椩羹焿浭畊絚羮菮鶊鹒賡",
    "jǐng,gěng": "颈",
    "gèng": "堩",
    "xuǎn": "暅烜选選癣癬",
    "héng": "恆珩恒衡蘅姮烆胻鑅鵆鸻鴴",
    "huán,gēng": "絙",
    "yìng": "硬鱦媵映暎膡",
    "xíng": "郉邢銒鈃钘陘陉硎饧餳型形刑侀哘娙洐蛵鉶铏",
    "gōng": "工功公弓攻宫恭躬肱龚觥匑匔塨幊杛碽糼宮觵躳髸龔侊糿",
    "gòng,gōng": "共",
    "gōng,gòng": "供",
    "gǒng": "拱巩汞珙廾拲栱輁鞏",
    "gòng": "贡熕貢莻",
    "hóng,gōng": "红紅",
    "gōng,zhōng": "蚣",
    "guāng": "咣光胱僙垙姯洸灮炗炚烡炛珖茪輄銧黆",
    "gòng,hǒng,gǒng": "唝嗊",
    "gōng,hóng": "厷",
    "gōng,gòng,hǒng": "愩慐",
    "hóng": "渱虹魟洪宏鸿弘闳荭黉仜泓吰垬娂妅宖彋汯浤潂玒玜硔竑竤篊粠紭綋紘翃翝耾纮苰葒葓谹鈜鋐鉷谼閎霐霟鞃鴻黌",
    "hóng,gòng": "羾",
    "qióng": "蛩舼宆穹跫穷琼邛茕筇儝銎卭惸桏焪焭橩憌熍煢睘瓊竆笻藭藑窮蛬赹",
    "hòng,gǒng": "銾澒",
    "gōng,wò": "龏",
    "gòu": "够购构垢彀觏诟遘媾冓坸搆撀煹構夠訽覯詬購雊啂",
    "gǒu": "狗苟岣笱玽耈耉耇豿",
    "gōu,gòu": "勾",
    "jù,gōu": "句",
    "jǔ,gǒu": "枸",
    "gōu,kòu": "佝",
    "jiǎng,gòu": "傋",
    "xǔ,hǒu,gòu": "呴",
    "qū,ōu": "区區",
    "jū": "抅泃鮈居鞠驹狙疽裾锔椐琚掬雎鞫凥匊娵婮崌梮檋毩毱涺砠腒罝艍蜛諊跔踘躹陱駒鴡鶋",
    "gòu,dù": "姤",
    "jū,gōu": "拘",
    "gǒu,qú,xù": "蚼",
    "hòu": "茩厚后候鲎後逅垕洉堠豞郈鮜鱟鲘",
    "gǔ": "古股鼓谷蛊鹘臌钴牯诂瞽毂嘏傦罟啒尳愲榖淈濲瀔皷盬穀羖脵薣蠱詁轂逧鈷餶馉鼔皼",
    "gù": "故顾固雇梏崮鲴锢牿痼僱凅堌崓棝榾祻錮顧鯝",
    "gū": "孤箍姑咕沽菇辜鸪轱菰酤蛄觚唂唃嫴橭柧泒稒笟箛篐罛苽蓇軱軲鈲鴣鮕巬巭",
    "gū,gù": "估",
    "gǔ,gū": "骨",
    "gǔ,jiǎ": "贾",
    "hú": "鹄鵠湖壶胡弧狐葫蝴瑚鹕醐囫斛猢煳觳槲喖嘝壷壺媩搰楜瀫焀瓳絗箶縠蔛螜衚鍸頶餬魱鰗鬍鶦鶘",
    "gǔ,yù": "汩",
    "guā,gū,guǎ": "呱",
    "wā,gǔ": "嗗",
    "gǔ,yíng": "夃",
    "qiǎ": "峠拤跒酠鞐",
    "hù,gù": "怘",
    "hú,gǔ": "抇",
    "kū": "枯哭窟刳骷堀圐桍矻跍鮬郀",
    "huǎng,guǒ,gǔ": "櫎",
    "huá": "滑猾铧骅搳撶蕐螖譁鷨鏵驊",
    "xiǒng,yīng": "焸焽",
    "huá,kě,gū": "磆",
    "gǔ,gòu": "糓",
    "guā": "胍刮瓜鸹劀歄煱踻颪騧鴰颳桰",
    "gǔ,hú": "縎鶻",
    "kǔ": "苦狜",
    "jiǎo,jué": "角",
    "jiǎ,gǔ,jià": "賈",
    "guà": "挂褂卦诖坬掛啩罣詿",
    "guǎ": "寡剐冎剮叧",
    "guā,tiǎn": "栝",
    "huài,shì": "咶",
    "guà,kuā": "絓",
    "guā,wō": "緺",
    "wā,guǎ,guō": "咼呙",
    "guǎi,guà": "罫",
    "huà,guā": "諣",
    "shé": "舌佘蛥虵",
    "guā,huó": "趏",
    "xiān,kuò,tiǎn,guā": "銽銛铦",
    "kuò,guā": "括",
    "guài": "怪恠夬",
    "guāi": "乖",
    "guǎi": "拐枴柺",
    "kuài": "哙噲獪巜块快筷侩郐狯脍儈凷圦塊廥旝糩膾鄶鱠鲙欳",
    "guái": "叏",
    "guó": "掴国帼馘虢囯囶囻圀國幗慖摑漍腘蔮聝膕",
    "guǎn": "管馆琯痯舘筦輨錧館鳤璭",
    "guān": "关官棺涫鳏倌瘝癏窤蒄関闗關鱞鰥",
    "guàn": "惯罐灌贯掼盥鹳悹慣摜悺樌泴潅爟瓘礶祼罆躀貫鏆遦鑵鱹鸛欟",
    "guān,guàn": "观冠観覌觀",
    "lún,guān": "纶綸",
    "jīn,qín,guān": "矜矝",
    "guān,guǎn,wǎn": "莞",
    "guàn,kuàng": "卝丱",
    "wān,wà": "婠",
    "huān": "懽鵍欢獾歓歡讙貛酄驩鴅",
    "wò,guǎn": "斡",
    "guǒ": "果裹椁蜾惈槨粿綶菓褁輠餜馃",
    "guāng,guàng": "桄",
    "guàn,wān": "毌",
    "guǒ,guàn": "淉",
    "guàn,quán": "矔",
    "wǎn": "萖晥皖脘晚碗挽婉惋绾琬畹倇唍晩晼梚椀盌綩綰踠鋔輓",
    "guàn,huán": "雚",
    "guàng": "逛俇",
    "guǎng": "犷広廣獷",
    "huǎng": "恍谎幌奛怳兤晄炾熀縨詤謊",
    "kuò": "扩擴萿鬠廓蛞拡濶阔筈葀霩闊鞹韕頢鞟",
    "kuò,guāng": "挄",
    "héng,guàng": "撗",
    "héng,hèng": "横橫",
    "huáng,guāng": "潢",
    "kuāng,guāng": "硄",
    "guàng,jiǒng": "臦",
    "guǎng,jiǒng": "臩",
    "huáng": "趪黄簧凰惶皇蝗磺煌隍鳇篁徨遑癀湟璜偟蟥喤堭媓崲墴楻獚瑝穔艎葟諻鍠鐄锽餭韹騜鱑鰉鷬黃",
    "wàng,kuāng": "迋",
    "guī": "归规硅闺瑰圭皈妫亀嫢媯嬀帰摫椝槼槻櫷歸珪璝瓌瞡茥蘬規邽郌閨騩鬶鬹",
    "guì": "贵跪桂刽刿劊劌撌攰昋椢槶櫃禬筀蓕襘貴鞼鱥鱖樻鐀鑎",
    "guǐ": "鬼轨诡癸庋宄晷匦佹簋匭厬垝姽庪恑湀祪蛫蟡觤詭軌陒",
    "guī,jūn,qiū": "龟龜",
    "guì,jǔ": "柜",
    "kuǐ,guī": "傀",
    "quē": "炔缺缼蒛",
    "guì,huì": "桧檜",
    "guì,jué": "鳜",
    "guī,xié": "鲑",
    "jiǒng,guì": "炅",
    "kuì,guì": "匱匮",
    "wā,wa": "哇",
    "wá": "娃",
    "guī,xī,juàn": "嶲巂",
    "jué,guì": "嶡趹",
    "guī,wěi,huì": "廆",
    "qiú,guǐ": "朹",
    "wéi": "桅沩潙违違韋韦矀围唯维惟潍帏闱涠帷嵬壝圍峗峞幃洈湋濰潿溈犩維蓶覹鄬醀鍏闈鮠",
    "jī,guī": "槣",
    "guǐ,guì": "攱",
    "huái,guī": "櫰",
    "guǐ,jiǔ": "氿",
    "wā": "洼蛙瓾挖娲劸屲媧攨溛漥畖穵窊韈窪鼃",
    "yàn,guì": "溎",
    "guì,wēi": "癐",
    "guì,wèi,kuì": "瞆",
    "guì,kuì": "瞶",
    "wěi,guì": "硊",
    "wā,guī": "窐",
    "guó,guì": "簂",
    "guī,kuì": "胿",
    "guì,huǐ": "螝",
    "guī,guà": "袿",
    "jué": "觖赽鴃鴂焳臄趉决绝爵掘诀抉攫劂桷矍爝镢橛獗珏崛蕨谲孓亅厥刔匷孒崫嶥彏憰憠戄挗欮氒橜灍決熦爴爑玃玦玨瘚瑴矡絕砄絶芵蕝虳蟨蟩觼譎貜蹷訣躩鈌鐍钁鐝鷢觮噊",
    "jué,juě": "蹶",
    "guī,xī": "雟",
    "wěi,kuí": "隗",
    "guī,xié,wā,kuí": "鮭",
    "gǔn": "鲧滚辊衮丨绲磙惃滾緄蓘袞輥蔉鮌鯀",
    "hún": "浑渾魂忶馄餛鼲",
    "hùn,hún": "混",
    "gùn": "睔謴",
    "hùn": "睴圂倱溷俒慁掍诨焝諢觨尡",
    "gǔn,yùn": "緷",
    "yuān,gǔn": "裷",
    "kūn": "錕锟昆坤髡琨醌鲲堃堒崑晜潉焜熴猑瑻崐菎蜫裈裩褌騉髠髨鯤鵾鶤鹍",
    "guò,guo,guō": "过",
    "guō": "锅郭埚聒猓崞蝈啯嘓墎堝彍彉瘑蟈鈛鍋懖",
    "wō,guō": "涡渦",
    "huá,huà": "划劃",
    "hǔ,xià": "唬",
    "wéi,guó": "囗",
    "guō,kuǎ": "楇",
    "huó": "活佸",
    "guō,wō": "濄",
    "kuàng,guō": "矌",
    "guò": "腂過鐹",
    "wō": "蝸踒窝蜗莴涹猧窩萵",
    "luǒ": "蠃裸倮瘰剆曪癳臝蓏躶",
    "kè": "錁锞艐衉溘克刻课客恪缂氪骒勀勊愙堁娔碦緙課騍",
    "hā,hǎ,hà": "哈",
    "pò,hǎ,tǎi": "奤",
    "hài,jiè": "妎",
    "xià,hè": "吓",
    "wéi,wèi": "為为喡爲",
    "hài": "害氦骇亥嗐餀饚駴駭",
    "hāi,hēi": "嗨",
    "hāi": "咍",
    "xié,hái": "嚡",
    "huī": "咴蘳灰挥辉恢徽麾晖诙噅噕媈幑婎拻揮楎暉洃瀈灳烣睳禈翬翚褘袆詼豗輝鰴",
    "hēi,mò": "嘿",
    "xià": "乤夓夏鎼下罅丅圷懗梺疜睱鏬",
    "kàn": "阚鬫瞰墈崁矙磡衎",
    han: "兯爳",
    "hán,hàn": "唅",
    "làn": "嚂滥濫烂燗爁爤瓓爛糷钄",
    "hān,nǎn": "嫨",
    "qiàn,kàn": "嵌",
    "jiān,hán": "椷",
    "qiān,xiān": "欦",
    "liǎn,hān": "歛",
    "tān": "滩灘摊攤舑贪瘫坍怹擹癱貪",
    "huàn": "澣换唤患幻宦涣焕豢痪逭漶鲩奂擐浣喚奐嵈愌攌換槵梙烉渙煥瑍瘓肒藧轘鯶鰀鯇",
    "hàn,rǎn": "熯",
    "qín,hán,hàn": "肣",
    "xuān": "軒轩縇宣喧暄儇煊萱揎塇媗谖愃愋昍晅瑄睻矎箮禤翾翧蓒萲蕿藼蘐蝖蠉諠譞諼鍹駽鰚",
    "kàn,hǎn": "闞",
    "háng,xíng": "行",
    "xiàng,hàng": "巷",
    "háng,kēng": "吭",
    "hàng": "沆",
    "kēng,háng": "妔",
    "kāng,hàng": "忼",
    "héng,háng": "桁",
    "háng,hàng": "笐",
    "láng": "狼廊稂琅螂榔锒勆嫏桹樃欴瑯硠艆蓈蜋躴郒郞鎯鋃斏",
    "kàng,háng": "邟",
    "hǎo,hào": "好",
    "hào,háo": "号",
    "hǎo": "郝",
    "hé,háo,mò": "貉",
    "xiāo,háo": "呺",
    "niū": "妞",
    "hào,jiào": "悎",
    "hào,xuè": "滈",
    "hào,mào": "秏",
    "hè": "翯贺赫褐鹤壑哬垎寉焃煂燺爀癋碋謞賀靍靎靏鸖鶴穒",
    "hāo,kǎo": "薧",
    "xiāo,hào": "藃",
    "xià,háo": "諕",
    "nòu": "鎒鐞耨槈",
    "hé,hè,huó,huò,hú": "和",
    "hē,hè,yè": "喝",
    "hé,hē,hè": "何",
    "hē": "嗬诃欱蠚訶",
    "hé,hè": "咊惒",
    "hū": "呼忽乎烀轷惚滹唿匢匫嘑垀寣幠昒歑泘淴苸虍謼虖軤雐乯",
    "hè,xiāo,xiào,hù": "嗃",
    "kē,kè": "嗑",
    "hè,xià": "嚇",
    "huàn,yuán,xuǎn,hé": "喛",
    "qì,kài": "愒",
    "hē,hè,qiā": "抲",
    "jiē,qì": "揭",
    "kě": "渇渴岢炣敤",
    "hè,xiāo": "熇",
    "hé,mò": "狢貈",
    "jiǎo,zhuó": "繳缴",
    "kē,hē": "苛",
    "huò": "藿霍擭穫韄檴或货祸惑获嚯镬锪蠖俰剨咟嚿奯旤曤沎湱瀖癨獲眓矐禍耯臛艧蒦謋貨鍃鑊雘靃窢彟彠",
    "hé,xiá": "螛",
    "xiē": "蝎揳歇楔娎蠍",
    "hè,kè": "袔",
    "xiá": "轄辖暇柙峡霞狭匣侠狎黠硖遐瑕俠敮炠峽烚珨狹祫碬筪舝縖硤翈舺蕸赮鍜鎋陜騢陿魻鶷",
    "hú,hè": "隺",
    "hé,jiè": "鶡",
    "hè,hú": "鶮",
    "hēi": "黒潶黑",
    "hěn": "狠很佷詪",
    "hén": "痕拫鞎",
    "hèn": "恨",
    "xīn,hěn,hèn": "噷",
    "xiān": "掀纎纖杴襳先锨仙籼祆跹酰暹氙仚佡僊僲嘕奾屳廯忺憸珗秈繊苮褼蹮躚鍁韯韱馦鱻鶱",
    "hēng": "哼涥脝",
    "hēng,pēng": "亨",
    "huán,huān": "狟貆",
    "hēng,hèng": "悙",
    "hōng": "訇轰烘薨嚝揈灴焢硡谾軣輷轟鍧呍",
    "hōng,hǒng,hòng": "哄",
    "hòng": "蕻讧撔訌闀鬨",
    "hōng,hóng": "叿",
    "hǒu,hōng,ōu": "吽",
    "hóng,lóng": "屸",
    "hǒng": "晎",
    "yíng,hōng": "巆",
    "wāng": "汪尣尩尪尫",
    "hōng,qìng": "渹",
    "xiáng,hóng": "瓨",
    "hòng,xiàng": "閧",
    "hòng,juǎn,xiàng": "闂",
    "hǒu": "吼犼",
    "hóu": "喉猴篌糇骺瘊帿睺翭葔鄇鍭鯸餱",
    "hóu,hòu": "侯矦",
    "hóu,qú": "翵",
    "hóu,xiàng": "銗",
    "hōu": "齁",
    "hǔ": "虎琥乕萀虝錿鯱",
    "hū,hú,hù": "糊",
    "xì,hū": "戏戯戲戱",
    "hǔ,xǔ": "浒滸",
    "kuā,hù": "姱",
    "hū,kuā": "恗",
    "hū,hù": "曶雽",
    "kǔ,hù": "楛",
    "hù,dǐ": "枑",
    "ké,qiào": "殻壳殼",
    "wū": "洿汚汙污屋钨呜乌诬巫邬圬剭嗚弙杇歍烏窏箼誈螐誣鄔鎢鴮鰞",
    "huò,hù": "濩",
    "zhí,hú": "瓡",
    "hǔ,huǎng": "汻",
    "què,hú": "礐",
    "hū,wǔ": "膴",
    "pù": "舗舖",
    "hù,xià": "芐",
    "huì,hū": "芔",
    "wù,hū": "芴",
    "lú": "芦卢盧炉颅庐栌泸轳鲈垆胪鸬舻嚧壚廬枦櫨瀘獹爐玈瓐矑籚罏纑舮艫蘆臚蠦轤鈩顱髗魲鑪鱸鸕黸曥馿",
    "xué,hù": "觷",
    "xǔ,hǔ": "许",
    "huá,wú,wū": "鋘",
    "huà": "话画桦婳嫿嬅崋摦杹槬樺澅畫畵繣舙諙話譮黊夻枠",
    "huā": "花婲埖椛硴糀蘤誮錵蒊",
    "huà,huā": "化",
    "huá,huā": "哗嘩",
    "huá,huà,huā": "华華",
    "huō,huò,huá": "豁",
    "xū,huā": "砉",
    "huá,huó": "姡",
    "zhǎo": "找沼瑵",
    "kuài,huì": "浍澮",
    "yè": "璍邺抴葉洂液鍱鐷页頁靨靥夜业腋曳谒晔烨亱僷墷嶫嶪捙擛擪擫曅枽曗枼曄澲業爗燁皣瞱瞸礏謁鄴餣饁馌驜鵺鸈曵",
    "lún,huā": "芲",
    "huà,xiè": "觟",
    "huá,yú": "釪",
    "huá,wū": "釫",
    "huài,pēi,pī,péi": "坏",
    "huí,huái": "佪",
    "huài": "壞壊蘾",
    "huái,wāi": "瀤",
    "huán": "环桓鬟寰锾萑洹缳堚寏峘澴環糫羦繯萈荁豲鍰鐶镮阛闤雈鹮獂",
    "huǎn": "缓睆緩",
    "xún,huán": "郇",
    "huán,yuán": "圜",
    "huàn,huān": "嚾",
    "huān,quán": "孉",
    "yuàn,huán": "垸",
    "xuān,huān": "懁",
    "yuán": "援謜茒园魭円元圆原猿源缘袁垣辕鼋橼爰沅螈塬厡厵圎園媴嫄圓榞榬櫞溒湲猨笎縁羱緣薗蝝蝯褤邧轅邍酛鈨鎱騵鶢鶰黿",
    "yù,yì": "欥",
    "wán": "汍完頑顽玩丸烷芄纨刓岏忨抏捖琓笂紈翫貦",
    "huán,yè,yà": "瓛",
    "xuàn": "眩泫绚楦渲铉碹镟炫怰昡琄縼繏絢蔙衒袨贙颴鉉鏇",
    "qióng,huán": "瞏",
    "wàn": "瞣輐錽蟃腕卍卐杤脕萬贎",
    "huán,huàn,wàn": "綄",
    "yuán,huán": "蒝",
    "shén": "鉮神榊鰰",
    "huāng": "慌荒肓塃巟衁",
    "huǎng,huàng": "晃",
    "huàng": "愰曂滉榥皝皩鎤",
    "huáng,yóng": "揘",
    "huāng,huǎng": "宺",
    "huāng,máng,wáng": "朚",
    "huáng,huǎng": "熿",
    "kuàng,huǎng": "爌",
    "máng": "茫芒忙盲硭邙吂娏厖哤恾杗杧浝汒牻笀痝蘉釯鋩铓駹",
    "huì,kuài": "会會璯",
    "huí": "回蛔茴洄囘囬廽廻恛痐蚘蜖蛕逥迴鮰",
    "huǐ": "毁悔虺檓毇毀燬譭",
    "hún,huī": "珲琿",
    "yuě,huì": "哕噦",
    "huì,huí": "缋繢藱",
    "huì,xié": "儶",
    "xié,huī": "孈",
    "huī,wéi": "撝",
    "wěi,huī": "椲",
    "mèi": "沬妹寐昧媚袂魅抺煝眛痗睸祙篃跊蝞鬽旀",
    "huì,mǐn,xū": "湏",
    "huì,huò": "濊",
    "huī,yùn,xūn": "煇",
    "huì,lěi": "瘣",
    "guì,suī": "眭",
    "huī,suī": "睢",
    "sōu": "蒐摉搜溲艘嗖飕锼凁廀廋捜馊獀鄋醙颼鎪騪餿",
    "xù,huì": "銊",
    "huì,suì,ruì": "鏸",
    "kuì,huì": "溃殨潰",
    "hūn": "昏荤婚阍昬棔睧睯涽蔒葷轋閽",
    "hùn,kūn": "婫",
    "hūn,mèn": "惛",
    "kǔn": "捆梱阃悃壸壼硱祵稇稛綑裍閸閫",
    "kuǎn": "梡款欵歀",
    "hūn,mèi": "殙",
    "mǐn,hūn": "湣",
    "zhuāng,hún": "湷",
    "yún,hùn": "眃",
    "xūn,hūn": "焄",
    "mín": "緍緡缗民珉苠岷垊姄崏慜捪旻旼琘琝瑉盿砇碈痻罠鈱錉鍲鴖",
    "shéng": "繉繩绳憴縄譝",
    "wèn": "顐问璺妏問揾搵",
    "yùn": "餫愠慍蕰薀蕴藴褞蘊韞运韵孕酝恽郓傊惲枟腪鄆運醖醞韗韻",
    "huǒ": "火伙夥钬邩鈥煷",
    "huò,xù": "掝",
    "huò,ǒ": "嚄",
    "huǒ,huò,kuò": "漷",
    "huò,yuè": "矆",
    "kè,huò": "礊",
    "huó,kuò": "秮秳",
    "zhuó,huò": "篧",
    "yuè": "越月跃躍瀹鑰黦阅岳悦粤钺嬳刖樾岄龠恱嶽戉抈捳悅爚玥礿禴篗籆籰蚎籥粵蚏蘥跀軏鈅鉞閱閲鸑鸙",
    "huò,shǎn": "閄",
    "yí,jí": "乁",
    "jī,jǐ": "几幾",
    "jī": "机鸡积激基肌姬饥击圾箕讥畸墼齑屐嵇矶笄剞叽跻唧畿玑羁赍芨犄乩刉刏僟喞嘰嗘嵆撃擊枅機毄樭璣癪磯積筓簊羇羈耭虀覉覊譤譏賫賷躸踑銈躋錤鑇鑙鐖隮雞鞿韲飢饑鳮鶏鸄鷄鹡鶺齏朞魕緁",
    "jǐ": "挤己脊戟虮嵴掎麂丮妀撠擠橶泲犱蟣魢鱾",
    "xì,jì": "系繫",
    "jì,jǐ": "纪济済濟",
    "jī,qī": "缉緝",
    "jì,zhài": "祭",
    "qī,jī": "期",
    "qí,jì,zī,zhāi": "齐",
    "jī,qǐ": "稽",
    "jié,jí": "诘尐鞊",
    "jì,jié": "偈",
    "jī,xī,qià": "咭",
    "jí,qì": "亟焏",
    "jì,jiē,zhāi": "哜嚌",
    "yǐ": "倚蟻乙裿齮以逘乛矣已蚁旖酏苡钇舣偯嬟崺庡扆攺敼旑檥礒笖苢艤螘輢轙鈘釔鉯顗鳦",
    "shí": "姼蝕十时蚀实埘鲥炻塒実寔實嵵峕旹時榯湜溡祏竍識遈鉐飠鮖饣鰣鼭鼫乭",
    "nì,jǐ": "屰",
    "qí,jì": "帺",
    "jì,xuě": "彐",
    "jiǎo,jǐ": "憿",
    "qí,jī,jì": "懠",
    "qiào,yāo,jī": "撽",
    "qī,yǐ,jī": "敧攲",
    "jí,zhì": "楖",
    "jī,jì": "櫅禨",
    "zhī,jì": "汥",
    "qiè,jí": "淁",
    "jué,jì": "櫭",
    "jí,shà": "濈",
    "yī,yǐ": "猗",
    "jì,zī": "璾",
    "zhài": "瘵寨债砦債",
    "kuí": "睽騤骙魁葵奎喹逵暌揆馗蝰夔巙戣晆楑楏櫆藈蘷虁躨鍨鄈鍷頯犪",
    "qú,jù": "瞿忂渠螶",
    "kòu,jì": "瞉",
    "jī,qí": "稘觭綨",
    "jǐ,jì": "穖",
    "jì,jié,jiè": "紒",
    "jié,jiē": "結结节",
    "jí,jiè": "耤",
    "luán": "脔娈孌挛攣滦峦孪栾銮鸾圝圞孿奱曫巒癵癴欒羉灤臠虊鵉鑾鸞",
    "lè": "艻鳓仂泐叻忇氻玏砳簕阞韷餎鰳鱳",
    "gōu,gǒu": "芶",
    "lì,jī": "苙",
    "zū,jù": "蒩",
    "jiè,jí": "藉",
    "là": "蜡辣瘌揧楋溂瓎翋臘蝋蝲辢鑞蠟镴鬎鯻",
    "jì,jī": "諅",
    "jí,jié": "趌",
    "què,qì,jí": "趞",
    "qí,qǐ": "跂",
    "qí,zhāi": "齊亝",
    "jiā,jia,jie": "家",
    "jiǎ,jià": "假",
    "jià,jiè,jie": "价",
    "jià": "架驾嫁稼幏榢駕",
    "jiá": "荚颊铗戛恝郏蛱圿忦戞扴脥莢裌蛺郟鋏頬頰鴶鵊",
    "qié": "茄癿聺",
    "jiǎ,xiá,xiā": "瘕",
    "jià,jie": "價",
    "jiá,qiǎn": "唊",
    "xiá,jiā": "埉",
    "tū,jiā": "宊",
    "jiǎ,xiá": "徦",
    "jiā,yá": "拁",
    "jié,jiá": "拮",
    "qiè": "挈窃怯惬锲妾匧厒箧悏穕笡竊籡篋愜踥鍥鯜",
    "xié,jiā": "挟挾",
    "kāi": "揩开锎奒鐦開",
    "qiā,jiā,yè": "擖",
    "jiǎ,jiā": "椵",
    "jiá,jié,qiā": "袷",
    "jié,xié,jiá": "颉",
    "jiàn,xiàn": "见見",
    "jiān,jiàn": "间监監鋻間",
    "qiǎn,jiān": "浅",
    "jiàn,kǎn": "槛檻",
    "jiǎn,nān": "囝",
    "qiàn,jiān": "傔",
    "tiě,jiàn": "僣",
    "qiàn,zàn,jiàn": "堑塹",
    "jiǎn,jiān,sàn": "帴",
    "qián,jiàn,jiǎn": "揵",
    "xiān,jiān": "攕",
    "jiǎn,jiān": "揃篯籛",
    "jiǎn,lán": "暕",
    "jiàn,zùn": "栫瀳袸",
    "jiàn,jìn": "榗",
    "zhǎn,jiǎn": "橏",
    "jiān,qián": "玪犍",
    "jiān,yàn": "猏豣",
    "xián,jiàn": "瞯",
    "jiān,zhàn": "碊",
    "xián,jiān,liàn": "稴",
    "zhēn,jiān": "籈",
    "nǐ,jiàn": "聻",
    "xiān,qiàn": "纤",
    "jīng": "葏经京惊精荆晶粳茎鲸睛兢腈菁旌泾亰坕坙婛旍橸涇猄秔稉経聙經荊鶁鯨驚麖鶄麠鼱綡",
    "zèn": "譖谮",
    "yàn,liǎn,xiān": "醶",
    "rì,rèn,jiàn": "釰釼",
    "wàn,jiǎn": "鋄鎫",
    "liàn": "錬鍊湅煉炼练恋链殓潋僆楝堜媡戀殮澰瀲瑓練纞萰鏈鰊",
    "jiàn,zàn": "鏩",
    "xián,jiān,jiàn": "閒",
    "qiān": "騫骞千牵签钎谦扦迁仟岍褰搴愆悭芊佥阡僉奷孯圲慳拪撁攐攑攓杄櫏汘汧竏牽籖籤簽粁茾蚈諐谸謙鈆遷釺鉛韆顅鬜鬝鏲鵮鹐",
    "jiān,qiān,zhān": "鳽",
    "yǐn,yìn": "廴隐隠隱飮飲",
    "jiāng,jiàng": "将浆將漿畺",
    "jiǎng": "讲奖蒋桨耩塂奨奬槳獎膙蔣講顜",
    "jiāng": "江僵姜礓豇缰茳壃橿殭疅繮畕翞葁螀螿薑韁鱂鳉",
    "jiàng,xiáng": "降夅",
    "jiàng": "酱匠犟绛糨洚勥匞嵹弜弶摾櫤滰糡絳謽醤醬",
    "jiāng,qiáng": "疆",
    "qiáng,qiǎng,jiàng": "强強彊",
    "jiāng,qiàng": "摪",
    "qiáng": "蔃墙蔷樯嫱墻嬙漒檣牆艢蘠",
    "jiǎo": "脚绞搅狡饺铰敫皎佼挢儌孂撹撟攪敽敿晈暞曒灚璬皦纐腳臫絞蟜譑賋踋鉸餃鱎龣燞",
    "jiào": "较叫轿窖酵噍醮呌嘦嘂嬓斠滘漖獥珓皭藠訆譥趭較釂轎",
    "jiào,jiāo": "教挍敎",
    "jué,jiào": "觉覐覚覺斍",
    "xiào,jiào": "校",
    "jiáo,jué,jiào": "嚼",
    "jiǎo,jiáo": "矫矯",
    "jiǎo,jiào": "徼笅筊",
    "jiǎo,yáo": "侥僥徺",
    "jiāo,qiú": "艽",
    "jiào,qiáo": "峤嶠潐",
    "jiāo,xiáo": "姣",
    "qiū,jiǎo": "湫湬",
    "qiáo,jiāo": "喬",
    "yǎo": "咬鷕舀崾杳偠窈婹宎岆柼榚溔狕窅苭闄騕齩",
    "liáo": "嵺僚橑獠聊疗辽寥鹩寮缭嫽嘹尞屪嶚嶛廫憀敹暸璙療竂簝膋繚膫蟟豂賿蹘遼飉鷯髎藔",
    "xiào,jiǎo": "恔",
    "jiǎo,kù": "捁",
    "zhuó,jiào,zé": "灂",
    "jiǎo,yào": "烄",
    "jiǎo,qiāo": "煍",
    "jiāo,qiáo,jué,zhuó": "燋",
    "jiào,liáo,liù": "窌",
    "jiū": "糾纠揪究赳鬏丩阄啾勼鸠揫朻萛鬮鳩",
    "qiú": "芁蝤訄頄求球泅囚酋裘巯逑俅虬赇犰鼽遒叴唒崷巰扏梂殏毬汓浗煪玌璆皳盚紌絿湭莍虯蛷觓肍觩訅逎賕釚釻銶鮂鯄鰽",
    "qiǎo,jiǎo": "釥",
    "qiāo,xiāo": "骹",
    "zān": "鵤橵鐟簪糌兂簮鐕",
    "jiě,jiè,xiè": "解觧",
    "jiě": "姐媎毑檞飷",
    "kǎi,jiē": "楷",
    "jié,jú": "桔",
    "jié,yà": "碣",
    "jiè,zé,jí": "唶",
    "qì,qiè,xiè": "契",
    "kě,jié": "嵑嶱",
    "jiē,suǒ": "嫅",
    "xiè,jiè": "嶰",
    "jiè,kè": "悈",
    "jié,zhé": "搩",
    "shí,shè": "拾",
    "zhì,jié": "擳",
    "jiē,qiè": "椄",
    "qiè,jié": "洯",
    "jié,qiè": "疌",
    "zǔ": "祖组組阻唨爼诅俎鎺靻詛",
    "xié,jié": "絜",
    "jiē,shà": "菨",
    "jù,jiē": "袓",
    "jǐn": "紧锦谨瑾馑槿卺儘侭厪巹漌緊菫蓳謹錦饉",
    "jìn": "近进浸晋烬靳荩噤缙妗赆觐僸凚嚍墐壗嬧搢枃晉殣浕溍濅濜煡燼瑨璶盡祲縉藎覲賮贐進齽",
    "jīn": "今斤金筋津巾襟衿堇堻惍琻璡琎珒砛荕觔釒釿钅鹶黅",
    "jìn,jǐn": "尽",
    "jīn,jìn": "禁紟",
    "jìn,jìng": "劲劤勁",
    "jǐn,qín": "廑",
    "jìn,yín": "伒唫",
    "qīn": "兓侵钦衾媇嵚嶔欽誛駸顉鮼骎",
    "qín,jīn": "埐",
    "yín": "吟訡垠齦乑淫滛银寅鄞夤狺霪噖嚚圁婬峾崯崟檭殥泿烎犾璌碒荶蔩訔訚誾鈝銀鷣",
    "qiān,jǐn": "婜",
    "xiān,yǎn,jìn": "嬐",
    "jìn,qǐn": "寖",
    "qín": "嶜斳勤擒琴芹秦禽芩嗪螓檎噙懃懄庈捦珡琹瘽澿耹菦鈙蠄靲雂鳹鵭鈫",
    "qín,jìn,jǐn": "慬",
    "jìn,qūn": "歏",
    "zhěn,tiǎn": "紾",
    "lèi,lē": "肋",
    "zhī,jìn": "臸",
    "qín,qīn,jīn": "菳",
    "lè,jīn": "竻",
    "qǐn": "鋟锓寝坅寑寢昑梫笉螼赾",
    "xìn,jìn": "馸",
    "jǐng,yǐng": "景",
    "jìng,liàng": "靓",
    "liàng,jìng": "倞",
    "qìng": "儬濪靘庆慶磬凊罄櫦碃",
    "jīng,xíng": "巠",
    "jǐng,jìng": "憼",
    "qíng,jǐng": "擏",
    "qíng,jìng": "殑",
    "shì,zhī": "氏",
    "qíng": "檠葝剠情晴擎氰黥勍夝暒棾樈甠硘",
    "jìng,zhěn": "竧",
    "kāng,jīng": "粇",
    "qìng,jīng": "箐",
    "qīng": "蜻靑青錆轻清氢倾卿圊傾鲭寈淸氫軽郬輕鯖鑋",
    "xíng,xìng,jīng": "鋞",
    "jiǒng": "窘炯侰僒迥冏囧泂澃烱煚煛熲燛綗褧逈顈颎",
    "jiōng": "扃冋坰埛冂蘏蘔駉駫",
    "qún": "宭群帬峮羣裠裙",
    "jiǒng,jiōng": "浻",
    "shǎng,jiōng": "扄",
    "jiōng,jiǒng": "絅",
    "xiǎng,jiōng": "銄",
    "jiǔ": "九酒久韭玖灸乆乣奺杦汣紤舏镹韮",
    "lù,jiū": "剹",
    "jiū,yóu": "揂",
    "jiū,liú,liáo,jiǎo,náo": "摎",
    "jiū,liáo": "樛",
    "sù,qiū": "橚",
    "jiū,lè": "牞",
    "mǔ": "畂母亩牡拇姆峔牳畆畒畮畞畝砪胟踇鉧",
    "zī,jiū": "稵",
    "jiū,jiǔ": "糺",
    "móu,miù,miào,mù,liǎo": "缪繆",
    "jǔ": "举矩龃榘踽莒榉弆挙擧椇櫸欅筥聥舉蒟襷齟",
    "jú": "局菊橘侷婅巈挶椈泦淗湨焗狊犑粷蘜趜跼輂郹蹫閰駶驧鵙鵴鼳鶪鼰",
    "jǔ,jù": "沮",
    "jù,jū": "据據鋸",
    "jǔ,zuǐ": "咀",
    "jù,qǔ": "苣",
    "qiè,jū": "趄",
    "yù,jú": "僪",
    "qǔ": "娶取龋竬蝺詓齲",
    "jù,lóu": "寠貗",
    "jū,jǔ": "岨",
    "kòu,jù": "怐",
    "xū,jū": "揟",
    "zǔ,jù": "珇",
    "jū,xū,kōu": "眗",
    "zū": "租葅菹",
    "lǒu": "篓簍嵝塿嶁甊",
    "zí,jú": "蓻",
    "lóu": "蒌蔞楼娄蝼髅婁耧廔溇樓漊熡艛耬謱螻遱鞻軁髏",
    "jū,jù,qiè": "跙",
    "jū,jú": "鋦",
    "juàn,juǎn": "卷帣巻",
    "quān,juàn,juān": "圈圏",
    "juàn": "倦眷绢鄄劵桊狷奆慻淃獧睊絭睠羂絹腃罥蔨餋",
    "juān": "鹃捐娟镌蠲涓勬姢脧裐鎸鐫",
    "juǎn": "锩呟埍臇菤錈",
    "jùn,juàn": "隽雋",
    "juàn,juān": "勌瓹",
    "juàn,quān": "弮",
    "yuān,juàn": "悁",
    "juǎn,quán": "捲",
    "juān,zuī": "朘",
    "xuān,juān,xié": "梋",
    "juàn,quán": "惓",
    "juān,yè": "焆",
    "quān,juàn": "棬奍",
    "suō": "睃簑唆嗍蓑梭桫娑嗦羧傞摍莏簔趖鮻",
    "zhuàn,juàn": "縳",
    "ruǐ": "蕋蕊壡橤繠蘃蘂",
    "juàn,xuān": "讂",
    "xuān,juān,juàn": "鋗",
    "xuān,juān": "鞙",
    "quàn": "韏劝勧勸牶",
    "yǎng,juàn": "飬",
    "jué,juè": "倔",
    "jué,xué": "噱",
    "juē,jué": "撅",
    "juē": "噘屩屫撧",
    "què,jué": "傕埆",
    "yuè,jué": "妜",
    "jué,zhāng": "弡",
    "jué,zhuó": "捔",
    "jué,xuè": "泬疦",
    "kuáng": "狂诳狅誑軖軠鵟",
    "qióng,jué": "璚",
    "yù,xù,jué": "矞",
    "zhuō,jué": "穱",
    "jú,jué": "繘",
    "jué,quē": "蚗",
    "nà,jué": "袦",
    "qū,juè": "誳",
    "què,quē": "闕",
    "quē,què": "阙",
    "jué,kuài": "駃",
    "jūn": "君军均钧皲桾汮皹碅皸莙蚐袀覠軍鈞銁銞鍕鮶鲪麏麕頵",
    "jūn,jùn": "菌",
    "jūn,qún": "麇",
    "yún": "勻匀鋆畇筼篔云耘郧芸昀纭伝囩妘愪抣橒沄涢溳澐熉秐縜紜蒷鄖蕓雲",
    "yún,jūn": "筠",
    "jūn,xún": "姰",
    "jùn,pèi": "攈",
    "xún": "旬栒廵巡恂畃寻尋洵循询鲟浔峋荀偱噚揗攳杊桪樳燅燖潯璕珣紃蟳鄩詢鱏鱘",
    "suān": "狻酸痠",
    "tūn": "焞吞暾朜",
    "qū,jùn": "焌",
    "jùn,qūn": "箘",
    "qiǎ,kǎ": "卡",
    "kā": "喀",
    "kǎ": "胩佧咔垰裃鉲",
    "kài,xì": "忾愾",
    "kài": "勓烗炌鎎",
    "xì,kài": "欯",
    "qǐ": "豈起启乞企屺芑杞绮呇唘啔啓婍啟棨玘盀綺諬邔闙",
    "kǎn": "砍坎偘莰侃惂冚輡轗顑",
    "kàn,kān": "看",
    "xiàn,kǎn": "埳",
    "kǎn,qiǎn": "凵",
    "kān,zhàn": "嵁",
    "zhì,sǔn,kǎn": "扻",
    "kǎn,kè": "歁",
    "kǎn,kàn": "竷",
    "xiān,liǎn": "莶薟",
    "kāng": "慷康糠嫝嵻槺漮砊穅躿鱇鏮",
    "kàng,kāng": "闶",
    "kào": "靠犒铐鮳銬鯌鲓",
    "kǎo": "考烤拷栲攷",
    "kāng,kàng": "閌",
    "kāo": "尻髛",
    "kǎo,qiǎo,yú": "丂",
    "kǎo,kào": "洘",
    "kù": "焅廤裤库酷喾绔俈嚳庫瘔絝袴褲",
    "kāo,qiāo": "嵪",
    "kē,kě": "坷軻",
    "kēi,kè": "剋尅",
    "kè,qià": "愘",
    "ké,qiā": "揢",
    "kē,ē": "痾",
    "kē,luǒ": "砢",
    "què,kè,kù": "硞",
    "chāo,kē": "窼",
    "zhuā": "簻檛髽膼抓",
    "ké": "翗",
    "kěn": "肯啃恳垦墾懇豤肎肻錹",
    "kèn": "裉掯褃",
    "yín,kèn": "珢",
    "kèn,xiàn,gǔn,yǐn": "硍",
    "kěn,kūn": "貇",
    "yín,kěn": "龈龂",
    "rǒng,kēng": "坈",
    "tǎn": "忐毯坦袒钽嗿憳憻暺璮菼襢醓鉭",
    "zhēng,kēng": "揁",
    "kēng,qiān": "摼挳",
    "qìng,kēng,shēng": "殸",
    "kēng,kěng": "硻",
    "zhǐ": "怾扺衹黹止指纸趾址旨枳轵祉芷咫酯凪劧坧帋恉汦洔淽沚疻砋秖紙藢茋襧訨軹阯",
    "kōng,kòng,kǒng": "空",
    "kǒng": "孔恐",
    "kòng": "控鞚",
    "kōng,kǒng": "倥悾",
    "kōng": "崆埪箜硿躻錓鵼",
    "kōng,náng": "涳",
    "qiāng,kōng": "椌",
    "qiāng,kòng": "羫",
    "kòu": "扣蔻寇冦筘叩宼敂窛簆蔲釦鷇滱",
    "kǒu": "口劶",
    "kōu": "抠芤眍剾彄摳瞘",
    "kuà,kū": "挎",
    "ōu": "毆鏂欧鸥殴瓯讴櫙歐甌膒藲謳鴎鷗",
    "qǔ,kǒu": "竘",
    "yū,wū,kū": "扝",
    "chù,shè": "泏",
    "kù,kū": "秙",
    "zhú,kū": "窋",
    "kuà,wù": "趶",
    "kuà": "跨胯骻",
    "kuā,kuà": "夸誇",
    "kuā": "咵舿",
    "xù,kuā": "晇",
    "kuī": "顝亏窥盔岿刲巋窺聧虧闚",
    "kuǎi": "蒯擓",
    "kuài,tuí": "墤",
    "kuì,kuài": "蒉",
    "kuān": "髋寛寬宽髖鑧臗",
    "kuàng": "矿框况旷眶邝纩贶圹岲壙懬昿曠況眖砿穬絋礦絖纊貺軦鉱鋛鑛黋鄺",
    "kuāng": "筐匡诓哐劻匩恇洭誆筺邼軭",
    "kuǎng": "夼儣懭",
    "kuáng,wǎng": "忹",
    "kuáng,wǎng,zài": "抂",
    "kuǐ": "跬煃蹞頍",
    "kuī,lǐ": "悝",
    "kuì,kuǐ": "尯",
    "kuǐ,wěi": "磈",
    "qǐng": "頃顷请謦苘庼廎檾漀請",
    "kùn": "困涃睏",
    "luǎn": "卵",
    "tūn,kuò": "噋",
    "kuò,yuè": "髺",
    "lā,lá": "拉",
    "lā,la": "啦",
    "là,xī": "腊",
    "lǎ": "喇藞",
    "lā": "垃邋柆菈",
    "là,luò,lào": "落",
    "lì,lā,lá": "砬",
    "là,lá": "剌揦",
    "liè": "儠鱲列捩栵猎劣烈埒鬣趔躐冽劽洌埓姴巤挒浖烮煭犣猟聗獵脟蛚迾颲鮤鬛鴷茢",
    "lá": "嚹旯",
    "lā,xié,xiàn": "搚",
    "liè,là": "擸",
    "là,lài": "攋櫴",
    "là,liè": "爉",
    "lá,lā": "磖",
    la: "鞡",
    "lái": "来莱崃涞铼俫倈來崍庲梾棶猍筙琜箂淶萊逨郲騋錸鶆鯠麳",
    "lài,lái": "徕",
    "lái,lài": "婡徠",
    "lǎn": "懶揽懒缆览榄罱漤壈嬾孄孏擥攬浨欖灠覧覽纜醂顲囕",
    "lǎi": "襰",
    "lí,xǐ,xī": "釐",
    "qiān,lán": "厱",
    "tǎn,tàn": "僋",
    "xiàn,làn": "壏",
    "lán,lín": "啉惏",
    "lán,xiàn": "懢",
    "lǎn,làn": "爦",
    "làng": "浪蒗阆埌閬",
    "láng,làng": "郎筤",
    "lǎng": "朗塱崀朖朤烺蓢",
    "làng,liáng": "莨",
    "lāng": "啷",
    "liàng,láng": "哴",
    "léng": "唥楞",
    "liáng": "俍粮良梁墚椋粱樑糧輬辌",
    "liàng": "悢亮辆晾谅喨湸諒輌輛鍄",
    "liǎng": "脼两魉両兩唡啢掚緉蜽裲魎",
    "lǎng,làng": "誏",
    "liáng,liàng": "踉凉量涼",
    "mán": "樠蛮馒谩鳗姏慲蠻謾鬗饅鰻鬘",
    "liáng,láng": "駺",
    "lāo": "捞撈粩",
    "láo": "牢劳铹醪僗崂痨労哰勞憥嶗朥浶癆窂簩顟鐒髝",
    "lào,luò": "烙",
    "lào": "涝酪耢嗠橯嫪澇耮軂躼",
    "luò,lào": "络絡",
    "mǔ,lǎo": "姥",
    "lǎo,lào,liáo": "潦",
    "liāo,liáo": "撩",
    "láo,luò": "磱",
    "liǎo,lù": "蓼",
    "láo,liáo": "蟧",
    "liǎo,le": "了",
    "lè,yuè": "乐楽",
    "lè,lēi": "勒",
    "lei,lē": "嘞",
    "gē,le": "饹",
    "lè,yuè,yào,lào": "樂",
    "lèi": "类泪酹涙淚禷纇蘱銇錑頛頪颣類",
    "léi,lěi,lèi": "累礧",
    "léi": "雷镭缧羸嫘儽檑欙瓃畾縲纝罍纍蔂蘲虆轠鐳鑘靁鱩鼺",
    "lěi": "垒蕾儡磊诔耒傫塁厽壨壘櫐灅癗礨矋蕌藟蘽蠝讄誄鑸鸓",
    "léi,lèi": "擂攂",
    "liě,liē,lié,lie": "咧",
    "léi,lěi": "樏櫑礌",
    "lěi,lèi": "洡",
    "luò,tà": "漯",
    "lěi,léi": "磥",
    "shuì,lèi": "祱",
    "lěi,lèi,léi": "絫",
    "li,lǐ,lī": "哩",
    "lì,lí": "丽",
    "lì,zhí": "郦",
    "lì,luò": "跞攊躒",
    "lì,yuè": "栎櫟",
    "lì,lài": "疠癘",
    "wèi": "位味餧蜼未喂胃卫魏畏谓蔚慰渭猬軎墛媦懀煟熭犚緭罻苿菋藯蘶螱衞蝟褽衛讏謂讆躗躛轊鏏霨餵饖鮇鳚",
    "zhuó,yǐ,lì,jué": "叕",
    "lí,lì": "孋麗",
    "lì,liè": "巁棙爄綟",
    "lì,luò,yuè": "擽",
    "lì,luǒ": "攭",
    "lì,shài": "攦",
    "lí,tái": "斄",
    "mǐ,lì": "沵",
    "máo": "氂毛矛锚茅茆蝥髦牦蟊枆渵楙罞軞鉾酕鶜錨",
    "luò,pō": "濼泺",
    "sǎ": "灑訯靸",
    "máo,lí": "犛",
    "yào,lì": "纅",
    "lí,xǐ,lǐ,sǎ": "纚",
    "lì,lù": "觻",
    "shī": "釃酾师虱失狮施湿诗尸鲺蓍呞屍師浉湤溮溼濕瑡獅葹蒒絁蝨褷襹詩邿鉇鍦鯴鰤鳲鳾鸤鶳",
    "shuò": "鑠铄烁爍朔搠妁槊蒴矟鎙",
    "mái": "霾",
    "sà": "颯飒蕯萨脎卅櫒薩鈒隡馺虄",
    "liǎ": "俩倆",
    "líng,lǐng,lìng": "令",
    "lián,liǎn": "慩梿槤櫣",
    "liǎn,liàn": "摙",
    "qiǎn,lián,xiàn": "槏",
    "lián,liǎn,nián,xián,xiàn": "溓",
    "lián,qiān": "磏",
    "lín": "瞵林临邻磷鳞琳霖遴嶙粼麟辚壣崊斴晽暽潾瀶璘燐碄粦繗翷臨轔鏻鄰隣驎麐鱗阾冧",
    "lìn": "膦赁蔺吝躏悋恡橉甐焛藺蹸躙賃躪轥閵",
    "líng": "苓零魿铃玲灵龄凌陵羚菱伶翎绫酃瓴蛉泠呤棂鲮聆囹柃刢坽姈婈孁夌彾掕昤朎櫺淩澪欞燯爧狑琌砱祾秢竛紷皊舲綾笭蓤蕶衑蔆裬詅跉軨輘醽錂閝鈴霊霝霛駖鸰鯪鹷霗麢齢齡鴒龗羐",
    "liào": "料撂廖尥镣尦炓窷鐐",
    "liáo,liǎo": "燎爎爒",
    "liǎo,liào": "钌瞭釕",
    "liǎo,liáo": "憭",
    "liáo,liú": "漻",
    "liǎo": "鄝镽曢",
    "liāo": "蹽",
    "liù,liáo": "飂",
    "liè,liě": "裂",
    "xié,liè": "劦",
    "liè,lǜ": "哷",
    "xī,liě": "忚",
    "liě": "毟挘",
    "tài,liè": "燤",
    "lín,lìn": "淋獜疄",
    "līn": "拎",
    "rèn,rén": "任",
    "lǐn,lìn": "亃",
    "xǐn": "伈",
    "lín,miǎo": "厸",
    "má,lìn": "痳",
    "lín,lǐn": "箖",
    "lǐn,má": "菻",
    "lìng": "另炩蘦靈",
    "lǐng": "领嶺領",
    "lǐng,líng": "岭岺袊",
    "léng,lēng,líng": "棱",
    "lěng": "冷",
    "líng,léng": "崚",
    "lóng": "靇龙隆聋咙窿胧珑栊砻癃茏嚨巃嶐巄昽曨槞朧湰櫳滝漋爖矓瓏礲礱竜眬聾蠬蘢襱豅蠪鏧鑨霳驡鸗龒",
    "liù,lù": "六",
    "liǔ": "柳绺锍嬼栁桞橮桺熮珋罶羀綹鋶",
    "liū,liù": "溜澑",
    "liù,liú": "馏",
    "lù,liù": "碌",
    "liū": "熘蹓",
    "liù": "遛鹨塯廇磟翏雡霤餾鬸鷚",
    "lǚ,lóu": "僂偻",
    "liú,liǔ": "懰藰",
    "liú,yóu": "斿",
    "lūn,lún": "抡掄",
    "mǎo": "泖鉚铆卯昴冇峁戼笷蓩",
    "liú,liù": "磂鎦",
    "luó,luō,luo": "囖",
    "lǒng": "拢垄陇垅壠壟攏竉隴",
    "lóng,lǒng": "笼篭籠躘龓龍",
    "nòng,lòng": "弄",
    "lóng,shuāng": "泷瀧",
    "lǒng,lóng,lòng": "儱",
    "lòng": "哢梇贚",
    "lòng,lǒng": "徿",
    "luò,lòng": "硦",
    "xiàng": "衖曏向象项像橡蟓勨姠嚮嶑珦缿襐鐌項鱌",
    "lǒu,lōu": "搂摟",
    "lòu": "漏陋镂瘘屚瘻瘺鏤",
    "lòu,lù": "露",
    "lóu,lou": "喽嘍",
    "lóu,lǚ": "慺鷜",
    "lóu,lǘ,lou": "瞜",
    "lǔ": "鲁卤虏掳氇橹镥塷擄樐氌櫓澛滷瀂硵磠艣艪蓾虜鏀鐪鑥魯鹵穞",
    "lǜ,lù": "绿緑",
    "lū": "撸噜嚕擼謢",
    "lǚ": "挔捛铝屡吕缕侣履旅膂褛稆儢侶屢呂焒梠祣穭絽縷郘鋁膐褸",
    "luō,lǚ": "捋",
    "lú,luó": "攎",
    "luàn": "乱亂釠",
    "zhì,luàn": "乿",
    "luán,luàn": "灓",
    "ní,luán": "臡",
    "wàn,luàn": "薍",
    "luó,luǎn": "覶",
    "lüè": "略掠锊畧圙稤鋢鋝",
    "shuài,lǜ": "率卛",
    "lüè,luó": "寽",
    "yào": "药藥燿艞鼼耀鹞曜熎矅穾窔筄葯薬袎覞詏讑靿鷂",
    "lùn,lún": "论論",
    "lǔn": "埨稐",
    "lǔn,lùn": "惀",
    "lùn": "溣",
    "lún,lǔn,lùn": "碖",
    "lún,lǔn": "耣",
    "luō,luó,luo": "啰囉",
    "ruó": "挼",
    "wǒ,luò,luǒ": "捰",
    "luō": "頱",
    m: "呣",
    "má,mǎ,ma": "吗嗎",
    "mā": "妈媽",
    "mǎ": "马码玛犸獁溤瑪碼遤鎷馬鰢鷌",
    "má,ma": "嘛",
    "má": "麻犘痲蔴蟇",
    "mà": "骂唛傌嘜睰祃禡罵閁鬕駡",
    "mǒ,mò,mā": "抹",
    "má,mò": "蟆",
    "mó": "嬷尛嬤劘擵膜魔摹蘑嫫馍谟橅糢謩謨饝饃髍魹",
    "mǎ,mā,mà": "蚂螞",
    "yāo,mó,ma,me": "么",
    "mó,mā": "摩",
    "gè,mā": "亇",
    "mà,mǎ": "杩",
    "nà,nè": "呐吶",
    "mā,má": "嫲",
    "zī,mā": "孖",
    "mà,mā": "榪",
    "mò": "蓦貊驀獏沫墨眽末默陌漠寞秣殁镆瘼貘茉耱嗼圽塻妺嫼帞昩枺歿爅皌眿瞐瞙砞礳纆莈藦蛨蟔絈貃銆靺鏌魩黙",
    "mí": "靡谜蘪迷醚蘼縻麋祢猕冞擟瀰爢禰獼蒾藌袮詸醾謎醿釄鸍镾麊麛麿",
    "mó,me": "麼麽",
    "mǎi": "买荬嘪蕒買鷶",
    "mài": "卖迈麦劢佅勱売脈衇邁霡霢麥賣",
    "mái,mán": "埋",
    "mài,mò": "脉",
    "mī": "咪",
    "mái,wō": "薶",
    "mǎn": "满螨屘満滿襔蟎鏋娨",
    "màn": "慢漫曼幔墁熳缦镘僈嫚澷獌蔄蘰縵鄤鏝",
    "mán,mén": "瞒瞞",
    "màn,wàn": "蔓槾",
    "mān": "颟顢",
    "mán,mèn": "鞔悗",
    "mán,màn": "摱",
    "wàn,màn": "澫",
    "miǎn": "睌免缅冕勉娩腼湎眄偭丏沔勔喕愐汅緬葂鮸靦",
    "mǎn,mán": "矕",
    "miǎn,wèn,mán,wàn": "絻",
    "mǎng": "莽漭壾茻蠎莾",
    "méng,máng": "氓",
    "mǎng,měng": "蟒",
    "lóng,máng,méng,páng": "尨",
    "máng,méng,páng": "庬",
    "méng": "朦甿鸏鹲霿盟萌檬礞甍儚虻艨幪曚橗氋溕獴濛莔蕄蝱鄳鄸靀顭饛鯍",
    "māng": "牤",
    "máng,dòu": "狵",
    "máng,wàng": "盳",
    "méng,měng": "瞢懞矒",
    "mào,mò": "冒",
    "mào": "帽貌茂贸耄懋瞀袤瑁冃冐媢愗暓毷皃眊萺覒蝐貿鄚鄮柕",
    "māo,máo": "猫貓",
    "máo,mào": "旄芼",
    "móu": "侔蛑踎谋鍪劺眸恈謀鴾麰",
    "mǎo,wǎn": "夘",
    "máo,móu,wǔ": "堥",
    "wù,máo": "嵍",
    "miáo": "描苗瞄媌嫹鹋鶓",
    "móu,mù": "牟",
    "miáo,máo": "緢",
    "máo,méng": "髳",
    "mèi,me,mò": "嚜",
    "mē": "嚒",
    "mè": "嚰濹",
    "mó,mā,me": "庅",
    "mèng": "癦梦孟夣夢霥",
    "méi,mò": "没沒",
    "miē": "孭咩吀哶",
    "měi": "每镁美浼凂媄媺嬍嵄挴毎渼燘躾鎂黣",
    "méi": "酶枚霉煤玫梅眉媒嵋猸湄鹛莓镅楣堳塺攗栂楳槑徾湈珻瑂睂脄禖腜脢葿苺郿鎇鶥黴",
    "mí,méi": "糜",
    "wěn": "呅稳吻刎紊抆桽穏肳穩脗伆",
    "mù,mǔ": "坶",
    "mǒu": "某",
    "miè,mèi": "櫗",
    "nì": "氼腻逆匿昵睨堄嫟嬺愵惄暱眤胒縌膩",
    "wēi": "溦微威危巍葳逶隈偎煨薇喴媙嶶愄揋揻椳楲烓燰癓縅葨蜲蝛覣詴隇霺鰃鰄鳂",
    "mèi,wà": "韎",
    "méi,méng": "鋂",
    "mén": "门们扪钔們捫璊菛虋鍆閅門",
    "mèn,mēn": "闷悶",
    "wěi,mén": "亹斖",
    "mèn": "焖懑懣暪燜",
    "mín,mén": "怋",
    "wèn,mén": "汶",
    "mén,yǔn": "玧",
    "mén,méi": "穈",
    "mēn": "椚",
    "mín,wén": "玟",
    "mēng,méng,měng": "蒙",
    "měng": "猛锰勐蜢懵蠓艋冡錳鯭鼆",
    "mèng,méng,měng": "懜",
    "míng,mǐng": "嫇",
    "mēng": "掹擝矇",
    "míng": "明瞑溟蓂冥名铭螟暝茗鸣朙榠洺猽眀眳覭銘鳴詺鄍",
    "wù,méng": "雺",
    "mǐn,miǎn,měng": "黽黾",
    "mǐ": "米弭芈脒敉侎孊洣渳灖粎羋葞蔝銤",
    "mì": "密蜜觅幂汨谧嘧冖冪宻塓峚幎幦榓樒櫁淧滵漞濗熐羃蔤覔覛覓謐鼏怽",
    "mī,mí": "眯瞇",
    "mí,mǐ": "弥彌",
    "mì,sī": "糸",
    "mí,mó": "戂",
    "sè,mí,sù": "摵",
    "mí,mǐ,mó": "攠",
    "nǐ,mí": "檷",
    "mǐ,nǐ": "濔",
    "xūn": "獯勋埙醺薰曛勲勛勳嚑坃壎壦塤燻矄纁臐薫蘍",
    "pàng,pán": "眫",
    "mí,xǐ": "瓕",
    "wǔ,mí": "瞴",
    "mì,miè": "簚",
    "yǎng": "蝆养氧痒佒傟咉坱岟慃懩攁氱炴癢礢紻軮駚養",
    "miàn": "面糆靣麫麪麺麵",
    "miǎn,shéng": "渑澠",
    "mián,miǎn": "媔",
    "wèn,wǎn,miǎn": "莬",
    "miǎo": "秒藐眇渺缈淼杪邈篎緲劰",
    "miào": "庙妙庿玅廟竗",
    "miāo": "喵",
    "piāo,piào": "彯",
    "shā": "紗纱桬殺乷鎩铩杀砂杉鲨痧裟唦硰猀繺蔱閷魦鯋鯊髿毮",
    "miē,niè": "乜",
    "miè,mò": "瀎",
    "mò,miè": "眜",
    "piē,miè": "覕",
    "wěn,mǐn": "呡",
    "mǐn,wěn,mín": "忞忟",
    "mǐn,mín": "暋",
    "wèn,mín": "渂",
    "xián,tián": "盷",
    "xiōng,mín": "賯",
    "mìng": "命掵椧",
    "mǐng": "佲凕姳慏酩",
    "miù": "谬謬",
    "mō": "摸嚤",
    "mó,mò": "磨",
    "mò,mù": "莫",
    "mó,mú": "模",
    "wàn,mò": "万",
    "wú": "无無譕毋蟱墲吴芜梧蜈鼯浯呉吳峿橆洖珸璑祦莁茣蕪郚鋙铻鯃鵐鷡鹀",
    "mò,wà": "帓",
    "mò,wěn": "歾",
    "mǒ": "懡",
    "mù,mò": "縸",
    "wà": "袜腽嗢膃襪韤",
    "mōu": "哞",
    "sī,mǒu": "厶",
    "wù,móu": "敄",
    "yú,móu": "桙",
    "mù,móu": "鞪",
    "mú": "毪氁",
    "wǔ,mǔ": "娒",
    "niǎo,mù": "樢",
    "nà,nǎ,nèi,nā": "那",
    "ná": "拿镎嗱拏鎿",
    "nǎ,něi,na,né": "哪",
    "nán,nā": "南",
    "nà,nuó": "娜",
    "nèi,nà": "内",
    "nǎ": "乸雫",
    "nà,nàn": "妠",
    "náo": "呶詉铙挠猱蛲硇夒峱嶩巎撓譊蟯鐃",
    "nè,nì,ruì,nà": "抐",
    "rú,ná": "挐蒘",
    "niǎn,shěn": "淰",
    "ruò": "篛箬偌叒弱楉爇焫蒻鄀鰙嵶鶸鰯",
    "xiáo": "訤淆崤洨誵",
    "nì,ná": "誽",
    "nuò": "蹃懦糯诺锘搦愞懧掿榒稬穤糑糥逽諾鍩",
    "nài": "耐萘奈柰鼐渿褦錼",
    "nǐ,nǎi": "妳",
    "nái": "孻腉",
    "nǐ,niè,yì": "掜",
    "zhì,nái": "搱摨",
    "xióng": "熋熊雄",
    "nài,něng": "螚",
    "néng,nài": "能",
    "nán": "男楠侽喃娚抩暔枏柟畘莮遖",
    "nán,nàn,nuó": "难難",
    "nǎn": "赧蝻腩戁揇湳煵萳",
    "nān": "囡",
    "nàn": "婻",
    "nán,nàn": "諵",
    "náng,nāng": "囊",
    "náng,nǎng": "馕",
    "nǎng": "曩攮擃灢",
    "náng": "乪嚢欜蠰饢",
    "nāng": "囔",
    "nàng,nāng": "儾",
    "nóng": "哝噥譨鬞檂农浓脓侬儂欁禯濃秾蕽膿襛辳穠農醲燶",
    "róng,náng,nǎng": "搑",
    "ráng,nǎng": "瀼",
    "náo,nǎo,náng": "憹",
    "nàng": "齉",
    "ráng": "蘘鬤瓤穰禳穣獽躟",
    "nǎo": "脑恼垴匘瑙堖嫐悩惱碯脳腦",
    "nāo": "孬",
    "náo,niú": "怓",
    "náo,nǎo,yōu": "獶",
    "ráo,náo": "橈桡",
    "náo,yōu": "獿",
    "róu": "蝚柔糅揉蹂媃鞣渘瑈粈腬瓇煣葇輮鍒騥禸鰇鶔脜",
    "ní,ne": "呢",
    "něi,suī": "娞",
    "wǒ": "婑我婐",
    "něi": "馁脮腇鮾餒鯘",
    "suī,něi": "浽",
    "nèn": "嫩嫰",
    "ruǎn,nèn": "媆",
    "nèn,nín": "恁",
    "nǐ": "你拟伱儞旎孴晲擬狔苨薿隬",
    "ní,nì": "泥秜",
    "nì,niào": "溺",
    "nī": "妮",
    "nǐ,nì": "伲",
    "ní,nǐ": "婗棿",
    "zhuǎn": "孨竱轉",
    "nǐ,ní": "抳",
    "nìng": "濘泞佞侫澝倿",
    "qiè,ní": "蛪",
    "nián": "年黏鲶鲇哖秊秥鮎鯰鵇",
    "niǎn,niē": "捻",
    "nián,niàn": "姩",
    "zhǎn": "輾盏展斩嫸搌琖斬盞醆颭飐",
    "zhǎn,niǎn": "辗",
    "niào,suī": "尿",
    "niào": "脲",
    "niē": "捏揑",
    "xìng": "幸姓性杏悻倖荇婞嬹涬緈臖莕葕",
    "shè,niè": "摄攝",
    "nié": "苶",
    "niè,rěn": "菍",
    "zhé,niè": "銸",
    "zuì,niè": "鋷",
    "nín": "囜您脌",
    "nǐn": "拰",
    "níng,nìng,zhù": "宁",
    "níng,nǐng,nìng": "拧擰",
    "níng,nìng": "寍寕寗甯寜寧",
    "rǎng": "攘壤壌爙",
    "yí,nǐ": "疑",
    "zhù,níng": "苧",
    "niú,yóu": "汼",
    "nǜ,niǔ": "沑",
    "niú": "牜牛",
    "yòu": "蚴佦幼又右诱佑釉宥囿鼬亴侑哊唀峟姷狖祐貁誘迶酭",
    "nòng": "挊挵齈",
    "nòng,nóng": "癑",
    "nǒng": "繷",
    "nù,nuò,nòu": "搙",
    "rǔ": "擩汝乳辱肗鄏",
    "nòu,ruǎn,rú": "檽",
    "nòu,rú": "獳",
    "nóu": "羺",
    "ròu": "譳肉宍",
    "nǔ": "努胬弩砮",
    "nú": "奴驽孥笯駑",
    "nù": "怒傉",
    "nú,nǔ": "伮",
    "rù": "褥縟缛入蓐溽洳嗕媷扖杁鳰",
    "nuán": "奻",
    "nuǎn": "暖煖煗餪",
    "nuǎn,nuán": "渜",
    "tuàn,nuǎn": "湪",
    "tǎng,nú": "帑",
    "nüè,yào": "疟瘧",
    "nún": "黁",
    "nuó": "挪傩儺梛橠",
    "nuò,rě": "喏",
    "ruán": "堧撋壖",
    "ná,nuò": "搻",
    "ruǎn,nuò": "耎",
    "nǚ,rǔ": "女",
    "nǜ": "衄恧衂",
    "nǚ": "钕籹釹",
    "nǜ,gǎ": "朒",
    o: "筽",
    "wài": "夞外顡",
    "wēn": "昷温瘟塭榲殟瑥溫豱轀輼辒鎾饂鰛鰮鳁",
    "wēn,yùn": "鞰榅",
    "ǒu": "偶藕耦吘嘔腢蕅",
    "ō,wō": "喔",
    "ǒu,ōu,òu": "呕",
    "òu,ōu": "沤漚",
    "òu": "怄慪",
    "ōu,qiū": "塸",
    "ōu,ǒu": "熰",
    "yū": "紆纡込淤迂瘀唹盓箊迃陓",
    "pā": "趴啪妑葩舥",
    "pái": "牌徘俳犤猅輫簰簲",
    "pò,pǎi": "迫廹",
    "piàn,piān": "片",
    "xì,pǎn": "盻",
    "pèng": "踫碰掽椪槰",
    "pǎng": "耪覫",
    "hóng,pāng": "沗",
    "péng,páng": "篣",
    "pāo": "抛脬拋萢",
    "pào,pāo": "泡",
    "pèi": "配佩沛帔旆霈辔姵伂斾珮蓜浿馷轡",
    "pěi": "俖",
    "pǐ,pèi": "嶏",
    "yí,pèi": "媐",
    "pī,pēi": "抷",
    "pì,pèi": "淠",
    "pěn": "呠翸",
    "pēng,píng": "泙硑",
    "píng,péng": "淜",
    "bēn,pēng": "漰",
    "pēng,pèng": "磞閛",
    "píng,pēng": "胓苹",
    "pí,pī": "铍",
    "xiù,pì": "嚊",
    "bī,pi": "榌",
    "pì,piē": "潎",
    "pǐ,yǎ,shū": "疋",
    "piě": "苤丿鐅",
    "pī,zhāo": "釽",
    "piān": "篇偏翩囨犏媥楄鍂",
    "piàn": "骗騗魸騙",
    "pián": "骈蹁胼楩腁賆騈駢骿",
    "piǎn": "谝覑貵諞",
    "piào,piāo": "票",
    "piáo": "瓢薸闝",
    "pǔ,pò,pō,piáo": "朴",
    "piǎo,piāo": "缥縹",
    "piè": "嫳",
    "pǐn": "品榀",
    "pīn": "拼姘礗穦驞馪",
    "pīng": "娉乒俜涄甹砯聠艵頩",
    "pìn,děng": "朩",
    "pín,píng": "蘋",
    "pǐng,bǐng": "屛",
    "xiǎo": "皛謏小晓筱暁曉皢筿篠",
    "pǒu": "咅哣犃",
    "yìn": "堷憖印胤茚垽廕慭憗懚洕湚猌癊酳鮣",
    "pōu": "剖",
    "pū,pù": "铺痡鋪",
    "pū,pú": "仆",
    "wén": "駇文闻蚊雯阌彣炆珳瘒聞芠螡蚉蟁閺闅闦閿馼魰鳼鴍鼤繧",
    "qī,qì": "妻",
    "qǐ,kǎi": "岂",
    "qì,qiè": "砌栔",
    "qī,xī": "栖",
    "sì,qí": "俟",
    "qì,sè": "槭",
    "qí,yín": "圻",
    "qí,shì": "耆忯",
    "qī,còu": "傶",
    "qiē,qiè": "切",
    "zhī,zī": "吱",
    "yì,qì": "忔",
    "sù,xiǔ,xiù": "宿",
    "xī,qī,xù": "恓",
    "zhī,qí": "枝",
    "sì,qǐ": "梩",
    "sè,qì,zì": "洓",
    "qì,xì,xiē": "滊",
    "qì,zhú": "磩",
    "qìng,qǐ": "綮",
    "xī,qī": "螇",
    "qí,zhǐ": "蚔",
    "xǔ": "諿糈栩醑诩喣暊珝盨詡鄦",
    "qiā": "掐葜",
    "xiá,qià,yà": "磍",
    "qiān,yán": "铅",
    "qiàn,qiè": "慊",
    "qián,xún": "荨蕁",
    "xián,qiàn,qiè": "嗛",
    "qiān,sú": "圱",
    "xiān,qiān": "孅",
    "qīn,qiǎn": "嵰",
    "qián,qín": "忴扲",
    "qiān,wàn": "掔",
    "zǎn,zān,zēn,qián": "撍",
    "qiān,lián": "檶",
    "shǎn,qián,shān": "炶煔",
    "quān": "箞悛鐉",
    "qiàn,qīng,zhēng": "綪",
    "qián,xián,yán": "羬",
    "qiǎng": "羥羟襁镪墏繈繦",
    "qiān,xián": "臤",
    "chán,yín": "苂",
    "qín,qián": "蚙",
    "qiàng": "炝唴熗羻",
    "qiáng,sè": "廧薔",
    "qīn,qìng": "親亲",
    "qiǎng,qiāng": "鏹",
    "qiǎo": "巧愀髜",
    "qiáo,qiào": "翘嘺翹",
    "qiào": "撬窍峭诮僺竅誚躈陗鞩韒髚",
    "qiǎo,qiāo": "悄",
    "qiào,shāo": "鞘",
    "què,qiāo,qiǎo": "雀",
    "qiào,xiào": "俏",
    "qiāo,sāo": "缲繰",
    "zào,qiāo": "喿",
    "xiāo,xuē": "削",
    "shān,qiāo,shēn": "幓",
    "qiáo,què": "墧",
    "shāo,shào": "捎稍",
    "shū,qiāo": "橾",
    "zhāo": "招昭钊妱巶鉊鍣駋釗",
    "qiáo,jiào": "癄",
    "qiáo,shào,xiāo": "睄",
    "què,qiāo": "碻",
    "shuò,xiāo,qiào": "箾",
    "qiáo,zhǎo": "菬",
    "qiè,xì": "郄",
    "shà,qiè": "帹",
    "qiè,hé": "朅",
    "xì,qiè": "稧",
    "qiē": "苆",
    "qìn": "沁吣吢唚揿抋搇撳瀙菣藽",
    "tán,qín": "覃",
    "zhēn,qín": "溱",
    "qín,shēn": "嫀",
    "qīn,qìn": "寴",
    "qīn,xiān": "綅",
    "yǐn": "赺輑引饮尹蚓瘾嶾朄檃檼櫽淾濥癮粌蘟螾讔趛鈏靷",
    "zèng": "鬵囎赠甑熷锃贈鋥",
    "qíng,yīng": "啨",
    "qīng,zhēng": "埥",
    "shēng": "声栍生升甥牲笙呏斘昇曻殅泩枡湦焺珄竔聲鉎鍟阩陞鵿陹鼪",
    "qìng,qiàn": "掅",
    "huán,xuān,qióng": "嬛",
    "xuán,qióng": "琁",
    "qióng,wěi,wèi": "瓗",
    "qiǔ": "糗搝",
    "róu,qiú": "厹",
    "tǔn": "氽",
    "qiú,wù": "渞",
    "xiū": "鱃脩咻修羞馐貅髹鸺俢樇庥烌脙臹銝鎀飍髤饈鮴鵂",
    "qù": "去阒刞厺迲閴闃麮鼁",
    "qū,qǔ": "曲紶",
    "qù,qū": "觑覻覷",
    "qú,yù": "翑",
    "qū,qù": "覰",
    "quàn,xuàn": "券",
    "quán,juàn": "婘",
    "quán,zhuān": "恮",
    "shuān": "拴栓闩閂",
    "quān,juàn,quán": "椦",
    "tuán,shuàn,quán": "槫",
    "xún,quán,quàn": "灥",
    "quán,shuān": "絟",
    "qué": "瘸",
    "zhuó,què": "汋",
    "shuò,xī": "獡",
    "què,xī": "碏",
    "rán": "然燃髯呥嘫蚺繎肰衻袇髥袡蚦",
    "rǎn,yān": "橪",
    "ràng": "让懹譲讓",
    "rǎng,rāng": "嚷",
    "ráng,xiāng": "勷儴",
    "niáng": "孃",
    "xiāng": "忀欀鑲镶稥香乡箱厢襄湘骧芗缃葙楿廂瓖膷萫緗薌郷鄊鄕鄉驤鱜麘",
    "xiāng,rǎng": "纕",
    "ráo": "饶荛襓蕘饒",
    "rào": "绕繞遶",
    "ráo,rǎo": "嬈娆",
    "xiāo,rào": "穘",
    "rǎo": "扰隢擾",
    "rè": "热熱",
    "ruò,rě": "若",
    "ruó,wěi,ré": "捼",
    "rě": "惹",
    "ruò,rè,luò": "渃",
    "rěn": "忍荏稔栠栣秹綛荵躵",
    "rěn,shěn": "棯",
    "rén,rěn": "銋",
    "yáng,rì": "氜",
    "rì": "日馹驲囸鈤衵",
    "róng": "容融绒溶熔荣戎蓉茸榕狨嵘傛蝾媶嫆嬫峵搈曧嶸栄榵毧榮瀜瑢穁烿絨羢茙螎鎔褣镕蠑駥",
    "róng,yíng": "嵤爃",
    "ròng": "穃",
    "róng,rǒng,ròng": "縙",
    "sòng": "頌颂送宋讼诵鎹訟誦餸",
    "róu,ròu": "楺",
    "rǒu": "韖",
    "rū": "嶿",
    "ruǎn,ruàn": "緛",
    "ruí": "蕤桵甤緌",
    "suǒ,ruǐ": "惢",
    "zhuō": "棁拙捉桌涿倬梲棳槕窧鐯",
    "zhuì,ruì": "笍",
    "suí": "綏绥随瓍遀隨髄",
    "shēng,ruí": "苼",
    "rùn": "橍润闰潤閠閏",
    "sǎ,xǐ": "洒",
    "sā,sǎ": "撒",
    "suō,shā": "挲莎挱",
    "sā": "仨",
    "sà,shā,shǎi": "摋",
    "yuè,sà": "泧",
    "sǎ,xiè": "躠",
    "sǎn,xiàn,sà": "鏾",
    "sàn,sǎ": "潵",
    "sà,xì": "钑",
    "sāi,sài,sè": "塞",
    "sāi": "腮噻嘥毢顋鰓",
    "sāi,xǐ": "鳃",
    "sī,sāi": "思",
    "sài": "赛僿賽簺",
    "sǎi": "嗮",
    "sāi,sī,sǐ": "愢",
    "sāi,suī": "毸",
    "sān": "三叁毵厁弎毶犙毿鬖",
    "sàn,sǎn": "散",
    "sǎn": "伞馓傘繖糤饊",
    "sǎn,shēn": "糁糣糝",
    san: "壭",
    "sàn": "俕閐",
    "shān,xiǎn": "彡",
    "shuǐ": "氵水氺閖",
    "sǎng": "颡嗓磉搡鎟褬顙",
    "sāng": "桑槡桒",
    "sāng,sàng": "丧喪",
    "sǎo,sào": "扫掃",
    "sāo,sǎo": "骚",
    "sāo": "搔鳋缫掻溞騒繅騷鱢鰠螦",
    "sǎo": "嫂",
    "sào,sǎo": "埽",
    "shāo,sào": "梢",
    "sāo,sào": "臊",
    "sào": "瘙氉矂髞",
    "sāo,sōu": "颾",
    "sù,shuò": "愬洬",
    "sè,shà": "歰",
    "suò": "溹蜶逤",
    "suǒ,sè": "鎍",
    "xì,sè,tà": "闟",
    "sè,xí": "雭",
    "sēn": "槮森襂椮",
    "sē,xī": "閪",
    "shā,shà": "沙煞",
    "shá": "啥",
    "shǎ": "傻儍",
    "shà,xià": "厦廈",
    "shā,xiè": "榝樧",
    "yē": "噎倻椰吔擨暍歋潱蠮",
    "zōng,zòng": "繌緵",
    "shē": "賖賒赊奢猞畲檨輋畭",
    "shài": "晒曬",
    "shāi": "筛篩簁籭",
    "shāi,sī": "簛",
    "shù": "術树束述戍墅竖庶恕漱沭腧庻怷樹潄濖竪絉荗蒁虪裋豎鉥錰鏣鶐霔",
    "shǎn": "闪陕晱熌睒覢閃陝",
    "shàn,shān": "扇",
    "yǎn,shàn": "剡",
    "yán,shān": "埏",
    "zhān,shàn": "嶦鳣",
    "shàn,yàn,yǎn": "掞",
    "tān,shàn": "潬",
    "shān,diàn": "痁",
    "shàn,shuò": "銏",
    "shàng,shǎng": "上",
    "shāng": "伤商墒熵觞殇慯傷滳殤漡蔏螪謪觴鬺",
    "tāng,shāng": "汤湯",
    "shāng,yáng": "禓",
    "shàng,zhǎng": "鞝",
    "shǎo,shào": "少",
    "shāo": "烧艄筲弰旓燒焼萷蕱輎髾鮹",
    "zhào,shào": "召",
    "tiáo,sháo": "苕",
    "shào,shāo": "娋",
    "sháo,shào": "柖",
    "zhāo,shào": "佋",
    "shāo,xiāo": "莦",
    "shè,yè,yì": "射",
    "zhē,zhé,shé": "折",
    "xī,shè": "歙",
    "shě": "捨",
    "shē,yú": "畬",
    "jí,shé": "磼",
    "shè,xiè": "韘",
    "shèn,shén": "甚",
    "shí,shén": "什",
    "shēn,xīn": "莘",
    "zhēn,shèn": "椹",
    "xìn,shēn": "信",
    "yǐn,shěn": "吲",
    "shēn,xiān": "姺",
    "tián,shēn": "搷",
    "shěng,xǐng": "省",
    "shěng": "偗眚渻",
    "shēng,xīng": "狌",
    "xīng": "箵興星腥惺猩垶曐煋瑆皨篂觪觲謃騂鮏骍鯹",
    "shǐ": "使史矢驶始屎豕乨兘宩榁笶鉂駛",
    "shí,zhì": "识",
    "sì,shì": "似",
    "xū,shī": "嘘噓",
    "zhí,shi": "殖",
    "zhì,shì": "峙崻",
    "shí,sì,yì": "食",
    "shì,shí": "莳蒔",
    "shì,zhē": "螫",
    "zhì,shī": "厔",
    "yì,shì": "埶醳",
    "shì,tǐ": "徥",
    "shì,tài": "忕",
    "tí,shì": "惿",
    "zhái,shì,tú": "檡",
    "xī,shǐ": "狶",
    "tà,shì": "狧",
    "tān,shǐ": "痑",
    "shì,zhì": "秲銴",
    "shī,yí": "箷釶",
    shi: "籂辻",
    "zhuǎi": "跩",
    "tā,tuó": "铊",
    "zhī,shì": "馶",
    "zā": "魳匝帀沞咂臜臢鉔迊",
    "shōu": "收収",
    "shǒu": "首手守艏垨扌",
    "shú": "熟赎孰秫塾尗璹贖",
    "shòu,tāo": "涭",
    "shòu,sōu": "鏉",
    "shù,shǔ,shuò": "数數",
    "shǔ,zhǔ": "属屬",
    "shù,shú,zhú": "术朮",
    "xú": "俆禑徐冔",
    "shù,zhù": "澍尌",
    "yú,yù,shù": "俞",
    "yú,shù": "兪",
    "shù,xún": "咰",
    "sòu": "嗽瘶",
    "yù,shū": "忬悆",
    "shù,sǒng,sōu": "捒",
    "zhū,shú": "朱",
    "sù": "涑溯潚诉素速塑肃粟愫僳簌觫谡夙嗉傃蔌塐嫊憟榡樎樕殐泝溸潥玊珟璛粛縤膆肅藗訴趚謖蹜遬遡鋉驌餗骕鱐鷫鹔",
    "tú,shū": "瑹",
    "tú,shǔ": "稌",
    "sǒu,shǔ": "籔",
    "xú,shú": "蒣",
    "tòu": "透",
    "yú,yáo,shù": "隃",
    "shuā": "唰",
    "shuā,shuà": "刷",
    "shuǎ": "耍",
    "shuà": "誜",
    "shuàn": "涮腨",
    "shuāi": "摔",
    "shuǎi": "甩",
    "shuài": "蟀帅帥",
    "shuāng": "双霜孇孀欆礵艭驦騻骦鷞鸘雙鹴",
    "sǒng": "傱耸怂竦悚嵷愯慫駷聳",
    "shuàng": "灀",
    "shuí": "谁脽",
    "shuì": "睡税帨涗涚裞稅",
    "zhuì,shuì": "娷",
    "shuō,shuì,yuè": "说説說",
    "tuō,shuì": "挩捝",
    "shuí,shéi": "誰",
    "shùn": "顺瞬舜橓瞚蕣鬊順",
    "shǔn": "吮",
    "xuàn,shùn,xún": "眴",
    "rún,shùn": "瞤",
    "shuò,shí": "硕碩",
    "chuò,yuè": "哾",
    "shuò,sòu": "欶",
    "zhuó,zhào": "濯啅",
    "sǐ": "死",
    "zhì,sī": "傂",
    "tái,tāi": "台苔",
    "sì,zhǐ,xǐ": "杫",
    "sī,tí": "磃",
    "yù,sì": "銉",
    "sī,tuó": "鋖",
    "yí,sì": "飴",
    "sōng": "松菘淞嵩倯凇崧庺娀憽枀柗枩檧硹梥濍鬆",
    "xuān,sòng": "吅",
    "sōng,zhōng": "忪",
    "sōu,sǒng": "摗",
    "zǒng,sōng": "揔",
    "sòu,sǒu": "擞擻",
    "zōu,sǒu": "棷",
    "xiāo,sōu": "撨",
    "sōu,sǒu": "蓃",
    "sú": "俗",
    "sū,sù": "苏",
    "suō,sù": "缩縮",
    "sū": "酥稣囌櫯甦窣穌蘓蘇鯂",
    "suì,sù": "埣",
    "sù,yìn": "梀",
    "sù,xiè": "碿",
    "zuì,zú,sū": "稡",
    "sù,yóu": "莤",
    "suàn": "算蒜筭笇祘",
    "suǎn": "匴",
    "suī": "虽濉荽倠哸夊滖芕荾鞖雖",
    "suǐ": "髓瀡膸",
    "zuī,suī": "嗺",
    "suì,zuì": "睟",
    "sūn,xùn": "孙孫",
    "sǔn": "损笋榫隼損箰筍鎨",
    "xùn": "巺潠蕈讯训殉迅驯汛逊巽伨徇侚卂噀愻殾狥訊訓訙迿鑂遜顨馴",
    "sǔn,zhuàn": "簨",
    "sǔn,xùn": "鶽",
    "xiē,suò": "些",
    "zǎo,suǒ": "璅",
    "tuò,tà,zhí": "拓",
    "tà,tàn": "傝",
    ta: "侤",
    "dùi": "襨",
    "tāi": "胎囼孡",
    "tái,yīng": "旲",
    "yí,tāi": "珆",
    "tàn": "碳叹探炭嘆歎湠舕",
    "tiǎn": "舔腆忝殄倎唺悿晪淟睓觍覥賟錪餂",
    "tāng": "羰镗劏嘡薚蝪蹚鞺鼞",
    "tāng,táng": "鏜",
    "tào": "套",
    "tǎo": "讨討",
    "jīn,sǎn": "仐",
    "táo,yáo": "匋",
    "yǎn,tāo": "夵",
    "yǎo,tāo": "抭",
    "chóu,táo,dào": "梼",
    "téng": "疼藤儯幐誊滕漛籐籘縢腾虅螣邆駦謄驣鰧騰",
    "tēng": "膯鼟熥",
    "tèng": "霯",
    "tí,tǐ": "醍",
    "tí,tì": "绨綈",
    "xī,tì": "裼",
    "yí,tí": "荑桋",
    "tǐ,tì": "挮",
    "tī,zhì,zhāi": "擿",
    "tì,yuè": "趯",
    "tǐ": "躰軆骵",
    "tǐ,tī": "體",
    "tiān": "天添兲婖酟靔靝黇",
    "tiàn": "掭舚",
    "tūn,tiān": "呑",
    "tǐng": "娗挺艇侹圢涏烶珽脡誔頲颋",
    "tiǎn,tiàn": "琠",
    "tiàn,tián,zhèn": "瑱",
    "zāi,zī": "畠甾",
    "tián,diān,yǎn": "窴",
    "tián,tiàn": "菾",
    "tiáo,tiāo": "条條",
    "tiǎo,yáo": "窕",
    "tiāo,yáo": "恌",
    "tǒu,tiǎo": "斢",
    "tiē": "贴萜貼",
    "tiè,tiě,tiē": "帖",
    "tiē,zhān": "怗",
    "tiè": "餮飻",
    "tiē,zhé": "聑",
    "zhān,zhàn": "占",
    "tǐng,tìng": "梃",
    "tīng,yíng": "桯",
    "tíng,tīng": "渟",
    "tíng,tǐng": "閮",
    "tóng,tòng": "同",
    "tōng": "通嗵樋炵蓪",
    "wéi,tōng": "囲",
    "yǒng,tóng": "硧",
    "tóng,zhǒng": "穜",
    "tōng,tóng": "痌",
    "tóu,tou": "头",
    "tōu": "偸偷鍮",
    "tǒu": "妵敨紏蘣黈",
    "tōu,yú": "婾媮",
    "yú,tōu": "愉",
    "tōu,xū,shū": "緰",
    "zhù,tǒu": "飳",
    "tǔ,tù": "吐唋",
    "tū": "突秃凸堗嶀捸涋湥痜葖禿鋵鵚鼵",
    "tù,tú": "菟莵",
    "yì,tú": "墿",
    tu: "汢",
    "tú,zhā": "潳",
    "tuān": "湍圕煓",
    "tuǎn": "疃畽",
    "zhuān,tuán": "塼",
    "tuán,zhuān": "剸漙篿",
    "tuān,tuàn": "猯貒",
    "tuǐ": "腿俀蹆骽",
    "tuì,tùn": "褪",
    "tuì": "退蜕煺娧蛻駾",
    "tuī": "推蓷藬",
    "tuó,tuì": "侻",
    "tè,tuī": "忒",
    "tuǐ,tuí": "僓",
    "zhūn,tūn,xiāng,duǐ": "啍",
    "wà,tuǐ,zhuó": "聉",
    "yí,tuī": "讉",
    "tún,zhūn": "屯",
    "tún,dùn": "坉",
    "tūn,zhùn": "旽",
    "tūn,yūn": "涒",
    "zhūn": "窀宒谆衠迍諄",
    "tuō,zhé": "乇杔馲",
    "tuǒ,yí": "彵",
    "wěi,tuǒ": "撱",
    "yí,lì,lí,duò,tuò": "杝",
    "tuō,tuò": "涶",
    "tuó,yí": "狏",
    "yí,yì": "袘",
    "tuó,tuō": "袉",
    "yǐ,yí": "迆迱迤",
    "": "桛烪",
    "bō,bǒ": "癷",
    "xuē": "辪靴薛疶蒆辥鞾",
    "yīng": "鶑嫈英霙鹰樱缨婴鹦莺璎嘤撄瑛罂膺偀噟媖嚶孆嬰孾愥攖朠桜渶櫻煐珱甇瓔甖碤礯緓绬纓罃罌蘡蝧蠳褮譻譍賏軈鑍锳鴬鶧鷪韺鶯鷹鸎鸚",
    "wǎ,wà": "瓦",
    "wǎ": "佤咓砙邷",
    "yuē,wā": "啘",
    "wàng,jiā,wā": "徍",
    "wā,wǎ,wà": "搲",
    wa: "瓲",
    "wāi": "喎歪竵",
    "wǎi,wēi": "崴",
    "wān": "弯湾豌蜿剜塆壪帵彎潫睕灣",
    "wǎn,yuān": "宛箢",
    "wǎn,yùn": "菀",
    "wǎn,wān": "埦",
    "wàn,yuán": "妧",
    "yuàn,wǎn,wān,yuān": "夗",
    "yuān,wǎn": "惌",
    "wàn,wǎn,wān,yù": "捥",
    "wǎn,wò,yuān": "涴",
    "yuán,wán": "蚖杬",
    "wàn,zhuàn": "贃",
    "yuǎn,yuān,wǎn,wān": "鋺",
    "zōng": "鍐鬷宗棕鬃踪腙倧堫嵕嵏惾朡椶熧猣磫緃翪葼蝬豵踨鑁騌騣骔鬉蹤鯮鯼",
    "wàng": "望忘旺妄朢",
    "wáng,wàng": "王",
    "wáng,wú": "亡",
    "wáng": "亾仼兦莣蚟",
    "wǎng,wàng": "暀",
    "wǎng,wāng": "瀇",
    "zhù,wǎng": "迬",
    "wěi,yǐ": "尾",
    "wěi,wēi": "委",
    "wèi,yù": "尉叞",
    "wéi,xū": "圩",
    "wō,wēi": "倭",
    "wēi,yán": "厃",
    "wō,wěi": "唩",
    "wéi,wěi": "媁",
    "wēi,wěi": "嵔",
    "wéi,zuì": "欈",
    "yǒu,yòu": "有",
    "yá,wèi": "猚",
    "wéi,yù": "琟",
    "wěi,yòu,yù": "痏",
    "wéi,wèi,ái": "硙",
    "wěi,wèi": "碨",
    "yuǎn,wěi": "薳",
    "wén,wèn": "纹紋",
    "huá,qì": "呚",
    "yūn,yǔn": "煴熅",
    "yùn,yūn,wēn": "緼縕缊",
    "yùn,wēn": "韫",
    "wēng": "翁嗡聬鎓螉鶲鹟",
    "wèng": "蕹瓮罋甕齆",
    "wěng,yǎng": "勜",
    "wěng": "蓊塕嵡奣暡瞈攚",
    "wěng,wēng": "滃",
    "zhuā,wō": "挝撾",
    "wò,xiá": "捾",
    "wò,yuè": "枂臒",
    "yūn,wò": "馧",
    "wú,yù": "吾",
    "yú,wū": "於杅",
    "wú,wù,yú": "娪",
    "yū,wū": "扜",
    "wù,wǔ": "旿",
    "xǐ,xiǎn": "洗",
    "xiǎn,xǐ": "铣銑",
    "xī,xì": "傒",
    "xī,shù": "怸",
    "xì,xié": "慀",
    "xī,zhé": "扸",
    "xǐ,xī": "憘",
    "xī,xǐ": "暿",
    "xī,yà": "潝",
    "xī,yì": "焬",
    "xī,yí": "煕",
    "yì,xī": "羛",
    "xí,xì": "蒵",
    "xí,xiào": "薂",
    "ēi,éi,ěi,èi,xī": "誒诶",
    "yā,ya": "呀",
    "yǎ,xiā": "疨",
    "xiā,xiǎ": "閕",
    "xiàn,xuán": "县縣",
    "xiān,xiǎn": "鲜鮮",
    "xián,xuán": "伭",
    "xiàn,xián": "咞",
    "xián,xuán,xù": "妶",
    "xián,xiàn": "憪",
    "xiǎn,xiān": "搟",
    "xiān,zhēn": "枮",
    "xuán,xián": "玹",
    "xián,xín": "礥",
    "yán,xiàn": "綖",
    "xìn,xiàn": "軐",
    "xiǎng": "想响享飨鲞饷亯晑蠁蚃響餉饗鮝鯗鱶",
    "xiāng,xiàng": "相",
    "xiáng": "祥翔庠佭栙絴跭詳",
    "xiáng,yáng": "详",
    "yáng,xiáng": "羏羊",
    "xiǎng,náng": "饟",
    "xiāo,xiào": "肖",
    "xiào,xué": "敩",
    "xiáo,yáo,xiào": "殽",
    "yào,xiāo": "獟",
    "xiě,xuè": "血",
    "xiě": "写冩藛",
    "xié,yá,yé,yú,xú": "邪",
    "xiè,yì": "泄",
    "yè,xié": "叶",
    "xié,yé": "峫",
    "xiě,xiè": "寫",
    "yì,xiè": "枻栧",
    "xié,jiē": "瑎",
    "xiè,yè": "緤",
    "yé,yē": "耶",
    "xīn,xìn": "芯",
    "xīng,xìng": "兴",
    "xiǔ": "潃朽滫糔",
    "xíng,yīng": "荥",
    "xíng,yíng": "滎",
    "xǐng,xìng": "睲",
    "yán,yàn": "硏研",
    "xiòng,xuàn": "夐敻",
    "xiòng": "詗诇",
    "xiū,xǔ": "休",
    "xiú": "苬",
    "yǒu": "莠黝友酉卣牖铕丣梄湵禉羑聈苃蜏銪",
    "xiū,xiù": "鏅",
    "xū,yù": "吁",
    "xǔ,xū": "姁湑稰",
    "zhèng": "幁靕证郑政塣诤証諍證鄭鴊",
    "xù,xuè": "怴",
    "yù,xù": "惐淢",
    "xù,xū": "旴",
    "xù,zhù": "芧",
    "xù,yù,xū": "藇",
    "yì,xǔ": "蛡",
    "xuán": "悬玄漩璇痃嫙暶懸檈璿蜁",
    "xuán,xuàn": "旋",
    "xuǎn,xuān": "咺",
    "xuān,yuān": "弲",
    "xuàn,yuán": "楥",
    "yuān": "蜎冤渊鸳眢鸢剈囦寃嬽棩渁渆淵渕灁肙葾蒬蜵駌鴛鳶鵷鼘鹓鼝",
    "xún,xuān": "駨",
    "xuě": "雪鳕樰膤艝轌鱈",
    "xūn,xùn": "熏爋",
    "yìn,xūn": "窨",
    "xùn,zhuì": "奞",
    "xún,xùn": "毥",
    "yàn,xún": "爓",
    "xùn,zè": "稄",
    "yín,xún": "蟫",
    "yà,yǎ": "挜掗",
    "yé": "瑘爷揶铘爺鎁鋣",
    "yà,yē": "窫",
    "yé,yá": "釾",
    "yān,yàn,yè": "咽",
    "yīn,yān,yǐn": "殷",
    "yàn,yān": "燕",
    "yǎn,yān": "奄",
    "yuán,yán": "芫",
    "yān,yīn": "湮歅",
    "yān,yàn": "傿嬮",
    "yǎn,yàn": "匽棪",
    "yè,yān,yàn": "殗",
    "yān,yǎn": "渰硽",
    "yán,yǎn": "礹",
    "yǎn,yǐn": "縯",
    "zhè": "這浙柘蔗鹧樜淛蟅鷓",
    "zhè,zhèi": "这",
    "yàn,yǎn": "隁",
    "zhěn,yān": "黰",
    "yàng": "样漾恙怏様樣羕詇",
    "yāng": "秧殃鸯央泱姎抰胦鉠鍈雵鴦",
    "yāng,yàng": "鞅",
    "yáng,yàng": "烊煬",
    "yǎng,yàng,yāng,yīng": "柍",
    "yǎng,yàng,yīng": "楧",
    "yǎng,yàng": "瀁",
    "yāng,yǎng,yìng": "眏",
    "zāng": "羘牂赃賍賘贓贜髒",
    "yōu": "羪优忧悠幽攸呦嚘優峳櫌憂瀀滺纋耰逌鄾麀",
    "yào,yāo": "要",
    "yuè,yào": "钥",
    "yōu,yào": "怮",
    "yáo,yào": "愮",
    "yǎo,yāo": "枖",
    "yáo,yóu,zhòu": "繇",
    "yǎo,zhuó": "蓔",
    "yáo,zú": "鎐",
    "yè,yē": "掖",
    ye: "亪",
    "yé,yú": "捓",
    "zhuài,zhuāi,yè": "拽",
    "yè,zhá": "煠",
    "yǐ,yī": "椅",
    "zhí,yì": "妷",
    yi: "弬",
    "yī,yì": "悘",
    "yì,niàn": "悥",
    "zé,zhái": "择擇",
    "zhī,yì": "栺",
    "yì,yīn": "欭",
    "yì,zhí": "秇",
    "yì,yí": "貤",
    "yì,sī": "鯣",
    "yīn,yìn": "荫",
    "háo,yǐ": "乚",
    "yín,yóu": "冘",
    "yín,zhì": "斦",
    "yīn,yǐn": "磤",
    "yīng,yìng": "应応應",
    "yīng,yǐng,yìng": "瀴",
    "yíng,yǐng": "瑩覮",
    "yún,yíng": "耺",
    "yō,yo": "哟喲",
    "yō": "唷",
    "yòng": "用砽苚蒏醟",
    "yōng,yòng": "佣",
    "yóng": "喁鰫顒颙",
    "yōng,yǒng": "噰澭",
    "róng,yōng": "槦",
    "zhōng,yōng": "銿",
    "yòu,yóu": "柚櫾",
    "yòu,niū": "孧",
    "yōu,yǒu": "懮",
    "yǒu,yù": "栯",
    "yóu,yǒu": "楢",
    "yǒu,yōng": "牗",
    "yǔ,yù,yú": "与",
    "yǔ,yù": "雨语語",
    "yú,yǔ": "予",
    "zhōu,yù": "粥",
    "yú,yù,ǒu": "禺",
    "huò,guó,xù": "喐",
    "yù,zhūn": "圫",
    "yù,yú": "媀",
    "yǔ,yú": "懙",
    "yǔ,zhōng": "斔",
    "zhà,yù": "灹",
    "yū,yǔ": "穻",
    "yuán,yún,yùn": "员員貟",
    "yuǎn,yuàn": "远",
    "yuàn,yuán": "媛傆",
    "yuǎn": "盶逺遠",
    "yuán,yùn": "贠",
    "yuē": "曰曱矱",
    "yùn,yūn": "晕暈",
    "zǎ,zé,zhā": "咋",
    "zā,zhā,zhá": "扎",
    "zá,zǎ": "咱喒偺",
    "zā,zǎn": "桚拶",
    "zhā,zā": "紥紮",
    "zài": "在再儎扗傤洅酨載",
    "zāi": "灾栽哉渽溨烖睵災賳",
    "zǎi,zài": "载",
    "zǎi": "宰崽",
    "zī,zǐ,zǎi": "仔",
    "zài,zēng": "縡",
    "zī,zì,zāi": "菑",
    "zǎn,zuàn": "揝",
    "zàng,zhuǎng": "奘",
    "zǎng": "驵駔",
    "zāo": "遭糟蹧醩",
    "záo": "凿鑿",
    "zè": "仄昃崱庂昗捑汄",
    "zuó,zé": "笮",
    "zhá,zé": "耫",
    "zuò,zhà": "柞怍",
    "zuò,zé,zhā": "飵",
    "zé,zhài": "責",
    "zěn": "怎",
    "zōng,zèng": "综綜",
    "zhà,zhá": "炸",
    "zhǎ": "眨砟拃鮺鲝",
    "zhà": "榨诈痄乍咤蚱宱搾溠醡詐",
    "zhà,zhā": "吒",
    "zhā,zhá": "劄",
    "zhǎ,zhǎi": "厏",
    "zhā,zǔ,zū": "柤",
    "zuó,zhǎ": "苲",
    "zhǎ,zhà": "鮓鲊",
    "zhǎi": "窄鉙",
    "zhāi": "摘斋夈捚斎榸粂齋",
    "zhé,zhái": "厇",
    "zhǐ,zhǎi": "抧",
    "zhàn,zhān": "覱",
    "zhán": "讝",
    "zhāng": "章张樟彰漳嫜璋傽鄣蟑獐慞張暲粻蔁遧鏱餦騿鱆麞",
    "zhǎng,zhàng": "涨漲",
    "zhǎng": "掌仉幥礃",
    "zhuó,zháo,zhāo,zhe": "着",
    "zhǎo,zhuǎ": "爪爫",
    "zhào,zhuō": "棹",
    "zhào,zhāo": "炤",
    "zhē": "遮嫬",
    "zhē,zhè,zhù,zhe": "嗻",
    "zhí,zhé": "慹",
    "zhí,zhì": "潪",
    "zhēn,zhěn": "嫃",
    "zhèng,zhēng": "正挣症",
    "zhěng": "整拯愸抍晸",
    "zhēng,zhèng": "钲掙",
    "zhēng,zhěng": "糽",
    "zhī,zhǐ": "只",
    "zhī,zhì": "知织憄織",
    "zhǐ,zhì": "坁",
    "zhǐ,zhuó": "墌",
    "zhí,tè": "犆",
    "zhì,zhǐ": "筫",
    "tí,zhǐ": "禔",
    "zhǒng": "肿踵冢塚尰歱煄瘇腫",
    "zhōng,zhòng": "中",
    "zhóu,zhòu": "轴軸",
    "zhǒu": "肘帚晭疛睭箒菷鯞",
    "zhù,zhú": "筑築",
    "zhuó,zhú": "斀",
    "zhuó,zhù": "櫡",
    "zhù,zhǔ": "砫",
    "zhuǎn,zhuàn,zhuǎi": "转",
    "zhuàn,zhuǎn": "転",
    "zhuàn,zuàn": "賺",
    "zhuàng": "撞壮状壯壵焋狀",
    "zhuī": "锥骓鵻錐騅",
    "zhuǐ,zǐ": "沝",
    "zhùn,zhǔn": "稕",
    "zhǔn,zhùn": "綧",
    "zhùn": "訰",
    "zhuó,zuó": "琢",
    "zhuó,bào": "犳",
    "zī,zuǐ": "觜",
    "zǐ,zì": "秄",
    "zì,zǐ": "芓",
    zuo: "咗",
    "còng,sōng": "愡",
    "zōng,zǒng": "稯",
    "zǒu": "赱鯐走",
    "zuān,zuàn": "钻",
    "zuǎn": "纂纉繤缵籫纘",
    "zuàn": "攥",
    "zuǐ": "嘴噿嶊璻",
    "zuī": "厜樶纗蟕",
    "zūn": "尊鳟遵噂嶟樽鐏鶎鷷罇鱒",
    "zùn": "捘銌",
    "zūn,zǔn": "繜",
    "zuǒ": "左佐繓"
});

;define('app/user/user.js', function (require, exports, module) {
    var $ = require('$');
    var login = require('login');
    var event = require('event');
    var util = require('util');
    var manager = require('manager');
    var slidepanel = require('widget/slidepanel/slidepanel');
//    var role = require('app/role/role');
    var cacheData;
    var op = 0;
    var pinyin = require('hotoo/pinyin/2.1.2/pinyin-debug');
    var slidewrap;
    var container;
    
    event.addCommonEvent('click', {
        'edit_user': function (evt) {
            var aitem = evt.target;
            if (aitem.nodeName != 'A') {
                return false;
            }
            op = 1;
            var id = $(evt.target).attr('userid');
            slidewrap = slidepanel.show({con:util.tmpl('<div class="drawer-wrapper" style="">    <div class="drawer-title"><i class="drawer-close"></i><span class="drawer-title-content">&nbsp;</span></div>    <input type="hidden" id="currentId" value="<%=data.id%>"/>    <%if (op == 1) {%><button cmd="del" deptid="<%=data.id%>"><i class="icon-remove"></i>删除</button><%}%>    <div class="form-horizontal">        <ul class="dialog">                <li class="clearfix">                <div class="control-group">                    <label class="control-label">用户工号</label>                    <div class="controls"><input class="input" value="<%=data.user_id%>" type="text" id="iptUserID" placeholder="用户工号"></div>                      <div class="input_tips"></div>                </div>            </li>                             <li class="clearfix">                <div class="control-group">                    <label class="control-label">用户中文名</label>                    <div class="controls"><input class="input" value="<%=data.cnname%>" type="text" id="iptCnName" placeholder="用户中文名"></div>                      <div class="input_tips"></div>                </div>            </li>                        <li class="clearfix">                <div class="control-group">                    <label class="control-label">联系电话</label>                    <div class="controls"><input class="input" value="<%=data.telno%>" type="text" id="iptTelno" placeholder="联系电话"></div>                      <div class="input_tips"></div>                </div>            </li>                        <li class="clearfix">                <div class="control-group">                    <label class="control-label">qq</label>                    <div class="controls"><input class="input" value="<%=data.qq%>" type="text" id="iptqq" placeholder="qq"></div>                      <div class="input_tips"></div>                </div>            </li>                        <li class="clearfix">                <div class="control-group">                    <label class="control-label">用户部门：</label>                    <div class="controls"><div id="userDeptList"></div></div>                    <span class="input-text"></span>                  </div>            </li>                        <li class="clearfix">                <div class="control-group">                    <label class="control-label">用户岗位：</label>                    <div class="controls"><select id="user_jobs">                        <%for (var i=0;i<sysbase.length;i++) {%>                            <%if (sysbase[i].type==5) {%>                               <option value="<%=sysbase[i].id%>" <%=((data.jobs==sysbase[i].id)?"selected": "")%> ><%=sysbase[i]._value%></option>                             <%}%>                            <%}%>                    </select></div>                    <span class="input-text"></span>                  </div>            </li>                        <li class="clearfix">                <div class="control-group">                    <label class="control-label">用户角色：</label>                    <div class="controls"><div id="userRoleList"></div></div>                    <span class="input-text"></span>                  </div>            </li>                                        <li class="clearfix hide">                <div class="control-group">                    <label class="control-label"></label>                    <div class="controls"><textarea class="input" type="text" id="iptNote" placeholder="输入角色描述"><%=data.note%></textarea>  </div>                </div>            </li>                <li class="current_status">                <a href="javascript:void 0;" cmd="save" class="btn btn-primary">确定</a>              </li>        </ul></div></div>', {data: util.getInfoById(cacheData, id), op: op,  }) } ) ;
            initUserRole(id);
            initUserDept(id);
            clickEvt();
            return false;
        }
    });
    
    function init() {
        container.find('a[cmd="addNew"]').unbind('click').click(function () {
            op = 0;
            slidewrap = slidepanel.show({con:util.tmpl('<div class="drawer-wrapper" style="">    <div class="drawer-title"><i class="drawer-close"></i><span class="drawer-title-content">&nbsp;</span></div>    <input type="hidden" id="currentId" value="<%=data.id%>"/>    <%if (op == 1) {%><button cmd="del" deptid="<%=data.id%>"><i class="icon-remove"></i>删除</button><%}%>    <div class="form-horizontal">        <ul class="dialog">                <li class="clearfix">                <div class="control-group">                    <label class="control-label">用户工号</label>                    <div class="controls"><input class="input" value="<%=data.user_id%>" type="text" id="iptUserID" placeholder="用户工号"></div>                      <div class="input_tips"></div>                </div>            </li>                             <li class="clearfix">                <div class="control-group">                    <label class="control-label">用户中文名</label>                    <div class="controls"><input class="input" value="<%=data.cnname%>" type="text" id="iptCnName" placeholder="用户中文名"></div>                      <div class="input_tips"></div>                </div>            </li>                        <li class="clearfix">                <div class="control-group">                    <label class="control-label">联系电话</label>                    <div class="controls"><input class="input" value="<%=data.telno%>" type="text" id="iptTelno" placeholder="联系电话"></div>                      <div class="input_tips"></div>                </div>            </li>                        <li class="clearfix">                <div class="control-group">                    <label class="control-label">qq</label>                    <div class="controls"><input class="input" value="<%=data.qq%>" type="text" id="iptqq" placeholder="qq"></div>                      <div class="input_tips"></div>                </div>            </li>                        <li class="clearfix">                <div class="control-group">                    <label class="control-label">用户部门：</label>                    <div class="controls"><div id="userDeptList"></div></div>                    <span class="input-text"></span>                  </div>            </li>                        <li class="clearfix">                <div class="control-group">                    <label class="control-label">用户岗位：</label>                    <div class="controls"><select id="user_jobs">                        <%for (var i=0;i<sysbase.length;i++) {%>                            <%if (sysbase[i].type==5) {%>                               <option value="<%=sysbase[i].id%>" <%=((data.jobs==sysbase[i].id)?"selected": "")%> ><%=sysbase[i]._value%></option>                             <%}%>                            <%}%>                    </select></div>                    <span class="input-text"></span>                  </div>            </li>                        <li class="clearfix">                <div class="control-group">                    <label class="control-label">用户角色：</label>                    <div class="controls"><div id="userRoleList"></div></div>                    <span class="input-text"></span>                  </div>            </li>                                        <li class="clearfix hide">                <div class="control-group">                    <label class="control-label"></label>                    <div class="controls"><textarea class="input" type="text" id="iptNote" placeholder="输入角色描述"><%=data.note%></textarea>  </div>                </div>            </li>                <li class="current_status">                <a href="javascript:void 0;" cmd="save" class="btn btn-primary">确定</a>              </li>        </ul></div></div>', {data: {id: '',name: '', note:'',power: ''}, op:op }) } ) ;
            initUserRole();
            initUserDept();
            clickEvt();
            return false;
        });  
      
        $('#search_user').unbind('click').click(function () {
            var val = $('#user_query').val();
            var rst = [];
            if (cacheData && val) {
                $.each(cacheData, function (i, n) {
                    $.each(n, function (u, v) {
                        if (String(v).indexOf(val) > -1) {
                            rst.push(n);
                            return false;
                        }
                        if (u == 'cnname') {
                            if (pinyin(v, {style: pinyin.STYLE_FIRST_LETTER }).join('').toUpperCase().indexOf(val.toUpperCase()) > -1) {
                                rst.push(n);
                                return false;
                            }
                        }
                    });
                });
            }
            initTable(rst.slice(0, 50));
            $('#show_tips').html('显示前' + Math.min(50, rst.length) + '条');
            return false;
        });
    }
    
    function initUserRole(id) {
        manager.getRole({}, function (data) {
            var o;
            if (id) {
                o = util.getInfoById(cacheData, id);
            }
            if (o) {
                var pw = o.role_id;
                for (var i = 0; i < data.length; i++) {
                    if ((',' + pw + ',').indexOf(',' + data[i].id + ',') > -1) {
                        data[i].checked = 1;
                    }
                }
            }
            $('#userRoleList').html(util.tmpl('<ul class="role_power_ul">    <% for (var i = 0; i < data.length; i++) {%>       <li><label><input type="checkbox" <%if (data[i].checked) {%>checked<%}%> value="<%=data[i].id%>" /><%=data[i].name%></label></li>    <%}%></ul>', {data: data}));
        });
    }
    
    function initUserDept(id) {
        manager.getDept({}, function (data) {
            var o;
            if (id) {
                o = util.getInfoById(cacheData, id);
            }
            if (o) {
                var pw = o.dept_id;
                for (var i = 0; i < data.length; i++) {
                    if ((',' + pw + ',').indexOf(',' + data[i].id + ',') > -1) {
                        data[i].checked = 1;
                    }
                }
            }
            $('#userDeptList').html(util.tmpl('<ul class="role_power_ul">    <% for (var i = 0; i < data.length; i++) {%>       <li><label><input type="checkbox" <%if (data[i].checked) {%>checked<%}%> value="<%=data[i].id%>" /><%=data[i].name%></label></li>    <%}%></ul>', {data: data}));
        });
    }
    
    function clickEvt () {
        slidewrap.find('a[cmd="save"]').unbind('click').click(function () {
            var roleCon = $('#userRoleList');
            var deptCon = $('#userDeptList');
            var rolechecklist = [], deptchecklist = [];
            roleCon.find('input[type="checkbox"]').each(function (i, n) {
                if (n.checked) {
                    rolechecklist.push(n.value);
                } 
            });
            deptCon.find('input[type="checkbox"]').each(function (i, n) {
                if (n.checked) {
                    deptchecklist.push(n.value);
                } 
            });
//            $('#iptPower').val(checklist.join('_'));
            var name = $('#iptUserID').val();
            var cnname = $('#iptCnName').val();
            var role_id = rolechecklist.join(',');
            var dept_id = deptchecklist.join(',');
            var job_id = $('#user_jobs').val();
            var telno = $('#iptTelno').val();
            var qq = $('#iptqq').val();
//            var note = $('#iptNote').val();
            if (name == '') {
                alert ('请输入正确的名称');
                return;
            }
//            if (menuLink == '') {
//                alert ('请输入正确的菜单地址');
//                return;
//            }
            manager.setUser($.extend({
                user_id: name,
                cnname: cnname,
                role_id: role_id,
                dept_id: dept_id,
                jobs: job_id,
                telno: telno,
                qq: qq
//                note: note
            }, op == 1 ? {id: $('#currentId').val()}: {}), function (d) {
                slidepanel.hide();
                user.render();
            });
        });
        
        slidewrap.find('button[cmd="del"]').unbind('click').click(function (evt) {
            var id = $(this).attr('deptid');
            manager.delRole({id: id}, function () {
                slidepanel.hide();
                role.render();
            });
            return false;
        });
    }
    var userDataCache;
    
    function initTable(data) {
        container.html(util.tmpl('<a class="btn" href="#" cmd="addNew">新增</a><form class="form-search">  <div class="input-append">    <input type="text" class="span2 search-query" style="width:200px;" id="user_query" placeholder="输入关键字">    <button type="submit" class="btn" id="search_user">搜索</button><label id="show_tips"></label>  </div></form><table class="table table-condensed table-bordered table-striped" data-event="edit_user">    <thead>      <tr>        <th>用户工号</th>        <th>中文名</th>        <th>所在部门</th>        <th>所属角色</th>      </tr>    </thead>    <tbody>        <%for (var i = 0; i < data.length; i++) {%>      <tr>        <td><a userid="<%=data[i].id%>" href="#"><%=data[i].user_id%></a></td>        <td><%=data[i].cnname%> </td>        <td><%=data[i].deptname %></td>        <td><%=data[i].rolename%></td>      </tr>        <%}%>    </tbody></table><div id="pagging_info"></div>', {data: data}));
        init ();
    }
    
    var user = {
        render: function () {
            container = $('#mainContainer');
            var param = {};
            var cp = 0;
            var fn = function () {
                initTable([]);
            }
            if (!cacheData) {
                manager.getUser(param, function (data) {
                    cacheData = data;
                    fn();
                });
            }
            else {
                fn();
            }
        },
        getUserData: function (callback) {
            if (typeof callback == 'function') {
                if (userDataCache) {
                    callback(userDataCache);
                }
                else {
                    manager.getUser({}, function (data) {
                        userDataCache = data;
                        callback(data);
                    });
                }
            }
        }
    };
    module.exports = user;
});
;define('app/userservice/failure_report/failure_report.js', function (require, exports, module) {
    var $ = require('$');
    var login = require('login');
    var event = require('event');
    var util = require('util');
    var dialog = require('dialog');
    var manager = require('manager');
    var slidepanel = require('widget/slidepanel/slidepanel');
    var app_util = require('main/app_util');
    var user = require('app/user/user');
    var ve = require('editor/ve');
    var cacheData;
    var op = 0;
    var dateFormat = { dateFormat : "yy-mm-dd " };
    var slidewrap;
    var container;
    var cstatus;
    var editorObj;
    var scoreEditObj;
    var newscored = {};
    var currentTab = 'new_report';
    
    event.addCommonEvent('click', {
        'edit_failure_report': function (evt) {
            var aitem = evt.target;
            if (aitem.nodeName != 'A') {
                return false;
            }
            op = 1;
            var id = $(evt.target).attr('reportid');
            app_util.getLoginInfo(function (info) {
                var dt = util.getInfoById(cacheData, id);
                $.extend(dt, {
                    user_cn_name: info[0].cnname,
                    user_dept_name: info[0].deptname, 
                    user_dept: info[0].deptid,
                    user_id: info[0].id
                });
                slidewrap = slidepanel.show({con:util.tmpl('<div class="drawer-wrapper" style="">    <div class="drawer-title"><i class="drawer-close"></i><span class="drawer-title-content">&nbsp;</span></div>    <input type="hidden" id="currentId" value="<%=data.id%>"/>        <div class="form-horizontal">                <div class="control-group">                    <input class="input" value="<%=data.user_id%>" type="hidden" id="iptUserID">                      <input class="input" value="<%=data.user_dept%>" type="hidden" id="iptUserDept">                    <div class="controls">                        <span class="input-text">申请人：<%=data.user_cn_name%>&nbsp;所在科室：<%=data.user_dept_name%>&nbsp;IP:<%=data.clientip%></span>                    </div>                </div>                            <div class="control-group">                    <label class="control-label">故障标题</label>                    <div class="controls">                        <input class="input-xlarge" value="<%=data.title%>" type="text" id="iptTitle" placeholder="故障标题">                    </div>                </div>                           <div class="control-group">                    <label class="control-label">联系电话</label>                    <div class="controls">                        <span class="input-text"><input class="input" value="<%=data.tel%>" type="text" id="iptTelNo" placeholder="联系电话"></span>                      </div>                </div>                            <div class="control-group">                    <label class="control-label">故障类型</label>                    <div class="controls">                        <span class=""><select id="report_type" style="width:auto;"></select></span>                     </div>                </div>                            <div class="control-group">                    <label class="control-label">紧急程度</label>                    <div class="controls">                        <span class=""><select id="report_grade" style="width:auto;"></select></span>                      </div>                </div>                            <div class="control-group">                    <label class="control-label">故障描述</label>                    <div class="controls">                        <div id="editFailureNote"></div>                        <textarea class="hide" rows="3" id="iptNote" placeholder="故障描述"><%=data.note%></textarea>                      </div>                </div>                                    <ul class="dialog_right">                    </ul>    </div>            <div style="clear:both;margin: 0 100px;" class="form-horizontal" style="">        <%if (op == 1 && data.cstatus == 75) {%>        <div id="process_wrap">                    </div>                <div id="score_wrap" style="margin-top: 10px;border: 1px solid #ccc;width: 670px;padding: 20px;">            <%if (data.score_grade == null && newscored[data.id] == null) { %>            <div class="grade_item">                <label><input type="radio" name="score_grade" value="5"/>很满意</label>                <label><input type="radio" name="score_grade" value="4"/>满意</label>                <label><input type="radio" name="score_grade" value="3"/>基本满意</label>                <label><input type="radio" name="score_grade" value="2"/>一般</label>                <label><input type="radio" name="score_grade" value="1"/>不满意</label>            </div>            <div id="score_note" class="hide"></div>            <p><a href="#" class="btn" cmd="submit_score">提交</a></p>            <% } else {%>                您已经评论此故障单！            <% }%>        </div>                        <%}%>            </div>    <div style="clear:both;margin: 0 100px;" class="form-horizontal" style="">        <%if (!data.cstatus || !data.process_user) {%>            <a href="javascript:void 0;" cmd="save" class="btn btn-primary">确定</a>            <%if (op == 1 && data.cstatus == 76) {%>            <button cmd="del" class="btn" deptid="<%=data.id%>"><i class="icon-remove"></i>删除</button>        <%} }%>    </div></div>', {data: dt, op:op,newscored: newscored }) } ) ;
                initCtl(dt);
                showProcess(dt);
                saveEvent();
            });
            
            return false;
        }
    });

    function init() {
        addEvents();
        if (currentTab) {
            $('.nav-tabs li').removeClass('active');
            $('.nav-tabs li a[cmd="' + currentTab + '"]').parent().addClass('active');
        }
    }
    
    function initCtl (dt ) {
        dt = dt || {};
        app_util.fillKeyValueSelect(1, $('#report_grade'), dt.grade);
        app_util.fillKeyValueSelect(3, $('#report_type'), dt.ftype);
        app_util.fillKeyValueSelect(2, $('#report_status'), dt.ftype);
        $( "#iptProcessDate" ).datepicker(dateFormat);
        $( "#iptDoneDate" ).datepicker(dateFormat);
        app_util.userTypeAhead($('#iptProcessUser'), function (item, dv, txt, seldata) {
            $('#processUser').val(dv)
            $('#iptProcessUser').val(seldata.cnname)
        });
        app_util.userTypeAhead($('#iptDoneUser'), function (item, dv, txt, seldata) {
            $('#doneUser').val(dv)
            $('#iptDoneUser').val(seldata.cnname)
        });
        app_util.userTypeAhead($('#iptDutyUser'), function (item, dv, txt, seldata) {
            $('#dutyUser').val(dv)
            $('#iptDutyUser').val(seldata.cnname)
        });
        
        if (op == 1 && dt.process_user && dt.cstatus == 75) {
            $("#editFailureNote").html(dt.note);
        }
        else {
            editorObj =new ve.Create({
                container:$("#editFailureNote")[0],
                height:'300px',
                width:'600px'
            });
            editorObj.setContent(dt.note);
        }
        
        if ($("#score_note").size()) {
            scoreEditObj =new ve.Create({
                container:$("#score_note")[0],
                height:'100px',
                width:'600px'
            });
        }
    }
    
    function addEvents() {
        container.find('a[cmd="addNew"]').unbind('click').click(function () {
			var btn = this;
			
            op = 0;
            app_util.getLoginInfo(function (info) {
                slidewrap = slidepanel.show({con:util.tmpl('<div class="drawer-wrapper" style="">    <div class="drawer-title"><i class="drawer-close"></i><span class="drawer-title-content">&nbsp;</span></div>    <input type="hidden" id="currentId" value="<%=data.id%>"/>        <div class="form-horizontal">                <div class="control-group">                    <input class="input" value="<%=data.user_id%>" type="hidden" id="iptUserID">                      <input class="input" value="<%=data.user_dept%>" type="hidden" id="iptUserDept">                    <div class="controls">                        <span class="input-text">申请人：<%=data.user_cn_name%>&nbsp;所在科室：<%=data.user_dept_name%>&nbsp;IP:<%=data.clientip%></span>                    </div>                </div>                            <div class="control-group">                    <label class="control-label">故障标题</label>                    <div class="controls">                        <input class="input-xlarge" value="<%=data.title%>" type="text" id="iptTitle" placeholder="故障标题">                    </div>                </div>                           <div class="control-group">                    <label class="control-label">联系电话</label>                    <div class="controls">                        <span class="input-text"><input class="input" value="<%=data.tel%>" type="text" id="iptTelNo" placeholder="联系电话"></span>                      </div>                </div>                            <div class="control-group">                    <label class="control-label">故障类型</label>                    <div class="controls">                        <span class=""><select id="report_type" style="width:auto;"></select></span>                     </div>                </div>                            <div class="control-group">                    <label class="control-label">紧急程度</label>                    <div class="controls">                        <span class=""><select id="report_grade" style="width:auto;"></select></span>                      </div>                </div>                            <div class="control-group">                    <label class="control-label">故障描述</label>                    <div class="controls">                        <div id="editFailureNote"></div>                        <textarea class="hide" rows="3" id="iptNote" placeholder="故障描述"><%=data.note%></textarea>                      </div>                </div>                                    <ul class="dialog_right">                    </ul>    </div>            <div style="clear:both;margin: 0 100px;" class="form-horizontal" style="">        <%if (op == 1 && data.cstatus == 75) {%>        <div id="process_wrap">                    </div>                <div id="score_wrap" style="margin-top: 10px;border: 1px solid #ccc;width: 670px;padding: 20px;">            <%if (data.score_grade == null && newscored[data.id] == null) { %>            <div class="grade_item">                <label><input type="radio" name="score_grade" value="5"/>很满意</label>                <label><input type="radio" name="score_grade" value="4"/>满意</label>                <label><input type="radio" name="score_grade" value="3"/>基本满意</label>                <label><input type="radio" name="score_grade" value="2"/>一般</label>                <label><input type="radio" name="score_grade" value="1"/>不满意</label>            </div>            <div id="score_note" class="hide"></div>            <p><a href="#" class="btn" cmd="submit_score">提交</a></p>            <% } else {%>                您已经评论此故障单！            <% }%>        </div>                        <%}%>            </div>    <div style="clear:both;margin: 0 100px;" class="form-horizontal" style="">        <%if (!data.cstatus || !data.process_user) {%>            <a href="javascript:void 0;" cmd="save" class="btn btn-primary">确定</a>            <%if (op == 1 && data.cstatus == 76) {%>            <button cmd="del" class="btn" deptid="<%=data.id%>"><i class="icon-remove"></i>删除</button>        <%} }%>    </div></div>', {data: {id: '',name: '', note:'',power: '',user_cn_name: info[0].cnname,user_dept_name: info[0].deptname, user_dept: info[0].deptid,user_id: info[0].id,tel: info[0].telno,clientip:clientIP }, op:op }) } ) ;
                initCtl();
                saveEvent();
                
            });
            return false;
        }); 
        container.find('a[cmd="new_report"]').unbind('click').click(function () {
            currentTab = 'new_report';
            initTable({cstatus: 76});
            return false;
        });
        container.find('a[cmd="done_report"]').unbind('click').click(function () {
            currentTab = 'done_report';
            initTable({cstatus: 75});
            return false;
        });
        container.find('a[cmd="process_report"]').unbind('click').click(function () {
            currentTab = 'process_report';
            initTable({cstatus: 74});
            return false;
        });
    }
    
    function showProcess() {
        var loaded = 0;
   
        !loaded && manager.getLog({
            target: 'failure_report',
            id:$('#currentId').val()
        }, function (data) {
            for (var i = 0; i < data.length; i++) {
                data[i].last_modify_time = util.formatDate(data[i].last_modify_time);
            }
            var html = util.tmpl('<% for (var i=0;i<data.length;i++){%><div style="padding:20px;border:1px solid #ccc; margin:5px;width:400px;">    <div style="font-size:14px;"><%=data[i].note%></div>    <div style="margin:5px 0 0 20px;font-size:12px;color:#666;"><%=data[i].op_user_cnname%>&nbsp;&nbsp;在&nbsp;&nbsp;<%=data[i].last_modify_time%>&nbsp;&nbsp;最后处理为<%=data[i].cstatusname%><%if (data[i].cstatus != 74 && i == data.length - 1) {%>,当前处理人为<%=data[i].process_user_cnname%><%}%></div></div><%}%>', {data: data});
            $('#process_wrap').html(html);
            loaded = 1;
        });
           
        var score_grade;
        $('#score_wrap input[type="radio"]').click(function (){
            score_grade = this.value;
            $('#score_note')[score_grade == 1 ? 'removeClass': 'addClass']('hide');
        });
        $('*[cmd="submit_score"]').unbind('click').click(function () {
            var param = {
                typeid: 'failure_report_list',
                grade: score_grade,
                mainid: $('#currentId').val(),
                note: score_grade == 1 ? scoreEditObj.getContent(): ''
            };
            console.log(param);
            
            manager.setScore(param, function () {
                newscored[$('#currentId').val()] = score_grade;
                $('#score_wrap').html('您已评论改故障单');
            });
            return false;
        });
    }
    
    function saveEvent( ) {
        slidewrap.find('a[cmd="save"]').unbind('click').click(function () {
            var title = $('#iptTitle').val();
            var telno = $('#iptTelNo').val();
            var report_type = $('#report_type').val();
            var report_grade = $('#report_grade').val();
            var note = editorObj.getContent();//$('#iptNote').val();
            var user_id = $('#iptUserID').val();
            var user_dept = $('#iptUserDept').val();
            var ProcessUser = $('#processUser').val();
            var dutyUser = $('#dutyUser').val();
            var iptProcessDate = $('#iptProcessDate').val();
            var iptDoneUser = $('#doneUser').val();
            var iptDoneDate = $('#iptDoneDate').val();
            var iptTelNo = $('#iptTelNo').val();
            if (title == '') {
                alert ('标题不能为空');
                return;
            }
            var params = {
                title: title,
                duty_user: 0,
                process_user: ProcessUser || 0,
                done_user: iptDoneUser || 0,
                repair_user: user_id || 0,
                repair_dept: user_dept || 0,
//                last_process_time: iptProcessDate,
//                done_time: iptDoneDate || ,
                grade: report_grade,
                ftype: report_type,
                note: note,
                tel: iptTelNo,
                clientip: clientIP,
                duty_user: dutyUser || 0,
                cstatus: 76
            };
            if (op ==1 ) {
                params.id = $('#currentId').val();
            }
			var btn = this;
			btn.disabled = true;
            manager.setFailureReport(params, function (d) {
                dialog.create ('操作成功', 400, 200, {isMaskClickHide: 0, title: '操作结果', button: {
                    '确定': function() {
                        dialog.hide();
                    }
                }});
                currentTab = 'new_report';
                slidepanel.hide();
				btn.disabled = false;
                moduleWrap.render();
            });
            return false;
        });
        slidewrap.find('button[cmd="del"]').unbind('click').click(function (evt) {
            var id = $(this).attr('deptid');
            dialog.create ('确定要删除改故障单么，删除后不可恢复，确定吗？', 400, 200, {isMaskClickHide: 0, title: '操作确认', button: {
                '确定': function() {
                    dialog.hide();
                    manager.delFailureReport({id: id}, function () {
                        dialog.miniTip ('删除成功');
                        slidepanel.hide();
                        moduleWrap.render();
                    });
                }
            }}); 
            
            return false;
        });
        
        slidewrap.find('button[cmd="process"]').unbind('click').click(function () {
            manager.setFailureReport({
                id: $('#currentId').val(),
                cstatus:$('#report_status').val()
            }, function (d) {
                manager.setProcessLog({
                    src: 'failure_report_list', 
                    status_type: 2, 
                    cstatus: cstatus, 
                    main_id: $('#currentId').val(),
                    dest_status: $('#report_status').val(),
                    note: $('#iptProcessNote').val()
                }, function (d) {
                    dialog.create ('操作成功', 400, 200, {isMaskClickHide: 0, title: '操作结果', button: {
                        '确定': function() {
                            dialog.hide();
                            slidepanel.hide();
                            moduleWrap.render();
                        }
                    }});
                });
            });
            
        });
    }
    
    function initTable(param) {
         manager.getFailureReport(param, function (data) {
            for (var i = 0; i < data.length; i++) {
                data[i].gradename = app_util.changeColor(util.getInfoById(sysbase, data[i].grade)._value);
                data[i].typename = util.getInfoById(sysbase, data[i].ftype)._value
                data[i].statusname = util.getInfoById(sysbase, data[i].cstatus)._value || '未处理';

                data[i].create_time = util.formatDate(data[i].create_time);
                data[i].last_process_time = util.formatDate(data[i].last_process_time);
                data[i].done_time = util.formatDate(data[i].done_time);
                data[i].end_time = util.formatDate(data[i].end_time);
            }
            cacheData = data;
            container.html(util.tmpl('<a class="btn" href="#" cmd="addNew">新增</a><ul class="nav nav-tabs">  <li class="active">    <a href="#" cmd="new_report">未处理</a>  </li>    <li>    <a href="#" cmd="process_report">已分派</a>  </li>  <li><a href="#" cmd="done_report">已完成</a></li></ul><table class="table table-condensed table-bordered table-striped table-nowrap" data-event="edit_failure_report">    <thead>      <tr>        <th>标题</th>        <th>报修人</th>        <th>报修人科室</th>        <th>提单时间</th>        <th>处理人</th>        <th>完成人</th>        <th>状态</th>        <th>紧急程度</th>        <th>故障类别</th>      </tr>    </thead>    <tbody>        <%for (var i = 0; i < data.length; i++) {%>      <tr>        <td><a reportid="<%=data[i].id%>" href="#"><%=data[i].title%></a></td>        <td><%=data[i].cnname%> </td>        <td><%=data[i].dept_name%></td>        <td><%=data[i].create_time%></td>        <td><%=data[i].process_cnname%></td>        <td><%=data[i].done_cnname%></td>        <td><%=data[i].statusname%></td>        <td><%=data[i].gradename%></td>        <td><%=data[i].typename%></td>      </tr>        <%}%>    </tbody></table>', {data: cacheData}));
            init ();
        });
    }
    
    var moduleWrap = {
        render: function () {
            container = $('#mainContainer');
            var param = {cstatus:76};
            currentTab = 'new_report';
            initTable(param);
        }
    };
    module.exports = moduleWrap;
});
define('app/userservice/failure_type_role/failure_type_role', function (require, exports, module) {
    var $ = require('$');
    var login = require('login');
    var event = require('event');
    var util = require('util');
    var dialog = require('dialog');
    var manager = require('manager');
    var menu = require('app/menu/menu.js');
    var cacheData;
    var op = 0;
    var type;
    var mod;
    var target;
    var slidewrap;
    var container;
    var wrap;
    var menuinited;
    
    var name_map = {
        '1': '硬件故障紧急程度',
        '2': '硬件故障单状态',
        '3': '故障类型',
        '4': '业务知识库类别',
        '5': '岗位',
        '6': '个人工作任务类别',
        '7': '值班休假类别'
    };
    function init() {
        initRoles();
    }
    
    var relationMap = {};
    function initRoles() {
        manager.getRole({}, function (roles) {
            var ar = [];
            for (var i = 0; i < roles.length; i++) {
                ar.push('<label><input type="radio" name="n_{n}" value="' + roles[i].id + '"/>' + roles[i].name + '</label>');
            }
            for (var i = 0; i < cacheData.length; i++) {
                $('.type_' + cacheData[i].id).html(ar.join('').replace(/\{n\}/g, i));
            }
            addEvent();
            manager.getFailureTypeRole({}, function (data) {
                for (var i = 0; i < data.length; i++) {
                    relationMap[data[i].failure_type] = data[i];
                    $('.type_' + data[i].failure_type).find(':radio[value="' + data[i].role_id + '"]').attr('checked', 1);
                }
            });
        });
    }
    
    function addEvent() {
        $.each(cacheData, function (i, n) {
            $('.type_' + n.id).find(':radio').click(function () {
                var roleid = this.value;
                var params = {role_id: roleid, failure_type: n.id};
                if (relationMap[n.id]) {
                    params.id = relationMap[n.id].id;
                }
                manager.setFailureTypeRole(params, function (d) {
                    dialog.miniTip('操作成功!');
                    initRoles();
                });
            });
        })
        
    }
    
    var timeout;
    wrap = {
        render: function (id, _target, _type) {
            container = $('#mainContainer');
            manager.getKeyValue({type : 3}, function (data) {
                cacheData = data;
//                callback(cacheData);
                container.html(util.tmpl('<div><span class="label label-info"><%=typename%></span></div><table class="table table-condensed table-bordered table-striped" data-event="key_value_list">    <thead>      <tr>        <th>故障类别</th>        <th>角色</th>      </tr>    </thead>    <tbody>        <%for (var i = 0; i < data.length; i++) {%>      <tr>        <td>            <span class="text" cmd="txt_<%=data[i].id%>"><%=data[i]._value%></span>        </td>        <td>            <div class="type_<%=data[i].id%>"></div>        </td>      </tr>        <%}%>    </tbody></table>', {data: cacheData, typename: '故障类型角色关系'}));
                init();
            });
        }        
    };
    module.exports = wrap;
});
;define('app/userservice/software_report/software_report', function (require, exports, module) {
    var $ = require('$');
    var login = require('login');
    var event = require('event');
    var util = require('util');
    var dialog = require('dialog');
    var manager = require('manager');
    var slidepanel = require('widget/slidepanel/slidepanel');
    var app_util = require('main/app_util');
    var dept = require('app/dept/dept');
    var user = require('app/user/user');
    var cacheData;
    var op = 0;
    var dateFormat = { dateFormat : "yy-mm-dd" };
    var slidewrap;
    var container;
    
    
    
    event.addCommonEvent('click', {
        'edit_software_report': function (evt) {
            var aitem = evt.target;
            if (aitem.nodeName != 'A') {
                return false;
            }
            op = 1;
            var id = $(evt.target).attr('reportid');
            app_util.getLoginInfo(function (info) {
                var dt = util.getInfoById(cacheData, id);
                $.extend(dt, {
                    user_cn_name: info[0].cnname,
                    user_dept_name: info[0].deptname, 
                    user_dept: info[0].deptid,
                    user_id: info[0].id
                });
                slidewrap = slidepanel.show({con:util.tmpl('<div class="drawer-wrapper" style="">    <div class="drawer-title"><i class="drawer-close"></i><span class="drawer-title-content">&nbsp;</span></div>    <input type="hidden" id="currentId" value="<%=data.id%>"/>        <div class="drawer bs-docs-example form-horizontal">        <ul class="dialog">              <li>                <div class="control-group">                    <input class="input" value="<%=data.user_id%>" type="hidden" id="iptUserID">                      <input class="input" value="<%=data.user_dept%>" type="hidden" id="iptUserDept">                      <span class="controls">申请人：<%=data.user_cn_name%>&nbsp;所在科室：<%=data.user_dept_name%></span>                </div>            </li>                             <li>                <div class="control-group">                    <label class="control-label">提出日期</label>                    <div class="controls">                        <input class="input-xlarge" value="<%=data.apply_time%>" type="text" id="iptApplyTime" placeholder="提出日期">                    </div>                </div>            </li>            <li>                <div class="control-group">                    <label class="control-label">相关科室</label>                    <div class="controls">                        <input value="<%=data.apply_dept%>" type="hidden" id="applyDept">                        <input class="input-small" value="<%=data.dept_name%>" type="text" id="iptApplyDept" placeholder="输入部门编码">输入部门编码检索                    </div>                </div>            </li>            <li>                <div class="control-group">                    <label class="control-label">科室联系人</label>                    <div class="controls">                        <input value="<%=data.apply_user%>" type="hidden" id="applyUser">                        <input class="input-small" value="<%=data.cnname%>" type="text" id="iptApplyUser" placeholder="输入工号">输入工号检索                    </div>                </div>            </li>            <li>                <div class="control-group">                    <label class="control-label">标题</label>                    <div class="controls">                        <input class="input-xlarge" value="<%=data.title%>" type="text" id="iptTitle" placeholder="项目标题">                    </div>                </div>            </li>                        <li>                <div class="control-group">                    <label class="control-label">项目描述</label>                    <div class="controls">                        <textarea rows="3" id="iptNote" placeholder="项目描述"><%=data.note%></textarea>                      </div>                </div>            </li>            <li>                <div class="control-group">                    <label class="control-label">相关系统</label>                    <div class="controls">                        <input class="input-xlarge" value="<%=data.related_app%>" type="text" id="iptRelatedApp" placeholder="故障标题">                    </div>                </div>            </li>            <li>                <div class="control-group">                    <label class="control-label">处理意见</label>                    <div class="controls">                        <textarea rows="3" id="iptResult" placeholder="处理意见"><%=data.result%></textarea>                     </div>                </div>            </li>            <li>                <div class="control-group">                    <label class="control-label">是否完成</label>                    <div class="controls">                        <input id="chkStatus" type="checkbox" <%=data.cstatus==1? "checked": ""%>/>                     </div>                </div>            </li>        </ul>    </div>    <div style="clear:both;">        <% if (data.cstatus == 0) {%>        <a href="javascript:void 0;" cmd="save" class="btn btn-primary">确定</a>        <%if (op == 1) {%><button cmd="del" class="btn btn-danger" deptid="<%=data.id%>"><i class="icon-remove"></i>删除</button><%}%>        <%}%>    </div></div>', {data: dt, op:op }) } ) ;
                
                initCtl(dt);
                saveEvent();
            });
            return false;
        }
    });

    function init() {
        addEvents();
    }
    
    function initCtl(dt) {
        dt = dt || {};
        $( "#iptApplyTime" ).datepicker(dateFormat);
        app_util.deptTypeAhead($( "#iptApplyDept" ), function (item, dv, txt, seldata) {
            $( "#applyDept" ).val(dv);
            $( "#iptApplyDept" ).val(seldata.name);
        });
        app_util.userTypeAhead($( "#iptApplyUser" ), function (item, dv, txt, seldata) {
            $( "#applyUser" ).val(dv);
            $( "#iptApplyUser" ).val(seldata.cnname);
        });
    };
    function addEvents() {
        container.find('a[cmd="addNew"]').click(function () {
            op = 0;
            app_util.getLoginInfo(function (info) {
                slidewrap = slidepanel.show({con:util.tmpl('<div class="drawer-wrapper" style="">    <div class="drawer-title"><i class="drawer-close"></i><span class="drawer-title-content">&nbsp;</span></div>    <input type="hidden" id="currentId" value="<%=data.id%>"/>        <div class="drawer bs-docs-example form-horizontal">        <ul class="dialog">              <li>                <div class="control-group">                    <input class="input" value="<%=data.user_id%>" type="hidden" id="iptUserID">                      <input class="input" value="<%=data.user_dept%>" type="hidden" id="iptUserDept">                      <span class="controls">申请人：<%=data.user_cn_name%>&nbsp;所在科室：<%=data.user_dept_name%></span>                </div>            </li>                             <li>                <div class="control-group">                    <label class="control-label">提出日期</label>                    <div class="controls">                        <input class="input-xlarge" value="<%=data.apply_time%>" type="text" id="iptApplyTime" placeholder="提出日期">                    </div>                </div>            </li>            <li>                <div class="control-group">                    <label class="control-label">相关科室</label>                    <div class="controls">                        <input value="<%=data.apply_dept%>" type="hidden" id="applyDept">                        <input class="input-small" value="<%=data.dept_name%>" type="text" id="iptApplyDept" placeholder="输入部门编码">输入部门编码检索                    </div>                </div>            </li>            <li>                <div class="control-group">                    <label class="control-label">科室联系人</label>                    <div class="controls">                        <input value="<%=data.apply_user%>" type="hidden" id="applyUser">                        <input class="input-small" value="<%=data.cnname%>" type="text" id="iptApplyUser" placeholder="输入工号">输入工号检索                    </div>                </div>            </li>            <li>                <div class="control-group">                    <label class="control-label">标题</label>                    <div class="controls">                        <input class="input-xlarge" value="<%=data.title%>" type="text" id="iptTitle" placeholder="项目标题">                    </div>                </div>            </li>                        <li>                <div class="control-group">                    <label class="control-label">项目描述</label>                    <div class="controls">                        <textarea rows="3" id="iptNote" placeholder="项目描述"><%=data.note%></textarea>                      </div>                </div>            </li>            <li>                <div class="control-group">                    <label class="control-label">相关系统</label>                    <div class="controls">                        <input class="input-xlarge" value="<%=data.related_app%>" type="text" id="iptRelatedApp" placeholder="故障标题">                    </div>                </div>            </li>            <li>                <div class="control-group">                    <label class="control-label">处理意见</label>                    <div class="controls">                        <textarea rows="3" id="iptResult" placeholder="处理意见"><%=data.result%></textarea>                     </div>                </div>            </li>            <li>                <div class="control-group">                    <label class="control-label">是否完成</label>                    <div class="controls">                        <input id="chkStatus" type="checkbox" <%=data.cstatus==1? "checked": ""%>/>                     </div>                </div>            </li>        </ul>    </div>    <div style="clear:both;">        <% if (data.cstatus == 0) {%>        <a href="javascript:void 0;" cmd="save" class="btn btn-primary">确定</a>        <%if (op == 1) {%><button cmd="del" class="btn btn-danger" deptid="<%=data.id%>"><i class="icon-remove"></i>删除</button><%}%>        <%}%>    </div></div>', {data: {id: '',name: '', note:'',power: '',user_cn_name: info[0].cnname,user_dept_name: info[0].deptname, user_dept: info[0].deptid,user_id: info[0].id,cstatus:0 }, op:op }) } ) ;
                
                initCtl();
                saveEvent();
                
            });
            return false;
        });  
    }
    
    function saveEvent( ) {
        slidewrap.find('a[cmd="save"]').click(function () {
            var title = $('#iptTitle').val();
            var iptApplyTime = $('#iptApplyTime').val();
            var iptApplyDept = $('#applyDept').val();
            var iptApplyUser = $('#applyUser').val();
            var iptRelatedApp = $('#iptRelatedApp').val();
            var result = $('#iptResult').val();
            var note = $('#iptNote').val();
            var chkStatus = +$('#chkStatus')[0].checked;
            if (title == '') {
                alert ('标题不能为空');
                return;
            }
            var params = {
                title: title,
                apply_dept: iptApplyDept,
                apply_user: iptApplyUser,
                apply_time: iptApplyTime,
                note: note,
                result: result,
                cstatus: chkStatus,
                related_app: iptRelatedApp
            };
            if (op ==1 ) {
                params.id = $('#currentId').val();
            }
            manager.setSoftwareReport(params, function (d) {
                dialog.create ('操作成功', 400, 200, {isMaskClickHide: 0, title: '操作结果', button: {
                    '确定': function() {
                        dialog.hide();
                    }
                }});
                slidepanel.hide();
                moduleWrap.render();
            });
            return false;
        });
        slidewrap.find('button[cmd="del"]').unbind('click').click(function (evt) {
            var id = $(this).attr('deptid');
            dialog.create ('确定要删除改故障单么，删除后不可恢复，确定吗？', 400, 200, {isMaskClickHide: 0, title: '操作确认', button: {
                '确定': function() {
                    dialog.hide();
                    manager.delFailureReport({id: id}, function () {
                        alert ('删除成功');
                        slidepanel.hide();
                        moduleWrap.render();
                    });
                }
            }}); 
            
            return false;
        });
    }
    
    var moduleWrap = {
        render: function () {
            container = $('#mainContainer');
            var param = {};
            manager.getSoftwareReport(param, function (data) {
                cacheData = data;
                for (var i = 0; i < data.length; i++) {
                    data[i].create_time = util.formatDate(data[i].create_time);
                    data[i].apply_time = util.formatDate(data[i].apply_time);
//                    data[i].statusname = data[i].cstatus == 1 ? '已完成' : '未完成';
                    data[i].statusname = {'0': '未完成', '1': '已完成', '2': '上级已同意','4':'上级已驳回'}[data[i].cstatus];
                }
                container.html(util.tmpl('<a class="btn" href="#" cmd="addNew">新增</a><table class="table table-condensed table-bordered table-striped table-nowrap" data-event="edit_software_report">    <thead>      <tr>        <th>标题</th>        <th>提单者</th>        <th>相关科室</th>        <th>相关联系人</th>        <th>申请日期</th>        <th>状态</th>      </tr>    </thead>    <tbody>        <%for (var i = 0; i < data.length; i++) {%>      <tr>        <td><a reportid="<%=data[i].id%>" href="#"><%=data[i].title%></a></td>        <td><%=data[i].op_username%></td>        <td><%=data[i].dept_name%></td>        <td><%=data[i].cnname%></td>        <td><%=data[i].apply_time%></td>        <td><%=data[i].statusname%></td>      </tr>        <%}%>    </tbody></table>', {data: cacheData}));
                init ();
            });
        }
    };
    module.exports = moduleWrap;
});
define('editor/ve', function(require, exports, module) {
var $ = require('$');
var upfile = require('upfile');
/**
 * @fileOverview 编辑器主文件
 * @author skyzhou
 * @version 0.9
 */
 
/**
 *@module ve
 */
/**
 *@class ve
 */
var ve = {};
ve.util = ve.util || {};
ve.lib = ve.lib || {};
ve.$ = function(id){
	return document.getElementById(id);
};

;(function(v){

	var uniqid = 0;
	var editors = {};
	var initFn = [];
	var destroyFn = [];
	var readyFn = [];
	var iconUrl = 'http://qzonestyle.gtimg.cn/open_proj/proj_qcloud_v2/ac/light/dashboard/toolbar.png';

	//编辑器模版
	var editorTpl = '<div  style="width:<%=config.width%>;" class="ve-editor-wrap"><div class="ve-fixed-toolbar" id="<%=tbwId%>"></div><% if (config.fixedToolbar) { var extraCls = " has-fixed-toolbar"} %><div _event="ve-edit" style="height:<%=config.height%>;"  id="<%=eId%>" contenteditable="true" class="ve-editor<%=extraCls%>"></div><div class="ve-statusbar" id="<%=sId%>" style="display:none;"><span>加载中……</span><a _event="ve-close" class="close">关闭</a></div><div class="ve-float" id="<%=fId%>" style="display:none;"></div></div>';

	/**
	 * 编辑器构造函数，通过传入配置信息在指定的容器里面创建一个可编辑的div层.
	 * @class ve.Create
	 * @constructor
	 * @param  {Object} option 参数配置
	 * @example
	 var ed = new ve.Create({
		 	container:$('container'),
		 	buttons:['bold','underline','strikethrough'],
		 	width:"600px",
		 	height:"300px"
	 	})
	 */
	function Create(option){

		//默认配置
		var config = {
			height:'300px',
			width:'100%',
			commands:['bold','italic', 'underline', '|', 'FontSize', "forecolor",'backcolor', '|', 'justifyleft','justifycenter','justifyright', '|', 'image', 'createLink'],
			container:document.createElement('div'),
			fixedToolbar: 1,
			floatToolbar: 1,
			zoomEdit: 1
		}

		for(var p in option){
			config[p] = option[p];
		}

		/**
		 * 编辑器配置信息
		 * @property config
		 * @type {Object}
		 * @for ve.Create
		 */
		this.config = config;


		/**
		 * 编辑器唯一ID
		 * @property id
		 * @type {String}
		 * @for ve.Create
		 */
		this.id = ++uniqid;
		

		var eId = 've_'+this.id;
		var sId = 'st_'+this.id;
		var fId = 'fl_'+this.id;
		var tbwId = 'toolbar_wrapper_'+this.id;

		/**
		 * 编辑器所在容器元素
		 * @property containerElement
		 * @type {htmlElement}
		 * @for ve.Create
		 */
		this.containerElement = config.container;
		this.containerElement.innerHTML = v.util.tmpl(editorTpl,{
			eId:eId,
			sId:sId,
			fId:fId,
			tbwId:tbwId,
			config:config
		});

		/**
		 * 编辑器元素
		 * @property editorElement
		 * @type {htmlElement}
		 * @for ve.Create
		 */
		this.editorElement = v.$(eId);
		this.statusElement = v.$(sId);
		this.floatElement = v.$(fId);
		this.fixedToolbarWrapperEl = v.$(tbwId);

		//实例属性
		this.panelinView = [];

		this._init();

		editors[editors] = this;
	}

	Create.prototype = {
		/**
		 * 初始化编辑器
		 * @private
		 */
		_init:function(){
			var that = this;
			v.util.insertStyleSheet(v.util.tmpl('.ve-editor-wrap{          background:#fff;        position:relative;        padding:0px;        overflow-y:auto;        position:relative;    }    .ve-editor{        word-break:break-all;        padding:10px;        outline:none;        overflow-x:hidden;        min-height:100px;        line-height:normal;    }    .ve-editor strong{        font-weight:bold;    }    .ve-editor em{        font-style:italic;    }    .ve-statusbar{        position:absolute;        height:25px;        background:#D9DDE2;        top:0px;        transition: opacity .5s ease-in-out;        font-size:13px;        opacity:0;    }    .ve-float{        position:absolute;        z-index:999;    }    .ve-statusbar span{        float:left;        margin:5px 10px;        color:#7F7F7F;    }    .ve-statusbar .close{        float:left;        margin:5px 10px;        cursor:pointer;        color:#00c;    }    .ve-toolbar{        font-size: 0px;        padding: 3px;        height: 26px;        line-height: 26px;        background-color: #FFF;        -webkit-box-shadow: 0 3px rgba(0, 0, 0, 0.1);        -moz-box-shadow: 0 3px rgba(0,0,0,.1);        box-shadow: 0 3px rgba(0, 0, 0, 0.1);        border: solid 1px #CBCBCB;    }    .ve-fixed-toolbar .ve-toolbar{        -webkit-box-shadow: none;        -moz-box-shadow: none;        box-shadow: none;        width: auto;    }    .ve-toolbar a{        width: 25px;        height: 24px;        display: inline-block;        background-color: #FFF;        border: 1px solid #FFF;        border-radius: 2px;        text-align: center;        line-height: 24px;        position: relative;        font-size: 12px;    }    .ve-toolbar .active,.ve-toolbar a:hover{        border:1px solid #939598;        background-image: -webkit-linear-gradient(bottom, rgba(0,0,0,.05), rgba(255,255,255,.05));        background-image: -moz-linear-gradient(bottom, rgba(0,0,0,.05), rgba(255,255,255,.05));        background-image: -o-linear-gradient(bottom, rgba(0,0,0,.05), rgba(255,255,255,.05));        background-image: -ms-linear-gradient(bottom, rgba(0,0,0,.05), rgba(255,255,255,.05));        background-image: linear-gradient(to top, rgba(0,0,0,.05), rgba(255,255,255,.05))    }       .ve-toolbar a span{        display: inline-block;        width: 20px;        height: 20px;        pointer-events: none;        font-size: 0;        line-height: 0;        overflow: hidden;        zoom: 1;        vertical-align: middle;        background: url(<%=icon%>) no-repeat;    }    .ve-toolbar .bold{        background-position: -20px -20px;    }    .ve-toolbar .strikethrough{         background-position: -20px -160px;    }    .ve-toolbar .underline{         background-position: -20px -60px;    }    .ve-toolbar .forecolor{         background-position: -20px -80px;    }    .ve-toolbar .italic{         background-position: -20px -40px;    }    .ve-toolbar .backcolor{         background-position: 0px -180px;    }     .ve-toolbar .FontSize{         background-position: -20px -221px;    }     .ve-toolbar .createLink{         background-position: -20px -200px;    }    .ve-toolbar .justifyleft{         background-position: -20px -100px;    }    .ve-toolbar .justifycenter{         background-position: -20px -120px;    }    .ve-toolbar .justifyright{         background-position: -20px -140px;    }    .ve-toolbar .image{        background-position: -20px -243px;    }    .ve-panel-wrap{        transition: opacity .2s ease-in-out;        opacity:0;        z-index:999;    }    .ve-panel{        background-color:#fff;        border: 1px solid #ccc;        box-shadow: 0 2px 4px rgba(0,0,0,.15);        padding: 10px;    }    .ve-color{        width: 210px;        height: 115px;    }    .ve-color a{        cursor: pointer;        display: inline-block;        height: 15px;        width: 15px;        box-shadow: 0 1px 1px rgba(0, 0, 0, .05) inset ;        border:2px solid #fff;        font-size:0;        float: left;    }    .ve-color a:hover{        border:2px solid #548dd4;    }    .ve-fontsize{        width: 165px;        padding: 10px 0px;        overflow:auto;    }    .ve-fontsize a{        cursor: pointer;        display: block;        color: #000;        padding: 4px 10px;        text-decoration:none;    }    .ve-fontsize a:hover{        background-color:#eee;    }    .ve-createLink{        width:360px;    }    .ve-uploadimg{        width:365px;        padding:0 0 10px;    }    .ve-toolbar-separator{         color: #CCCCCC;        font-size: 12px;        margin: 0 5px;    }    .has-fixed-toolbar{        border: 1px solid #CBCBCB;        border-top: none;    }    .ve-editor img {        max-width:100%    }    .ve-toolbar a.zoom-link{        position:absolute;         right:10px;        width:56px    }    .ve-maximize .ve-editor-wrap{        position: fixed;        left: 100px;        top: 100px;        right: 100px;        bottom: 100px;        z-index: 1100    }    .ve-maximize .slide-panel, .ve-maximize .main{        overflow: inherit!important    }    .ve-maximize-mask{        position:fixed;        left:0;        top:0;        width:100%;        height:100%;        z-index:1000;        background:#000;    }    .ve-maximize .ve-fixed-toolbar .ve-toolbar{        border:none;        border-bottom:1px solid #cbcbcb    }    .ve-maximize .has-fixed-toolbar{        border:none    }    .ve-editor p {        margin: 1em 0;    }',{ua:v.ua,icon:iconUrl}), 'editorStyle');

			for (var i=0,fn;fn = destroyFn[i];i++) {
				fn.call(this);
			}

			initFn.sort(function(a,b){
				return a.index - b.index
			});
			for(var i=0,fn;fn = initFn[i];i++){
				fn.call(this);
			}

			var tm = setInterval(function(){
				if(document.body){
					for(var i=0,fn;fn = readyFn[i];i++){
						fn.call(that);
					}
					clearInterval(tm);
					readyFn = [];
				}
			},100);
		},
		/**
		 * @for ve.Create
		 */
		/**
		 * 获取当前编辑器的内容
		 * @method getContent
		 * @return {String} 内容
		 */
		getContent:function(){
			return this.editorElement.innerHTML;
		},
		getTitle:function(){
			var divNode = document.createElement('div');
			divNode.innerHTML = this.editorElement.innerHTML;
			var ignores = divNode.getElementsByTagName('p');
			for (var i = 0, ignore; ignore = ignores[i]; i++){
				if (ignore.className == 'size') {
					ignore.innerHTML = '';
				}
			}
			
			divNode.innerHTML = divNode.innerHTML.replace(/<\!\-\-no gettitle start\-\->[\s\S]*<\!\-\-no gettitle end\-\->/gi,"");
			var text = divNode.innerText || divNode.textContent || "";
			text = text.replace(/(^\s+|\s+$)/g,'').substr(0,40);
			return text.split(/(\r\n|\r|\n)/)[0];
		},
		/**
		 * 设置编辑器内容
		 * @method setContent
		 * @param  {html} html html文本
		 */
		setContent:function(html,focus,ignore){
			this.editorElement.innerHTML = ignore?html:this.filterHtml(html);
			if(focus){
				this.focus();
			}
		},
		/**
		 * 使得当前编辑器获取焦点/光标
		 * @method focus
		 */
		focus:function(){
			this.setFocusAt(this.editorElement);
		},
		/**
		 * 将函数添加到ready队列，当编辑器初始化完成且document.body已load后执行
		 * @method onReady
		 * @param {Function} fn 函数
		 */
		onReady:function(fn){
			readyFn.push(fn);
		},
		/**
		 * 将编辑器append到指定的元素容器中
		 * @method appendTo
		 * @param {htmlElement} elem 容器
		 */
		appendTo:function(elem){
			elem.appendChild(this.editorElement);
		},
		resize:function(option){
			for(var p in option){
				this.editorElement.style[p] = option[p];
			}
		},
		filterHtml:function(html){
			return v.util.filterHtml(html);
		},

		uploadImage:function(imageBlob,url,options){
			var _self = this;
			var Upload = ve.lib.Upload;
            var loader = new Upload({
                url:url,
                name:"image",
                onprogress:function(name,p1,p2){
                	if(!options.progress || options.progress(name,p1,p2)){
	                    var p = parseInt(p1/p2*100);
	                    if(p>99){
	                        p=99;
	                    }
	                    _self.displayStatusBar("图片上传中："+p+"%");
                	}
                },
                oncomplete:function(data){
                   data = eval('('+data+')');
                   options.complete && options.complete(data)
                }
            });
            loader.addFile(imageBlob);
            loader.send();
		},
		isEmpty: function () {
			return (this.editorElement.innerHTML.replace(/<(?!img|embed).*?>/ig, '').replace(/&nbsp;/ig, ' ').replace(/\r\n|\n|\r/, '') == '');
		},
		zoomEdit: function (btn) {
			var JQ = require('$');
			var editorWrapper = JQ(this.containerElement).find('.ve-editor-wrap');
			var options = this.config;
			var btn = editorWrapper.find('.zoom-link');
			var editor = JQ(this.editorElement);
			var bd = JQ('body');

			if (bd.hasClass('ve-maximize')) {
				bd.removeClass('ve-maximize');
				editorWrapper.width(options.width);
				editor.height(options.height);
				btn.text('放大编辑');
				JQ('#veMask').remove();
		    } else {
		    	var mask = JQ('<div/>').attr({
		    		'id': 'veMask',
		    		'_event': 've-maximize-mask',
		    		'class': 've-maximize-mask'
		    	});
		    	mask.css('opacity','0.5');
		    	mask.insertBefore(editorWrapper);
		    	bd.addClass('ve-maximize');
		    	var toolbarHei = JQ(this.fixedToolbarWrapperEl).outerHeight() || 0;
		    	editorWrapper.width('auto');
				editor.height(editorWrapper.height() - toolbarHei - 21);
				btn.text('缩小编辑');
		    } 
		}
	}
	
	/**
	 * 扩展，为构造函数添加原型方法、静态方法，或为编辑器添加初始化函数
	 * 方法首字母为"$"的为静态方法，通过ve.$**调用。
	 * 前几个字符为"_init"的为初始化函数，会在编辑器初始化的时候被调用
	 * @method $extend
	 * @param  {Object} obj 方法集。
	 * @param {Number} index 添加次序，当有初始化方法时有效
	 * @for ve
	 */
	v.$extend = function(obj,index){
		var index = index || 999;
		for(var p in obj){
			if(p.charAt(0) == '$'){
				v[p] = obj[p];
			}
			else if(/^_init/.test(p)){
				obj[p].index = index;
				initFn.push(obj[p]);
			}
			else if(/^_destroy/.test(p)){
				destroyFn.push(obj[p]);
			}
			else{
				Create.prototype[p] = obj[p];
			}
			
		}
	}
	v.Create = Create;

	//预加载icon
	new Image().src = iconUrl;
})(ve);


/**
 * 工具栏
 */
(function(v){
	
	var toolbarTpl = '<div  class="ve-toolbar" unselectable="on"><% for(var i=0,pl;pl = plugins[i];i++) { %><% if (pl == "|") { %><span class="ve-toolbar-separator">|</span><% } else { %><a href="javascript:;" title="<%=(pl.description+(pl.shortcut?"("+pl.shortcut.join("+")+")":""))%>" command="<%=pl.command%>" _event="ve-command" class="<%=prefix%>_tool_<%=pl.command%>"  hidefocus="true"><span class="<%=pl.className%>"></span></a><% } %><% } %><% if (zoomEdit) {%><a href="javascript:;" class="zoom-link" _event="ve-zoom">放大编辑</a><% } %></div>';
	var elements = [];
	var binded = false;

	v.$extend({
		//初始化工具栏
		_initToolbar:function(){
			var that = this;

			var bindVeCmdEvt = function (topElem) {
				v.util.bindEvt(topElem,'click',{
					"ve-command":function(){
						var cmd = this.getAttribute("command");
						//this.focus();
						that.execCommand(cmd);
						that.updateToolStat();
					}      
				});
			}
			if (this.config.floatToolbar) {
				this.toolbarElement = this.createToolPanel(v.util.tmpl(toolbarTpl,{plugins:this.plugins, zoomEdit:'', prefix:'float'}), this.id);
				bindVeCmdEvt(this.toolbarElement);
			}

			if (this.config.fixedToolbar) {
				this.fixedToolbarWrapperEl.innerHTML = (v.util.tmpl(toolbarTpl,{plugins:this.plugins , zoomEdit:this.config.zoomEdit , prefix:'fixed'}));
				bindVeCmdEvt(this.fixedToolbarWrapperEl);
			}

			this.onReady(function(){
				var panelContainer = that.getPanelContainer();
				for(var i=0,el;el = elements[i];i++){
					el && panelContainer.appendChild(el);
				}
			});
		},
		_destroyThis: function () {
			elements = [];
		},
		getPanelContainer: function () {
			var panelContainer = document.getElementById('vePanelContainer');
			if (!panelContainer) {
				panelContainer = document.createElement('div');
				panelContainer.id = 'vePanelContainer';
				document.body.appendChild(panelContainer);
			}
			return panelContainer;
		},
		displayStatusBar:function(str){
			if(str){
				this.statusElement.firstChild.innerHTML = str;
				this.statusElement.style.display = "";
				this.statusElement.style.opacity = 1;
			}
			else{
				v.util.hide(this.statusElement,200);
			}
		},
		displayFloatDiv:function(html,elem){
			if(html){
				var elemRect = v.util.getPostion(elem);
				var editorRect = v.util.getPostion(this.editorElement);
				var floatElement = this.floatElement;

				floatElement.innerHTML = html;
				floatElement.style.top = (elemRect.top - editorRect.top)+'px';
				floatElement.style.left = (elemRect.left - editorRect.left)+'px';
				floatElement.style.display = "";
				this.setEventHdl("floatElement","del-img",function(){
					elem.parentNode.removeChild(elem);
				});
			}
			else{
				floatElement.style.display = "none";
			}
			

			
		},
		/**
		 * 展现某个面板或隐藏所有面板
		 * @method displayPanel
		 * @param  {htmlElement} elem  要展现的面板元素，当为空时隐藏所有
		 * @param  {Object} option 展现参数
		 * @for ve.Create
		 */
		displayPanel:function(elem,option){
			var that = this;
			option = option || {};

			if(elem){
				if(elem.tm){
					v.util.clear(elem.tm);
					elem.tm = null;
				}
				if(!elem.uniqid){
					elem.uniqid = "u_"+(+new Date());
				}
			}


			for(var i=0,el;el = this.panelinView[i];i++){
				if(elem && el.uniqid == elem.uniqid){
					continue;
				}
				el.blur();
				v.util.hide(el,200);
				this.panelinView.splice(i,1);
				this.clearCatchBodyClick();
			}

			//
			if(!elem){
				
				//防止键起立即又显示
				that.forbid = true;
				v.util.hide(that.toolbarElement,option.delay,function(){
					that.forbid = false;
				});	
				
				return;
			}
			elem.style.display = "";
			
			//当前元素的占位信息
			var panelRect = v.util.getPostion(elem);
			//编辑器元素占位信息
			var editorRect = v.util.getPostion(this.editorElement);

			//目标元素的占位信息
			var targetPos = v.util.getPostion();
			

			var scrollTop = Math.max(document.body.scrollTop,document.documentElement.scrollTop);
			var scrollLeft = Math.max(document.body.scrollLeft,document.documentElement.scrollLeft);
			var viewHeight = Math.max(document.documentElement.clientHeight||document.body.clientHeight);
			var x = 0,y = 0;

			that.catchBodyClick(elem);

			//如果是面板（不是浮动工具栏）
			if(option.panel){
				 this.panelinView.push(elem);
				//如果带有定位信息，比如弹窗
				if(option.position){
					if(option.position.auto){
						option.position.x=Math.max(parseInt((editorRect.width-panelRect.width)/2),0);
						option.position.y=Math.max(parseInt((editorRect.height-panelRect.height)/2),0);
						x+=option.position.x+editorRect.left;
						y+=option.position.y+editorRect.top;

						if(y<scrollTop){
							y=0;
						}
					}
					else if(option.position.relative){
						var relativePos = v.util.getPostion(option.position.relative);
						var deviation = option.position.deviation || {}
						
						x+=relativePos.left+(deviation.x||0);
						y+=relativePos.bottom+(deviation.y||0)
					}
					else{
						x+=option.position.x||0;
						y+=option.position.y||0;
					}
				}
				//否则根据当前被点击元素的信息来定位
				else{
					x+=targetPos.left;
					y+=targetPos.top+30
				}
				
			}
			//浮动工具栏根据当前选中信息来定位
			else{
				var rangeRect = this.range.getBoundingClientRect();
				x+=rangeRect.left;
				y+=rangeRect.bottom+5;
			}

			//弹窗不溢出边框
			if(x+panelRect.width>editorRect.left+editorRect.width){
				x-=panelRect.width-(option.panel?27:-5);
			}
			
			if(y+panelRect.height>viewHeight){
				y -= (panelRect.height+33);
			}

			x += scrollLeft;
			y += scrollTop;

			

			elem.style.opacity = 1;
			if(option.keep){
				return;
			}

			elem.style.left = x+'px';
			elem.style.top = y+'px';

			if(!option.panel){
				//刷新状态
				this.updateToolStat();
			}
		},

		clickHandler : function(){
			this.displayPanel();
		},

		catchBodyClick:function(elem){
			var that = this;
			var catchTime = null;
			
			if(!binded){

				this.clickHandler = function(evt){
					var _target = evt.target || evt.srcElement,
						_targetParent = _target.parentNode,
						_isToolbar = _targetParent && /(ve-toolbar|float_tool)/.test(_targetParent.className);
					if (_isToolbar) {
						return false;
					}
					
					//延时100毫秒才响应
					if(catchTime && new Date()-catchTime > 100)
						that.displayPanel();
				}

				var catchTime = +new Date();
				if(document.body.addEventListener)
					document.body.addEventListener("click",this.clickHandler);
				else{
					document.body.attachEvent("onclick",this.clickHandler);
				}
				binded = true;
			}

			catchTime = +new Date();
		},

		clearCatchBodyClick:function(){
			if(this.clickHandler){
				if(document.body.removeEventListener)
					document.body.removeEventListener("click",this.clickHandler);
				else{
					document.body.detachEvent("onclick",this.clickHandler);
				}

				binded = false;
			}
		},

		createToolPanel: function (html,id) {
			var panelContainer = this.getPanelContainer();

			var div = document.createElement("div");
			div.innerHTML = html;
			div.className = 've-panel-wrap ve-panel-tool';
			div.id = 'vePaneTool' + id;
			div.style.display = "none";
			div.style.position = "absolute";
			panelContainer.appendChild(div);
			return div;
		},

		updateToolStat:function(){
			v.currentIns = this;
			if(!document.queryCommandState){
				return;
			}
			var fixedBtns = [], floatBtns = [];
			if (this.fixedToolbarWrapperEl) {
				fixedBtns = this._makeArray(this.fixedToolbarWrapperEl.getElementsByTagName('a'));
			}
			if (this.toolbarElement) {
				floatBtns = this._makeArray(this.toolbarElement.getElementsByTagName('a'));
			}

			var btns = fixedBtns.concat(floatBtns);
			for(var i=0,a;a = btns[i];i++){
				if (a.className.indexOf('active') >= 0) {
					a.className = a.className.replace('active', '');
				}
			}

			var isActive = false, el,
				containerEle = this.containerElement,
				floatToolPanel =  document.getElementById('vePaneTool' + this.id);

			for (var i = 0,pl;pl = this.plugins[i]; i++) {
				if (pl == '|') {
					continue;
				}
				try {
					isActive = document.queryCommandState(pl.command);
				} catch (e) {}
				
				var	floatBtnEl = v.util.getClass("float_tool_"+pl.command, 'a', floatToolPanel)[0],
					fixedBtnEl = v.util.getClass("fixed_tool_"+pl.command, 'a', containerEle)[0];

				if(isActive){
					floatBtnEl && (floatBtnEl.className = floatBtnEl.className + " active");
					fixedBtnEl && (fixedBtnEl.className = fixedBtnEl.className + " active");
				}
			}
		},
		_makeArray: function (obj) {
			try {
		        return [].slice.call(obj);
		    } catch (e) {//for IE
		        var j, i=0, rs=[];
		        while (j=obj[i]) {
		        	rs[i++] = j;
		        }
		        return rs;             
		    }
		},
		/**
		 * 创建一个面板
		 * @method  createPanel
		 * @param  {String} html  面板的innerHTML
		 * @param  {Object} option 面板参数
		 * @return {htmlElement}       面板元素
		 * @for ve.Create
		 */
		createPanel:function(html, option){	
			option = option || {}
			var div = v.util.getClass('ve-panel-' + option.cmd, 'div');
			if (div.length) {
				div = div[0];
			} else {
				var div = document.createElement("div");
				div.innerHTML = html;
				div.className = 've-panel-wrap ve-panel-' + option.cmd;
				div.style.display = "none";
				div.style.position = "absolute";
				elements.push(div);
			}
			return div;
		}})

})(ve);
/**
 * 事件绑定
 */

;(function(v){
	
	var lisners = {}

	var isLast = false;

	var lsId = 0;

	var lastInputTime;

	var timer = null;

	var eventHdl = {
		"floatElement":{}
	}
	
	v.$extend({
		//初始化函数，编辑器初始化时调用，不会出现在对象方法列表中
		_initEvent:function(){

			var that = this;
			
			var onUp = function(evt){

				var x = evt.x;
				var y = evt.y;
				var t = evt.type;
				v.util.lazy(function(){
					if(that.forbid){
						return;
					}
					if(that.hasRange()){
						var option = {
							x:x+5,
							y:y+8,
							type:t
						}

						if(!that.isNewRange()){
							//维持原位置
							option.keep = true;
						}
						that.displayPanel(that.toolbarElement,option);
					}
					else{
						that.displayPanel();
					}
				},60);
				
				lastInputTime = +new Date();

				return !that.fire(evt);;

			}
			var onDown = function(evt){
				return !that.fire(evt);;
			}

			v.util.bindEvt(this.containerElement,'mousedown',{
				've-edit':onDown
			});


			v.util.bindEvt(this.containerElement,'mouseup',{
				've-edit':onUp
			});
			
			v.util.bindEvt(this.containerElement,'click',{
				've-img':function(){
					that.selectNode(this);
				},
				've-link':function(evt){
					var link = this.href;
					if(evt.ctrlKey && /^http/i.test(link)){
						window.open(link);
					}
				},
				've-edit':function () {
					that.updateToolStat();
				},
				've-zoom':function () {
					that.zoomEdit();
				},
				've-maximize-mask': function () {
					that.zoomEdit();
				}
			});

			v.util.bindEvt(this.containerElement,'dblclick',{
				've-img':function(){
					that.selectNode(this);
					var src = this.getAttribute("src");
					src = src.replace(/\/\d+$/,'/0')
					window.open(src);
				}
			});
			
			v.util.bindEvt(this.floatElement,'mouseup',eventHdl["floatElement"]);

			v.util.bindEvt(this.containerElement,'keydown',{
				've-edit':onUp
			});

			v.util.bindEvt(this.containerElement,'keyup',{
				've-edit':onUp
			});
			
			v.util.bindEvt(this.containerElement,'paste',{
				've-edit':function(evt){
					if(new Date() - lastInputTime < 600){
						timer && clearTimeout(timer);
					}
					return filterContent(evt);
				},
				've-img':function(evt){
					if(new Date() - lastInputTime < 600){
						timer && clearTimeout(timer);
					}
					return filterContent(evt);
				}
			});

			var filterContent = function(evt){
				var clipboardData =  evt.clipboardData || window.clipboardData || {};
                var textData = clipboardData.getData("text");
                var types = clipboardData.types;
                if (types && types.indexOf('Files') != -1 && FileReader) {
                    var item = clipboardData.items[0],
                        reader = new FileReader();
                    reader.onload = function(event) {
                        that.setContent('<img src="' + event.target.result + '" />');
				        that.setFocusAt();
                    }
                    //对复制图片的处理，非截图
                    if(item.kind === 'string' && clipboardData.items[1]) {
                        item = clipboardData.items[1];
                    }
                    reader.readAsDataURL(item.getAsFile());
                }
				
				var defaultAction = true;
				if(eventHdl["beforepaste"]){
					for(var fn in eventHdl["beforepaste"]){
						if(!eventHdl["beforepaste"][fn](evt,textData))
							defaultAction = false;
					}
				}

				timer = setTimeout(function(){
					//hack一把
					that.saveFocus();
					var content = that.getContent();
					if(content){
						that.setContent(content);
						that.setFocusAt();
						//setContent之后，保存的range全部失效，
						//这里把最后一个重新保存一个
						that.saveRange();
					}
					
					if(eventHdl["afterpaste"]){
						for(var fn in eventHdl["afterpaste"])
							eventHdl["afterpaste"][fn](evt,textData);
					}
					
				},300);

				return defaultAction;
			}

			v.util.bindEvt(this.statusElement,'mousedown',{
				"ve-close":function(){
					that.displayStatusBar();
				}
			});

			lastInputTime = +new Date();

			this.addEvtListener("keydown",function(evt){
				//8 46
				var keyCode = evt.keyCode;
				if(keyCode == 8 || keyCode == 46){
					if(document.selection && /control/i.test(document.selection.type)){
						this.deleteContents();
						return true;
					}
				}
				return ;
			});
		},
		/**
		 * @for ve.Create
		 */
		/**
		 * 添加编辑操作中的事件监听
		 * @method addEvtListener
		 * @param  {String} type 事件类型
		 * @param  {Function} hdl 回调句柄
		 * @return {Number}     唯一索引id，用于解除绑定用
		 */
		addEvtListener:function(type,hdl){
			!lisners[this.id]  && (lisners[this.id] = {});
			!lisners[this.id][type]  && (lisners[this.id][type] = []);
			hdl.id = ++lsId;
			lisners[this.id][type].push(hdl);
			return lsId;
		},
		/**
		 * 解除事件绑定
		 * @method removeEvtListener
		 * @param  {Number} id  绑定时返回的ID
		 * @return {Boolean}      是否解除成功
		 */
		removeEvtListener:function(id){
			var hdls = lisners[this.id];
			for(var p in hdls){
				for(var i = 0,hdl;hdl = hdls[p][i];i++){
					if(hdl.id == id){
						hdls.splice(i,1);
						return true;
					}
				}
			}
		},
		/**
		 * 触发事件
		 * @method fire
		 * @param  {KeyboardEvent} evt 事件对象
		 * @return {Boolean}    是否阻止默认事件
		 */
		fire:function(evt){

			var type = evt.type;
			var prevent = false;

			if(lisners[this.id] && lisners[this.id][type]){
				for(var i = 0,fn;fn = lisners[this.id][type][i];i++){
					if(fn.call(this,evt)){
						prevent = true;
					}
				}
			}

			return prevent;
		},
		getLastInputTime:function(){
			return lastInputTime;
		},
		setEventHdl:function(mod,name,fn){
			if(!eventHdl[mod]){
				eventHdl[mod] = {};
			}
			eventHdl[mod][name] = fn;
		},

		getEventHdl:function(mod,name){
			if(eventHdl[mod]){
				if(name)
					return eventHdl[mod][name];
				else return eventHdl[mod];
			}
		}
	});
})(ve);
/**
 * 键盘事件
 */
;(function(v){
	var shortcuts = [];

	var str2key = {
		'ctrl':"ctrlKey",
		'shift':"shiftKey",
		'alt':'altKey'
	}
	var code2key = {
		"18":'altKey',
		"17":"ctrlKey",
		"16":"shiftKey"
	}
	var key2code = {
		'altKey':18,
		"ctrlKey":17,
		"shiftKey":16
	}
	v.$extend({
		/**
		 * 获取当前被按下的功能键
		 * @method getFnKeys
		 * @param  {KeyboardEvent} evt 事件对象
		 * @return {Array}    功能键列表
		 * @for ve.Create
		 */
		getFnKeys:function(evt){
			var arr = [];
			for(var key in key2code){
				evt[key] && arr.push(key);
			}

			return arr.sort();
		},
		/**
		 * 添加快捷键
		 * @method addShortcut
		 * @param  {Array} keys 键序列
		 * @param  {[type]} hdl 执行句柄
		 * @return {[type]}     是否阻止默认事件
		 * @for ve.Create
		 * @example
		 * this.addShortcut(
		 * 		['ctrl','shift','b'],
		 * 		function(){
		 * 			console.log('命中')
		 * 		}
		 * )
		 */
		addShortcut:function(keys,hdl){
			var that = this;
			var sFnKeys = [];
			//规则化
			keys = keys.join(',').replace(/ctrl|shift|alt/ig,function(m){
					var k = str2key[m];sFnKeys.push(k);return k}
				).split(',');

			sFnKeys.sort();

			shortcuts.push(keys);
			
			this.addEvtListener('keydown',function(evt){
				
				var keyCode = evt.keyCode;

				var fnKeys = this.getFnKeys(evt);

				//如果当前是功能键 返回
				if(code2key[keyCode]){
					return;
				}
				

				//检测功能键
				if(fnKeys.join('-') != sFnKeys.join('-')){
					return
				}
				
				if(keys.slice(-1)[0].charCodeAt(0)-32 !== evt.keyCode){
					return
				}

				hdl.call(that,evt);

				return true;
			})
		}
	});
})(ve);
/**
 * 选区
 */
;(function(v){

	var Range = function(range){
			this.ieRange = range;
			this.collapsed=true;//*
			this.commonAncestorContainer=range.parentElement?range.parentElement():null;//*
			this.endContainer=null;
			this.endOffset=0;
			this.startContainer=null;
			this.startOffset=0;
	}

	Range.prototype = {
		cloneContents:function(){
			return this.ieRange.duplicate().text;
		},
		cloneRange:function(){},
		collapse:function(){
			this.ieRange.collapse();
		},
		compareBoundaryPoints:function(){},
		compareNode:function(){},
		comparePoint:function(){},
		createContextualFragment:function(){},
		deleteContents:function(){
			this.ieRange.execCommand("delete");
		},
		detach:function(){},
		expand:function(){},
		extractContents:function(){},
		getBoundingClientRect:function(){
			var box =  this.ieRange.getBoundingClientRect(),rect = {};
		    //ie8- 没有width和height
		    if(box.width){
		    	rect = box;
		    	box.width = box.right-box.left;
		    	box.height = box.bottom - box.top;
		    }
		    else{
		    	rect = {
		    		top:box.top,
		    		right:box.right,
		    		bottom:box.bottom,
		    		left:box.left,
		    		width:box.right-box.left,
		    		height:box.bottom - box.top
		    	}
		    }
			return rect; 
		},
		getClientRects:function(){},
		insertNode:function(node){
			var div = document.createElement("div")
			div.appendChild(node);
			var html = div.innerHTML;

			if(/img/i.test(node.nodeName)){
				html+="<span></span>"
			}
			this.ieRange.pasteHTML(html);
		},
		intersectsNode:function(){},
		isPointInRange:function(){},
		selectNode:function(){},
		selectNodeContents:function(){},
		setEnd:function(){},
		setEndAfter:function(){},
		setEndBefore:function(){},
		setStart:function(){},
		setStartAfter:function(){},
		setStartBefore:function(){},
		surroundContents:function(){},
		toString:function(){
			return this.ieRange.text;
		}
	}

	var elements = [];
	var history = [];
	var focusId = null;

	v.$extend({
		/**
		 * 当前选区
		 * @property range
		 * @type {range}
		 * @for ve.Create
		 */
		range:null,
		/**
		 * 判断当前是否存在选区
		 * @method hasRange
		 * @return {Boolean} 
		 * @for ve.Create
		 */
		hasRange:function(){
			this.saveRange();
			var text = window.getSelection?window.getSelection().toString():document.selection.createRange().text;
			if(text){
				return true;
			}
		},
		/**
		 * 判断当前选区是新建的还是上次存在的
		 * @method isNewRange
		 * @return {Boolean} 
		 * @for ve.Create
		 */
		isNewRange:function(){
			if(history.length<2){
				return true;
			}
			else{
				return history[0].toString()!==history[1].toString();
			}
			
		},
		/**
		 * 获取当前选区
		 * @method getRange
		 * @for ve.Create
		 */
		getRange:function(){
			var selection,range;
			if(window.getSelection){
				selection = window.getSelection();
				if(selection.rangeCount){
					range = selection.getRangeAt(0);
				}
				else{
					range = this.getLastRange() || {};
				}
				
			}
			else{
				range = new Range(document.selection.createRange());
			}
			return range;
		},
		/**
		 * 获取上次选区
		 * @method getLastRange
		 * @return {Range} 
		 * @for ve.Create
		 */
		getLastRange:function(){
			return history[0];
		},
		/**
		 * 选中上次选区 selectRange
		 * @method
		 * @for ve.Create
		 */
		selectRange:function(range){
			range = range || history[0];
			if(!range){
				return;
			}
			if(window.getSelection){
				var selection = window.getSelection();
				selection.addRange(range);
			}
			else{
				history[0].ieRange.select();
			}
			
		},
		selectNode:function(elem){
			if(window.getSelection){
				var range = document.createRange();
				range.selectNode(elem);
				var selection = window.getSelection();
				selection.removeAllRanges();
				selection.addRange(range);
			}
		},
		/**
		 * 设置光标
		 * @method setFocusAt
		 * @param  {htmlElement} elem 被定位的元素
		 * @for ve.Create
		 */
		setFocusAt:function(elem,collapse){
			var elem = elem;

			if(!elem || !elem.parentNode){
				elem = v.$(focusId)
			}

			if(!elem){
				return;
			}
			var range,selection;

			if (collapse == undefined) {
				if(elem.innerHTML){
					var isEmpty = (elem.innerHTML.replace(/<(?!img|embed).*?>/ig, '').replace(/&nbsp;/ig, ' ').replace(/\r\n|\n|\r/, '') == '');
					collapse = isEmpty ? true : false;
				}else{
					collapse = false;
				}
			}
			
			if(document.createRange)//Firefox, Chrome, Opera, Safari, IE 9+
			{	
				if(/img/i.test(elem.tagName)){
					var selection = window.getSelection();
					if(selection){
						//定位光标
						var nodes = Array.prototype.slice.call(this.editorElement.childNodes,0);
						var index = nodes.indexOf(elem);
						selection.collapse(this.editorElement,index+1);
					}
				}
				else{
					range = document.createRange();//Create a range (a range is a like the selection but invisible)
					range.selectNodeContents(elem);//Select the entire contents of the element with the range
					range.collapse(collapse);//collapse the range to the end point. false means collapse to end rather than the start
					selection = window.getSelection();//get the selection object (allows you to change selection)
					selection.removeAllRanges();//remove any selections already made
					selection.addRange(range);//make the range you have just created the visible selection
				}
				if(elem.focus)
					elem.focus();

			}
			else if(document.selection)//IE 8 and lower
			{ 
				try {
					range = document.body.createTextRange();//Create a range (a range is a like the selection but invisible)
					range.moveToElementText(elem);//Select the entire contents of the element with the range
					range.collapse(collapse);//collapse the range to the end point. false means collapse to end rather than the start
					range.select();//Select the range (make it the visible selection
				} catch (e) {}
				elem.focus();
			}
		},
		/**
		 * 保存光标位置信息
		 * @method saveFocus
		 * @for ve.Create
		 */
		saveFocus:function(){
			focusId =  'f_'+new Date().valueOf();

			var span = document.createElement('span');
			span.setAttribute('name','empt');
			span.id = focusId;
		
			var range = this.getRange();

			range.insertNode(span);
			emptElem = span;
		},
		/**
		 * 保存选区
		 * @method saveRange
		 * @for ve.Create
		 */
		saveRange:function(){
			this.range = this.getRange();
			history.unshift(this.range);
		},

		insertNode:function(node){
			if(history[0]){
				if(history[0].commonAncestorContainer && this.editorElement.contains && !v.ua.isie){
					//如果当前选区不在editor范围内
					if(!this.editorElement.contains(history[0].commonAncestorContainer)){
						this.editorElement.appendChild(node);
						return
					}
				}
				history[0].insertNode(node);
			}
			else{
				this.editorElement.appendChild(node);
			}
			this.setFocusAt(node,true);
		},
		/**
		 * 清除选区
		 * @method clearRange
		 * @for ve.Create
		 */
		deleteContents:function(){
			this.getRange().deleteContents();
		}
	})
})(ve);
/**
 * 插件
 */
;(function(v){

	var plugins ={}
	if (require) {
		var JQ = require('$');
	}
	v.$extend({
		//初始化
		_initPlugins:function(){
			
			for(var p in plugins){
				plugins[p] = this._buildPlugin(plugins[p]);
			}

			this.plugins = [];

			for(var i = 0,cmd;cmd = this.config.commands[i];i++){
				if (cmd == '|') {
					this.plugins.push('|');
				} else {
					var pl = plugins[cmd];
					pl && this.plugins.push(pl);
				}
			}
		},
		/**
		 * 构建插件
		 * @param  {Object} pl 插件
		 * @return {Object}   格式化后的插件
		 */
		_buildPlugin:function(pl){
			
			var that = this;

			if(pl.panel){
				var panel = this.createPanel(pl.panel, {'cmd': pl.command});
				pl.dialog = function(position){	
					this.displayPanel(panel,{panel:true,position:pl.position || position});
					pl.onAfterDialog && pl.onAfterDialog.call(this,panel,pl.callback);
				}

				var hdl = {};
				hdl["ve-"+pl.command] = function(evt,target){	
					pl.value = target.getAttribute('value');
					that.execCommand(pl.command,pl.value,{from:'dialog'});
				}

				v.util.bindEvt(panel,'click',hdl);				
			}
			if(pl.shortcut){
				this.addShortcut(pl.shortcut,function(){
					that.execCommand(pl.command,pl.value,{from:'shortcut'});
				});
			}
			if(pl.onInit){
				pl.onInit.call(this, panel);
			}
			return pl;
		},
		/**
		 * 静态方法，新增插件
		 * @method $addPlugin
		 * @param  {Object} pl 插件配置
		 * @for ve
		 */
		$addPlugin:function(pl){
			plugins[pl.command] = {
				value:pl.value,
				panel:pl.panel,
				command:pl.command,
				className:pl.className || pl.command,
				dialog:null,
				execCommand:pl.execCommand,
				onAfterDialog:pl.onAfterDialog,
				shortcut:pl.shortcut || '',
				description:pl.description || '',
				position:pl.position,
				onInit:pl.onInit
			}

		},
		/**
		 * 执行插件命令
		 * @method execCommand
		 * @param  {String} cmd   命令串
		 * @param  {String} value 命令值
		 * @param  {String} from  命令执行来源
		 * @for ve.Create
		 */
		execCommand:function(cmd,value,option){
			var _self = v.currentIns || this;
			var pl = plugins[cmd],ret,opt = option || {};
			//
			if(!opt.from && pl.dialog){
				if(opt.callback){
					pl.callback = function(args){
						opt.callback.call(_self,args);
						_self.callback = null
					}
				}
				pl.dialog.call(_self,opt.position);
				return;
			}

			_self.editorElement.focus();

			if(pl.execCommand){
				ret = pl.execCommand.call(_self,value,opt.callback);
			}
			else{
				ret = document.execCommand(cmd,false,value || pl.value);
				_self.displayPanel(null,{delay:300})
			}

			JQ && JQ(document).trigger('editorExecCommand', _self);
			return ret;
		}
	},1)
})(ve);

/**
 * 系统插件
 */
(function(v) {
	var sys = [
		["cut", "Cut"],
		["copy", "Copy"],
		["paste", "Paste"],
		["bold", "Bold","加粗",["ctrl","b"]],
		["forecolor", "fgcolor"],
		["italic", "Italic","斜体",["ctrl","i"]],
		["underline", "Underline","下划线",["ctrl","u"]],
		["strikethrough", "<s>","删除线",["ctrl","shift","s"]],
		["createLink", "<a>"],
		["inserthorizontalrule", "<hr />"],
		["undo", "Undo"],
		["redo", "Redo"],
		["backcolor", "bgcolor"],
		["hilitecolor", "hilite"],
		["increasefontsize", "A+"],
		["decreasefontsize", "A-"],
		["fontname", "font-family"],
		["FontSize", "font-size"],
		["subscript", "<sub>"],
		["superscript", "<sup>"],
		["justifyleft", "left","居左",["ctrl",'alt',"l"]],
		["justifyright", "right","居右",["ctrl",'alt',"r"]],
		["justifycenter", "center","居中",["ctrl",'alt',"c"]],
		["justifyfull", "justify"],
		["insertorderedlist", "<ol>"],
		["insertunorderedlist", "<ul>"],
		["insertparagraph", "<p>"],
		["inserthtml", "html"],
		["formatblock", "formatblock"],
		["heading", "heading"],
		["indent", "indent"],
		["outdent", "outdent"],
		["contentreadonly", "readonly"],
		["delete", "del"],
		["unlink", "unlink"]
	];
	for(var i = 0,arr;arr = sys[i];i++){
		v.$addPlugin({command:arr[0],value:arr[1],description:arr[2],shortcut:arr[3]});
	}
})(ve);
/**
 * 组件
 */
;(function(v){
	var marks = {keyup:[],keydown:[]};
	var onInit = [];
	var fn = function(evt){
		var that = this;
		var range = that.getRange();

		if(!range.collapsed){
			return;
		}

		var ancestor = range.commonAncestorContainer;

		if(!ancestor || ancestor.nodeType!=3){
			return
		}

		var text = ancestor.data;
		
		for(var i=0,mark;mark = marks[evt.type][i];i++){
			var regs = v.util.isArray(mark.reg)?mark.reg:[mark.reg];
			for(var i=0,item;item = regs[i];i++){
				if(text.match(item)){
					 mark.callback.call(that,{textNode:ancestor,event:evt,range:range});
					 return
				}
			}

		}
	};
	v.$extend({
		//初始化组件
		_initMark:function(){
			this.addEvtListener('keyup',fn)
			this.addEvtListener('keydown',fn)

			for(var i=0,init;init = onInit[i];i++){
				init.call(this);
			}
		},
		/**
		 * 新增一个组件
		 * @method $addMark
		 * @param  {RegExp} reg 正则
		 * @param  {Function} hdl 执行句柄
		 * @param  {String} 事件类型
		 * @example
		 ve.$addMark(
			//
		 );
		 * @for ve
		 */
		$addMark:function(mk){
			var mark = {
				reg:mk.reg,
				callback:mk.callback,
				type:mk.type || 'keyup',
				onInit:mk.onInit
			}

			if(mark.onInit){
				onInit.push(mark.onInit);
			}

			marks[mark.type].push(mark);		
		}
	})
})(ve);
;(function(v){
	var userAgent = navigator.userAgent;
	v.ua = function(){
		var isie = /msie/i.test(userAgent);
		var isie6 = /msie\s+?6/i.test(userAgent);
		var isFirefox = /firefox/i.test(userAgent);
		return {
			isie:isie,
			isie6:isie6,
			isFirefox: isFirefox
		}
	}();
})(ve);

;(function(lib){
	
	var EMPTY_FN = function(){};

	var requestQueue = [];//等待上传的队列

	var param = [];//其他参数

	var url;

	var fname;

	var serial;

	var progressHdl;

	var errorHdl;

	var completeHdl;

	var send = function(file){
		
		var form =  new FormData();

		param.forEach(function(item){
			form.append(item.name, item.value);
		});

		form.append(fname, file);


		var xhr = new XMLHttpRequest();

		xhr.upload.addEventListener("progress", function(evt){
			progressHdl(file.name, evt.loaded,evt.total);
		}, false);

		
        xhr.onload = function () {
           completeHdl(xhr.responseText);

        };
   

		xhr.open("post", url, true);
		xhr.send(form);

	}

	var Upload = function(option){
		
		//初始化配置
		url = option.url || "";
		fname = option.name || "file";
		serial =  option.serial || false;
		progressHdl = option.onprogress || EMPTY_FN;
		errorHdl = option.onerror || EMPTY_FN;
		completeHdl = option.oncomplete || EMPTY_FN;

	}
	Upload.prototype = {
		
		addFile:function(file){
			requestQueue.push(file);
		},

		addFiles:function(files){
			for(var i=0;i<files.length;i++){
				this.addFile(files[i]);
			}
		},

		addParam:function(name,value){
			param.push({name:name,value:value});
		},

		setSerial:function(){

		},

		send:function(){
			
			while(requestQueue.length){
				send(requestQueue.shift());
			}
		}
	}

	lib.Upload = Upload;
	window.veUpload = Upload;
})(ve.lib);
;(function(util,v){

	var _currentTarget;

	/**
	 * @method isArray
	 */
	util.isArray = function(val){
		return Object.prototype.toString.call(val)==="[object Array]";
	}
	/**
	 * @method isObject
	 */
	util.isObject = function(val){
		return Object.prototype.toString.call(val)==="[object Object]";
	}
	/**
	 * @method isFunction
	 */
	util.isFunction = function(val){
		return Object.prototype.toString.call(val)==="[object Function]";
	}
	/**
	 * @method tmpl
	 */
	util.tmpl = function(){
		var cache = {};
		function _getTmplStr(rawStr, mixinTmpl) {
			if(mixinTmpl) {
				for(var p in mixinTmpl) {
					var r = new RegExp('<%#' + p + '%>', 'g');
					rawStr = rawStr.replace(r, mixinTmpl[p]);
				}
			}
			return rawStr;
		};
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
	}();
	/**
	 * @method addEvt
	 */
	util.addEvt = function(elem,type,fn){
		if(elem.addEventListener){
			elem.addEventListener(type,fn);
		}
		else if(elem.attachEvent){
			elem.attachEvent('on'+type,fn);
		}
	}
	/**
	 * @method getElementByAttribute
	 */
	util.getElementByAttribute = function(target,attr,topElem){

		topElem = topElem || document.body;

		while(target  && target.nodeType == 1){
			var val = target.getAttribute(attr);
			if(val!==null){
				return target;
			}
			if(target == topElem){
				return;
			}
			target = target.parentNode;
		}
	}
	/**
	 * @method bindEvt
	 */
	util.bindEvt = function(topElem,type,dealFnMap,scope){
		util.addEvt(topElem,type,function(event){
			
			var _target = event.target || event.srcElement;
			_currentTarget = _target;

			var _realTarget = util.getElementByAttribute(_target,"_event",this);

			if(!_realTarget){
				return true;
			}

			

			var returnValue = true,_hit = false;

			if(util.isFunction(dealFnMap)){
				returnValue = dealFnMap.call(_realTarget,event,_realTarget,scope);
				_hit = true;
			}
			else {
				var evt = _realTarget.getAttribute("_event");
				if(evt && dealFnMap[evt]){
					returnValue = dealFnMap[evt].call(_realTarget,event,_realTarget,scope);
					_hit = true;
				}	
			}

			if(_hit && !returnValue){
				if(event.preventDefault)
	                event.preventDefault();
	            else
	                event.returnValue = false;
			}

		});
	}
	/**
	 * @method createDiv
	 */
	util.createDiv = function(html,option){
		var div = document.createElement("div");
		div.innerHTML = html;

		if(option.display){
			div.style.display = option.display;
		}

		if(option.position){
			div.style.position = option.position;
		}

		if(option.parent){
			option.parent.appendChild(div);
		}

		return div;
	}
	/**
	 * @method getPostion
	 */
	util.getPostion =function(elem){
		try {
			elem = elem || _currentTarget || document.body;
		    var box =  elem.getBoundingClientRect(),rect = {};
		    //ie8- 没有width和height
		    if(box.width){
		    	rect = box;
		    	box.width = box.right-box.left;
		    	box.height = box.bottom - box.top;
		    }
		    else{
		    	rect = {
		    		top:box.top,
		    		right:box.right,
		    		bottom:box.bottom,
		    		left:box.left,
		    		width:box.right-box.left,
		    		height:box.bottom - box.top
		    	}
		    }
			return rect;
		} catch (e) {return {}} 
	}
	/**
	 * @method insertStyleSheet
	 */
	util.insertStyleSheet = function(rules, id){
		if (!document.getElementById(id)) {
			var node=document.createElement("style");
			node.type='text/css';
			node.id = id;
			document.getElementsByTagName("head")[0].appendChild(node);
			if(rules){
				if(node.styleSheet){
					node.styleSheet.cssText=rules;
				}else{
					node.appendChild(document.createTextNode(rules));}
				}
			return node.sheet||node;
		}
	}
	/**
	 * @method lazy
	 */
	util.lazy = function(hdl,time){
		return setTimeout(hdl,time);
	}
	/**
	 * @method clear
	 */
	util.clear = function(tm){
		clearTimeout(tm);
	}
	/**
	 * @method sptTransition
	 */
	util.sptTransition = function(){
		var dummyStyle = document.documentElement.style;
		var vendors = 't,webkitT,MozT,msT,OT'.split(','),
			t,
			i = 0,
			l = vendors.length;

		for ( ; i < l; i++ ) {
			t = vendors[i] + 'ransform';
			if ( t in dummyStyle ) {
				return vendors[i].substr(0, vendors[i].length - 1);
			}
		}

		return false;
	}
	/**
	 * @method hide
	 */
	util.hide = function(elem,time,fn){
		if (!elem) {
			return
		}

		fn = fn || function(){};
		
		//显示是否淡出
		if(this.sptTransition() && time){
			elem.style.opacity = 0;
			elem.tm =  this.lazy(function(){
				elem.style.display = 'none';
			},time);
		}
		else{
			elem.style.display = 'none';
		}

		//是否延迟执行函数
		if(time){
			this.lazy(function(){
				fn();
			},time);
		}
		else{
			fn();
		}
	}
	/**
	 * @method writeFrame
	 */
	util.writeFrame = function(id,parent,dout,callback,style){
		var ua = v.ua,doc,frm =v.$(id), win;
		
		if(!frm){
			var frm = document.createElement('iframe');
			frm.setAttribute('frameBorder','0');
			frm.setAttribute('scrolling','no');
			frm.name = id;
			frm.id = id;
			parent.appendChild(frm);
		}

		frm.callback = callback;

		style = style || {};
		for(var p in style){
			frm.style[p] = style[p];
		}

		if (ua.isie) {
		    frm.src = 'javascript:;';
		    //立即创建就访问会出现权限问题
		    setTimeout(function(){
		    	try{
		    		win = window.frames[id] || v.$(id).contentWindow;
					doc = win.contentDocument || win.document;
			    	doc.open();
				    doc.write(dout);
					doc.close();
		    	}
		    	catch(e){

		    	}
		    	
		    },100);
		   
		} else {
			setTimeout(function() {
				frm.src = "javascript:'" + encodeURIComponent(dout) + "'";
			}, 50);
		    
		}
		
	}
	util.text2Html = function(text){
		if(!text){
			return "";
		}
		return text.replace(/\r\n|\r|\n/g,"<br />").replace(/\t/g,"&nbsp;&nbsp;&nbsp;&nbsp;").replace(/\s/,"&nbsp;");
	}
	util.clone = function(obj){
		var copyObj = {};
		for(var p in obj){
			copyObj[p] = obj[p];
		}
		return copyObj;
	}
	util.filterHtml = function(html){
		html = html || "";

		html = html.replace(/<(script|iframe|head|style)[^>]*>[\s\S]*?<\/(script|iframe|head|style)>/ig,'');

		html = html.replace(/(<\w+)([^>]*>)/ig,function(match,s1,s2){
			//xss
			s2 = s2.replace(/(\W)(on\w+\s*=)/gi,"$1_$2").replace(/javascript\:/ig,"#");
			//position
			s2 = s2.replace(/(\W)((?:position|float)\s*\:)/gi,"$1_$2");
			if(/img/i.test(s1)){	
				s2 = s2.replace(/(height)\s*([:=])/ig,"_$1$2");
				if(!/_event/i.test(match)){
						s1+=' _event="ve-img"';
				}
			}
			else if(/<a/i.test(s1)){
				if(!/data-event/i.test(match)){
						s1+=' _event="ve-link"';
				}
			}
			return s1+s2;
			
		});
		
		var ret = v.util.addFindLink(html)

		if(ret){
			html = ret;
		}
		return html;
	}
	util.addFindLink = function(sHtml){
		var wwwReg = /(\W|^)(www(?:\.\w+){2,})(\W|$)/ig
		var linkReg = /https?:\/\/(?:[\w\-]+\.)+\w+(?:\/[^'"\s\b<>]*)?/ig;
		var html =sHtml,indexId = 0,pool = {};
		var filter = function(text,ignore){
			return text.replace(linkReg,function(m){
				indexId ++ ;
				pool[indexId] = ignore?m:'<a href="'+m+'"  _event="ve-link">'+m+'</a>';
				return '<'+indexId+'>'
			}).replace(wwwReg,function(m,b,l,e){
				indexId ++ ;
				pool[indexId] = ignore?m:(b+'<a href="http://'+l+'" _event="ve-link">'+l+'</a>'+e);
				return '<'+indexId+'>'
			})
		}
		//过滤掉<!--no url start--><!--no url end-->中的内容
		var noUrlSection = [],i=0;
		html = html.replace(/<\!\-\-no url start\-\->[\s\S]*<\!\-\-no url end\-\->/gi,function($$){
			noUrlSection.push($$);
			return "%"+(i++)+"%";
		});

		html = html.replace(/<a[\s\S]+?<\/a>/ig,function(m){
			return filter(m,true)
		});

		html = html.replace(/<\w+[^>]+>/ig,function(m){
			return filter(m,true);
		});

		if(linkReg.test(html) || wwwReg.test(html)){
			
			html = filter(html).replace(/<(\d+)>/g,function(m,id){
				return pool[id];
			});
			//如果有url，才替换回来，否则原内容无需改变
			//替换回滤掉<!--no url start--><!--no url end-->中的内容
			if(noUrlSection.length){
				html = html.replace(/%(\d+)%/gi,function(m,id){
					return noUrlSection[id];
				});
			}

			return html;
		}
	};

	 var RegExps =  {

		escHTML: {
			re_amp: /&/g,
			re_lt : /</g,
			re_gt : />/g,
			re_apos : /\x27/g,
			re_quot : /\x22/g
		},
		
		restXHTML: {
			re_amp: /&amp;/g,
			re_lt: /&lt;/g,
			re_gt: /&gt;/g,
			re_apos: /&(?:apos|#0?39);/g,
			re_quot: /&quot;/g
		}
	}

	util.restHTML =  function(str){
		var t = RegExps.restXHTML;
		return util.listReplace((str + ""), {
			/*
			 * '&' must be
			 * escape last
			 */
			'<': t.re_lt,
			'>': t.re_gt,
			'\x27': t.re_apos,
			'\x22': t.re_quot,
			'&': t.re_amp
		});
	};

	util.escHTML =  function(str){
		var t = RegExps.escHTML;
		return util.listReplace((str + ""), {
		/*
		 * '&' must be
		 * escape first
		 */
			'&amp;' : t.re_amp,
			'&lt;' : t.re_lt,
			'&gt;' : t.re_gt,
			'&#039;' : t.re_apos,
			'&quot;' : t.re_quot
		});
	};

	util.commonReplace = function(s, p, r) {
		return s.replace(p, r);
	};

	util.listReplace = function(s, l) {
		if (util.isObject(l)) {
			for (var i in l) {
				s = util.commonReplace(s, l[i], i);
			}
			return s;
		} else {
			return s+'';
		}
	};

	util.getClass = function(cls,tag,container) {
		container = container || document;
		var nodes = [];
		if (document.querySelectorAll) {
			nodes = container.querySelectorAll('.'+cls);
		} else {
			var tags = container.getElementsByTagName(tag);
			for(var i=0,el; el = tags[i]; i++) {
		        var classes = el.className.split(" ");
		        for(var j = 0; j < classes.length; j++) {
		            if(classes[j] === cls) {
		                nodes.push(el);
		                break;
		            }
		        }
		    }
		}
		return nodes;
	};

})(ve.util,ve);
//cancel
;(function(v){
	v.$addPlugin({
		command:'cancel',
		execCommand:function(){
			this.displayPanel();
		}
	});
})(ve);

//color
;(function(v){
	var colors = ["#ffffff","#000000","#eeece1","#1f497d","#4f81bd","#c0504d","#9bbb59","#8064a2","#4bacc6","#f79646","#ffff00","#f2f2f2","#7f7f7f","#ddd9c3","#c6d9f0","#dbe5f1","#f2dcdb","#ebf1dd","#e5e0ec","#dbeef3","#fdeada","#fff2ca","#d8d8d8","#595959","#c4bd97","#8db3e2","#b8cce4","#e5b9b7","#d7e3bc","#ccc1d9","#b7dde8","#fbd5b5","#ffe694","#bfbfbf","#3f3f3f","#938953","#548dd4","#95b3d7","#d99694","#c3d69b","#b2a2c7","#b7dde8","#fac08f","#f2c314","#a5a5a5","#262626","#494429","#17365d","#366092","#953734","#76923c","#5f497a","#92cddc","#e36c09","#c09100","#7f7f7f","#0c0c0c","#1d1b10","#0f243e","#244061","#632423","#4f6128","#3f3151","#31859b","#974806","#7f6000"];
	var panelTpl = '<div  class="ve-panel ve-color"  unselectable="on"><% for(var i=0,item;item = colors[i];i++) { %><a href="javascript:;" value="<%=item%>" _event="ve-<%=command%>" style="background-color:<%=item%>;"></a><% } %></div>';
	v.$addPlugin({
		command:'forecolor',
		panel:v.util.tmpl(panelTpl,{colors:colors,command:'forecolor'}),
		description:'字体颜色',
		shortcut:['ctrl','shift','f'],
		value:'#c0504d'
	});

	v.$addPlugin({
		command:'backcolor',
		panel:v.util.tmpl(panelTpl,{colors:colors,command:'backcolor'}),
		description:'背景颜色',
		shortcut:['ctrl','shift','b'],
		value:'#ffff00'
	});

	
	
})(ve);


//cancel
;(function(v){
	var fontsizes = [
		{value:1,size:'10px',text:'1(10px)'},
		{value:2,size:'12px',text:'2(12px)'},
		{value:3,size:'14px',text:'3(14px)'},
		{value:4,size:'16px',text:'4(16px)'},
		{value:5,size:'18px',text:'5(18px)'},
		{value:6,size:'24px',text:'6(24px)'},
		{value:7,size:'36px',text:'7(36px)'}
	];

	v.$addPlugin({
		command:'FontSize',
		panel:v.util.tmpl('<div  class="ve-panel ve-fontsize" unselectable="on"><% for(var i=0,item;item = fontsizes[i];i++) { %><a href="javascript:;"  _event="ve-FontSize" value="<%=item.value%>" style="font-size:<%=item.size%>;"><%=item.text%></a><% } %></div>',{fontsizes:fontsizes}),
		description:'字号',
		shortcut:['ctrl','alt','f'],
		value:4
	});
})(ve);

;(function(v){
	var manager = require('manager');
	var util = require('util');
	
	v.$addPlugin({
		command:'image',
		panel:v.util.tmpl('<div  class="ve-panel ve-uploadimg" style="background-color:#ffffff"><div></div></div>',{}),
		onAfterDialog: function (panel, callback) {
			var that = this;
			var frame = v.util.writeFrame(
				'v_img_upload',
				panel.firstChild,
				upfile.form(),
				function (data) {
					if(data.url){
						var src = data.url;

						that.execCommand("insertimage",src);

						that.displayStatusBar();
					}
					else{
						that.displayStatusBar(data.msg || "上传出错！");
					}
					that.displayPanel();
				}
			)
		}
		// onInit:function(pannel){
		// 	var that = this;
		// 	setTimeout(function () {
		// 		upfile.bind($(that.fixedToolbarWrapperEl).find('a[command="image"]'), {
		// 			callback: function (data) {
		// 				if(data.url){
		// 					var src = data.url;

		// 					that.execCommand("insertimage",src);

		// 					that.displayStatusBar();
		// 				}
		// 				else{
		// 					that.displayStatusBar(data.msg || "上传出错！");
		// 				}
		// 				that.displayPanel();
		// 			}
		// 		});
		// 	},100);
		// },

		// execCommand: function () {
		// 	return true;
		// }
	});
	v.$addPlugin({
		command:"insertimage",
		execCommand:function(src,callback){
			var img = document.createElement('img');
			img.src = src;
			img.setAttribute("_event","ve-img");
			img.style.maxWidth = '100%';
			this.insertNode(img);
			var br = document.createElement('br');
			this.insertNode(br);
		}
	})
})(ve);

;(function(v){
	v.$addPlugin({
		command:'createLink',
		description:"添加链接",
		panel:v.util.tmpl('<div  class="ve-panel ve-createLink"></div>',{}),
		onAfterDialog:function(panel){
			var that = this;
			var href = 'http://'
			var frame = v.util.writeFrame(
				"v_add_link",
				panel.firstChild,
				v.util.tmpl('    <html>        <head>            <meta http-equiv="Content-type" content="text/html; charset=utf-8"/>            <style>                body{                    padding: 0px;                    margin: 0px;                    font-size: 14px;                }                input{                   width: 207px;                    height: 27px;                    outline: none;                    background-color: #F9F9F9;                    color: #999D9E;                    border: 1px solid #DADADA;                    font-family: inherit;                    font-size: inherit;                    font-weight: inherit;                    letter-spacing: normal;                    word-spacing: normal;                    text-transform: none;                    text-indent: 0px;                    text-shadow: none;                    display: inline-block;                    text-align: start;                }                input, .btn_add {                    margin-right: 10px;                }                .btn{                    display: inline-block;                    height: 26px;                    line-height: 26px;                    width: 51px;                    text-align: center;                }                .btn_1{                    color: #3D4958;                    border-radius: 3px;                    background-color: #FFF;                    border: solid 1px #CBCBCB;                    background-image: -moz-linear-gradient(bottom, rgba(0,0,0,.02), rgba(255,255,255,.02) 46%);                    <% if (!/firefox/i.test(navigator.userAgent)) { %>                     background-image: -webkit-linear-gradient(bottom, rgba(0, 0, 0, 0.02), rgba(255, 255, 255, 0.02) 46%);                    background-image: -o-linear-gradient(bottom, rgba(0,0,0,.02), rgba(255,255,255,.02) 46%);                    background-image: -ms-linear-gradient(bottom, rgba(0,0,0,.02), rgba(255,255,255,.02) 46%);                    background-image: linear-gradient(to top, rgba(0, 0, 0, 0.02), rgba(255, 255, 255, 0.02) 46%);                    <% } %>                }                a{                    text-decoration: none;                    cursor: pointer;                }            </style>        </head>        <script type="text/javascript">            <% if(domain){ %>            document.domain = "<%=domain%>";            <% } %>            function addLink(){                frameElement.callback(document.getElementById("link").value);            }            function removeLink(){                frameElement.callback();            }        </script>        <body>            <input id="link" value="<%=href%>"/>            <a onclick="addLink()" class="btn btn_1 btn_add">添加</a>            <a onclick="removeLink()" class="btn btn_1">删除</a>        </body>    </html>',{domain:document.domain,href:href}),
				function(link){
					
					if(link){
						that.execCommand('createLink',link,{from:'dialog'});	
					}
					else{
						that.execCommand('unlink','unlink',{from:'dialog'});	
					}
				},
				{height:"30px",width:"360px"}
			);
		}
	});
})(ve);
//tab
;(function(v){

	v.$addPlugin({
		onInit:function(){
			var that = this;
			this.addEvtListener("keydown",function(evt){
				//接管tab
				if(evt.keyCode == 9){
					var span = document.createElement("span");
					span.id="content_tab";
					span.innerHTML = "&nbsp;&nbsp;&nbsp;&nbsp;";
					span["class"] = "content_tab";
					this.insertNode(span);
					this.setFocusAt($("content_tab"));
					$("content_tab").removeAttribute("id");
					return true;
				}
				//退格
				else if(evt.keyCode == 8){
					//暂不支持
				}
			});
		}
	});
})(ve);
//cancel
;(function(v){
	var wwwReg = /(\W|^)(www(?:\.\w+){2,})(\W|$)/g
	var linkReg = /https?:\/\/(?:[\w\-]+\.)+\w+(?:\/[^'"\s\b<>]*)?/g;
	v.$addMark({
		reg:[linkReg,wwwReg],
		callback:function(option){
			var keyCode = option.event.keyCode;
			if(keyCode == 32 || keyCode == 13){
				
				this.saveFocus();
				var html = v.util.addFindLink(this.getContent())
				if(html){
					this.setContent(html,false,true);
					this.setFocusAt();
				}
			}
		},
		type:'keydown',
		onInit:function(){
			v.util.bindEvt(this.editorElement,"click",function(evt,target){
				if(/a/i.test(target.nodeName) && /^(https?|ftp)/i.test(target.href)){
					if(/#inner/i.test(target.href)){
						return;
					}
					window.open(target.href,"");
				}
			})
		}
	});
})(ve);
//cancel
;(function(v){
	var pwdReg = /((?:password|密码)[\s:：])(.+?)(\s|&nbsp;)/;
	v.$addMark(
		{
			reg:pwdReg,
			callback:function(option){
				var keyCode = option.event.keyCode;
				if(keyCode == 32 || keyCode == 13){
					
					//保存光标，后续innerHTML替换操作会丢失光标
					this.saveFocus();
					var node = option.textNode.parentNode;
					var html = node.innerHTML,indexId = 0,pool = {};

					html = html.replace(/<mm:password.+?<\/mm:password>/ig,function(m){
						indexId ++ ;
						pool[indexId] = m;
						return '<'+indexId+'>'
					})
					if(!pwdReg.test(html)){
						return;
					}

					html = html.replace(pwdReg,function(match,pre,pwd,nbsp){
						return '<mm:password class="ve-password" title="'+pwd+'">'+pre+(new Array(pwd.length+1).join('*'))+'</mm:password>'+nbsp;
					}).replace(/<(\d+)>/g,function(m,id){
						return pool[id];
					})

					node.innerHTML = html;
					//恢复光标位置
					this.setFocusAt();
				}
			}
		});
})(ve);
	module.exports = ve;
});