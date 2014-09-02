/**
 * 对话框
 * @module widget
 * @class dialog
 **/
define('widget/dialog/dialog', function(require, exports, module) {
    var $ = require('$');
    var dialog = {
        el: null,
        contentEl: null,
        mask: null,
        mTipTime: null,
        enableLoadTip: 1,
        /**
         * 创建对话框
         * @method create
         * @param  {String} html   html字符串
         * @param  {Number} width  宽
         * @param  {Number} height 高
         * @param  {Object} option 选参
         */
        create: function (html,width,height,option) {
            option = option || {};
            var _self = this;
            var config = {
                'button': null,
                'title': '',
                'closeIcon': false,
                'mask': true,
                'class': 'mod_popup',
                'isMaskClickHide': 1
            };
            var $body = $('body');

            option = $.extend({}, config, option);

            if(!this.el){
                var dialogWrap = $('<div/>').css({
                    'position': 'absolute',
                    'display': 'none',
                    'zIndex': '999'
                });

                var dialogContent = $('<div/>');
                dialogWrap.append(dialogContent);

                $body.append(dialogWrap);

                this.el = dialogWrap;
                this.contentEl = dialogContent;
            }

            this.el.attr('class', option['class']);
            
            var win = $(window),
                winWidth = win.width(),
                winHeight = win.height();


            //标题
            this.el.find('> .title').remove();
            if (option.title || option.closeIcon) {
                var dialogTitle = $('<div/>').addClass('title');
                if (option.title) {
                    option.closeIcon = 1;
                    dialogTitle.html(option.title);
                }
                if (option.closeIcon) {
                    dialogTitle.append('<a title="关闭" class="close" href="javascript:;"><i class="icon_cancel"></i></a>');
                }
                dialogTitle.off().on('click', '.close', function(){
                  _self.hide();
                });
                this.el.prepend(dialogTitle);

                this.contentEl.addClass('content');
            } else {
                //无标题时, 让样式更干净
                this.contentEl.removeClass('content');
            }

            //内容
            this.contentEl.html(html);

            var ifr = this.el.find("iframe")[0];

            if (ifr) {
                ifr.callback = option.callback||function(){}
            }

            //按钮
            this.el.find('> .bottom').remove();
            if (option.button) {
                var dialogButton = $('<div/>').addClass('bottom');
                for (var key in option.button) {
                    var btn = $('<a/>').addClass('button button_primary').attr('href', 'javascript:;').text(key);
                    var btnFun = option.button[key];
                    (function (_btn, _btnFun) {
                        _btn.on('click', function () {
                            (typeof(_btnFun) == 'function') && _btnFun(_btn, _self.el)
                        });
                    })(btn, btnFun);
                    
                    dialogButton.append(btn).append(' ');
                }
                var cancelbtn = $('<a/>').addClass('button').attr('href', 'javascript:;').text('取消');
                dialogButton.append(cancelbtn);
                cancelbtn.on('click', function(){
                  _self.hide();
                });
                this.el.append(dialogButton);
            }
            
            //位置
            var _top = (option.top || parseInt((winHeight - (height || this.el.height()))/2))+document.body.scrollTop;
            this.el.css({
                'width': width,
                'height': height,
                'left': option.left || parseInt((winWidth - width)/2),
                'top': _top
            });

            //显示
            this.el.show();

            //mask
            if(option.mask){
                if(!this.mask){
                    var dialogMask = $('<div/>').css({
                        'position': 'absolute',
                        'background': '#000',
                        'opacity': 0,
                        'width': '100%',
                        'height': '100%',
                        'left': 0,
                        'top': 0,
                        'zIndex': '900',
                        'transition': 'opacity 0.2s ease',
                        'visibility': 'hidden'
                    });

                    $body.append(dialogMask);
                    

                    this.mask = dialogMask;
                }

                this.mask.css({
                    'visibility': 'visible',
                    'opacity': '0.5'
                });

                this.ieMaskOpacity(true);
                
                if (option.isMaskClickHide == 1) {
                    this.mask.off('click').on('click', function () {
                        _self.hide();
                    });
                }
                else {
                    this.mask.unbind('click');
                }
            }

            if(option.time){
                setTimeout(function(){
                    _self.hide();
                },option.time);
            }

            if(option.onload){
                option.onload.call(this,this.el)
            }

            if (option.owner) {
                this.owner = option.owner;
            } else {
                this.owner = null;
            }

        },
        /**
         * 显示对话框
         * @method show
         */
        show: function () {
            this.el && this.el.show();
        },
        /**
         * 隐藏对话框
         * @method hide
         */
        hide: function () {
            this.el && this.el.hide();
            if(this.mask){
                this.mask.css({
                    'visibility': 'hidden',
                    'opacity': '0'
                });
                this.ieMaskOpacity(false);
            }
            this.owner = null;
            $(document).trigger('dialogHide');
        },
        ieMaskOpacity: function (opacity) {
            if (!$.support['opacity']) {
                opacity = opacity ? '50' : '0';
                this.mask.get(0).style.filter = "alpha(opacity=" +opacity+ ")";
            }
        },

        miniTip: function (str, duration) {
            var _self = this;
            _self.showMiniTip(str);

            var t = setTimeout(function () {
                _self.hideMiniTip(1);
            }, duration || 4000);

            _self.mTipTime = t;
        },

        showMiniTip: function (str) {
            clearTimeout(this.mTipTime);
            this.mTipTime = null;
            
            var flashMsg = $('#flashMsg');
			$('#msgbox').remove();
            if (!flashMsg.length) {
                var msgBox = $('<div/>').addClass('msgbox').attr('id', 'msgbox');
                flashMsg = $('<div/>').addClass('flash-message').attr('id', 'flashMsg');
                msgBox.append(flashMsg);
                msgBox.appendTo('body');
            }
            flashMsg.html(str).fadeIn(500);
        },

        hideMiniTip: function (fromTiming) {
            var _self = this;
            var _hideTip = function () {
                $('#flashMsg').fadeOut(function () {
                    !_self.mTipTime && $(this).html('');
                })
                _self.mTipTime = null;
            }
            if (fromTiming) {
                _hideTip();
            } else {
                //从loading过来场景, 有其他提示存在则不隐藏
                !_self.mTipTime && _hideTip();
            }
        },

        setLoadTip: function (_bool) {
            this.enableLoadTip = _bool;
        },

        getTitleHeight: function () {
            return 55;
        },
        
        getBottomHeight: function () {
            return 60;
        }
    };
    module.exports = dialog;
});
