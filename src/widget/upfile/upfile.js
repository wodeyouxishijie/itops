//use sea
var $ = require('$');
var util = require('util');
var id = 'upfile_' + util.genId();
var formid = 'upform_' + util.genId();
function createForm() {
	return ['<html><head><meta http-equiv="Content-type" content="text/html; charset=utf-8"/></head><body><form action="/upfile" method="post" enctype="multipart/form-data"><input type="file" name="upfile" id="' + id + '"/></form>',
		'<script type="text/javascript">',
		'document.getElementById("' + id + '").onchange = function() {', 
			'if (this.value) {',
				'document.forms[0].submit();',
			'}',
		'};</script></body></html>'].join('');
}

function addEvt (el, opt) {
	el.find('input[type="file"]').change(function () {
		if (this.value) {
			$('#' + formid).get(0).submit();
			$('#tmpifrm').get(0).callback = function () {
				opt.callback.apply(null, arguments);
				$('#tmpifrm').remove();
			}
			this.value = '';
		}		
	});
}

var upfile = {
	bind: function (el, opt) {
		el.append(createForm());
		addEvt(el, opt);
		// el.unbind('click', clickfn(opt)).click(clickfn(opt));
	},

	form: function (callback) {
		return createForm();
	}
};
module.exports = upfile;