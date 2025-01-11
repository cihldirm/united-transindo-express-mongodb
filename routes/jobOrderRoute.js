module.exports = app => {
	const jobOrders = require('../controllers/jobOrderContoller')
	const r = require('express').Router()

	r.get('/', jobOrders.showAll)
	r.get('/:no_joj', jobOrders.detail)
	r.post('/', jobOrders.create)
	r.put('/:no_joj', jobOrders.update)
	r.delete('/:no_joj', jobOrders.delete)

	app.use('/jobOrders', r)
}
