module.exports = app => {
	const users = require('../controllers/userController')
	const r = require('express').Router()

	r.get('/', users.showAll)
	r.get('/:id', users.detail)
	r.post('/', users.register)
	r.put('/:id', users.update)
	r.delete('/:id', users.delete)

	app.use('/users', r)
}
