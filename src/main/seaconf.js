seajs.config({
    base: '/dest/',
//	            map: [['http://qzs.qq.com/qcloud/app/web/dest/csspath/', 
//	                'http://qzonestyle.gtimg.cn/open_proj/proj_qcloud_v2/css/light/']
//	            ],
    alias: {
        '$': 'lib/jquery-1.10.2',
        'util': 'lib/util',
        'app_util': 'main/app_util',
        'net': 'lib/net',
        'event': 'lib/event',
        'simulator':'widget/simulator/simulator',
        'config': 'config/config',
        'router': 'main/router',
        'pagemanage': 'main/pagemanage',
        'manager': 'main/manager',
        'wxManager': 'app/weixin/config/manager',
        'startup': 'main/startup',
        'dialog': 'widget/dialog/dialog',
        'login': 'widget/login/login',
        'bdWexin': 'widget/bind_weixin/bind_weixin',
        'addPanel': 'widget/add_panel/add_panel',
        'comdata': 'main/comdata',
        'editor': 'editor/ve',
        'upfile': 'widget/upfile/upfile'
    }
});