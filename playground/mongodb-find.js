const {MongoClient, ObjectID} = require('mongodb');

MongoClient.connect('mongodb://localhost:27017/TodoApp', (err, db) => {
	if (err) {
		return console.log('Unable to connect to DB');
	}

	// db.collection('Todos').find({
	// 		_id: new ObjectID('5a37ea65ef130b1e80b33432')
	// 	}).toArray().then(
	// 	(docs) => {
	// 		console.log('Todos');
	// 		console.log(JSON.stringify(docs, undefined, 2));
	// 	},
	// 	(err) => {
	// 		console.log('Unable to fetch todos', err);
	// 	}
	// );

	// db.collection('Todos').find().count().then(
	// 	(count) => {
	// 		console.log(`Todos count: ${count}`);
			
	// 	},
	// 	(err) => {
	// 		console.log('Unable to fetch todos', err);
	// 	}
	// );	

	db.collection('Users').find({name: 'Edwin'}).toArray().then(
		(docs) => {
			console.log(JSON.stringify(docs, undefined, 2));
		},
		(err) => {
			console.log('Could Not Perform find action');
		}
	);

	// db.close();
});