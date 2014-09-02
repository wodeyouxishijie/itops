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
