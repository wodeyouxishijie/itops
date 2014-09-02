var util = require('../mysql/util.js');
var conn = require('../mysql/conn.js');
var async = require('async');

module.exports = {
    setRole: function (data, callback) {
        if (typeof data.id == 'undefined') {
            util.insert('role_list', data, callback);
        } 
        else {
            data.where = ' id=' + data.id;
            delete data.id;
            util.update('role_list', data, callback);
        }
    },
    
    getRole: function (data, callback) {
        util.select('role_list', data || {}, callback);
    },
    
    delRole: function (id, callback) {
        util.delete('role_list', {where: ' id=' + id}, callback);
    },
    
    addMenu: function (role_id, menu_list, callback) {
        var sql = 'select * from role_list where id=?';
        conn.query ( sql, [role_id], function (err, rst) {
            if (rst.length == 0) {
                callback ({code: -1});
                return;
            }
            var str = rst[0].power;
            var rstr = str + ',' + menu_list;
            var sql = "update role_list set power=? where id=?";
            conn.query(sql, [rstr, role_id], callback);
        });
    },
    
    addMenuUser: function(user_id, menu_list, callback) {
        var sql = 'select * from role_list where id in (select role_id from user_list where user_id=?)';
        conn.query ( sql, [user_id], function (err, rst) {
            if (rst.length == 0) {
                callback ({code: -1});
                return;
            }
            var str = rst[0].power;
            var rstr = str + '_' + menu_list;
            var sql = "update role_list set power=? where id=?";
            conn.query(sql, [rstr, rst[0].id], callback);
        })
    },
    
    queryRoleInfo: function (ids, callback) {
        var sql = 'select * from role_list where id in (' + ids + ')';
        conn.query ( sql, function (err, rst) {
            if (err) {
                console.log(err);
            }
            else {
                if (rst.length == 0) {
                    callback ({code: -1});
                    return;
                }
                callback (null, rst);
            }
        });
    },

    queryUserRoles: function (uid, callback) {
        var sql = 'select role_id from user_list where id=' + uid;
        async.waterfall([
            function (cb) {
                conn.query (sql, cb)
            },
            function (roles, cb) {
                if (roles && roles.length > 0) {
                    var sql = 'select * from role_list where id in (' + roles[0].role_id + ')';
                    conn.query(sql, cb);
                }
                else {
                    cb ({code: -1});
                }
            }
        ], function (e, rst) {
            callback (e, rst);
        });
    }
}