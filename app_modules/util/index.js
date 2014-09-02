module.exports = {
	getCurrentTime: function () {
		var date = new Date();
            // 2014-03-26 00:40:30 
		return date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate() + ' ' + date.getHours() + ':' + date.getMinutes() + ':' + date.getSeconds();
	},

	upBase64ToFile: function (note, callback) {
		var base64Data, filename;
		if (!note) {
			return note;
		}
		var re = /src="(data\:image[\s\S]*?)"/gi, result;
		note = note.replace(re, function ($0, $1) {
			var extname;
			base64Data = $1.replace(/^data:([^;]*);base64,/,function ($$0, $$1) {
				extname = $$1.split('/')[1];
				return "";
			});;
			
			filename = ['pic', new Date().getTime(), Math.round(Math.random() * 1000000)].join('') + '.' + extname;
			
			return 'src="' + '/upfiles/' + filename + '"';
		});

		if (base64Data) {
			require("fs").writeFile('./upfiles/' + filename, base64Data, 'base64', function(err) {
				if (err) {
					callback (err);
				}
				else {
					callback (null, note);
				}
			});
		}
		else {
			callback (null, note);
		}
	},

	formatDate: function (d, format) {
		if (!d instanceof Date) {
			d = new Date(d);
		}
		var o = { 
			"M+" : d.getMonth()+1, //month 
			"d+" : d.getDate(), //day 
			"h+" : d.getHours(), //hour 
			"m+" : d.getMinutes(), //minute 
			"s+" : d.getSeconds(), //second 
			"q+" : Math.floor((d.getMonth()+3)/3), //quarter 
			"S" : d.getMilliseconds() //millisecond 
		} 

		if(/(y+)/.test(format)) { 
			format = format.replace(RegExp.$1, (d.getFullYear()+"").substr(4 - RegExp.$1.length)); 
		} 

		for(var k in o) { 
			if(new RegExp("("+ k +")").test(format)) { 
				format = format.replace(RegExp.$1, RegExp.$1.length==1 ? o[k] : ("00"+ o[k]).substr((""+ o[k]).length)); 
			} 
		} 
		return format;  
	}
}