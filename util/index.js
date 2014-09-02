var UUID = require('./uuid');
module.exports = {
	getCurrentTime: function () {
		var date = new Date();
            // 2014-03-26 00:40:30 
		return date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate() + ' ' + date.getHours() + ':' + date.getMinutes() + ':' + date.getSeconds();
	},
	genUid: function () {
		var n = 10, ar = [];
		return Math.floor(Math.random() * Math.random() * 1000 ) * new Date();
	}
}