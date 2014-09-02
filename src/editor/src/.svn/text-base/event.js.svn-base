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
				var clipboardData =  evt.clipboardData || window.clipboardData;
				var textData = clipboardData.getData("text");

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