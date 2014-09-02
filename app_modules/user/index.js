var util = require('../mysql/util.js');
var conn = require('../mysql/conn.js');

var table = 'user_list';

function buildData (data) {
    var o = {};
        
    for (var i in data) {
        if (',id,user_id,name,nick,pwd,type,user_status,ext1,cnname,role_id,dept_id,menu_id,jobs,gender,telno,qq,oldpwd,'.indexOf(',' + i + ',') > -1) {
            o[i] = data[i];
        }
    }
    return o;
}

module.exports = {
    setUser: function (data, callback) {
        data = buildData(data);
        if (typeof data.id == 'undefined') {
            util.insert(table, data, callback);
        } 
        else {
            console.log(data);
            var oldpwd = data.oldpwd ;
            oldpwd && delete data.oldpwd;
            data.where = ' id=' + data.id + ' and ' + (oldpwd && (' pwd=\'' + oldpwd + '\' ') || ' 1=1 ');
            delete data.id;
            util.update(table, data, callback);
        }
    },
    
    getUser: function (data, callback) {
        var sql = 'select a.*,'
        + ' b.id as deptid,b.name as deptname,c.id as roleid,c.name as rolename from ' + table + ' a '
        + ' left join dept_list b on a.dept_id=b.id '
        + ' left join role_list c on a.role_id=c.id '
        + ' where ' + (data.where || ' 1=1 ');
//        console.log(sql);
        conn.query(sql, callback);
//        util.select(table, {}, callback);
    },
    
    delUser: function (id, callback) {
        util.delete(table, {where: ' id=' + id}, callback);
    },
    
    getUserInfo: function (ids, callback) {
        var sql = 'select * from user_list where id in (' + ids.join(',') + ') ';
        conn.query(sql, callback);
    }
}