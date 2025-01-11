module.exports = mongoose => {
	// const schema = mongoose.Schema({
	// 	namaLengkap: String,
	// 	namaPengguna: String,
	// 	jenisKelamin: String,
	// 	tanggalLahir: Date,
	// 	umur: Number,
	// 	statusNikah: Boolean,
	// }, {
	// 	timestamps: true,
	// })

	// // Mengubah _id menjadi id (OPSIONAL)
	// schema.method("toJSON", function() {
	// 	const {__v, _id, ...obj} = this.toObject()
	// 	obj.id = _id
	// 	return obj
	// })

	// // Membuat Collections bernama 'users'
	// return mongoose.model("users", schema)

	const schema = mongoose.Schema({}, {
		collection: "job-order"
	});
	
	return mongoose.model("job-order", schema);
}

/* {
    "namaLengkap": "Syuhada Rantisi",
    "namaPengguna": "syuhendar",
    "jenisKelamin": "L",
    "tanggalLahir": "2004-07-29",
    "umur": 19,
    "statusNikah": false
} */
