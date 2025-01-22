const dbConfig = require('../config/db')
const mongoose = require('mongoose')
const userModel = require('./userModel')
const jobOrderModel = require('./jobOrderModel')
const databaseModel = require('./databaseModel')

module.exports = {
	mongoose,
	url: dbConfig.url,
	Users: userModel(mongoose),
	JobOrders: jobOrderModel(mongoose),
	databases: databaseModel(mongoose),
}
