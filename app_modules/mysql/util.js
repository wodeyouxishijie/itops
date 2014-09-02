var conn = require('./conn.js');

module.exports = {
    // data 
    //      {fields: [], where: ''}
    select: function (table, data, callback) {
        var sql = ['select '];
        if (!data.fields) {
            sql.push(' * ');
        }
        else {
            var fd = [];
            for (var i = 0; i < data.fields.length; i++) {
                fd.push(data.fields[i]);
            }
            sql.push(fd.join(','))
        }
        sql.push(' from ', table, ' where ' + (data.where || '1=1') );
//        console.log(sql.join(''));
        conn.query(sql.join(''), callback);
    },
    
    insert: function (table, data, callback) {
        var sql, fields = [], values = [];
        for (var i in data) {
            values.push(data[i] || '');
            fields.push(i + '=?');
//            sql.push(i, '=?', ',');
        }
        sql = ['insert into ', table, ' set '].join('') + fields.join(',');
//        console.log(sql, values);
        conn.query(sql, values, callback); 
    },
    
    update: function (table, data, callback) {
        var sql, fields = [], values = [], condition;
        for (var i in data) {
            if (i == 'where') {
                condition = data['where'];
                continue;
            }
            values.push(data[i] || '');
            fields.push(i + "='" + data[i] + "'");
        }
        sql = ['update ', table, ' set '].join('') + fields.join(',') + ' where ' + (condition || ' 1=1');
        conn.query(sql, undefined, callback); 
    },
    
    // data:
    //      {where: ' id = 1'}
    delete: function (table, data, callback) {
        var sql = 'delete from ' + table + ' where ' + (data.where || '1=1');
        conn.query(sql, callback); 
    }
}