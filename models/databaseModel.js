module.exports = mongoose => {
	const schema = mongoose.Schema({}, {
		collection: "database"
	});
	
	return mongoose.model("database", schema);
}
