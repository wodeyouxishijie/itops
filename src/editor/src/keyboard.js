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