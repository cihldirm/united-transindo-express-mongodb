const dbConfig = require('../config/db')
const mongoose = require('mongoose')
const jobOrderModel = require('./jobOrderModel')

module.exports = {
	mongoose,
	url: dbConfig.url,
	jobOrders: jobOrderModel(mongoose)
}
