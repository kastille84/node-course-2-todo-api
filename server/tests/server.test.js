const expect = require("expect");
const request = require('supertest');

//load in local files
const {app} = require('./../server');
const {Todo} = require('./../models/todo');

beforeEach( (done)=> {
	Todo.remove({}).then(()=> {
		done()
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

				Todo.find().then( (todos) => {
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
				expect(todos.length).toBe(0);
				done();
			}).catch( (err) => {
				done(err);
			})
		});
	});
})