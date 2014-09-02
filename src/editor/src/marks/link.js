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