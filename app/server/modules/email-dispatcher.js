
var EM = {};
exports.EM = EM;
var nodemailer = require('nodemailer');

EM.transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      secure: false,
      auth: {
            user: 'g1.gonature',
            pass: 'Aa123456!'
      }
});
// EM.server = require("emailjs/email").server.connect(
// {
// 	host 	    : 'smtp.gmail.com',
// 	user 	    : 'g1.gonature',
// 	password    : 'Aa123456!',
// 	ssl		    : true
// });

EM.dispatchResetPasswordLink = function(account, callback)
{
	EM.transporter.sendMail({
		from         : process.env.NL_EMAIL_FROM || 'Node Login <do-not-reply@gmail.com>',
		to           : account.email,
		subject      : 'Password Reset',
		text         : 'something went wrong... :(',
		html	     : EM.composeResetPasswordEmail(account)
	}, callback );
}

EM.composeResetPasswordEmail = function(o)
{
	let baseurl = process.env.NL_SITE_URL || 'http://localhost:3000';
	var html = "<html><body>";
		html += "Hi "+o.name+' '+o.lastName+",<br><br>";
		html += "<a href='"+baseurl+'/reset-password?key='+o.passKey+"'>Click here to reset your password</a><br><br>";
		html += "Cheers,<br>";
		html += "</body></html>";
	//return [{data:html, alternative:true}];
	return html
}

EM.dispatchResistrationLink = function(account,link, callback)
{
	EM.transporter.sendMail({
		from         : process.env.NL_EMAIL_FROM || 'Node Login <do-not-reply@gmail.com>',
		to           : account.email,
		subject      : 'new account',
		text         : EM.composeEmailResister(account,link),
		html   		 : EM.composeEmailResister(account,link)
	}, callback );
}
EM.composeEmailResister = function(o,link)
{
	let baseurl = process.env.NL_SITE_URL || 'http://localhost:3000';
	var html = "<html><body>";
		html += "Hi "+o.name+' '+o.lastName+",<br><br>";
		html += "<a href='"+baseurl+link+"'>Click here to compleate your registration</a><br><br>";
		html += "Cheers,<br>";
		html += "</body></html>";
		return html
}


EM.dispatchMailVerificationMail = function(account,link, callback)
{
	EM.transporter.sendMail({
		from         : process.env.NL_EMAIL_FROM || 'Node Login <do-not-reply@gmail.com>',
		to           : account.email,
		subject      : 'new account',
		text         : EM.composeEmailMailVerification(account,link),
		html   		 : EM.composeEmailMailVerification(account,link)
	}, callback );
}
EM.composeEmailMailVerification = function(o,link)
{
	let baseurl = process.env.NL_SITE_URL || 'http://localhost:3000';
	var html = "<html><body>";
		html += "Hi "+o.name+' '+o.lastName+",<br><br>";
		html += "<a href='"+baseurl+link+"'>Click here to verify your email</a><br><br>";
		html += "Cheers,<br>";
		html += "</body></html>";
		return html
}
