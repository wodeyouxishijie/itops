var mysql = require('../../node_modules/mysql');
var config = require ('../../config');
var opt = {};
var conn = {}, poolMap = {};

if (config.env == 'test') {
    opt = {
        host: 'localhost',
        user: 'root',
        dateStrings: true,
        password: '111111',
        database: 'ops_db',
        port: 3306,
        timezone: '+08'
    };
}
else {
    opt = {
        host: '218.75.133.243',
        user: 'jp',
        password: 'jp_cdyy8136',
        database: 'opsdb',
        port: 3306,
        timezone: '+08'
    };
}

conn.query = function (sql, params, callback) {
    var args = arguments, poolKey = opt.host + '_' + opt.port + '_' + opt.database;
    if (!poolMap[poolKey]) {
        poolMap[poolKey] = mysql.createPool(opt);
    }
    var pool = poolMap[poolKey];
    if (pool) {
        pool.getConnection(function (err, connection) {
            if (err) {
                callback(err);
            }
            else {
                if (typeof params == 'function') {
                    callback = params;
                
                    connection.query(sql, function (err, list) {
                        connection.release();
                        if (err) {
                            callback (err)
                        }
                        else {
                            callback(err, list);
                        }
                    });
                }
                else {
                    connection.query(sql, params, function (err, list) {
                        connection.release();
                        if (err) {
                            callback (err)
                        }
                        else {
                            callback(err, list);
                        }
                    });
                }
            }
        });
    }
}
// var conn = getConnection ();
setInterval(function () {
    conn.query(' select 1 ', [], function () {});
}, 1000 * 60 * 10);
module.exports = conn;