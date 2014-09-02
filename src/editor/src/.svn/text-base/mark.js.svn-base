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