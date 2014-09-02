;define('config/config', function (require, exports, module) {
    var items = ['menu', 'dept', 'role', 'user', 'keyValue', 'failureReport', 'SoftwareReport', 'Tasking', 'Repository', 'MyTasking', 'ProcessLog', 'leaderTasking', 'Vacation', 'FailureTypeRole', 'softwareTodo', 'score'];
    var all_net_config = {};
    for (var i = 0; i < items.length; i++) {
        var m = items[i].replace(/(^\w)/, function (_0, _1) {return _1.toUpperCase();} );
        all_net_config['get' + m] = {
            method: 'get',
            url: '/json?action=get' + m,
        };
        
        all_net_config['set' + m] = {
            method: 'post',
            url: '/post?action=set' + m,
        };
        
        all_net_config['del' + m] = {
            method: 'post',
            url: '/post?action=del' + m,
        };
    }
    all_net_config.getUserInfo = {
        url: '/json?action=getUserInfo',
        method: 'get'
    };
    all_net_config.setProcessLog = {
        url: '/post?action=setProcessLog',
        method: 'post'
    };
    all_net_config.sendMail = {
        url: '/post?action=sendMail',
        method: 'post'
    };
    all_net_config.getLog = {
        url: '/json?action=getLog',
        method: 'get'
    };
    all_net_config.getNewMyTasking = {
        url: '/json?action=getNewMyTasking',
        method: 'get'
    };

    all_net_config.getEmployee = {
        url: '/json?action=getEmployee',
        method: 'get'
    };

    all_net_config.getEmployeeTask = {
        url: '/json?action=getEmployeeTask',
        method: 'get'
    };
    all_net_config.getReportData = {
        url: '/json?action=getReportData',
        method: 'get'
    };
    var host = 'http://' + location.host + '/cgi';
    
    for (var i  in all_net_config) {
        var cur = all_net_config[i];
        if (cur && cur.url) {
            cur.url = host + cur.url;
        }
    };
    var config = {};
    config.get = function(argv){
	   return all_net_config[argv];
    };
    config.all = all_net_config;
    
    module.exports  = config;
});