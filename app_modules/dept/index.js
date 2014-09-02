var conn = require('../mysql/conn.js');
var aysnc = require('../../node_modules/async');
var TAG = 'dept';

module.exports = {
    getDept: function (cond, callback) {
        var sql = 'select a.*,b.user_id as leader1_user_id,b.cnname as leader1_cnname,b.id as leader1_id,c.user_id as leader2_user_id,c.cnname as leader2_cnname,c.id as leader2_id from dept_list a left join user_list b on a.leader1=b.id left join user_list c on a.leader2=c.id '
//        + ' where c.user_id=?';
        console.log(sql);
        conn.query(sql, function (err, rst) {
            if(err){
                callback(err, null);
            }else{
                callback(null, rst);
            }
        });
    },
    
    setDept: function (data, callback) {
        var sql = 'select * from dept_list '
        var optype = data.id ? 'update': 'insert';
        
        if (optype == 'insert') {
            sql = "insert into dept_list (name,codes,parent,tel1,tel2,fax,ext,leader1,leader2) values ('" + data.name + "','" + data.codes + "','" + (data.parent || 0) + "','" + data.tel1 + "','" + data.tel2 + "','" + data.fax + "','" + data.ext + "'," + (data.leader1 ||0) + "," + (data.leader2||0) + ")";
        }
        else if (optype == 'update') {
           sql = "update dept_list set name=?,codes=?,parent=?,tel1=?,tel2=?,fax=?,ext=?,leader1=?,leader2=? where id=?"; 
        }
        conn.query(sql, [data.name, data.codes, data.parent, data.tel1, data.tel2, data.fax,data.ext,data.leader1,data.leader2,data.id], function (err, rst) {
            if(err){
                console.log(err);
                callback(err, null);
            }else{
                if (optype == 'insert') {
//                    conn.query (sql)
                }
                callback(null, rst);
            }
        });
    },
    
    delDept: function (id, callback) {
        function findChildAndDel(pid) {
            var sql = 'select id from dept_list where parent=' + pid;
            conn.query(sql, function (err, rst) {
                if (err) {
                    
                }
                else {
                    if (rst.length > 0) {
                        for (var i = 0; i < rst.length; i++) {
                            var sql = 'delete from dept_list where id=' + rst[i].id;
                            conn.query(sql, function (err1, rst1) {
                                if (err1) {
                                    
                                }
                                else {
                                    rst1.length && findChildAndDel(rst1[i].id);
                                }
                            });
                            
                        }
                    }
                }
            });
        }
        
        
        findChildAndDel(id);
        
        var sql = 'delete from dept_list where id=?';
        conn.query(sql, [id, id], function (err, rst) {
            console.log(TAG, rst);
            if(err){
                callback(err, null);
            }else{
                callback(null, rst);
            }
        });
    }
};