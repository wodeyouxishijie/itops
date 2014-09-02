define('app/userservice/failure_type_role/failure_type_role', function (require, exports, module) {
    var $ = require('$');
    var login = require('login');
    var event = require('event');
    var util = require('util');
    var dialog = require('dialog');
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
        initRoles();
    }
    
    var relationMap = {};
    function initRoles() {
        manager.getRole({}, function (roles) {
            var ar = [];
            for (var i = 0; i < roles.length; i++) {
                ar.push('<label><input type="radio" name="n_{n}" value="' + roles[i].id + '"/>' + roles[i].name + '</label>');
            }
            for (var i = 0; i < cacheData.length; i++) {
                $('.type_' + cacheData[i].id).html(ar.join('').replace(/\{n\}/g, i));
            }
            addEvent();
            manager.getFailureTypeRole({}, function (data) {
                for (var i = 0; i < data.length; i++) {
                    relationMap[data[i].failure_type] = data[i];
                    $('.type_' + data[i].failure_type).find(':radio[value="' + data[i].role_id + '"]').attr('checked', 1);
                }
            });
        });
    }
    
    function addEvent() {
        $.each(cacheData, function (i, n) {
            $('.type_' + n.id).find(':radio').click(function () {
                var roleid = this.value;
                var params = {role_id: roleid, failure_type: n.id};
                if (relationMap[n.id]) {
                    params.id = relationMap[n.id].id;
                }
                manager.setFailureTypeRole(params, function (d) {
                    dialog.miniTip('操作成功!');
                    initRoles();
                });
            });
        })
        
    }
    
    var timeout;
    wrap = {
        render: function (id, _target, _type) {
            container = $('#mainContainer');
            manager.getKeyValue({type : 3}, function (data) {
                cacheData = data;
//                callback(cacheData);
                container.html(util.tmpl(<Template.list wrap="'">, {data: cacheData, typename: '故障类型角色关系'}));
                init();
            });
        }        
    };
    module.exports = wrap;
});