var nodemailer = require("../../node_modules/nodemailer");


module.exports = {
    send: function (opt, callback) {
        if (!opt.to ) {
            return;
        }
        var transport = nodemailer.createTransport("SMTP", {
            host: "smtp.qq.com",
            secureConnection: true, // use SSL
            port: 465, // port for secure SMTP
            auth: {
                user: "2016788920@qq.com",
                pass: "abc12345"
            }
        });
        
        transport.sendMail({
            from : "2016788920@qq.com",
            to : opt.to,//"390498257@qq.com",
            subject: opt.subject,
            generateTextFromHTML : true,
            html : opt.html + '，该邮件系统自动发送，请勿回复！'
        }, function(error, response){
            if(error){
                console.log(error);
            }else{
                typeof callback == 'function' && callback();
                console.log("Message sent: " + response.message);
            }
            transport.close();
        });
    }
}