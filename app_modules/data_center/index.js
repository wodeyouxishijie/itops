module.exports = (function () {
    var obj = {};
    return {
        set: function (k, v) {
            obj[k] = v;
        },
        
        get: function (k) {
            return obj[k];
        }
    };
}) ();