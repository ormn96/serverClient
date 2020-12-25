let express = require('express');
let port = process.env.PORT || 3000;
let app = express();

const {Pool, Client} = require('pg')
const connectionString = 'postgres://abpqsvrhxskjrr:02d82386ab2e881c39b2aa7b1861d3caff197f7965f927f81fb354d19887713a@ec2-176-34-123-50.eu-west-1.compute.amazonaws.com:5432/ddlsie8d46flhp'

const client = new Client({
  connectionString:connectionString
})

client.connect()


client.query('select * from links', (err, res)=>{
  console.log(err, res)
  client.end()
})



app.get('/', (req, res) => {
	res.sendFile(__dirname + '/mainPage.html');
});

app.listen(port, () => {
	console.log('App listening on port %d!', port);
});