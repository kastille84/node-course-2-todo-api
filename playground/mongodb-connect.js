// const MongoClient = require('mongodb').MongoClient;
const {MongoClient, ObjectID} = require('mongodb');

MongoClient.connect('mongodb://localhost:27017/TodoApp', (err, db) => {
	if (err) {
		return console.log('Unable to connect to MongoDB Server');
	}
	console.log('Connected to MongoDB Server');
	// db.collection('Todos').insertOne({
	// 	text: 'Something to do',
	// 	completed: false
	// }, (err, result) => {
	// 	if (err) { return console.log('Unable to insert todo', err)}

	// 	console.log(JSON.stringify(result.ops, undefined, 2));

	// });

	//insert new doc into Users (name, age, location)
	// db.collection('Users').insertOne({
	// 	name: "Edwin",
	// 	age: '30',
	// 	location: 'Newburgh'
	// }, (err, results ) => {
	// 	if (err) {
	// 		return console.log('Unable to insert user', err);
	// 	}

	// 	//console.log(JSON.stringify(results.ops, undefined, 2));
	// 	console.log(results.ops[0]._id.getTimestamp());
	// });

	db.close();
});