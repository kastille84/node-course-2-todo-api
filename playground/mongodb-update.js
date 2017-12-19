const {MongoClient, ObjectID} = require('mongodb');

MongoClient.connect('mongodb://localhost:27017/TodoApp', (err, db) => {
	if (err) {
		return console.log('Unable to connect to DB');
	}
	console.log('Connected to MongoDB server');

	// db.collection('Todos').findOneAndUpdate( 
	// 	{_id: new ObjectID('5a386d5c193db66003fdbcce')},
	// 	{$set: {completed: true} },
	// 	{returnOriginal: false}
	// ).then( (result) => {
	// 	console.log(result);
	// });

	db.collection('Users').findOneAndUpdate(
		{_id: new ObjectID('5a37f69620544520dcc50051')},
		{
			$inc: {age: -5},
		  	$set: {location: 'Philadelphia' }
		},
		{returnOriginal: false}
	).then( (result) => {
		console.log(result);
	});

	// db.close();
});