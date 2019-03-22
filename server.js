const express 		= require('express');
const bodyParser 	= require('body-parser');
const cors 			= require('cors');
const knex			= require('knex');
const bcrypt  		= require('bcrypt-nodejs');

const db = knex({
  client: 'pg',
  connection: {
    host : '127.0.0.1',
    user : 'postgres',
    password : '',
    database : 'smart-brain'
  }
});

// db.select('*').from('users').then(data => {
// 	console.log(data);
// });

const app = express();

app.use(bodyParser.json());
app.use(cors());

// // TO DO: Create database for users 
// const database ={
// 	user :[
// 			{
// 				id:'123',
// 				username:'hdragon1501',
// 				email:'hdragon1501@gmail.com',
// 				password:'123456',
// 				entries: 0,
// 				joined: new Date()
// 			},
// 				{
// 				id:'124',
// 				username:'qdragon81',
// 				email:'qdragon81@gmail.com',
// 				password:'quan1997',
// 				entries: 0,
// 				joined: new Date()
// 			}
// 		],
// 	login :[{
// 		id:'987',
// 		hash:'',
// 		email:'hdragon1501@gmail.com'
// 	}]

// }

// TO DO: The server is shown that it is working 
app.get('/',(req, res)=>{
	res.send(database.user);
});
app.get('/profile/:id', (req, res)=>{
	const {id} = req.params;

	db.select('*').from('users').where({
		id: id
	}).then(user =>{
		res.json(user[0]);
	});

	// res.status(404).json("Not found");

});


// TO DO: User sign in to database 
app.post('/signin', (req, res) => {
	const {email, password} = req.body;

	db.select('email','hash').from('login')
	  .where('email','=',email)
	  .then(data =>{
	  		if(bcrypt.compareSync(password, data[0].hash)){
	  			return db.select('*').from('users')
	  			  .where('email','=',email)
	  			  .then(user =>{
	  			  	res.json(user[0]);
	  			  })
	  			  .catch(err =>console.log(err));
	  			  
	  		}else{
	  			return res.status(400).json('error');
	  		}

	  })
	  .catch(err =>{
	  	res.status(404).json('fail');
	  });

});

// TO DO : User posts a image
app.put('/image',(req, res)=>{
	const {id} = req.body;
	db('users').where('id','=',id)
	.increment('entries',1)
	.returning('entries')
	.then(entries =>{
		res.json(entries[0]);
	}).catch(err => res.status(400).json('unable to increase entries'));
}); 


// TO DO: User register
app.post('/register', (req, res)=>{
	const {email, username, password} = req.body;

	const hash = bcrypt.hashSync(password);
	db.transaction(trx => {
		trx.insert({
			hash : hash,
			email :email		
		})
		.into('login')
		.returning('email')
		.then(loginEmail => {
			return trx('users')
				.returning('*')
				.insert({
					email: loginEmail[0],
					name : username,
					joined : new Date()
				}).then(user =>{
					res.json(user[0]);
				})
		})
		.then(trx.commit)
		.catch(trx.rollback)
	})
	.catch(err =>{
		res.json('unable to register');
	})
});


app.listen(process.env.PORT || 3001,()=>{
	console.log(`server is running..${process.env.POST}`);
});

/* --> res = this is working
/signin --> POST = success/fail
/register --> POST = user
/profile/:userId --> GET = user
/image --> PUT --> user
*/