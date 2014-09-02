var util = require('../mysql/util.js');
var conn = require('../mysql/conn.js');
var table = 'failure_type_role_list';
module.exports = {
    set: function (data, callback) {
        if (typeof data.id == 'undefined') {
            util.insert(table, data, callback);
        } 
        else {
            data.where = ' id=' + data.id;
            delete data.id;
            util.update(table, data, callback);
        }
    },
    
    get: function (data, callback) {
        util.select(table, data, callback);
    },
    
    del: function (id, callback) {
        util.delete(table, {where: ' id=' + id}, callback);
    },
	
	getUserByTypeId: function (typeid, callback) {
		var sql = 'select role_id from ' + table + ' where failure_type=' + typeid;
		sql = ' select * from user_list where role_id in (' + sql + ') ';
		conn.query(sql, callback); 
	}
}