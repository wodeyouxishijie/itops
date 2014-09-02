var util = require('../mysql/util.js');
var table = 'score_list';
function buildData (data) {
    var o = {};
        
    for (var i in data) {
        if (',id,mainid,note,grade,typeid,op_user,ext,'.indexOf(',' + i + ',') > -1) {
            o[i] = data[i];
        }
    }
    return o;
}
module.exports = {
    set: function (data, callback) {
        data = buildData(data);
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
        data = data || {};
        data.where = data.where || ' 1=1 ';
        util.select(table, data, callback);
    },
    
    del: function (id, callback) {
        util.delete(table, {where: ' id=' + id}, callback);
    }
}