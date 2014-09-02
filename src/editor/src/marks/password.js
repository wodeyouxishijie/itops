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