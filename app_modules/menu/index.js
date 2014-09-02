var conn = require('../mysql/conn.js');
var TAG = 'menu';
module.exports = {
    getMenu: function (user_id, role_id, callback) {
        var sql = 'select a.name as menuname,a.id as menuid,a.parent as menuparent,a.note as menunote,a.href as menulink from menu_list a'
        + ' left join user_menu b on a.id=b.menu_id'
        + ' left join user_list c on b.id=c.id';
        
//        var sql = "select power from role_list where id in (select role_id from user_list where user_id=?)";
        var sql = "select power from role_list where id=" + role_id;
//        + ' where c.user_id=?';
        if (user_id == 'all') {
            sql = "select a.name as menuname,a.id as menuid,a.parent as menuparent,a.note as menunote,a.href as menulink from menu_list a";
//            console.log(sql);
            conn.query(sql, [], function (menuerr, menulist) {
                callback(null, menulist);
            });
        }
        else {
//			console.log('user_id', user_id);
            conn.query(sql, [user_id], function (err, rst) {
                if(err){
                    callback(err, null);
                }else {
                    var powers = [];
                    for (var i = 0; i < rst.length; i++) {
                        powers.push(rst[i].power.replace(/_/g, ','));
                    }
                    var sql = "select a.name as menuname,a.id as menuid,a.parent as menuparent,a.note as menunote,a.href as menulink from menu_list a"
                    + " where id in (" + powers.join(',') + ')';
//                    console.log(sql);
                    conn.query(sql, [], function (menuerr, menulist) {
                        callback(null, menulist);
                    });
                }
            });
        }
    },
    
    setMenu: function (data, callback) {
        var optype = 'insert';
        if (typeof data.id != 'undefined') {
            optype = 'update';
        }
        if (optype == 'insert') {
            sql = "insert into menu_list (name,href,parent,note) values ('" + data.name + "','" + data.link + "','" + data.parent + "','" + data.note + "')";
        }
        else if (optype == 'update') {
           sql = "update menu_list set name=?,href=?,parent=?,note=? where id=?"; 
        }
        console.log(TAG + '11111', sql);
        conn.query(sql, [data.name, data.link, data.parent, data.note,data.id], function (err, rst) {
            console.log(TAG, err, rst);
            if(err){
                callback(err, null);
            }else{
                if (optype == 'insert') {
//                    conn.query (sql)
                }
                callback(null, rst);
            }
        });
    },
    
    getTopMenu: function (user_id, callback) {
        var sql = 'select * from menu_list where parent in (select a.id from menu_list a'
        + ' left join user_menu b on a.id=b.menu_id '
        + ' left join user_list c on b.id=c.id '
        + ' where a.parent=0)';
        conn.query(sql, [user_id], function (err, rst) {
            console.log(TAG, rst);
            if(err){
                callback(err, null);
            }else{
                callback(null, rst);
            }
        });
    },
    
    delMenu: function (id, callback) {
        function findChildAndDel(pid) {
            var sql = 'select id from menu_list where parent=' + pid;
            conn.query(sql, function (err, rst) {
                if (err) {
                    
                }
                else {
                    if (rst.length > 0) {
                        for (var i = 0; i < rst.length; i++) {
                            var sql = 'delete from menu_list where id=' + rst[i].id;
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
        
        var sql = 'delete from menu_list where id=?';
        conn.query(sql, [id, id], function (err, rst) {
            console.log(TAG, rst);
            if(err){
                callback(err, null);
            }else{
                callback(null, rst);
            }
        });
    }
}