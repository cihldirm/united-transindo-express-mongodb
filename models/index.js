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
	humanize: (str) => {
		let frags = str.split('_');
		for (let i=0; i<frags.length; i++) {
			frags[i] = frags[i].charAt(0).toUpperCase() + frags[i].slice(1);
		}
		return frags.join(' ');
	},
}
