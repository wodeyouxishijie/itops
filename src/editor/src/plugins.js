/**
 * 插件
 */
;(function(v){

	var plugins ={}
	if (require) {
		var JQ = require('$');
	}
	v.$extend({
		//初始化
		_initPlugins:function(){
			
			for(var p in plugins){
				plugins[p] = this._buildPlugin(plugins[p]);
			}

			this.plugins = [];

			for(var i = 0,cmd;cmd = this.config.commands[i];i++){
				if (cmd == '|') {
					this.plugins.push('|');
				} else {
					var pl = plugins[cmd];
					pl && this.plugins.push(pl);
				}
			}
		},
		/**
		 * 构建插件
		 * @param  {Object} pl 插件
		 * @return {Object}   格式化后的插件
		 */
		_buildPlugin:function(pl){
			
			var that = this;

			if(pl.panel){
				var panel = this.createPanel(pl.panel, {'cmd': pl.command});
				pl.dialog = function(position){	
					this.displayPanel(panel,{panel:true,position:pl.position || position});
					pl.onAfterDialog && pl.onAfterDialog.call(this,panel,pl.callback);
				}

				var hdl = {};
				hdl["ve-"+pl.command] = function(evt,target){	
					pl.value = target.getAttribute('value');
					that.execCommand(pl.command,pl.value,{from:'dialog'});
				}

				v.util.bindEvt(panel,'click',hdl);				
			}
			if(pl.shortcut){
				this.addShortcut(pl.shortcut,function(){
					that.execCommand(pl.command,pl.value,{from:'shortcut'});
				});
			}
			if(pl.onInit){
				pl.onInit.call(this);
			}
			return pl;
		},
		/**
		 * 静态方法，新增插件
		 * @method $addPlugin
		 * @param  {Object} pl 插件配置
		 * @for ve
		 */
		$addPlugin:function(pl){
			plugins[pl.command] = {
				value:pl.value,
				panel:pl.panel,
				command:pl.command,
				className:pl.className || pl.command,
				dialog:null,
				execCommand:pl.execCommand,
				onAfterDialog:pl.onAfterDialog,
				shortcut:pl.shortcut || '',
				description:pl.description || '',
				position:pl.position,
				onInit:pl.onInit
			}

		},
		/**
		 * 执行插件命令
		 * @method execCommand
		 * @param  {String} cmd   命令串
		 * @param  {String} value 命令值
		 * @param  {String} from  命令执行来源
		 * @for ve.Create
		 */
		execCommand:function(cmd,value,option){
			var _self = v.currentIns || this;
			var pl = plugins[cmd],ret,opt = option || {};
			//
			if(!opt.from && pl.dialog){
				if(opt.callback){
					pl.callback = function(args){
						opt.callback.call(_self,args);
						_self.callback = null
					}
				}
				pl.dialog.call(_self,opt.position);
				return;
			}

			_self.editorElement.focus();

			if(pl.execCommand){
				ret = pl.execCommand.call(_self,value,opt.callback);
			}
			else{
				ret = document.execCommand(cmd,false,value || pl.value);
				_self.displayPanel(null,{delay:300})
			}

			JQ && JQ(document).trigger('editorExecCommand', _self);
			return ret;
		}
	},1)
})(ve);

/**
 * 系统插件
 */
(function(v) {
	var sys = [
		["cut", "Cut"],
		["copy", "Copy"],
		["paste", "Paste"],
		["bold", "Bold","加粗",["ctrl","b"]],
		["forecolor", "fgcolor"],
		["italic", "Italic","斜体",["ctrl","i"]],
		["underline", "Underline","下划线",["ctrl","u"]],
		["strikethrough", "<s>","删除线",["ctrl","shift","s"]],
		["createLink", "<a>"],
		["inserthorizontalrule", "<hr />"],
		["undo", "Undo"],
		["redo", "Redo"],
		["backcolor", "bgcolor"],
		["hilitecolor", "hilite"],
		["increasefontsize", "A+"],
		["decreasefontsize", "A-"],
		["fontname", "font-family"],
		["FontSize", "font-size"],
		["subscript", "<sub>"],
		["superscript", "<sup>"],
		["justifyleft", "left","居左",["ctrl",'alt',"l"]],
		["justifyright", "right","居右",["ctrl",'alt',"r"]],
		["justifycenter", "center","居中",["ctrl",'alt',"c"]],
		["justifyfull", "justify"],
		["insertorderedlist", "<ol>"],
		["insertunorderedlist", "<ul>"],
		["insertparagraph", "<p>"],
		["inserthtml", "html"],
		["formatblock", "formatblock"],
		["heading", "heading"],
		["indent", "indent"],
		["outdent", "outdent"],
		["contentreadonly", "readonly"],
		["delete", "del"],
		["unlink", "unlink"]
	];
	for(var i = 0,arr;arr = sys[i];i++){
		v.$addPlugin({command:arr[0],value:arr[1],description:arr[2],shortcut:arr[3]});
	}
})(ve);