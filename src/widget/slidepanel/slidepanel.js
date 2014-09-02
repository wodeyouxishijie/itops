/**
 * 侧边栏滑动
 * @module widget
 * @class slide
 **/
define('widget/slidepanel/slidepanel', function(require, exports, module) {
    var $ = require('$')
        , util = require('util')
        , defOpt = {
            left: '30%',
            con: ''
        };

    var slide = {}, 
        tpl = <Template.slidepanel>,
        wrapper,
        main,
        mask;
    slide.show = function (opt) {
        opt = $.extend({}, defOpt, opt);
        var $body = $('body');
        var content = util.tmpl(tpl, {'content': opt.con});
        wrapper = $(content);
        main = wrapper.find('.slide-panel');
        mask = wrapper.find('.slide-mask');

        mask.css('opacity', 0.4);
        $body.append(wrapper);

        setTimeout(function() {
            main.css('left', opt.left);
            main.css('width', $(window).width() - parseInt(main.css('left')));
        },50)

        wrapper.find('.mod_edit_left_toggle').click(function() {
            slide.hide();
        });
        mask.click(function() {
            slide.hide();
        });
        return wrapper;
    };
    slide.hide = function () {
        main.css({'left': '100%'});
        if (util.isOldIe()) {
             wrapper.remove();
        } else {
            setTimeout(function() {
                wrapper.remove();
            },300)
        }
    };
    module.exports = slide;
});
