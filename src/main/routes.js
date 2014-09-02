
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
