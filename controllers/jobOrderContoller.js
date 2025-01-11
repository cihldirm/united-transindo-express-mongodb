const db = require('../models')
const JobOrders = db.jobOrders


exports.showAll = (req, res) => {
	JobOrders.find()
		.then(data => res.send(data))
		.catch(err => res.status(500).send({message: err.message}))
}

exports.detail = (req, res) => {
	const no_joj = req.params.no_joj
	JobOrders.findOne({no_joj: no_joj})
		.then(data => res.send(data))
		.catch(err => res.status(500).send({message: err.message}))
}

exports.create = (req, res) => {
	// req.body.tanggalLahir = new Date(req.body.tanggalLahir)
	JobOrders.create(req.body)
		.then(() => res.send({message: "Tersimpan"}))
		.catch(err => res.status(500).send({message: err.message}))
}

exports.update = (req, res) => {
	// const id = req.params.id
	const no_joj = req.params.no_joj
	// req.body.tanggalLahir = new Date(req.body.tanggalLahir)
	JobOrders.findByIdAndUpdate(no_joj, req.body, {useFindAndModify: false})
		.then(data => {
			if (!data) res.status(404).send({message: "Update Gagal"})
			res.send({message: "Update Berhasil", data})
		})
		.catch(err => res.status(500).send({message: err.message}))
}

exports.delete = (req, res) => {
	// const id = req.params.id
	const no_joj = req.params.no_joj
	// req.body.tanggalLahir = new Date(req.body.tanggalLahir)
	JobOrders.findByIdAndRemove(no_joj)
		.then(data => {
			if (!data) res.status(404).send({message: "Delete Gagal"})
			res.send({message: "Delete Berhasil", data})
		})
		.catch(err => res.status(500).send({message: err.message}))
}
