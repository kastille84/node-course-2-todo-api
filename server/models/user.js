const mongoose = require('mongoose');
const validator = require('validator');
const jwt = require('jsonwebtoken');
const __ = require('lodash');
var bcrypt = require('bcryptjs');

var UserSchema = new mongoose.Schema({
	email: {
		type: String,
		required: true,
		minlength: 1,
		trim: true,
		unique: true,
		validate: {
			validator: (value)=> {
				return validator.isEmail(value);
			},
			message: '{VALUE} is not a valid email'
		}
	},
	password: {
		type: String,
		required: true,
		minlength: 6
	},
	tokens: [{
		access: {
			type: String,
			required: true
		},
		token: {
			type: String,
			required: true
		}
	}]
});

UserSchema.methods.toJSON = function () {
	// determines what exactly gets sent back when a model is converted to JSON values
	var user = this;
			// takes mongoose data and converts it into a regular object
	var userObject = user.toObject();
	return __.pick(userObject, ['_id', 'email']);
};

UserSchema.methods.generateAuthToken = function () {
	var user = this;
	var access = 'auth';
	var token = jwt.sign({_id: user._id.toHexString(), access: access}, 'abc123').toString();

	user.tokens.push({
		access,
		token
	});

	return user.save().then( () => {
		return token;
	});

};

UserSchema.statics.findByToken = function(token) {
	var User = this;
	var decoded;

	try {
		decoded = jwt.verify(token, 'abc123');
	} catch (e) {
		return Promise.reject();
	}

	return User.findOne({
		_id: decoded._id,
		'tokens.token': token,
		'tokens.access': 'auth'
	});
};

UserSchema.pre('save', function(next) {
	var user = this;

	if(user.isModified('password')){
		//hash the password
		bcrypt.genSalt(10, (err, salt) => {			
			bcrypt.hash(user.password, salt, (err, hash)=> {
				user.password = hash;
				next();
			});
		});
	} else {
		next();
	}
});

var User = mongoose.model('User', UserSchema);

module.exports = {
	User
};