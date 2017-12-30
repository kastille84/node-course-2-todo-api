const expect = require("expect");
const request = require('supertest');
const {ObjectID} = require('mongodb');

//load in local files
const {app} = require('./../server');
const {Todo} = require('./../models/todo');
const {User} = require('./../models/user');
const {todos, users, populateTodos, populateUsers} = require('./seed/seed');

beforeEach(populateUsers);
beforeEach(populateTodos);

describe('POST /todos', () => {
	// test 1, with correct data everything goes as expected
	it('should create a new todo', (done) => {
		var text = 'Test todo text';

		request(app)
			.post('/todos')
			.send({text: text})
			.expect(200)
			.expect((res) => {
				expect(res.body.text).toBe(text);
			})
			.end((err, res) => {
				if (err) {
					return done(err);
				}

				Todo.find({text: text}).then( (todos) => {
					expect(todos.length ).toBe(1);
					expect(todos[0].text).toBe(text);
					done();
				}).catch((err)=> {
					done(err);
				});
			});
	});

	//test 2, verifies that todo does not get created with bad data
	it('should not create a new todo with invalid data', (done) => {
		
		request(app)
		.post('/todos')
		.send({})
		.expect(400)
		.end( (err, res) => {
			if (err) return done(err);

			Todo.find().then( (todos)=> {
				expect(todos.length).toBe(2);
				done();
			}).catch( (err) => {
				done(err);
			})
		});
	});
});

describe('GET /todos', () => {
	it('should get all todos', (done) => {
		request(app)
		.get('/todos')
		.expect(200)
		.expect((res) => {
			expect(res.body.todos.length).toBe(2);
		})
		.end(done);
	})
});

describe('GET /todos/:id', () => {
	it('should return todo doc', (done)=> {
		request(app)
			.get(`/todos/${todos[0]._id.toHexString()}`)
			.expect(200)
			.expect( (res) => {
				expect(res.body.todo.text).toBe(todos[0].text);
			})
			.end(done);
	});

	// valid id, but not in db
	it('should return 404 if todo not found', (done) => {
		var unfoundId = new ObjectID();
		request(app)
			.get(`/todos/${unfoundId.toHexString()}`)
			.expect(404)
			.end(done);
	});
	// if invalid id, we get 404
	it('should return 404 for non-bject ids', (done) => {
		request(app)
			.get(`/todos/1234`)
			.expect(404)
			.end(done);
	});
});

describe("DELETE /todos/:id", () => {
	it('Should remove a todo', (done) => {
		var hexId = todos[1]._id.toHexString();
		request(app)
			.delete(`/todos/${hexId}`)
			.expect(200)
			.expect( (res) => {
				expect(res.body.todo._id).toBe(hexId);
			})
			.end( (err, res) => {
				if (err) {
					return done(err);
				}

				Todo.findById(hexId).then( (todo) => {
					expect(todo).toNotExist();
					return done();
				}).catch( (e) => {
					return done(e);
				});
			});
	});

	it('Should return 404 if todo not found in db', (done) => {
		var hexId = new ObjectID();
		request(app)
			.delete(`/todos/${hexId}`)
			.expect(404)
			.end(done);
	});

	it('Should return 404 if object id is invalid', (done) => {
		request(app)
			.delete("/todos/1234")
			.expect(404)
			.end(done);
	});

});

describe("PATCH /todos/:id", () => {
	// set text equal to something else
	it('should update todo', (done) => {
		// grab id of first item
		var hexId = todos[0]._id.toHexString();
		var text = 'This should be the new text';
		// make patch request
		request(app)
			.patch(`/todos/${hexId}`)
			.send({
				completed: true,
				text: text
			})
			.expect(200)
			.expect( (res) => {
				expect(res.body.todo.text).toBe(text);
				expect(res.body.todo.completed).toBe(true);
				expect(res.body.todo.completedAt).toBeA("number");
			})
			.end(done);

	});

	it('should clear completedAt when todo is not completed', (done) => {
		// grab id of first item
		var hexId = todos[1]._id.toHexString();
		var text = 'This should be the new text!!!';
		// make patch request
		request(app)
			.patch(`/todos/${hexId}`)
			.send({
				completed: false,
				text: text
			})
			.expect(200)
			.expect( (res) => {
				expect(res.body.todo.text).toBe(text);
				expect(res.body.todo.completed).toBe(false);
				expect(res.body.todo.completedAt).toNotExist();
			})
			.end(done)
	});
});

describe('GET /users/me', () => {
	//test 1, when we provid valide auth token
	it('should return user if authenticated', (done) => {
		request(app)
			.get('/users/me')
			.set('x-auth', users[0].tokens[0].token)
			.expect(200)
			.expect( (res) => {
				expect(res.body._id).toBe(users[0]._id.toHexString());
				expect(res.body.email).toBe(users[0].email);
			})
			.end(done);
	})
	//test 2, when we do not provide valid auth token
	it('should return 401 if not authenticated', (done) => {
		request(app)
			.get('/users/me')
			.expect(401)
			.expect( (res) => {
				expect(res.body).toEqual({});
			}).end(done);
	});
});

describe('POST /users', () => {
	// test 1, we get a user back, when we pass valid data
	it('should create a user', (done) => {
		var email = 'example@example.com';
		var password = '123mnb!';

		request(app)
			.post('/users')
			.send({email, password})
			.expect(200)
			.expect( (res) => {
				expect(res.headers['x-auth']).toExist();
				expect(res.body.email).toBe(email);
				expect(res.body._id).toExist();
			})
			.end( (err) => {
				if (err) {
					return done(err);
				}

				User.findOne({email}).then( (user) => {
					expect(user).toExist();
					expect(user.password).toNotBe(password);
					done();
				}).catch( (e) => done(e));
			});
	});

	// test 2, user doesn't get created if passed invalid data
	it('should return validation erorrs if req is invalid', (done) => {
		var email = 'asdk';
		var password = "fsa";

		request(app)
			.post('/users')
			.send({email, password})
			.expect(400)
			.end(done);
	});

	// test 3, 
	it('should not create user if email in use', (done) => {
		var password = "";
		request(app)
			.post('/users')
			.send({email: users[0].email, password: 'password123!'})
			.expect(400)
			.end(done);
	});
});

describe("POST /users/login", () => {
	// test 1, valid email and password
	it("should login user and return auth token", (done) => {
		request(app)
		.post('/users/login')
		.send({ email: users[1].email, password: users[1].password})
		.expect(200)
		.expect( (res) => {
			expect(res.headers['x-auth']).toExist();
		})
		.end( (err, res) => {
			if (err) {
				return done(err);
			}

			User.findById(users[1]._id).then( (user) => {
				expect(user.tokens[0]).toInclude({
					access: 'auth',
					token: res.headers['x-auth']
				});
				done();
			}).catch( (e) => done(e));
		});
	});

	it('should reject invalid login', (done) => {
		request(app)
			.post('/users/login')
			.send({email: users[1].email, password: "asd,dksf"})
			.expect(400)
			.expect( (res) => {
				expect(res.headers['x-auth']).toNotExist();
			})
			.end( (err, res) => {
				if (err) {
					return done(err);
				}
	
				User.findById(users[1]._id).then( (user) => {
					expect(user.tokens.length).toBe(0);
					done();
				}).catch( (e) => done(e));
			});

	})
});

describe('DELETE /users/me/token', () => {

	it('should remove auth token on logout', (done) => {
		request(app)
			.delete('/users/me/token')
			.set('x-auth', users[0].tokens[0].token)
			.expect(200)
			.end( (err, res) => {
				if (err) return done(err);

				User.findById(users[0]._id).then( (user) => {
					expect(user.tokens.length).toBe(0);
					done();
				}).catch( (err) => {
					done(err);
				});
			});
	});
});