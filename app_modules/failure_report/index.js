var util = require('../mysql/util.js');
var conn = require('../mysql/conn.js');
var table = 'failure_report_list';
var user = require('../user');
var utillib = require('../util');
var async = require('async');

function buildData (data) {
    var o = {};
        
  
    for (var i in data) {
        if (',id,repair_user,title,duty_user,process_user,tel,done_user,create_time,end_time,grade,ftype,note,repair_dept,last_process_time,done_time,cstatus,op_user,clientip,'.indexOf(',' + i + ',') > -1) {
            o[i] = data[i];
        }
    }
    return o;
}

module.exports = {
    set: function (data, callback) {
        data = buildData(data);
        callback = callback || function () {};
        if (typeof data.id == 'undefined') {
            async.waterfall([
                function (cb) {
                    utillib.upBase64ToFile(data.note, function (err, note) {
                        if (err) {
                            cb (err);
                        }
                        else {
                            cb (null, note);
                        }
                    })
                }, 
                function (note, cb) {
                    data.note = note;
                    util.insert(table, data, function (err, rst) {
                        if (err && err.code.indexOf('ER_DATA_TOO_LONG') != -1) {
                            err = null;
                        }
                        if (err) {
                            console.error(err);
                            cb (err);
                        }
                        else {
                            util.insert ('tasking_list', {
                                "title": data.title,
                                "cstatus": data.cstatus,
                                "process_user": data.process_user,
                                "main_id": rst.insertId,
            //                    "end_time": data.end_time,
                                "note": data.note,
                                "repair_user": data.repair_user,
                                "tel": data.tel,
                                "repair_dept": data.repair_dept,
                                "grade": data.grade,
                                "ftype": data.ftype,
                                "op_user": data.op_user,
                                'clientip': data. clientip,
                                "task_src": "failure_report_list"
                            }, cb);
                        }
                    });
                }
            ], function (err, rst) {
                callback(err, rst);
            })
        } 
        else {
            data.where = ' id=' + data.id;
            var main_id = data.id;
            delete data.id;
            utillib.upBase64ToFile(data.note, function (e, note) {
                if (e) {
                    callback (e);
                }
                else {
                    data.note = note;
                    util.update(table, data, function (err, rst) {
                        if (err) {
                            callback (err);
                        }
                        else {
                            var param = {
                                where:" task_src='failure_report_list' and main_id=" + main_id
                            };
                            ['title', 'cstatus', 'note', 'tel', 'grade', 'ftype'].forEach(function (item) {
                                if (data[item]) {
                                    param[item] = data[item];
                                }
                            });
                            util.update ('tasking_list', param, function (err, rst) {
                                if (err) {
                                    console.log(err);
                                }
                                else {
                                    callback(null, rst);
                                }
                            });
                        }
                    });
                }
            });
        }
    },
    
    get: function (data, callback) {
        // 获取新纪录
        var sql = 'select a.* '
            + ', 1000 * unix_timestamp(a.create_time) as create_time '
            + ', 1000 * unix_timestamp(a.last_process_time) as last_process_time '
            + ', 1000 * unix_timestamp(a.done_time) as done_time '
            // + ' b.user_id,b.cnname,'
            // + ' tprocess.cnname as process_cnname,'
            // + ' tduty.cnname as duty_cnname,'
            // + ' tdone.cnname as done_cnname,'
            + ', g.grade as score_grade,g.note as score_note '
            // + ' c.name as dept_name '
            + ' from ' + table + ' a '
            // + ' left join user_list b on a.repair_user=b.id '
            // + ' left join user_list tprocess on a.process_user=tprocess.id and a.process_user!=0  '
            // + ' left join user_list tduty on a.duty_user=tduty.id and a.duty_user!=0  '
            // + ' left join user_list tdone on a.done_user=tdone.id and a.done_user!=0 '
            // + ' left join dept_list c on a.repair_dept=c.id '
            + ' left join score_list g on g.mainid=a.id and g.typeid=\'' + table + '\''
            + ' where 1=1 and ' + (data.where || ' 1=1 ') + ' order by create_time desc ';
console.log(sql);
        conn.query(sql, function (err, rst) {
            if (err) {
                callback(err);
            }
            else {
                var userids = [];
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
                    callback (null, rst);
                });
            }
        });        
    },
    
    del: function (id, callback) {
        util.delete(table, {where: ' id=' + id + ' and cstatus=76 '}, callback);
        util.delete('tasking_list', {where: ' main_id=' + id + ' and cstatus=76 and task_src=\'failure_report_list\''}, callback);
    },
    
    getProcessLog: function (id, callback) {
        var sql = 'select distinct e.*, 1000 * unix_timestamp(e.last_modify_time) as last_modify_time, b.cnname as op_user_cnname,d.cnname as process_user_cnname,c._value as cstatusname from ' + table + ' a '
        + ' left join process_log_list e on e.main_id=a.id '
        + ' left join user_list b on b.id=e.op_user '
        + ' left join user_list d on d.id=a.process_user '
        + ' left join key_value_list c on c.id=e.dest_status '
        + ' where e.from_table=\'' + table + '\' and e.main_id=' + id
        + ' order by e.last_modify_time asc '
        console.log(sql);
        conn.query(sql, callback);  
    }
}