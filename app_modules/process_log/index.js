//repository_list
/*
id               | int(10) unsigned | NO   | PRI | NULL              | auto_increment              |
| title            | varchar(100)     | YES  |     | NULL              |                             |
| cstatus          | int(10)          | YES  |     | NULL              |                             |
| create_time      | timestamp        | NO   |     | CURRENT_TIMESTAMP |                             |
| ftype            | int(10)          | YES  |     | NULL              |                             |
| last_modify_time | timestamp        | NO   |     | CURRENT_TIMESTAMP | on update CURRENT_TIMESTAMP |
| note             | varchar(400)     | YES  |     | NULL              |                             |
| add_user         | int(10)          | YES  |     | NULL              |                             |
| ext              | 
*/
var util = require('../mysql/util.js');
var conn = require('../mysql/conn.js');

var table = 'process_log_list';
function buildData (data) {
    var o = {};
        
    for (var i in data) {
        if (',id,src,main_id,from_table,status_type,cstatus,dest_status,note,last_modify_time,last_modify_time,add_user,'.indexOf(',' + i + ',') > -1) {
            o[i] = data[i];
        }
    }
    return o;
}

module.exports = {
    set: function (data, callback) {
//        data = buildData(data);
//        if (typeof data.id == 'undefined') {
        util.insert(table, data, callback);
//        } 
//        else {
//            data.where = ' id=' + data.id;
//            delete data.id;
//            util.update(table, data, callback);
//        }
    },
    
    get: function (data, callback) {
        var sql = 'select a.*, 1000 * unix_timestamp(a.last_modify_time) as last_modify_time,'
        + ' b.user_id,b.cnname as adduser_cnname from ' + table + ' a '
        + ' left join user_list b on a.add_user=b.id '
        + ' where ' + (data.where || ' 1=1 ');
        console.log(sql);
        conn.query(sql, callback);
        
        data = data || {};
        data.where = data.where || ' 1=1 ';
        util.select(table, data, callback);
    },
    
    del: function (id, callback) {
        util.delete(table, {where: ' id=' + id}, callback);
    },

    getLog: function (table, id, callback) {
        var sql = 'select distinct e.*, 1000 * unix_timestamp(e.last_modify_time) as last_modify_time, b.cnname as op_user_cnname,c._value as cstatusname from ' + table + ' a '
        + ' left join process_log_list e on e.main_id=a.id '
        + ' left join user_list b on b.id=e.op_user '
        // + ' left join user_list d on d.id=a.process_user '
        + ' left join key_value_list c on c.id=e.dest_status '
        + ' where (e.from_table=\'' + table + '\' or e.src=\'' + table + '\') and e.main_id=' + id
        + ' order by e.last_modify_time asc ';
        console.log(sql);
        conn.query(sql, callback);  
    }
}