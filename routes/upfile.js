
/*
 * GET users listing.
 */

var fs = require('fs');
var crypto = require('crypto');


exports.upfile = function(req, res) {
	var path = req.files.upfile.path;
	var dir = req.body.dir;
	
	var newdir = dir || 'upfiles';
    var filename = req.files.upfile.name.split('/').pop();
    var ext = filename.split('.').pop();
    filename = [new Date().getTime(), Math.ceil(Math.random() * 100000)].join('');
    var md5 = crypto.createHash('md5');
    filename = md5.update(filename).digest('base64');
    filename = filename.replace(/[\/\\\.\$]/g, '');
    filename = filename + '.' + ext;
    console.log(filename)
    newdir += '/';
	var newpath = newdir + filename;
	// console.log(tmpfilename);
	// console.log(newdir);
	// res.send(newdir);
	console.log("newdir", newdir);
	console.log("newpath", newpath);

    var upfile = function(err) {
        if (err) {
            console.log('mkdirerr', err);
            return;
        }
        
        fs.rename(path, newpath, function(err) {
            if (err) {
                console.log('err', err);
                return;
            }
            
            fs.unlink(path, function(err) {
                if (err) 
                    return;
                console.log('del success');
            });

        });
    };
	if (!fs.existsSync(newdir)) {   
        fs.mkdir(newdir, 0755, upfile);
    }
    else {
        upfile(null);
    }
    console.log('-------');
    console.log("[/" + newpath + ']');
    var jsonstr = JSON.stringify({code: 0, url: '/upfiles/' + filename});
    console.log(jsonstr);
	res.end('<script>;frameElement.callback(' + jsonstr + ');</script>');
};