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