
const MongoClient 	= require('mongodb').MongoClient;

var db, promos;
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
				promos = db.collection('PromoCode');
				promos.createIndex({promoCode:1});
				console.log('mongo :: connected to database :: "'+process.env.DB_NAME+'"');
			}
		});

exports.getPromo = function(code, callback)
{
	promos.findOne({promoCode:code}, function(e, o) {
		if (o == null){
			callback('promo-code-not-found');
		}	else{
			callback(null, o);
		}
	});
}


exports.addPromo = function(newData, callback)
{
	promos.findOne({promoCode:newData.promoCode}, function(e, o) {
		if (o){
			callback('existing-promo-code');
		}	else{
			promos.insertOne(newData, callback);
		}
	});
}

exports.getAllRecords = function(callback)
{
	promos.find().toArray(
		function(e, res) {
		if (e) callback(e)
		else callback(null, res)
	});
}

exports.deleteAccount = function(id, callback)
{
	promos.deleteOne({_id: getObjectId(id)}, callback);
}

exports.deleteAllAccounts = function(callback)
{
	promos.deleteMany({}, callback);
}
