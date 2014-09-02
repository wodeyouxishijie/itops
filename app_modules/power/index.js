var conn = require('../mysql/conn.js');
var aysnc = require('../../node_modules/async');
var TAG = 'power';

module.exports = {
    setMenuPower: function (user_id, menu_id, callback) {
        // 先检查是否已经拥有权限
        
        var getCount = function (cb) {
            var sql = "select * from user_menu where user_id=(select id from user_list where user_id='" + user_id + "') and menu_id=" + menu_id;
            conn.query(sql, function (err, rst) {
                if (err) {
                    console.error(TAG, err)
                }
                else {
                    cb(err, rst);
                }
            });
        };
                       
        var getUserID = function (cb) {
            var sql = "select id from user_list where user_id='" + user_id + "'";
            conn.query(sql, function (err, rst) {
                if (err) {
                    console.error(TAG, err)
                }
                else {
                    cb(err, rst);
                }
            });  
        }
        
        var insertUserMenu = function (uid, cb) {
            sql = 'insert into user_menu(user_id, menu_id) values (' + uid + ',' + menu_id + ')';
            conn.query(sql, function (insert_err, insert_rst) {
                if (insert_err) {
                    console.error(TAG, insert_err)
                }
                else {
                    callback(insert_rst);
                }
            });
        };
        
        
        async.series([
            function(cb) { 
                getCount(function(err,v1) {
             // do something with v1
                    console.log('v1', v1);
                    console.log('cb1', cb.toString());
                    cb(err, v1);
                });
            },
            function(cb) { 
                getUserID(function (err, rst) {
                    cb(err, rst);
                });
            },
            function(uid, cb) {
                insertUserMenu(uid, function () {
                    
                });
            }
        ], function(err, values) {
        // do somethig with the err or values v1/v2/v3
            console.log(err, values);
        });
                    
        getCount(function (err, rst) {
            if (rst.length == 0) {
                getUserID(function (err, rst1) {
                    insertUserMenu(rst1[0].id, function () {
                        
                    }); 
                });
                
            }
        });
        
        
//        async.series ([
//            function (callback) {
//                
//            },    
//            function () {
//                sql = 'insert into user_menu(user_id, menu_id) values (' + user_id + ',' + menu_id + ')';
//                conn.query(sql, function (insert_err, insert_rst) {
//                    if (insert_err) {
//                        console.error(TAG, insert_err)
//                    }
//                    else {
//                        callback(insert_rst);
//                    }
//                }
//            }
//        ], function (err, rst) {
//            
//        });
    }
};