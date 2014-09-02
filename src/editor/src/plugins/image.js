
;(function(v){
	var manager = require('manager');
	var upFile = require('widget/upfile/upfile');
	var util = require('util');

	v.$addPlugin({
		command:'image',
		panel:v.util.tmpl(QNOTE.TPL.UPLOADIMG,{}),
		onAfterDialog:function(panel,callback){
			var that = this;
			var div = panel.children[0];
			var frame = v.util.writeFrame(
				'v_img_upload',
				div,
				v.util.tmpl(QNOTE.TPL.IMG_IFRAME,{
					domain:document.domain,
					name:'image',
					action:''}
				),
				function(data){
					if(!data){
						that.displayPanel();
						return;
					}
					if (data.cmd && data.cmd == 'initUpload') {
						var _selfFun = arguments.callee;
						upFile.init({
			                renderHTML: function () {
			                    return '<a href="javascript:;" cmd="selfile" class="g_btn g_btn_3">上传图片</a>';
			                },
			                renderTo: data.wrapper,
			                canEdit: 0,
			                onFileSelected: function(base64, blob, file) {
			                	var _this = this;
			                	var filename = new Date().getTime() + '_' + file.name;
			                    manager.getUploadURL({
			                        filenames: filename
			                    }, function(obj) {
			                        if (obj.code == 0) {
			                            var posturl = obj.data[0];
			                            _this.upload(posturl, function () {
			                            	_selfFun({
			                            		'url': util.getCosImgPath(posturl)
			                            	})
		
			                            });
			                        }
			                    });
			                }
			            });
						return;
					}
					if(data.url){
						var src = data.url;

						if(callback){
							callback({src:src});
						}
						else{
							that.execCommand("insertimage",src);
						}

						that.displayStatusBar();
					}
					else{
						if(callback){
							callback({msg:data.msg || "上传出错！"});
						}
						else{
							that.displayStatusBar(data.msg || "上传出错！");
						}
					}
					that.displayPanel();
				},
				{height:"134px",width:"365px"}
			);
		},
		onInit:function(){
			/*var that = this;
			v.util.bindEvt(this.editorElement,'dragenter',function(){});
			v.util.bindEvt(this.editorElement,'dragover',function(){});
			v.util.bindEvt(this.editorElement,"drop",function(evt){
				var files=evt.dataTransfer.files;
				if(files && /image/.test(files[0].type)){
					that.uploadImage(files[0],"http://biji.qq.com/cgi-bin/memo_web_image_upload?type=image&g_tk=",{
						complete:function(data){
							if(!data){
								return;
							}
							if(data.url){
								var src = data.url+"600";
								that.execCommand("insertimage",src);
								that.displayStatusBar();
							}
							else{
								if(/2000[34]/.test(data.ecode)){
									ex.login.show();
								}
							}
							return true;
						}
					});
	        	}
			});*/
		}
	});
	v.$addPlugin({
		command:"insertimage",
		execCommand:function(src,callback){
			var img = document.createElement('img');
			img.src = src;
			img.setAttribute("_event","ve-img");
			img.style.maxWidth = '100%';
			this.insertNode(img);
		}
	})
})(ve);