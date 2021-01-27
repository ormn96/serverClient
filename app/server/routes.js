
 var PM = require('./modules/promo-manager');
 var AM = require('./modules/account-manager');
 var EM = require('./modules/email-dispatcher').EM;
 var urlCrypt = require('url-crypt')('~{ry*I)44==yU/]9<7DPk!Hj"R#:-/Z7(hTBnlRS=4CXF');

module.exports = function(app) {
	var path = require('path');
/*
	login & logout
*/

	app.get('/', function(req, res){
	// check if the user has an auto login key saved in a cookie //
		if (req.cookies.login == undefined){
			res.sendFile(path.join(__dirname,'/../../client/login.html'));
			//res.render('login', { title: 'Hello - Please Login To Your Account' });
		}	else{
	// attempt automatic login //
			AM.validateLoginKey(req.cookies.login, req.ip, function(e, o){
				if (o){
					AM.autoLogin(o.email, o.pass, function(o){
						req.session.user = o;
						res.redirect('/home');
					});
				}	else{
					res.sendFile(path.join(__dirname,'/../../client/login.html'));
				}
			});
		}
	});
	
	app.post('/', function(req, res){
		AM.manualLogin(req.body['email'], req.body['pass'], function(e, o){
			if (!o){
				res.status(400).send(e);
			}	else{
				req.session.user = o;
				if (req.body['remember-me'] == 'false'){
					res.status(200).send(o);
				}	else{
					AM.generateLoginKey(o.user, req.ip, function(key){
						res.cookie('login', key, { maxAge: 900000 });
						res.status(200).send(o);
					});
				}
			}
		});
	});

	app.post('/logout', function(req, res){
		res.clearCookie('login');
		req.session.destroy(function(e){ res.status(200).send('ok'); });
	})
	
/*
	control panel
*/
	
	app.get('/home', function(req, res) {
		if (req.session.user == null){
			res.redirect('/');
		}	else{
			res.sendFile(path.join(__dirname,'/../../client/charts.html'));
			// res.render('home', {
			// 	title : 'Control Panel',
			// 	countries : CT,
			// 	udata : req.session.user
			// });
		}
	});
	
	app.post('/home', function(req, res){
		if (req.session.user == null){
			res.redirect('/');
		}	else{
			AM.updateAccount({
				id		: req.session.user._id,
				name	: req.body['name'],
				lastName: req.body['lastName'],
				email	: req.body['email'],
				promo	: req.body['promo'],
				phone	: req.body['phone'],
				country	: req.body['country'],
				city	: req.body['city'],
				street	: req.body['street'],
				zipCode : req.body['zipCode'],
			}, function(e, o){
				if (e){
					//res.status(400).send('error-updating-account');
					res.status(400).send(e);
				}	else{
					req.session.user = o.value;
					res.status(200).send('ok');
				}
			});
			if(req.body['email']){
				var data = {
					id		: req.session.user._id,
					name	: req.body['name'],
					lastName: req.body['lastName'],
					email	: req.body['email']
				}
				var base64 = urlCrypt.cryptObj(data);
				EM.composeEmailMailVerification(data,'/verifyMail/'+base64)
			}
		}
	});

	app.post('/changePassword', function(req, res){
		if (req.session.user == null){
			res.redirect('/');
		}	else{
			AM.updatePasswordRequest( req.session.user._id,
				req.body['oldPass'],
				 req.body['pass']
			, function(e, o){
				if (e){
					//res.status(400).send('error-updating-account');
					res.status(400).send(e);
				}	else{
					res.status(200).send('ok');
				}
			});
		}
	});

	app.get('/verifyMail/:base64', function(req, res){
		var data;

		try {
			data =  urlCrypt.decryptObj(req.params.base64);
		} catch(e) {
			// The link was mangled or tampered with.  
			return res.status(400).send('Bad request.  Please check the link.');
		}
		AM.updateMail(data
			, function(e){
			if (e){
				console.log(e)
				res.status(400).send(e);
			}	else{
				res.status(200).send('ok');
				
			}
		});
	});

/*
	new accounts
*/

	app.get('/signup', function(req, res) {
		// res.render('signup', {  title: 'Signup', countries : CT });
		res.sendFile(path.join(__dirname,'/../../client/register.html'));
	});

	app.get('/css/sb-admin-2.min.css', function(req, res) {
		res.sendFile(path.join(__dirname,'/../../client/css/sb-admin-2.min.css'));
	});
	
	app.post('/signup', function(req, res){
		var data = {
			name 	: req.body['name'],
			lastName: req.body['lastName'],
			email 	: req.body['email'],
			pass	: req.body['pass'],
			promo : req.body['promo']
		}
		AM.checkMail(data.email,function(state){
			if(state){
				var base64 = urlCrypt.cryptObj(data);
				EM.dispatchResistrationLink(data,'/addAccount/'+base64)
				res.status(200).send('ok');
			}else{
				res.status(400).send('email-taken');
			}
		})
		
	});

	app.get('/addAccount/:base64', function(req, res){
		var data;

		try {
			data =  urlCrypt.decryptObj(req.params.base64);
		} catch(e) {
			// The link was mangled or tampered with.  
			return res.status(400).send('Bad request.  Please check the link.');
		}
		AM.addNewAccount(data
			, function(e){
			if (e){
				console.log(e)
				res.status(400).send(e);
			}	else{
				console.log("success\n"+data)
				//TODO add sucess message
				res.sendFile(path.join(__dirname,'/../../client/login.html'));
				
			}
		});
	});

/*
	password reset
*/

	app.post('/lost-password', function(req, res){
		let email = req.body['email'];
		AM.generatePasswordKey(email, req.ip, function(e, account){
			if (e){
				res.status(400).send(e);
			}	else{
				EM.dispatchResetPasswordLink(account, function(e, m){
			// TODO this callback takes a moment to return, add a loader to give user feedback //
					if (!e){
						res.status(200).send('ok');
					}	else{
						for (k in e) console.log('ERROR : ', k, e[k]);
						res.status(400).send('unable to dispatch password reset');
					}
				});
			}
		});
	});

	app.get('/reset-password', function(req, res) {
		AM.validatePasswordKey(req.query['key'], req.ip, function(e, o){
			if (e || o == null){
				res.redirect('/');
			} else{
				req.session.passKey = req.query['key'];
				res.sendFile(path.join(__dirname,'/../../client/forgot-password.html'));
				// res.render('reset', { title : 'Reset Password' });
			}
		})
	});
	
	app.post('/reset-password', function(req, res) {
		let newPass = req.body['pass'];
		let passKey = req.session.passKey;
	// destory the session immediately after retrieving the stored passkey //
		req.session.destroy();
		AM.updatePassword(passKey, newPass, function(e, o){
			if (o){
				res.status(200).send('ok');
			}	else{
				res.status(400).send('unable to update password');
			}
		})
	});

	app.get('/getPromo', function(req, res) {
		PM.getPromo(req.query['code'],function (e,o) {
			if( e || o==null){
				res.status(400).send('promo-not-found');
			}else{
				res.status(200).send(o);
			}
		})
	});

	app.post('/addPromo', function(req, res) {
		PM.addPromo({
			promoCode: req.body['promoCode'],
			desc: req.body['desc']
		}, function(e){
			if (e){
				res.status(400).send(e);
			}	else{
				res.status(200).send('ok');
			}
		});
	});
	
/*
	view, delete & reset accounts
*/
	
	// app.get('/print', function(req, res) {
	// 	AM.getAllRecords( function(e, accounts){
	// 		res.render('print', { title : 'Account List', accts : accounts });
	// 	})
	// });
	
	app.post('/delete', function(req, res){
		AM.deleteAccount(req.session.user._id, function(e, obj){
			if (!e){
				res.clearCookie('login');
				req.session.destroy(function(e){ res.status(200).send('ok'); });
			}	else{
				res.status(400).send('record not found');
			}
		});
	});
	
	// app.get('/reset', function(req, res) {
	// 	AM.deleteAllAccounts(function(){
	// 		res.redirect('/print');
	// 	});
	// });
	
	app.get('*', function(req, res) { res.render('404', { title: 'Page Not Found'}); });

};
