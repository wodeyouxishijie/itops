var util = require('../mysql/util.js');
var conn = require('../mysql/conn.js');
var table = 'software_report_list';

/*
id           | int(10) unsigned | NO   | PRI | NULL              | auto_increment |
| apply_user   | int(10)          | YES  |     | NULL              |                |
| apply_dept   | int(10)          | YES  |     | NULL              |                |
| related_dept | int(10)          | YES  |     | NULL              |                |
| title        | varchar(100)     | YES  |     | NULL              |                |
| cstatus      | int(10)          | YES  |     | NULL              |                |
| create_time  | timestamp        | NO   |     | CURRENT_TIMESTAMP |                |
| apply_time   | datetime         | YES  |     | NULL              |                |
| note         | varchar(400)     | YES  |     | NULL              |                |
| contact      | int(10)          | YES  |     | NULL              |                |
| related_app 
*/
function buildData (data) {
    var o = {};
    for (var i in data) {
        if (',id,apply_user,apply_dept,related_dept,title,cstatus,create_time,apply_time,note,contact,related_app,result,op_user,'.indexOf(',' + i + ',') > -1) {
            o[i] = data[i];
        }
    }
    return o;
}

module.exports = {
    set: function (data, callback) {
        if (typeof data.id == 'undefined') {
            util.insert(table, buildData(data), callback);
        } 
        else {
            data = buildData(data);
            data.where = ' id=' + data.id;
            delete data.id;
            util.update(table, data, callback);
        }
    },
    
    get: function (data, callback) {
        var sql = 'select a.*, 1000 * unix_timestamp(a.create_time) as create_time,'
        + ' b.user_id,b.cnname,bb.cnname as op_username,'
        + ' c.name as dept_name from ' + table + ' a '
        + ' left join user_list b on a.apply_user=b.id '
        + ' left join user_list bb on a.op_user=bb.id '
        + ' left join dept_list c on c.id=a.apply_dept '
        + ' where ' + (data.where || ' 1=1 ') + ' order by a.create_time desc ';
        conn.query(sql, callback);
//        util.select(table, {}, callback);
    },
    
    del: function (id, callback) {
        util.delete(table, {where: ' id=' + id}, callback);
    },
    
    getTodo: function (where, callback) {
        var sql = 'select a.*'
        + ', 1000 * unix_timestamp(a.create_time) as create_time'
        + ', 1000 * unix_timestamp(a.apply_time) as apply_time'
        + ',b.user_id,b.cnname,bb.cnname as op_username,c.name as dept_name from ' + table + ' a '
        + ' left join user_list b on a.apply_user=b.id '
        + ' left join user_list bb on a.op_user=bb.id '
        + ' left join dept_list c on c.id=a.apply_dept ';
        
        
        if (typeof where.cstatus != 'undefined') {
            sql += ' where a.cstatus=' + where.cstatus;
        }
        else {
            var user = where.user_id;
            var mymember = 'select id from user_list where dept_id=(select dept_id from user_list where id=(select leader1 from dept_list where id=(select dept_id from user_list where id=' + user + ')))';
            sql += ' where a.op_user in (' + mymember + ') and a.cstatus=0;';
        }
        console.log(sql, 'soft');
        conn.query(sql, callback);
    }
}