module.exports = app => {
	const users = require('../controllers/userController')
	const r = require('express').Router()

	r.get('/', users.showAll)
	r.get('/:email', users.detail)
	r.post('/', users.register)
	r.put('/:email', users.update)
	r.delete('/:email', users.delete)

	app.use('/users', r)
}
