const {ObjectID} = require('mongodb');
const {mongoose} = require('./../server/db/mongoose');
const {Todo} = require('./../server/models/todo');
const {User} = require('./../server/models/user');


var id = '5a3c0cdcfb00d1100f4d9da311';
var userId = '5a3a9e3cf75d74c41d6cf2c6';

// if (!ObjectId.isValid(id)){
// 	console.log('Id not valid');
// }

// Todo.find({
// 	_id: id
// }). then( (todos) => {
// 	console.log('Todos', todos);
// });

// Todo.findOne({
// 	_id: id
// }).then( (todo) => { console.log("Todo", todo)});

// Todo.findById(id).then( (todo)=> {
// 	if( !todo) {
// 		return console.log('Could not get Item using that ID');
// 	}
// 	console.log('Todo', todo);
// }).catch( (e)=> {console.log(e)});

if (!ObjectID.isValid(userId)) {
	console.log('Invalid Id');
} else {
	User.findById(userId).then( (user) => {
		if (!user) {
			return console.log('Could not get user');
		}

		console.log(JSON.stringify(user, undefined, 2));
	}).catch((e) => {
		console.log(e);
	});
}