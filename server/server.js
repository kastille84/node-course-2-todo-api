require('./config/config');

const express = require('express');
const bodyParser = require('body-parser');
const __ = require('lodash');

var {ObjectID} = require('mongodb');
var {mongoose}= require('./db/mongoose');
var {Todo} = require('./models/todo');
var {User} = require('./models/user');
var {authenticate} = require('./middleware/authenticate');

var app = express();
const port = process.env.PORT;

app.use(bodyParser.json());

app.post('/todos', (req, res) => {
	var todo = new Todo({
		text: req.body.text
	});

	todo.save().then((doc) => {
		res.send(doc);
	}, (e)=> {
		res.status(400).send(e);
	});
});

app.get('/todos', (req, res) => {
	Todo.find().then(
		(todos) => {
			res.send( {
				todos: todos
			});
		},
		(e) => {
			res.status(400).send(e);
		}
	);
});

// GET /todos/1234
app.get('/todos/:id', (req, res) => {
	// get id
	var id = req.params.id;
	// validate it
	if (!ObjectID.isValid(id)) {
		return res.status(404).send();
	}
	// query mongoose with id
	Todo.findById(id).then( (todo) => {
		if (!todo) {
			return res.status(404).send();
		}
		return res.status(200).send({
					todo: todo,
					message: "Todo was found" 
				});
	}).catch((e) => {
		res.status(400).send();
	});
});

// DELETE /todos/1234
app.delete('/todos/:id', (req, res) => {
	var id = req.params.id;
	//validate id
	if (!ObjectID.isValid(id)) {
		return res.status(404).send();
	}

	Todo.findByIdAndRemove(id).then((todo) => {
		if (!todo) {
			return res.status(404).send();
		}
		return res.status(200).send({todo});
	}).catch( (e) => {
		res.status(404).send();
	});

});

app.patch('/todos/:id', (req, res) => {
	var id = req.params.id;
	var body = __.pick(req.body, ['text', 'completed']);

	if(!ObjectID.isValid(id)) {
		return res.status(404).send();
	}

	if(__.isBoolean(body.completed) && body.completed) {
		body.compleatedAt = new Date().getTime();

	}else {
		body.completed = false;
		body.completedAt = null;
	}

	Todo.findByIdAndUpdate(id, {
		$set: body}, {new: true}).then( (todo) => {
			if (!todo) {
				return res.status(404).send();
			}
			res.status(200).send({todo});

		}).catch( (e) => {
			res.status(400).send();
		});
});

// POST /users
app.post('/users', (req, res) => {
	var body = __.pick(req.body, ['email', 'password']);
	var user = new User({
		email: body.email,
		password: body.password
	});



	user.save().then( () => {
		return user.generateAuthToken();
	})
	.then( (token) => {
		res.header('x-auth',token).send(user)
	})
	.catch( (e) => {
		res.status(400).send(e);
	});

});

app.get('/users/me', authenticate, (req, res) => {
	res.send(req.user);
});

// Route for loggin | Post /users/login  {email, password}
app.post("/users/login", (req, res) => {
	var body = __.pick(req.body, ['email','password']);

	User.findByCredentials(body.email, body.password).then( (user) => {
		//we have the user
		return user.generateAuthToken().then( (token) => {
			res.header('x-auth', token).send(user);
		});
		
	}).catch( (e) => {
		// not able to login
		res.status(400).send();
	});
});

app.listen(port, () => {
	console.log(`Started up on port ${port}`);
});

module.exports = {
	app
};
