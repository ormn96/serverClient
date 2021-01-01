let express = require('express');
let port = process.env.PORT || 3000;
let app = express();

const {Pool, Client} = require('pg')
const connectionString = 'postgressql://abpqsvrhxskjrr:02d82386ab2e881c39b2aa7b1861d3caff197f7965f927f81fb354d19887713a@ec2-176-34-123-50.eu-west-1.compute.amazonaws.com:5432/ddlsie8d46flhp'


// let con2 = {
//   connectionString: connectionString,
//   ssl: true
//   };

  
// const pool = new Pool(con2);
// pool.on('connect', () => console.log('connected to db'));

// const client = new Client({
//   connectionString:connectionString
// })

const client = new Client({
    user: "abpqsvrhxskjrr",
    password: "02d82386ab2e881c39b2aa7b1861d3caff197f7965f927f81fb354d19887713a",
    database: "ddlsie8d46flhp",
    port: 5432,
    host: "ec2-176-34-123-50.eu-west-1.compute.amazonaws.com",
    ssl: {
    rejectUnauthorized: false
  }
}); 

client.connect().catch((err)=>{
  console.log(err)
})

client.query('select * from public.links', (err, res)=>{
  if (err) throw err;
  for (let row of res.rows) {
    //console.log(JSON.stringify(row));
    console.log(row.name);
  }
})


app.get('/', (req, res) => {
	res.sendFile(__dirname + '/mainPage.html');
});

app.get('/set', (req, res) => {
  client.query("INSERT INTO public.links VALUES(3,'sadsda','asdasa',null,null)", (err, res2)=>{
    console.log(err ,res2)
  })
  res.sendFile(__dirname + '/mainPage.html');
});

app.listen(port, () => {
	console.log('App listening on port %d!', port);
});


