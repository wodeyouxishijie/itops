define('app/startup/common/common', function (require, exports, module) {
    var $ = require('$');
    var login = require('login');
    var event = require('event');
    var util = require('util');
    var manager = require('manager');
    var menu = require('app/menu/menu.js');
    var cacheData;
    var op = 0;
    var type;
    var mod;
    var target;
    var slidewrap;
    var container;
    var wrap;
    var menuinited;
    
    var name_map = {
        '1': '硬件故障紧急程度',
        '2': '硬件故障单状态',
        '3': '故障类型',
        '4': '业务知识库类别',
        '5': '岗位',
        '6': '个人工作任务类别',
        '7': '值班休假类别'
    };
    function init() {
        addEvents();
    }
    
    function addEvents() {
        container.find('a[cmd="addNew"]').click(function () {
            op = 0;
            container.find('div[cmd="new_con"]').toggleClass('hide');
            return false;
        }); 
        
        var saveBtn = container.find('button[cmd="save"]');
        var delBtn = container.find('button[cmd="del_row"]');
        saveBtn.click(function () {
            this.disabled = true;
            var btn = this;
            $(this).html('...').addClass('disabled');
            manager.setKeyValue({
                _key:'',
                _value: container.find('input[cmd="value"]').val(),
                type: type,
                typename : name_map[type] || '未知类别'
            }, function (data) {
                $(btn).html('确定').removeClass('disabled');
                btn.disabled = false;
                container.find('div[cmd="new_con"]').addClass('hide');
                wrap.render(mod, target, type);
            });
            return false; 
        });
        delBtn.click (function () {
            this.disabled = true;
            var btn = this;
            $(this).html('...').addClass('disabled');
            manager.delKeyValue({
                id: this.getAttribute('keyid')
            }, function (data) {
                $(btn).html('确定').removeClass('disabled');
                btn.disabled = false;
                container.find('div[cmd="new_con"]').addClass('hide');
                wrap.render(mod, target, type);
            });
            return false; 
        });
        container.find('.name_relative').mouseover(function ( ) {
            $(this).find('.edit_panel').removeClass('hide');
        })
        .mouseout(function ( ) {
            $(this).find('.edit_panel').addClass('hide');
        });
        container.find('.name_relative button[cmd="save_row"]').click(function () {
            this.disabled = true;
            var btn = this;
            $(this).html('...').addClass('disabled');
            var id = this.getAttribute('keyid');
            var _value = container.find('input[cmd="value_' + id + '"]').val(); 
            manager.setKeyValue({
                _key:'',
                _value: _value,
                type: type,
                typename : name_map[type] || '未知类别',
                id: id
            }, function (data) {
                container.find('span[cmd="txt_' + id + '"]').html(_value);
                $(btn).html('确定').removeClass('disabled');
                btn.disabled = false;
                $(btn).parent().addClass('hide');
            });
            return false; 
        });
    }
    var timeout;
    wrap = {
        render: function (id, _target, _type) {
            mod = id;
            target = _target;
            if (id == 'keyvalue' && _type) {
                type = _type;
                (!menuinited || !id) && (menu.render(target), menuinited = 1);
//                return;
                clearTimeout(timeout);
                timeout = setTimeout(function () {
                    if (!menuinited) {
                        var obj = require('app/' + id + '/' + id);
                        if (!obj) {
                            obj = require('app/' + target + '/' + id + '/' + id);
                        }
                        obj && obj.render(target, id);
                    }
                        
                        
                    container = $('#mainContainer');
                    var param = {type : type};
                    manager.getKeyValue(param, function (data) {
                        cacheData = data;
                        container.html(util.tmpl(<Template.list wrap="'">, {data: cacheData, typename: name_map[type]}));
                        init ();
                    });
                }, 400);
            }
        },
        
        getDataList: function (type, callback) {
            if (typeof callback == 'function') {
                if (cacheData) {
                    callback(cacheData);
                }
                else {
                    manager.getKeyValue({type : type}, function (data) {
                        cacheData = data;
                        callback(cacheData);
                    });
                }
            }
        }
    };
    module.exports = wrap;
});