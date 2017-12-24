const expect = require("expect");
const request = require('supertest');
const {ObjectID} = require('mongodb');

//load in local files
const {app} = require('./../server');
const {Todo} = require('./../models/todo');

const todos = [
	{	
		_id: new ObjectID(),
		text: "First test todo",
		completedAt: 123
	},
	{
		_id: new ObjectID(),
		text: 'Second test todo',
		completed: true,
		completedAt: 333
	}
];

beforeEach( (done)=> {
	Todo.remove({}).then(()=> {
		return Todo.insertMany(todos);
	}).then(()=> {
		done();
	});
});

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