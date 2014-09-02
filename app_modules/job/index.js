var util = require('../mysql/util.js');
module.exports = {
    set: function (data, callback) {
        if (typeof data.id == 'undefined') {
            util.insert('role_list', data, callback);
        } 
        else {
            data.where = ' id=' + data.id;
            delete data.id;
            util.update('role_list', data, callback);
        }
    },
    
    get: function (data, callback) {
        util.select('role_list', {}, callback);
    },
    
    del: function (id, callback) {
        util.delete('role_list', {where: ' id=' + id}, callback);
    }
}