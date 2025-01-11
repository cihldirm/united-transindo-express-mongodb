const dbConfig = require('../config/db')
const mongoose = require('mongoose')
const jobOrderModel = require('./jobOrderModel')
const databaseModel = require('./databaseModel')

module.exports = {
	mongoose,
	url: dbConfig.url,
	jobOrders: jobOrderModel(mongoose),
	databases: databaseModel(mongoose),
}
