
/*
 * GET home page.
 */

var login = require('../app_modules/login');
var mail = require('../app_modules/mail');
var data_center = require('../app_modules/data_center');
var menu = require('../app_modules/menu');
var dept = require('../app_modules/dept');
var power = require('../app_modules/power');
var role = require('../app_modules/role');
var user = require('../app_modules/user');
var key_value = require('../app_modules/key_value');
var failure_report = require('../app_modules/failure_report');
var software_report = require('../app_modules/software_report');
var tasking = require('../app_modules/tasking');
var repository = require('../app_modules/repository');
var mytasking = require('../app_modules/mytasking');
var leader_tasking = require('../app_modules/leader_tasking');
var vacation = require('../app_modules/vacation');
var process_log = require('../app_modules/process_log');
var failure_type_role = require('../app_modules/failure_type_role');
var score = require('../app_modules/score');
var Controller = require('../controller');
exports.index = function(req, res){
    if (!req.cookies.user || !req.cookies.sign) {
        res.redirect('/login');
//        res.render('login/login.ejs', { });   
    }
    else {
        user.getUser({where: ' a.id=' + req.cookies.uid}, function (err, rst) {
            if (err) {
                console.log('-----');
                console.log(err);
            } 
            else {
                res.render('manager/main.ejs', {
                    uid: req.cookies.uid, 
                    role_id: rst[0].roleid, 
                    dept_id: rst[0].deptid, 
                    job_id: rst[0].jobs,
                    dept_name: rst[0].deptname,
                    clientIP: req.connection.remoteAddress,
                    role_name: rst[0].rolename
                });
            } 
        });
    }
};

var g_UserInfo = {};

exports.selrole = function (req, res) {
    role.queryUserRoles(req.cookies.uid, function (err, list) {
        if (err) {
            console.log(err);
            res.send(404, 'Sorry, we cannot find that!');
        }
        else {
            res.render('selrole',  {role_list: list});
        }
    });
};

exports.setrole = function (req, res) {
    if (req.query.role_id) {
        res.cookie('role_id', req.query.role_id);
//        res.cookie('role_name', req.query.role_id);
        res.redirect('/');
    }
}

exports.login = function (req, res) {
    login.doLogin(req.body.user_id, req.body.pwd, function (err, rst) {
        console.log(err);
        if (err) {
            console.log(err);
            res.send(500, err);
        }
        else if (rst && rst.length == 0) {
            res.redirect('/login?err=1');
            return;
        }
        var cookieOpt = {
//            domain: req.get('Host').split(':')[0], 
            path: '/'
        };
        g_UserInfo[rst[0].id] = {};
        res.cookie('user', req.body.user_id, cookieOpt );
        res.cookie('uid', rst[0].id, cookieOpt );
        function logincomplete() {
            user.getUser({where: " a.id='" + rst[0].id + "'"}, function (err, user_rst) {
                console.log(user_rst);
                if (!user_rst || user_rst.length == 0) {
                    // 用户不存在
                    res.render('404', {type: 1000});
                    return;
                }
                var rst_role = user_rst[0].role_id.split(',');
                if (rst_role.length > 1) {
                    role.getRole({where: ' id in (' + user_rst[0].role_id + ') '}, function (e, role_list) {
                        if (e) {
                            console.log(e);
                        }
                        else {
//                            console.log(role_list);
                            data_center.set('userRole_' + rst[0].id, role_list);
                            g_UserInfo[rst[0].id].role_list = role_list;
                            res.redirect('/selrole');
                        }
                    });
                }
                else if (rst_role.length == 1){
                    res.cookie('role_id', rst_role[0]);
                    res.redirect('/');
                }
            });
            
        }
        login.creatSign(req.body.user_id, function (sign) {
            res.cookie('sign', sign, cookieOpt);
            login.createCsrfCode(req.body.user_id, function (csrf) {
                res.cookie('csrf_code', csrf, cookieOpt);
                logincomplete();
            });
        });
    });
};

exports.loginpage = function (req, res) {
    res.clearCookie('user');
    res.clearCookie('uid');
    res.clearCookie('csrf_code');
    res.clearCookie('sign');
    res.render('login/login.ejs', { });
};

var cmdMap = {
    'sendMail': function (req, res) {
        var to = req.body.to_user_id;
        var from = req.body.from_user_id;
        var toinfo, frominfo;
        console.log([to, from]);
        user.getUserInfo([to, from], function (err, rst) {
            if (!err) {
                for (var i = 0;i < rst.length; i++) {
                    if (rst[i].id == to) {
                        toinfo = rst[i];   
                    }
                }
                for (var i = 0;i < rst.length; i++) {
                    if (rst[i].id == from) {
                        frominfo = rst[i];   
                    }
                }
                
                console.log(frominfo.qq, '  ', toinfo.qq);
                if (toinfo && frominfo) {
                    console.log('sending mail', toinfo);
                    var content = req.body.content.replace(/%from_user%/g, frominfo.cnname).replace(/%to_user%/g, toinfo.cnname);
                    if (toinfo.qq) {
                        mail.send({
                            to: toinfo.qq + '@qq.com',
                            'subject': '你收到一张新的故障单',
                            html: content
                        }, function () {
                            res.json({code: 0});
                        })
                    }
                }
                else {
                    res.json({code: -1});
                }
            }
            else {
                res.json({code: -1});
            }
        });
    },
    
    'setTasking':function (req, res) {
        tasking.set(req.body, function (err, rst) {
            if (err) {
                res.json({code: -1, data: rst})
            }
            else {
                res.json({code: 0, data: rst});
            }
        });
    },
    
    'delTasking' : function (req, res) {
        if (typeof req.body.id == 'undefined') {
            res.json({code:-3, data: rst});
            return;
        }
        tasking.del(req.body.id, function (err, rst) {
            if (err) {
                res.json({code:-1, data: rst});
            }
            else {
                res.json({code:0, data: rst});
            }
        });
    },
    
    'getTasking': function (req, res) {
        var search = {where: ' 1=1 '};
        if (typeof req.query.cstatus != 'undefined') {
            search = {where : 'cstatus in (' + req.query.cstatus + ') ' + (req.query.duty_user ? (' and duty_user=' + req.query.duty_user) : '')};
        }
        search.page = {
            cp: req.query.cp || 0,
            ps: req.query.ps || 20
        }
        tasking.get(search, function (err, rst, page) {
            if (err) {
                console.log(err);
                res.json({code: -1, data: rst})
            }
            else {
                res.json({code: 0, data: rst, page: page});
            }
        });
    },
    
    'setRepository':function (req, res) {
        console.log(req)
        repository.set(req.body, function (err, rst) {
            if (err) {
                res.json({code: -1, data: rst})
            }
            else {
                res.json({code: 0, data: rst});
            }
        });
    },
    
    'delRepository' : function (req, res) {
        if (typeof req.body.id == 'undefined') {
            res.json({code:-3, data: rst});
            return;
        }
        repository.del(req.body.id, function (err, rst) {
            if (err) {
                res.json({code:-1, data: rst});
            }
            else {
                res.json({code:0, data: rst});
            }
        });
    },
    
    'getRepository': function (req, res) {
        var search = {};
        repository.get(search, function (err, rst) {
            if (err) {
                res.json({code: -1, data: rst})
            }
            else {
                res.json({code: 0, data: rst});
            }
        });
    },
    
    'setMyTasking':function (req, res) {
        mytasking.set(req.body, function (err, rst) {
            if (err) {
                res.json({code: -1, data: rst})
            }
            else {
                res.json({code: 0, data: rst});
            }
        });
    },
    
    'delMyTasking' : function (req, res) {
        if (typeof req.body.id == 'undefined') {
            res.json({code:-3, data: rst});
            return;
        }
        mytasking.del(req.body.id, function (err, rst) {
            if (err) {
                res.json({code:-1, data: rst});
            }
            else {
                res.json({code:0, data: rst});
            }
        });
    },
    
    'getMyTasking': function (req, res) {
        var search = {where: ' add_user=' + req.cookies.uid};
        mytasking.get(search, function (err, rst) {
            if (err) {
                res.json({code: -1, data: rst})
            }
            else {
                res.json({code: 0, data: rst});
            }
        });
    },
    
    'setLeaderTasking':function (req, res) {
        leader_tasking.set(req.body, function (err, rst) {
            if (err) {
                res.json({code: -1, data: rst})
            }
            else {
                res.json({code: 0, data: rst});
            }
        });
    },
    
    'delLeaderTasking' : function (req, res) {
        if (typeof req.body.id == 'undefined') {
            res.json({code:-3, data: rst});
            return;
        }
        leader_tasking.del(req.body.id, function (err, rst) {
            if (err) {
                res.json({code:-1, data: rst});
            }
            else {
                res.json({code:0, data: rst});
            }
        });
    },
    
    'getLeaderTasking': function (req, res) {
        var search = {where: ' 1=1 '};
        if (typeof req.query.cstatus != 'undefined') {
            search = {where : 'cstatus=' + req.query.cstatus}
        }
        leader_tasking.get(search, function (err, rst) {
            if (err) {
                res.json({code: -1, data: rst})
            }
            else {
                res.json({code: 0, data: rst});
            }
        });
    },
    
    'setVacation':function (req, res) {
        vacation.set(req.body, function (err, rst) {
            if (err) {
                res.json({code: -1, data: rst})
            }
            else {
                res.json({code: 0, data: rst});
            }
        });
    },
    
    'delVacation' : function (req, res) {
        if (typeof req.body.id == 'undefined') {
            res.json({code:-3, data: rst});
            return;
        }
        vacation.del(req.body.id, function (err, rst) {
            if (err) {
                res.json({code:-1, data: rst});
            }
            else {
                res.json({code:0, data: rst});
            }
        });
    },
    
    'getVacation': function (req, res) {
        var search = {where: ' 1=1 '};
        vacation.get(search, function (err, rst) {
            if (err) {
                res.json({code: -1, data: rst})
            }
            else {
                res.json({code: 0, data: rst});
            }
        });
    },
    'setProcessLog': function (req, res) {
        var search = {};
        process_log.set(req.body, function (err, rst) {
            if (err) {
                console.log(err);
                res.json({code: -1, data: rst})
            }
            else {
                res.json({code: 0, data: rst});
            }
        });
    },
    'getFailureTypeRole': function (req, res) {
        var search = {where: ' 1=1 '};
        if (typeof req.query.role_id != 'undefined') {
            search.where = ' role_id=' + req.query.role_id + ' ';
			failure_type_role.get(search, function (err, rst) {
				if (err) {
					res.json({code: -1, data: null})
				}
				else {
					res.json({code: 0, data: rst});
				}
			});
        }
		else if (typeof req.query.type_id != 'undefined') {
			failure_type_role.getUserByTypeId(req.query.type_id, function (err, rst) {
				if (err) {
					res.json({code: -1, data: null})
				}
				else {
					res.json({code: 0, data: rst});
				}
			});
		}
        else {
			res.json({code: -4, data: null});
		}
    },
    'setFailureTypeRole': function (req, res) {
        failure_type_role.set(req.body, function (err, rst) {
            if (err) {
                res.json({code: -1, data: rst})
            }
            else {
                res.json({code: 0, data: rst});
            }
        });
    },
    'getSoftwareTodo': function (req, res) {
        var param = {user_id:req.cookies.uid};
        if (typeof req.query.cstatus != 'undefined') {
            param.cstatus = req.query.cstatus;
        }
        software_report.getTodo(param, function (err, rst) {
            if (err) {
                res.json({code: -1, data: rst})
            }
            else {
                res.json({code: 0, data: rst});
            } 
        });
    },
    
    'getLog': function (req, res) {
        var target;
        if (req.query.target == 'failure_report') {
            target = failure_report;
        }
        if (target) {
            failure_report.getProcessLog(req.query.id, function (err, rst) {
                if (err) {
                    res.json({code: -1, data: rst})
                }
                else {
                    res.json({code: 0, data: rst});
                } 
            });
        }
        else {
            process_log.getLog(req.query.target, req.query.id, function (err, rst) {
                if (err) {
                    res.json({code: -1, data: rst})
                }
                else {
                    res.json({code: 0, data: rst});
                } 
            });
        }
    },
    
    'setScore':function (req, res) {
        score.set(req.body, function (err, rst) {
            if (err) {
                res.json({code: -1, data: rst})
            }
            else {
                res.json({code: 0, data: rst});
            }
        });
    }
};

exports.json = function (req, res) {
    var action = req.query.action;
//    console.log(req.path);
//    menu[action]()
    switch(action) {
        case 'getMenu':
            menu.getMenu(req.query.all || req.query.user, req.cookies.role_id, function (err, rst) {
                if (err) {
                }
                else {
                    res.json({code:0, data: rst});
                }
            });
//            res.end('0');
            break;
//        case 'getTopMenu':
//            menu.getTopMenu(req.query.user, function (err, rst) {
//                if (err) {
//                    console.error('err', err);
//                }
//                else {
//                    res.json({code:0, data: rst});
//                }
//            });
//            break;
        case 'getDept':
            var search = {};
            if (typeof req.query.id != 'undefined') {
                search
            }
            dept.getDept(search, function (err, rst) {
                if (err) {
                    
                }
                else {
                    res.json({code:0, data: rst});
                }
            });
            break;
        case 'getRole':
            var search = {};
            role.getRole(search, function (err, rst) {
                if (err) {
                    
                }
                else {
                    res.json({code:0, data: rst});
                }
            });
            break;
        case 'getUser':
            var search = {};
            if (typeof req.query.id != 'undefined') {
                search.where = ' a.id=' + req.query.id;
            }
            user.getUser(search, function (err, rst) {
                if (err) {
                    
                }
                else {
                    res.json({code:0, data: rst});
                }
            });
            break;
        case 'getKeyValue':
            var search = {};
            if (req.query.type) {
                search = {where: ' type=' + req.query.type};
            }
            key_value.get(search, function (err, rst) {
                if (err) {
                    
                }
                else {
                    if (req.query.var) {
                        res.send('var ' + req.query.var + '=' + JSON.stringify(rst));
                    }
                    else {
                        res.json({code:0, data: rst});
                    }
                }
            });
            break;
        case 'getFailureReport':
            var search = {where: ' 1=1 and repair_user=' + req.cookies.uid};
            if (typeof req.query.cstatus != 'undefined') {
                search.where += ' and a.cstatus=' + req.query.cstatus;
            }

            console.log(search);
            
            failure_report.get(search, function (err, rst) {
                console.log(rst);
                if (err) {
                    console.log(err);
                }
                else {
                    
                    res.json({code:0, data: rst});
                }
            });
            break;
        case 'getUserInfo':
            // 返回用户信息，中文名 所在部门 角色 信息 
            user.getUser({where: " user_id='" + req.cookies.user + "'"}, function (err, rst) {
                if (err) {
                }
                else {
                    role.queryRoleInfo(rst[0].role_id, function (e, r) {
                        if (e) {
                        }
                        res.json({code:0, data: {user:rst, roleData: r}});
                    });
                    
                }
            });
            break;
        case 'getSoftwareReport':
//            var obj = require('../app_modules/software_report');
            var search = {where: ' 1=1 and (op_user=' + req.cookies.uid + ' or ' + (typeof req.query.role_id != 'undefined' ? ' 1=1 ' : ' 0=1 ')+ ')'};
            if (typeof req.query.cstatus != 'undefined') {
                search.where += ' and cstatus=' + req.query.cstatus + ' ';
            }
            software_report.get(search, function (err, rst) {
                if (err) {
                    console.log(err);
                }
                else {
                    res.json({code:0, data: rst});
                }
            });
            break;
        default:
            var fn = cmdMap[action];
            if (typeof fn == 'function') {
                fn(req, res);
            }
            else {
                var controller = new Controller(req, res);
                controller.start();
            }
            break;
    }
};
exports.post = function (req, res) {
    var action = req.query.action;
    console.log(req.path);
//    menu[action]()
    switch(action) {
        case 'setMenu':
            var data = {
                name: req.body.name,
                link: req.body.link,
                note: req.body.note,
                parent: req.body.parent
            };
            if (req.body.id) {
                data.id = req.body.id;
            }
            if (!data.name) {
                res.json({code:-1, data: rst});
            }
            menu.setMenu(data, function (err, rst) {
                if (err) {
                    
                }
                else {
                    req.query.user == 'admin' && login.creatSign(req.query.user, function (sign) {
                        if (sign == req.cookies.sign) {
                            // 新增的目录给admin授权
                            if (!req.body.id) {
                                role.addMenuUser('admin', rst.insertId, function (errs, rsts) {
                                    if (errs) {
                                        res.json({code:-3, data: rst});
                                        return;
                                    }
                                    res.json({code:0, data: rst});
                                });
                            }
//                            power.setMenuPower();
                        }
                    });
//                    if (req.query.user == 'admin' && login.creatSign(req.body.user_id, function (sign) {})
                    
                    res.json({code:0, data: rst});
                }
            });
            break;
        case 'delMenu':
            req.query.user == 'admin' && login.creatSign(req.query.user, function (sign) {
                // 管理员
                if (sign == req.cookies.sign) {
                    menu.delMenu(req.body.id, function (err, rst) {
                        if (err) {
                            res.json({code:-1, data: rst});
                        }
                        else {
                            res.json({code:0, data: rst});
                        }
                    });
                }
                else {
                    res.json({code:-2, data: new Error});
                }
            });
            break;
        case 'setDept':
            req.query.user == 'admin' && login.creatSign(req.query.user, function (sign) {
                // 管理员
                if (sign == req.cookies.sign) {
                    var data = {
                        name: req.body.name,
                        codes: req.body.codes,
                        ext: req.body.ext,
                        leader1: req.body.leader1 || 0,
                        leader2: req.body.leader2 || 0,
                        parent: req.body.parent
                    };
                    if (req.body.id) {
                        data.id = req.body.id;
                    }
                    console.log(data);
                    if (!data.name) {
                        res.json({code:-1, data: rst});
                    }
                    dept.setDept(data, function (err, rst) {
                        if (err) {
                            res.json({code:-1, data: rst});
                        }
                        else {
                            res.json({code:0, data: rst});
                        }
                    });
                }
                else {
                    res.json({code:-2, data: new Error});
                }
            });
            break;
        case 'delDept':
            req.query.user == 'admin' && login.creatSign(req.query.user, function (sign) {
                // 管理员
                if (sign == req.cookies.sign) {
                    dept.delDept(req.body.id, function (err, rst) {
                        if (err) {
                            res.json({code:-1, data: rst});
                        }
                        else {
                            res.json({code:0, data: rst});
                        }
                    });
                }
                else {
                    res.json({code:-2, data: {}});
                }
            });
            break;
        case 'setRole':
            req.query.user == 'admin' && login.creatSign(req.query.user, function (sign) {
                // 管理员
                if (sign == req.cookies.sign) {
                    var data = {
                        name: req.body.name,
                        note: req.body.note,
                        power: req.body.power,
                        ext: req.body.ext
                    };
                    if (typeof req.body.id != 'undefined') {
                        data.id = req.body.id;
                    }
                    role.setRole(data, function (err, rst) {
                        if (err) {
                            res.json({code:-1, data: rst});
                        }
                        else {
                            res.json({code:0, data: rst});
                        }
                    });
                }
                else {
                    res.json({code:-2, data: new Error});
                }
            });
            break;
        case 'delRole':
            req.query.user == 'admin' && login.creatSign(req.query.user, function (sign) {
                // 管理员
                if (sign == req.cookies.sign) {
                    role.delRole(req.body.id, function (err, rst) {
                        if (err) {
                            res.json({code:-1, data: rst});
                        }
                        else {
                            res.json({code:0, data: rst});
                        }
                    });
                }
                else {
                    res.json({code:-2, data: new Error});
                }
            });
            break;
        case 'setUser':
            login.creatSign(req.query.user, function (sign) {
                // 管理员
//                console.log(req);
                if (sign == req.cookies.sign) {
                    if(typeof req.body.oldpwd != 'undefined') {
                        req.body.oldpwd = req.body.oldpwd;
                    }
                    user.setUser(req.body, function (err, rst) {
                        if (err) {
                            console.log(err);
                            res.json({code:-1, data: rst});
                        }
                        else {
                            res.json({code:0, data: rst});
                        }
                    });
                }
                else {
                    res.json({code:-2, data: new Error});
                }
            });
            break;
        case 'setKeyValue':
            login.creatSign(req.query.user, function (sign) {
                // 管理员
//                console.log(req);
                if (sign == req.cookies.sign) {
                    key_value.set(req.body, function (err, rst) {
                        if (err) {
                            console.log(err);
                            res.json({code:-1, data: rst});
                        }
                        else {
                            res.json({code:0, data: rst});
                        }
                    });
                }
                else {
                    res.json({code:-2, data: new Error});
                }
            });
            break;
        case 'delKeyValue':
            if (typeof req.body.id == 'undefined') {
                res.json({code:-3, data: rst});
                return;
            }
            login.creatSign(req.query.user, function (sign) {
                // 管理员
                if (sign == req.cookies.sign) {
                    key_value.del(req.body.id, function (err, rst) {
                        if (err) {
                            console.log(err);
                            res.json({code:-1, data: rst});
                        }
                        else {
                            res.json({code:0, data: rst});
                        }
                    });
                }
                else {
                    res.json({code:-2, data: new Error});
                }
            });
            break;
        case 'setFailureReport':
            login.creatSign(req.query.user, function (sign) {
                // 管理员
//                console.log(req);
                if (sign == req.cookies.sign) {
                    req.body.op_user = req.cookies.uid;
                    failure_report.set(req.body, function (err, rst) {
                        if (err) {
                            console.log(err);
                            res.json({code:-1, data: rst});
                        }
                        else {
                            res.json({code:0, data: rst});
                        }
                    });
                }
                else {
                    res.json({code:-2, data: new Error});
                }
            });
            break;
        case 'delFailureReport':
            if (typeof req.body.id == 'undefined') {
                res.json({code:-3, data: rst});
                return;
            }
            login.creatSign(req.query.user, function (sign) {
                // 管理员
                if (sign == req.cookies.sign) {
                    failure_report.del(req.body.id, function (err, rst) {
                        if (err) {
                            res.json({code:-1, data: rst});
                        }
                        else {
                            res.json({code:0, data: rst});
                        }
                    });
                }
                else {
                    res.json({code:-2, data: new Error});
                }
            });
            break;
        case 'setSoftwareReport':
            login.creatSign(req.query.user, function (sign) {
                // 管理员
//                console.log(req);
                if (sign == req.cookies.sign) {
                    if (typeof req.body.id == 'undefined') {
                        req.body.op_user = req.cookies.uid;
                    }
                    software_report.set(req.body, function (err, rst) {
                        if (err) {
                            console.log(err);
                            res.json({code:-1, data: rst});
                        }
                        else {
                            res.json({code:0, data: rst});
                        }
                    });
                }
                else {
                    res.json({code:-2, data: new Error});
                }
            });
            break;
        default:
            console.log(action, 'new action')
            var fn = cmdMap[action];
            if (typeof fn == 'function') {
                login.creatSign(req.query.user, function (sign) {
                    // 管理员
    //                console.log(req);
                    if (sign == req.cookies.sign) {
//                        console.log('-----');
                        req.body.op_user = req.cookies.uid;
                        fn(req, res);
                    }
                    else {
                        res.json({code:-2, data: new Error});
                    }
                });
            }
            else {
                var controller = new Controller(req, res);
                controller.start();
            }
            break;
    }
}