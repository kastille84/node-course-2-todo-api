const {SHA256} = require('crypto-js');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

var password = '123abc!';

// bcrypt.genSalt(10, (err, salt) => {
// 	bcrypt.hash(password, salt, (err, hash) => {
// 		console.log(hash);
// 	});
// });

var hashedPassword = '$2a$10$3Oew9dgYjTaVBSnSmVAMF.y8izGubogscH12X3tXGO.S1JLJISbj.';

bcrypt.compare(password, hashedPassword, (err, result) => {
	console.log(result);
});
// var data = {
// 	id: 10
// };

// var token = jwt.sign(data, '123abc');
// console.log(token);

// var decoded = jwt.verify(token, '123abc');
// console.log('decoded:', decoded); 
// var message = 'I am user number 3';
// var hash = SHA256(message).toString();

// console.log(`message: ${message}`);
// console.log(`hash: ${hash}`);

// var data = {
// 	username: "kastille84@gmail.com",
// 	password: "123abc!"
// };


// var token = {
// 	data,
// 	hash: SHA256(JSON.stringify(data) + 'somesecret').toString()
// };

// // token.data.username= "kasteolke";
// // token.hash = SHA256(JSON.stringify(token.data)).toString();

// var resultHash = SHA256(JSON.stringify(token.data) + 'somesecret').toString();

// if (resultHash === token.hash) {
// 	console.log('they match, Data was not maniuplated: ', token.hash);
// } else {
// 	console.log("Data was changed, Dont trust!");
// }