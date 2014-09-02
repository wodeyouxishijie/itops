/**
 * 选区
 */
;(function(v){

	var Range = function(range){
			this.ieRange = range;
			this.collapsed=true;//*
			this.commonAncestorContainer=range.parentElement?range.parentElement():null;//*
			this.endContainer=null;
			this.endOffset=0;
			this.startContainer=null;
			this.startOffset=0;
	}

	Range.prototype = {
		cloneContents:function(){
			return this.ieRange.duplicate().text;
		},
		cloneRange:function(){},
		collapse:function(){
			this.ieRange.collapse();
		},
		compareBoundaryPoints:function(){},
		compareNode:function(){},
		comparePoint:function(){},
		createContextualFragment:function(){},
		deleteContents:function(){
			this.ieRange.execCommand("delete");
		},
		detach:function(){},
		expand:function(){},
		extractContents:function(){},
		getBoundingClientRect:function(){
			var box =  this.ieRange.getBoundingClientRect(),rect = {};
		    //ie8- 没有width和height
		    if(box.width){
		    	rect = box;
		    	box.width = box.right-box.left;
		    	box.height = box.bottom - box.top;
		    }
		    else{
		    	rect = {
		    		top:box.top,
		    		right:box.right,
		    		bottom:box.bottom,
		    		left:box.left,
		    		width:box.right-box.left,
		    		height:box.bottom - box.top
		    	}
		    }
			return rect; 
		},
		getClientRects:function(){},
		insertNode:function(node){
			var div = document.createElement("div")
			div.appendChild(node);
			var html = div.innerHTML;

			if(/img/i.test(node.nodeName)){
				html+="<span></span>"
			}
			this.ieRange.pasteHTML(html);
		},
		intersectsNode:function(){},
		isPointInRange:function(){},
		selectNode:function(){},
		selectNodeContents:function(){},
		setEnd:function(){},
		setEndAfter:function(){},
		setEndBefore:function(){},
		setStart:function(){},
		setStartAfter:function(){},
		setStartBefore:function(){},
		surroundContents:function(){},
		toString:function(){
			return this.ieRange.text;
		}
	}

	var elements = [];
	var history = [];
	var focusId = null;

	v.$extend({
		/**
		 * 当前选区
		 * @property range
		 * @type {range}
		 * @for ve.Create
		 */
		range:null,
		/**
		 * 判断当前是否存在选区
		 * @method hasRange
		 * @return {Boolean} 
		 * @for ve.Create
		 */
		hasRange:function(){
			this.saveRange();
			var text = window.getSelection?window.getSelection().toString():document.selection.createRange().text;
			if(text){
				return true;
			}
		},
		/**
		 * 判断当前选区是新建的还是上次存在的
		 * @method isNewRange
		 * @return {Boolean} 
		 * @for ve.Create
		 */
		isNewRange:function(){
			if(history.length<2){
				return true;
			}
			else{
				return history[0].toString()!==history[1].toString();
			}
			
		},
		/**
		 * 获取当前选区
		 * @method getRange
		 * @for ve.Create
		 */
		getRange:function(){
			var selection,range;
			if(window.getSelection){
				selection = window.getSelection();
				if(selection.rangeCount){
					range = selection.getRangeAt(0);
				}
				else{
					range = this.getLastRange() || {};
				}
				
			}
			else{
				range = new Range(document.selection.createRange());
			}
			return range;
		},
		/**
		 * 获取上次选区
		 * @method getLastRange
		 * @return {Range} 
		 * @for ve.Create
		 */
		getLastRange:function(){
			return history[0];
		},
		/**
		 * 选中上次选区 selectRange
		 * @method
		 * @for ve.Create
		 */
		selectRange:function(range){
			range = range || history[0];
			if(!range){
				return;
			}
			if(window.getSelection){
				var selection = window.getSelection();
				selection.addRange(range);
			}
			else{
				history[0].ieRange.select();
			}
			
		},
		selectNode:function(elem){
			if(window.getSelection){
				var range = document.createRange();
				range.selectNode(elem);
				var selection = window.getSelection();
				selection.removeAllRanges();
				selection.addRange(range);
			}
		},
		/**
		 * 设置光标
		 * @method setFocusAt
		 * @param  {htmlElement} elem 被定位的元素
		 * @for ve.Create
		 */
		setFocusAt:function(elem,collapse){
			var elem = elem;

			if(!elem || !elem.parentNode){
				elem = v.$(focusId)
			}

			if(!elem){
				return;
			}
			var range,selection;

			if (collapse == undefined) {
				if(elem.innerHTML){
					var isEmpty = (elem.innerHTML.replace(/<(?!img|embed).*?>/ig, '').replace(/&nbsp;/ig, ' ').replace(/\r\n|\n|\r/, '') == '');
					collapse = isEmpty ? true : false;
				}else{
					collapse = false;
				}
			}
			
			if(document.createRange)//Firefox, Chrome, Opera, Safari, IE 9+
			{	
				if(/img/i.test(elem.tagName)){
					var selection = window.getSelection();
					if(selection){
						//定位光标
						var nodes = Array.prototype.slice.call(this.editorElement.childNodes,0);
						var index = nodes.indexOf(elem);
						selection.collapse(this.editorElement,index+1);
					}
				}
				else{
					range = document.createRange();//Create a range (a range is a like the selection but invisible)
					range.selectNodeContents(elem);//Select the entire contents of the element with the range
					range.collapse(collapse);//collapse the range to the end point. false means collapse to end rather than the start
					selection = window.getSelection();//get the selection object (allows you to change selection)
					selection.removeAllRanges();//remove any selections already made
					selection.addRange(range);//make the range you have just created the visible selection
				}
				if(elem.focus)
					elem.focus();

			}
			else if(document.selection)//IE 8 and lower
			{ 
				try {
					range = document.body.createTextRange();//Create a range (a range is a like the selection but invisible)
					range.moveToElementText(elem);//Select the entire contents of the element with the range
					range.collapse(collapse);//collapse the range to the end point. false means collapse to end rather than the start
					range.select();//Select the range (make it the visible selection
				} catch (e) {}
				elem.focus();
			}
		},
		/**
		 * 保存光标位置信息
		 * @method saveFocus
		 * @for ve.Create
		 */
		saveFocus:function(){
			focusId =  'f_'+new Date().valueOf();

			var span = document.createElement('span');
			span.setAttribute('name','empt');
			span.id = focusId;
		
			var range = this.getRange();

			range.insertNode(span);
			emptElem = span;
		},
		/**
		 * 保存选区
		 * @method saveRange
		 * @for ve.Create
		 */
		saveRange:function(){
			this.range = this.getRange();
			history.unshift(this.range);
		},

		insertNode:function(node){
			if(history[0]){
				if(history[0].commonAncestorContainer && this.editorElement.contains && !v.ua.isie){
					//如果当前选区不在editor范围内
					if(!this.editorElement.contains(history[0].commonAncestorContainer)){
						this.editorElement.appendChild(node);
						return
					}
				}
				history[0].insertNode(node);
			}
			else{
				this.editorElement.appendChild(node);
			}
			this.setFocusAt(node,true);
		},
		/**
		 * 清除选区
		 * @method clearRange
		 * @for ve.Create
		 */
		deleteContents:function(){
			this.getRange().deleteContents();
		}
	})
})(ve);