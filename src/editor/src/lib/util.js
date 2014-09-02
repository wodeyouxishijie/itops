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
		    frm.src = 'javascript:(function(){document.open();document.domain="'+document.domain+'";document.close();})()';
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