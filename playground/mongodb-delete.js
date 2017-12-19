const {MongoClient, ObjectID} = require('mongodb');

MongoClient.connect('mongodb://localhost:27017/TodoApp', (err, db) => {
	if (err) {
		return console.log('Unable to connect to DB');
	}
	console.log('Connected to MongoDB server');

	// deleteMany - targets many documents and removes them
	// db.collection('Todos').deleteMany({text: 'Eat Lunch'}).then( (result) => {
	// 	console.log(result);
	// });
	// deleteOne - targets one document and removes it
	// db.collection('Todos').deleteOne({text: 'Eat lunch'}).then( (result) => {
	// 	console.log(result);
	// })
	// findOneAndDelete - removes indiv. items and returns their values
	// db.collection('Todos').findOneAndDelete({completed: false}).then(
	// 	(result) => {
	// 		console.log(result);
	// });
	// db.collection('Users').deleteOne({name: 'Edwin'}).then( (result) => {
	// 	console.log(result);
	// });
	db.collection('Users').findOneAndDelete({})
	// db.close();
});