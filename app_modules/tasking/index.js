var util = require('../mysql/util.js');
var conn = require('../mysql/conn.js');
var comm = require('../../util');
var user = require('../user');
var async = require('async');
var table = 'tasking_list';

/*
 id           | int(10) unsigned | NO   | PRI | NULL              | auto_increment |
| repair_user  | int(10)          | YES  |     | NULL              |                |
| repair_dept  | int(10)          | YES  |     | NULL              |                |
| title        | varchar(100)     | YES  |     | NULL              |                |
| duty_user    | int(10)          | YES  |     | NULL              |                |
| process_user | int(10)          | YES  |     | NULL              |                |
| done_user    | int(10)          | YES  |     | NULL              |                |
| cstatus      | int(10)          | YES  |     | NULL              |                |
| create_time  | timestamp        | NO   |     | CURRENT_TIMESTAMP |                |
| end_time     | datetime         | YES  |     | NULL              |                |
| grade        | int(10)          | YES  |     | NULL              |                |
| ftype        | int(10)          | YES  |     | NULL              |                |
| note         | varchar(400)     | YES  |     | NULL              |                |
| apply_time   | datetime         | YES  |     | NULL              |                |
| op_user      
*/
function buildData (data) {
    var o = {};
    for (var i in data) {
        if (',id,repair_user,repair_dept,duty_user,process_user,done_user,title,cstatus,create_time,end_time,note,grade,ftype,apply_time,op_user,task_src,clientip,'.indexOf(',' + i + ',') > -1) {
            o[i] = data[i];
        }
    }
    return o;
}

module.exports = {
    set: function (data, callback) {
        var _self = this;
        var rid = data.id
        if (typeof data.id == 'undefined') {
            util.insert(table, buildData(data), callback);
        } 
        else {
            data = buildData(data);
            data.where = ' id=' + data.id;
            delete data.id;
            
            if (data.cstatus == 75) {
                data.end_time = comm.getCurrentTime();
            }
            util.update(table, data, function (err, rst) {
                if (err) {
                    callback(err);
                }
                else {
                    _self.get({
                        where: ' a.id=' + rid
                    }, function (e, r) {
                        if (e) {
                            callback(err);
                        }
                        else {

                            var maintable = r[0].task_src,
                                mainid = r[0].main_id,
                                newdata = {};
                            newdata.where = ' id=' + mainid;
                            newdata.cstatus = data.cstatus;
                            newdata.process_user = data.op_user;
                            console.log(maintable, mainid, newdata);
                            util.update(maintable, newdata, callback);
                        }
                    })
                }
            });
        }
    },
    
    get: function (data, callback) {
        var sql = 'select a.*' 
            + ', 1000 * unix_timestamp(a.create_time) as create_time '
            + ', 1000 * unix_timestamp(a.end_time) as end_time '
            + ', 1000 * unix_timestamp(a.apply_time) as apply_time '
            // + ' b.user_id,b.cnname,'
            // + ' tprocess.cnname as process_cnname,'
            // + ' tduty.cnname as duty_cnname,'
            // + ' tdone.cnname as done_cnname,'
            // + ' c.name as dept_name 
            + ' from ' + table + ' a '
            // + ' left join user_list b on a.repair_user=b.id '
            // + ' left join user_list tprocess on a.process_user=tprocess.id and a.process_user!=0  '
            // + ' left join user_list tduty on a.duty_user=tduty.id and a.duty_user!=0  '
            // + ' left join user_list tdone on a.done_user=tdone.id and a.done_user!=0 '
            // + ' left join dept_list c on a.repair_dept=c.id '
            + ' where 1=1 and ' + (data.where || ' 1=1 ') + ' order by create_time desc ';
        var spos = 0, ps = 20;
        if (data.page) {
            spos = data.page.cp;
            ps = data.page.ps;
        }

         sql += ' limit ' + (spos * ps) + ',' + ps;
        async.parallel([
            function (cb) {
                var sqlCount = 'select count(*) as count from ' + table + ' a where 1=1 and ' + (data.where || ' 1=1 ');
                conn.query(sqlCount, cb);
            },

            function (cb) {
                conn.query(sql, function (err, rst) {
                    if (err) {
                        console.log(err);
                        cb(err);
                    }
                    else {
                        cb (null, rst);
                    }
                });
            }
        ], function (err, rsts) {
            if (err) {
                console.log(err);
                callback(err);
            }
            else {
                var userids = [];
                var rst = rsts[1];
                for (var i = 0; i < rst.length; i++) {
                    rst[i].repair_user && userids.push(rst[i].repair_user);
                    rst[i].process_user && userids.push(rst[i].process_user);
                    rst[i].duty_user && userids.push(rst[i].duty_user);
                    rst[i].done_user && userids.push(rst[i].done_user);
                }
                console.log(userids);
                user.getUser({
                    where: ' a.id in (' + userids.join(',') + ')'
                }, function (e, r) {
                    var usercache = {};
                    function pick (id) {
                        if (usercache[id]){
                            return usercache[id];
                        }
                        for (var i = 0; i < r.length; i++) {
                            if (r[i].id == id) {
                                return usercache[id] = {
                                    cnname: r[i].cnname,
                                    deptName: r[i].deptname
                                };
                            }
                        }
                        return {};
                    }
                    for (var i = 0; i < rst.length; i++) {
                        rst[i].process_cnname = pick(rst[i].process_user).cnname;
                        rst[i].duty_cnname = pick(rst[i].duty_user).cnname;
                        rst[i].done_cnname = pick(rst[i].done_user).cnname;
                        var repUser = pick(rst[i].repair_user);
                        rst[i].cnname = repUser.cnname;
                        rst[i].dept_name = repUser.deptName;
                    }
                    var page = {};
                    page.cp = spos;
                    page.ps = ps;
                    page.rc = rsts[0] && rsts[0][0].count;
                    page.pc = Math.ceil(page.rc / page.ps);
                    callback (null, rst, page);
                });
            }
        });
//        
//        var sql = 'select a.*,'
//        + ' b.id as repair_user,b.cnname,'
//        + ' tprocess.id as process_user,tprocess.cnname as process_cnname,'
//        + ' tduty.id as duty_user,tduty.cnname as duty_cnname,'
//        + ' tdone.id as done_user,tdone.cnname as done_cnname,'
//        + ' c.name as dept_name from ' + table + ' a '
//        + ' left join user_list b on a.repair_user=b.id '
//        + ' left join user_list tprocess on a.process_user=tprocess.id '
//        + ' left join user_list tduty on a.duty_user=tduty.id '
//        + ' left join user_list tdone on a.done_user=tdone.id '
//        + ' left join dept_list c on a.repair_dept=c.id '
//        + ' where ' + (data.where || ' 1=1 ');

        
    },
    
    del: function (id, callback) {
        util.delete(table, {where: ' id=' + id}, callback);
    }
}