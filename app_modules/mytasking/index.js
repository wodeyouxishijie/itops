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
var utillib = require('../../util');
var table = 'mytasking_list';
function buildData (data) {
    var o = {};
        
    for (var i in data) {
        if (',id,taskid,title,cstatus,create_time,ftype,note,last_modify_time,last_modify_time,ext,add_user,'.indexOf(',' + i + ',') > -1) {
            o[i] = data[i];
        }
    }
    return o;
} 

console.log(utillib);
module.exports = {
    set: function (data, callback) {
        data = buildData(data);
        if (typeof data.id == 'undefined') {
            data.taskid = utillib.genUid();
            console.log(data);
            util.insert(table, data, callback);
        } 
        else {
            data.where = ' id=' + data.id;
            delete data.id;
            console.log(data);
            util.update(table, data, callback);
        }
    },
    
    get: function (data, callback) {
        var sql = 'select a.*, 1000 * unix_timestamp(a.create_time) as create_time,'
        + ' b.user_id,b.cnname as adduser_cnname from ' + table + ' a '
        + ' left join user_list b on a.add_user=b.id '
        + ' where ' + (data.where || ' 1=1 ');
        conn.query(sql, callback);
        
        data = data || {};
        data.where = data.where || ' 1=1 ';
        util.select(table, data, callback);
    },
    
    del: function (id, callback) {
        util.delete(table, {where: ' id=' + id}, callback);
    }
}