const { isEmail } = require('validator');

module.exports = mongoose => {
	const schema = mongoose.Schema({
		username: {
			type: String,
			required: [true, 'Please enter a username'],
			minlength: [3, 'Minimum username length is 3 characters'],
		},
		name: {
			type: String,
			required: [true, 'Please enter a name'],
			minlength: [3, 'Minimum name length is 3 characters'],
		},
		email: {
			type: String,
			required: [true, 'Please enter an email'],
			unique: true,
			validate: [isEmail, 'Please enter a valid email']
		},
		role: {
			type: String,
			required: [true, 'Role option must be selected'],
		},
		location: {
			type: String,
			required: [true, 'Location option must be selected'],
		},
		password: {
			type: String,
			required: [true, 'Please enter a password'],
			minlength: [3, 'Minimum password length is 3 characters'],
		}
	}, {
		collection: "user",
		versionKey: false
	});
	
	return mongoose.model("user", schema);
}
