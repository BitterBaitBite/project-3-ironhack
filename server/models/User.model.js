const { Schema, model } = require('mongoose');

const userSchema = new Schema({
	username: {
		type: String,
		unique: true,
		required: true,
	},

	password: {
		type: String,
		required: true,
	},

	role: {
		type: String,
		enum: ['ARTIST', 'RECRUITER'],
		required: true,
	},

	portfolio: {
		name: String,
		last_name: String,
		country: String,
		city: String,
		about: String,
		email: String,
		tel: String,
		tags: [String],
		experience: [String],
	},
});

const User = model('User', userSchema);

module.exports = User;
