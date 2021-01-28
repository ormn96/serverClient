
const crypto 		= require('crypto');
const moment 		= require('moment');
const MongoClient 	= require('mongodb').MongoClient;
var PM = require('./promo-manager');
var EM = require('./email-dispatcher').EM;
var db, accounts;

// MongoClient.connect(process.env.DB_URL, { useNewUrlParser: true, useUnifiedTopology: true }, function(e, client) {
// 	if (e){
// 		console.log(e);
// 	}	else{
// 		db = client.db(process.env.DB_NAME);
// 		accounts = db.collection('accounts');
// 	// index fields 'user' & 'email' for faster new account validation //
// 		accounts.createIndex({user: 1, email: 1});
// 		console.log('mongo :: connected to database :: "'+process.env.DB_NAME+'"');
// 	}
// });

const uri = "mongodb+srv://admin:admin@gody.0onor.mongodb.net/test?retryWrites=true&w=majority";
const client = new MongoClient(uri, { useNewUrlParser: true , useUnifiedTopology: true });
client.connect(err => {
	if (err){
				console.log(err);
			}	else{
				db = client.db(process.env.DB_NAME);
				accounts = db.collection('accounts');
				accounts.createIndex({email: 1});
				console.log('mongo :: connected to database :: "'+process.env.DB_NAME+'"');
			}
		});

const guid = function(){return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {var r = Math.random()*16|0,v=c=='x'?r:r&0x3|0x8;return v.toString(16);});}

/*
	login validation methods
*/
exports.checkMail = function(email,  callback)
{
	accounts.findOne({email:email}, function(e, o) {
		if (o){
			callback(false)
		}	else{
			callback(true);
		}
	});
}
exports.autoLogin = function(email, pass, callback)
{
	accounts.findOne({email:email}, function(e, o) {
		if (o){
			o.pass == pass ? callback(o) : callback(null);
		}	else{
			callback(null);
		}
	});
}

exports.manualLogin = function(email, pass, callback)
{
	accounts.findOne({email:email}, function(e, o) {
		if (o == null){
			callback('user-not-found');
		}	else{
			validatePassword(pass, o.pass, function(err, res) {
				if (res){
					callback(null, o);
				}	else{
					callback('invalid-password');
				}
			});
		}
	});
}

exports.generateLoginKey = function(email, ipAddress, callback)
{
	let cookie = guid();
	accounts.findOneAndUpdate({email:email}, {$set:{
		ip : ipAddress,
		cookie : cookie
	}}, {returnOriginal : false}, function(e, o){ 
		callback(cookie);
	});
}

exports.validateLoginKey = function(cookie, ipAddress, callback)
{
// ensure the cookie maps to the user's last recorded ip address //
	accounts.findOne({cookie:cookie, ip:ipAddress}, callback);
}

exports.generatePasswordKey = function(email, ipAddress, callback)
{
	let passKey = guid();
	accounts.findOneAndUpdate({email:email}, {$set:{
		ip : ipAddress,
		passKey : passKey
	}, $unset:{cookie:''}}, {returnOriginal : false}, function(e, o){
		if (o.value != null){
			callback(null, o.value);
		}	else{
			callback(e || 'account not found');
		}
	});
}

exports.validatePasswordKey = function(passKey, ipAddress, callback)
{
// ensure the passKey maps to the user's last recorded ip address //
	accounts.findOne({passKey:passKey, ip:ipAddress}, callback);
}

/*
	record insertion, update & deletion methods
*/

exports.addNewAccount = function(newData, callback)
{
	accounts.findOne({email:newData.email}, function(e, o) {
		var found = true
		if (o){
			callback('email-taken');
		}	else{
			if(newData.promo && newData.promo != ''){
				PM.getPromo(newData.promo,function (e,o) {
					if (e!=null){
						callback('promo-code-not-exists')
						found = false
					}
				})
			}
			if(found){
				saltAndHash(newData.pass, function(hash){
					newData.pass = hash;
				// append date stamp when record was created //
					newData.date = moment().format('MMMM Do YYYY, h:mm:ss a');
					accounts.insertOne(newData, callback);
				});
			}			
		}
	});
}
exports.updateMail = function(newData, callback)
{
	var o = {
		email : data.email
	}
	accounts.findOneAndUpdate({_id:getObjectId(data.id)}, {$set:o}, {returnOriginal : false}, callback);
}
exports.updateAccount = function(newData, callback)
{
	let findOneAndUpdate = function(data){
		var o = {
			name : data.name,
			lastName: data.lastName,
			email : data.email,
			promo : data.promo,
			phone : data.phone,
			country : data.country,
			city : data.city,
			street : data.street,
			zipCode : data.zipCode
		}
		if (data.pass) o.pass = data.pass;
		accounts.findOneAndUpdate({_id:getObjectId(data.id)}, {$set:o}, {returnOriginal : false}, callback);
	}
	//TODO check promo
	if(newData.promo != ''){
		PM.getPromo(newData.promo,function (e,o) {
			if (e!=null){
				callback('promo-code-not-exists')
				return
			}
		})
	}
	findOneAndUpdate(newData);
}

exports.updatePasswordRequest = function(id, oldPass, newPass, callback)
{
	accounts.findOne({_id:getObjectId(id)},function(e,res){
		if(res){
			validatePassword(oldPass,res.pass,function(e,result){
				if(result){
					saltAndHash(newPass, function(hash){
						newData.pass = hash;
						var o = {
							pass: newPass
						}
						accounts.findOneAndUpdate({_id:getObjectId(data.id)}, {$set:o}, {returnOriginal : false}, callback);
					});
				}else{
					callback('password-not-match')
				}
			})
			
		}else{
			callback('error-getting-pass')
		}
		
	})
	
	
}

exports.updatePassword = function(passKey, newPass, callback)
{
	saltAndHash(newPass, function(hash){
		newPass = hash;
		accounts.findOneAndUpdate({passKey:passKey}, {$set:{pass:newPass}, $unset:{passKey:''}}, {returnOriginal : false}, callback);
	});
}

/*
	account lookup methods
*/

exports.getAllRecords = function(callback)
{
	accounts.find().toArray(
		function(e, res) {
		if (e) callback(e)
		else callback(null, res)
	});
}

exports.deleteAccount = function(id, callback)
{
	accounts.deleteOne({_id: getObjectId(id)}, callback);
}

exports.deleteAllAccounts = function(callback)
{
	accounts.deleteMany({}, callback);
}

/*
	private encryption & validation methods
*/

var generateSalt = function()
{
	var set = '0123456789abcdefghijklmnopqurstuvwxyzABCDEFGHIJKLMNOPQURSTUVWXYZ';
	var salt = '';
	for (var i = 0; i < 10; i++) {
		var p = Math.floor(Math.random() * set.length);
		salt += set[p];
	}
	return salt;
}

var md5 = function(str) {
	return crypto.createHash('md5').update(str).digest('hex');
}

var saltAndHash = function(pass, callback)
{
	var salt = generateSalt();
	callback(salt + md5(pass + salt));
}

var validatePassword = function(plainPass, hashedPass, callback)
{
	var salt = hashedPass.substr(0, 10);
	var validHash = salt + md5(plainPass + salt);
	callback(null, hashedPass === validHash);
}

var getObjectId = function(id)
{
	return new require('mongodb').ObjectID(id);
}

var listIndexes = function()
{
	accounts.indexes(null, function(e, indexes){
		for (var i = 0; i < indexes.length; i++) console.log('index:', i, indexes[i]);
	});
}

