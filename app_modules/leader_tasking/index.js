/*
id           | int(10) unsigned | NO   | PRI | NULL              | auto_increment |
| repair_user  | int(10)          | YES  |     | NULL              |                |
| repair_dept  | int(10)          | YES  |     | NULL              |                |
| related_dept | int(10)          | YES  |     | NULL              |                |
| done_user    | int(10)          | YES  |     | NULL              |                |
| title        | varchar(100)     | YES  |     | NULL              |                |
| cstatus      | int(10)          | YES  |     | NULL              |                |
| create_time  | timestamp        | NO   |     | CURRENT_TIMESTAMP |                |
| start_time   | datetime         | YES  |     | NULL              |                |
| end_time     | datetime         | YES  |     | NULL              |                |
| grade        | int(10)          | YES  |     | NULL              |                |
| ftype        | int(10)          | YES  |     | NULL              |                |
| apply_time   | datetime         | YES  |     | NULL              |                |
| note         | varchar(400)     |
*/
var util = require('../mysql/util.js');
var conn = require('../mysql/conn.js');
var async = require('async');
var utillib = require('../util');
var table = 'leader_tasking_list';

function buildData (data) {
    var o = {};
        
  
    for (var i in data) {
        if (',id,repair_user,title,related_dept,done_user,start_time,create_time,end_time,grade,ftype,note,repair_dept,cstatus,op_user,task_for,task_for_type,'.indexOf(',' + i + ',') > -1) {
            o[i] = data[i];
        }
    }
    return o;
}

module.exports = {
    set: function (data, callback) {
        data = buildData(data);
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
                if (typeof data.id == 'undefined') {
                    util.insert(table, data, cb);
                } 
                else {
                    data.where = ' id=' + data.id;
                    delete data.id;
                    util.update(table, data, cb);
                }
            }
        ], function (err, cb) {
            callback (err, cb);
        });
        
    },
    
    get: function (data, callback) {
        // 获取新纪录
        var sql = 'select a.* ,'
            + ' b.user_id,b.cnname,'
            + ' tdone.cnname as done_cnname,'
            + ' c.name as dept_name, d.name as related_dept_name, d.id as related_dept_id from ' + table + ' a '
            + ' left join user_list b on a.repair_user=b.id '
            + ' left join user_list tdone on a.done_user=tdone.id and a.done_user!=0 '
            + ' left join dept_list c on a.repair_dept=c.id '
            + ' left join dept_list d on a.related_dept=d.id '
            + ' where 1=1 and ' + (data.where || ' 1=1 ');
//        console.log(sql);
        conn.query(sql, callback);        
    },
    
    del: function (id, callback) {
        util.delete(table, {where: ' id=' + id}, callback);
    }
}