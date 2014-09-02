
;(function(v){
	v.$addPlugin({
		command:'createLink',
		description:"添加链接",
		panel:v.util.tmpl(QNOTE.TPL.CREATELINK,{}),
		onAfterDialog:function(panel){
			var that = this;
			var href = 'http://'
			var frame = v.util.writeFrame(
				"v_add_link",
				panel.firstChild,
				v.util.tmpl(QNOTE.TPL.CL_IFRAME,{domain:document.domain,href:href}),
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