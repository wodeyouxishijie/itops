/*
id          | int(10) unsigned | NO   | PRI | NULL              | auto_increment |
| title       | varchar(100)     | YES  |     | NULL              |                |
| cstatus     | int(10)          | YES  |     | NULL              |                |
| create_time | timestamp        | NO   |     | CURRENT_TIMESTAMP |                |
| start_time  | datetime         | YES  |     | NULL              |                |
| ftype       | int(10)          | YES  |     | NULL              |                |
| note        | text             | YES  |     | NULL              |                |
| apply_user  | int(10)          | YES  |     | NULL              |                |
| ext         | varchar(1024)    | YES  |     | NULL              |                |
| op_user
*/

var util = require('../mysql/util.js');
var conn = require('../mysql/conn.js');
var table = 'vacation_list';

function buildData (data) {
    var o = {};
        
  
    for (var i in data) {
        if (',id,title,create_time,start_time,ftype,note,cstatus,apply_user,op_user,ext,'.indexOf(',' + i + ',') > -1) {
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
        // 获取新纪录
        var sql = 'select a.* ,'
            + ' b.id as role_id,b.name as role_name '
            + ' from ' + table + ' a '
            + ' left join role_list b on a.apply_user=b.id and a.apply_user!=0 '
            + ' where 1=1 and ' + (data.where || ' 1=1 ');
        console.log('dfsdfsdf',sql);
        conn.query(sql, callback);        
    },
    
    del: function (id, callback) {
        util.delete(table, {where: ' id=' + id}, callback);
    }
}