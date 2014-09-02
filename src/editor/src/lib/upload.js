
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