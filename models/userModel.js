module.exports = mongoose => {
	const schema = mongoose.Schema({}, {
		collection: "user"
	});
	
	return mongoose.model("user", schema);
}
