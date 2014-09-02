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