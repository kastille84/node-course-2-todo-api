const expect = require("expect");
const request = require('supertest');
const {ObjectID} = require('mongodb');

//load in local files
const {app} = require('./../server');
const {Todo} = require('./../models/todo');

const todos = [
	{	
		_id: new ObjectID(),
		text: "First test todo"
	},
	{
		_id: new ObjectID(),
		text: 'Second test todo'
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