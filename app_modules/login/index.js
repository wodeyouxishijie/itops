var conn = require('../mysql/conn.js');
var crypto = require('crypto');

var TAG = 'login'
module.exports = {
    doLogin: function (user_id, pwd, callback) {
        var sql = 'select * from user_list where user_id=? and pwd=?';
//        console.log(user_id, pwd);
        conn.query(sql, [user_id, pwd], function (err, rst) {
            if(err){
                callback(err);
            }else{
                callback(err, rst);
            }
//            conn.end();
        });
    },
    
    check: function (user_id) {
        return false;
    },
    
    creatSign: function (user_id, callback) {
        var sql = 'select * from user_list where user_id=?';
        conn.query(sql, [user_id], function (err, rst) {
            if(err){
                callback(err);
            }else{
//                console.log('md4', crypto.md5('sdfasdfasdf'));
                var hash  = crypto.createHash('md5');
                var str = hash.update('!@#' + user_id + rst[0].pwd).digest('base64');
//                console.log(str);
                callback(str);
            }
//            conn.end();
        });
    },
    
    createCsrfCode: function (user_id, callback) {
        var sql = 'select * from user_list where user_id=?';
        conn.query(sql, [user_id], function (err, rst) {
            if(err){
                callback(err);
            }else{
                var hash  = crypto.createHash('md5');
                var str = hash.update('csrf:' + user_id + rst[0].pwd).digest('base64');
                callback(str);
            }
//            conn.end();
        });
    }
}