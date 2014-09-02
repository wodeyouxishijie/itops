/**
 * 工具栏
 */
(function(v){
	
	var toolbarTpl = QNOTE.TPL.TOOL;
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