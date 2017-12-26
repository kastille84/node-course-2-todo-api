const mongoose = require('mongoose');
const validator = require('validator');
const jwt = require('jsonwebtoken');
const __ = require('lodash');

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

var User = mongoose.model('User', UserSchema);

module.exports = {
	User
};