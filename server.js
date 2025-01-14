const express = require("express")
const app = express()
const path = require("path")
const bodyParser = require("body-parser");
const cors = require("cors")
const http = require('http');
const port = process.env.PORT || 3000
require('dotenv').config();
const db = require("./models")
const run = require("./routes/jobOrderRoute")
const corsOptions = {origin: "*"}

app.use(cors(corsOptions))
app.use(express.json())

const { google } = require("googleapis");
const secretKey = require("./ut-database-center-c0e311032c53.json");
const { client_email, private_key } = secretKey;
const { MongoClient } = require("mongodb");
const mongoose = require("mongoose");
var dbo;
app.set('views', __dirname + '/views');
// // app.set('views', './views');
app.set('view engine', 'ejs');
// app.engine('html', require('ejs').renderFile);
// app.set('view engine', 'html');
// app.set('views', __dirname + '/views');

// view engine setup
// app.set('views', path.join(__dirname, 'views'));
// app.engine('html', require('ejs').renderFile);
// app.set('view engine', 'html');

// app.use(express.static(`${__dirname}/assets`));

// app.use(express.static(`${__dirname}/views`));
// app.use(express.static(`./assets`));
// app.use("/assets", express.static(path.join(__dirname, 'assets')));

// used
// app.use(express.static(path.join(__dirname, 'views')));
app.use(express.static(path.join(__dirname, 'assets')));

// support parsing of application/x-www-form-urlencoded post data
// app.use(bodyParser.urlencoded({ extended: true }));

// support parsing of application/json type post data
// app.use(bodyParser.json());

// app.use(function(req, res) {
// 	res.status(404);
// 	return res.send('<h1>404 Error: Resource not found</h1>');
// });

const mongooseConfig = {
	useNewUrlParser: true,
	useUnifiedTopology: true,
}

const client = new MongoClient(db.url);

db.mongoose.connect(db.url, mongooseConfig)
	.then(async () => {
		console.log("Connected to MongoDB");
		await client.connect();         
		console.log('Connected successfully to server');
		console.log("client is = ", client);
		dbo = client.db("united-transindo");
		console.log("dbo is = ", dbo);
		// let http_server = http.createServer((req, res) => {

		// })
		// let server = app.listen(port, (err) => {
		// 	if (err) {
		// 		return console.log("ERROR", err);
		// 	}
		// 	console.log(`Server started on port ${port}`);
		// });
		let server = http.createServer(app).listen(port, (err) => {
			if (err) {
				return console.log("ERROR", err);
			}
			console.log(`Server started on port ${port}`);
		});
		server.keepAliveTimeout = 120 * 1000;
    	server.headersTimeout = 120 * 1000;
	}).catch((err) => {
		console.error("Error connecting to MongoDB", err);
	}).finally(() => client.close());

db.mongoose.connection.on("error", console.error.bind(console, "MongoDB Connection Error"));

// console.log("dbo is = ", dbo);

async function readGoogleSheet(sheet) {
	// let secretKey = require("./ut-database-center-c0e311032c53.json"), 
	let jwtClient = new google.auth.JWT(
		   client_email,
		   null,
		   private_key,
		   ['https://www.googleapis.com/auth/spreadsheets']);
	//authenticate request
	jwtClient.authorize((err, tokens) => {
	 if (err) {
	   console.log(err);
	   return;
	 } else {
	   console.log("Successfully connected!");
	 }
	});
	//Google Sheets API
	let spreadsheetId = '1h5_afIl-tH4faCNGnRO-JjE6_r_e2iCnDfb7lb6Ng-U',
		// sheetRange =  sheet === "database" ? 'DATABASE 2024!A1:AQ' : 'Kode Rute!A1:Z',
		sheetRange,
		sheets = google.sheets('v4');
  
	if (sheet === "database") {
	  sheetRange = 'DATABASE 2024!A:AQ';
	} else if (sheet === "nama pengirim") {
	  sheetRange = 'Nama Pengirim!A:A';
	} else if (sheet === "alamat pengirim") {
	  sheetRange = 'Alamat Pengirim!A:A';
	} else if (sheet === "kontak pengirim") {
	  sheetRange = 'Kontak Pengirim!A:A';
	} else if (sheet === "nama penerima") {
	  sheetRange = 'Nama Penerima!A:A';
	} else if (sheet === "alamat penerima") {
	  sheetRange = 'Alamat Penerima!A:A';
	} else if (sheet === "kontak penerima") {
	  sheetRange = 'Kontak Penerima!A:A';
	} else if (sheet === "merk") {
	  sheetRange = 'Merk!A:A';
	} else if (sheet === "type") {
	  sheetRange = 'Type!A:A';
	} else if (sheet === "warna") {
	  sheetRange = 'Warna!A:A';
	} else if (sheet === "nopol noka") {
	  sheetRange = 'Nopol Noka!A:A';
	} else {
	  // Kode Rute
	  sheetRange = 'Kode Rute!A:B';
	}
	return await sheets.spreadsheets.values.get({
	  auth: jwtClient,
	  spreadsheetId: spreadsheetId,
	  range: sheetRange
	}).then((response) => {
	  if (sheet === "database") {
		let results = response.data.values, 
			headerIndex = getIndexOfItem(results, "NO. JOJ")[0], 
			headerTable = results.slice(headerIndex).shift(), 
			contentTable = [];
  
		// console.log(results[2]);
  
		// console.log(getIndexOfItem(results, "NO. SJ")[0]);
		// console.log(getIndexOfItem(results, "NO. SJ")[1]);
  
		// method 1
		// const [header, ...rows] = results.slice(headerIndex);
		// for (let vals = 0; vals < rows.length; vals++) {
		//   let row = rows[vals]
		//   let tableObj = {};
		//   for (let key = 0; key < header.length; key++) {
		//     tableObj[header[key]] = row[key]
		//   }
		//   contentTable.push(tableObj);
		// }
  
		// method 2
		contentTable = results.slice(headerIndex + 1).reduce((agg, arr) => {
		  agg.push(arr.reduce((obj, item, index) => {
			obj[headerTable[index]] = item;
			return obj;
		  }, {}));
		  return agg;
		}, []);
  
		return { headerTable, contentTable };
	  }
	  else if (sheet === "route code") {
		let results = response.data.values, 
			headerTable = results.slice(0).shift(), 
			// routeCode = [];
			routeCode = results.slice(1).map(column => column[1]);
  
		console.log("results is = ", results);
		console.log("headerTable is = ", headerTable);
		console.log("routeCode is = ", routeCode);
  
		return { routeCode };
	  }
	  else {
		let results = response.data.values;
		let data = results.map(column => column[0]);
		// console.log("results nama pengirim is = ", results.map(column => column[0]));
		
		console.log("results is = ", results);
		console.log("data is = ", data);
		// return { listNamaPengirim };
		return data;
	  }
	  
	}).catch((error) => {
	  return console.log('The API returned an error: ' + error);
	});
  }
  
  async function writeGoogleSheet(sheetName, cellRange, sheetResource) {
	let jwtClient = new google.auth.JWT(
		   client_email,
		   null,
		   private_key,
		   ['https://www.googleapis.com/auth/spreadsheets']);
	//authenticate request
	jwtClient.authorize((err, tokens) => {
	 if (err) {
	   console.log(err);
	   return;
	 } else {
	   console.log("Successfully connected!");
	 }
	});
  
	//Google Sheets API
	let spreadsheetId = '1h5_afIl-tH4faCNGnRO-JjE6_r_e2iCnDfb7lb6Ng-U',
		// sheetRange = 'DATABASE 2024!A1:AQ',
		sheetRange = `${sheetName}!${cellRange}`,
		sheets = google.sheets('v4');
	return await sheets.spreadsheets.values.update({
	  auth: jwtClient,
	  spreadsheetId: spreadsheetId,
	  range: sheetRange,
	  resource: sheetResource
	}).then((response) => {
	  let results = response.data.values, 
		  headerIndex = getIndexOfItem(results, "NO. JOJ")[0], 
		  headerTable = results.slice(headerIndex).shift(), 
		  contentTable = [];
  
	  // method 1
	  // const [header, ...rows] = results.slice(headerIndex);
	  // for (let vals = 0; vals < rows.length; vals++) {
	  //   let row = rows[vals]
	  //   let tableObj = {};
	  //   for (let key = 0; key < header.length; key++) {
	  //     tableObj[header[key]] = row[key]
	  //   }
	  //   contentTable.push(tableObj);
	  // }
  
	  // method 2
	  contentTable = results.slice(headerIndex + 1).reduce((agg, arr) => {
		agg.push(arr.reduce((obj, item, index) => {
		  obj[headerTable[index]] = item;
		  return obj;
		}, {}));
		return agg;
	  }, []);
  
	  return { headerTable, contentTable };
	}).catch((error) => {
	  return console.log('The API returned an error: ' + error);
	});
  }

  function getIndexOfItem(arr, item) {
	for (let i = 0; i < arr.length; i++) {
	  let index = arr[i].indexOf(item);
	  if (index > -1) {
		return [i, index];
	  }
	}
  }
  
  function getRowColIndex(twoDArr, value) {
	// console.log("twoDArr = ",twoDArr);
	let colIndex = -1;
	const rowIndex = twoDArr.findIndex((row) => {
	  const foundColIndex = row.indexOf(value);
	  if (foundColIndex !== -1) {
		colIndex = foundColIndex;
		return true;
	  }
	});
	return [rowIndex, colIndex];
  }

//   const databaseSchema = new mongoose.Schema({
// 	// field: String
//   }, {
// 	collection: "database"
//   });
  
//   const databaseModel = mongoose.model("database", databaseSchema);
  
  const namaPengirimSchema = new mongoose.Schema({
	field: String
  }, {
	collection: "nama-pengirim"
  });
  
  const namaPengirimModel = mongoose.model("nama-pengirim", namaPengirimSchema);
  
  // console.log("namaPengirimSchema is = ", namaPengirimSchema);
  
  // console.log("namaPengirimModel is = ", namaPengirimModel);
  
  const alamatPengirimSchema = new mongoose.Schema({
	field: String
  }, {
	collection: "alamat-pengirim"
  });
  
  const alamatPengirimModel = mongoose.model("alamat-pengirim", alamatPengirimSchema);
  
  const kontakPengirimSchema = new mongoose.Schema({
	field: String
  }, {
	collection: "kontak-pengirim"
  });
  
  const kontakPengirimModel = mongoose.model("kontak-pengirim", kontakPengirimSchema);
  
  const namaPenerimaSchema = new mongoose.Schema({
	field: String
  }, {
	collection: "nama-penerima"
  });
  
  const namaPenerimaModel = mongoose.model("nama-penerima", namaPenerimaSchema);
  
  const alamatPenerimaSchema = new mongoose.Schema({
	field: String
  }, {
	collection: "alamat-penerima"
  });
  
  const alamatPenerimaModel = mongoose.model("alamat-penerima", alamatPenerimaSchema);
  
  const kontakPenerimaSchema = new mongoose.Schema({
	field: String
  }, {
	collection: "kontak-penerima"
  });
  
  const kontakPenerimaModel = mongoose.model("kontak-penerima", kontakPenerimaSchema);
  
  const merkUnitSchema = new mongoose.Schema({
	field: String
  }, {
	collection: "merk-unit"
  });
  
  const merkUnitModel = mongoose.model("merk-unit", merkUnitSchema);
  
  const typeUnitSchema = new mongoose.Schema({
	field: String
  }, {
	collection: "type-unit"
  });
  
  const typeUnitModel = mongoose.model("type-unit", typeUnitSchema);
  
  const nopolNokaUnitSchema = new mongoose.Schema({
	field: String
  }, {
	collection: "nopol-noka-unit"
  });
  
  const nopolNokaUnitModel = mongoose.model("nopol-noka-unit", nopolNokaUnitSchema);
  
  const warnaUnitSchema = new mongoose.Schema({
	field: String
  }, {
	collection: "warna-unit"
  });
  
  const warnaUnitModel = mongoose.model("warna-unit", warnaUnitSchema);
  
//   const jobOrderSchema = new mongoose.Schema({
// 	// field: String
//   }, {
// 	collection: "job-order"
//   });
  
//   const jobOrderModel = mongoose.model("job-order", jobOrderSchema);

app.get("/", (req, res) => res.type('html').send(`
	<!DOCTYPE html>
	<html>
	  <head>
		<title>Hello from Render!</title>
		<script src="https://cdn.jsdelivr.net/npm/canvas-confetti@1.5.1/dist/confetti.browser.min.js"></script>
		<script>
		  setTimeout(() => {
			confetti({
			  particleCount: 100,
			  spread: 70,
			  origin: { y: 0.6 },
			  disableForReducedMotion: true
			});
		  }, 500);
		</script>
		<style>
		  @import url("https://p.typekit.net/p.css?s=1&k=vnd5zic&ht=tk&f=39475.39476.39477.39478.39479.39480.39481.39482&a=18673890&app=typekit&e=css");
		  @font-face {
			font-family: "neo-sans";
			src: url("https://use.typekit.net/af/00ac0a/00000000000000003b9b2033/27/l?primer=7cdcb44be4a7db8877ffa5c0007b8dd865b3bbc383831fe2ea177f62257a9191&fvd=n7&v=3") format("woff2"), url("https://use.typekit.net/af/00ac0a/00000000000000003b9b2033/27/d?primer=7cdcb44be4a7db8877ffa5c0007b8dd865b3bbc383831fe2ea177f62257a9191&fvd=n7&v=3") format("woff"), url("https://use.typekit.net/af/00ac0a/00000000000000003b9b2033/27/a?primer=7cdcb44be4a7db8877ffa5c0007b8dd865b3bbc383831fe2ea177f62257a9191&fvd=n7&v=3") format("opentype");
			font-style: normal;
			font-weight: 700;
		  }
		  html {
			font-family: neo-sans;
			font-weight: 700;
			font-size: calc(62rem / 16);
		  }
		  body {
			background: white;
		  }
		  section {
			border-radius: 1em;
			padding: 1em;
			position: absolute;
			top: 50%;
			left: 50%;
			margin-right: -50%;
			transform: translate(-50%, -50%);
		  }
		</style>
	  </head>
	  <body>
		<section>
		  Hello from Render!
		</section>
	  </body>
	</html>
`));

// app.get("/dashboard", async(req, res) => {
// 	// res.render("index", {
// 	res.render("dashboard", {
// 	  message:"",
// 	  errorMessage:"",	
// 	  resultArr:[]
// 	});
//   });
  
app.get("/dashboard", (req, res) => {
  res.sendFile(path.join(__dirname, './views/dashboard.html'));
});

// Pemanggilan routing (utama)
run(app)

// const db_model = require('./models')
// const { jobOrders, databases } = db_model

app.get("/input-job-order", async(req, res) => {
	// let contentTable, list_no_joj;

	// try {
	// 	// Connect to the MongoDB client
	// 	await client.connect();

	// 	// Find operation after successful connection
	// 	// contentTable = await dbo.collection('database').find({}, {timeout: false}).toArray(function(err, result) {
	// 	contentTable = await dbo.collection('database').find({}, {noCursorTimeout: false}).toArray(function(err, result) {
	// 	if (err) throw err;
	// 	console.log("result of contentTable is = ", result);
	// 	// db.close();
	// 	});
	// } catch (err) {
	// 	console.error(err);
	// } finally {
	// 	// Ensure the client is closed when done
	// 	await client.close();
	// }

	// contentTable = await databases.find()
	// 	.then(data => res.send(data))
	// 	.catch(err => res.status(500).send({message: err.message}))

	// 	const no_joj = req.params.no_joj
	// JobOrders.findOne({no_joj: no_joj})
	// 	.then(data => res.send(data))
	// 	.catch(err => res.status(500).send({message: err.message}))

	// console.log("contentTable is = ", contentTable);

	// list_no_joj = contentTable.map((data) => data["NO"][" JOJ"]).map((value) => Number(value));

	// const findMax = value => value.reduce((res, cur) => res < cur ? cur : res, -Infinity);

	let getData = true;
  let listNamaPengirim = await namaPengirimModel.find({}).select({"field": 1, "_id": 0})
    .catch(function(err) {
      getData = false;
      console.log(err);
    });
  let listAlamatPengirim = await alamatPengirimModel.find({}).select({"field": 1, "_id": 0})
    .catch(function(err) {
      getData = false;
      console.log(err);
    });
  let listKontakPengirim = await kontakPengirimModel.find({}).select({"field": 1, "_id": 0})
    .catch(function(err) {
      getData = false;
      console.log(err);
    });
  let listNamaPenerima = await namaPenerimaModel.find({}).select({"field": 1, "_id": 0})
    .catch(function(err) {
      getData = false;
      console.log(err);
    });
  let listAlamatPenerima = await alamatPenerimaModel.find({}).select({"field": 1, "_id": 0})
    .catch(function(err) {
      getData = false;
      console.log(err);
    });
  let listKontakPenerima = await kontakPenerimaModel.find({}).select({"field": 1, "_id": 0})
    .catch(function(err) {
      getData = false;
      console.log(err);
    });
  let listMerkUnit = await merkUnitModel.find({}).select({"field": 1, "_id": 0})
    .catch(function(err) {
      getData = false;
      console.log(err);
    });
  let listTypeUnit = await typeUnitModel.find({}).select({"field": 1, "_id": 0})
    .catch(function(err) {
      getData = false;
      console.log(err);
    });
	let listWarnaUnit = await warnaUnitModel.find({}).select({"field": 1, "_id": 0})
    .catch(function(err) {
      getData = false;
      console.log(err);
    });

	listNamaPengirim = listNamaPengirim.map((data) => data.field);
  listAlamatPengirim = listAlamatPengirim.map((data) => data.field);
  listKontakPengirim = listKontakPengirim.map((data) => data.field);
  listNamaPenerima = listNamaPenerima.map((data) => data.field);
  listAlamatPenerima = listAlamatPenerima.map((data) => data.field);
  listKontakPenerima = listKontakPenerima.map((data) => data.field);
  listMerkUnit = listMerkUnit.map((data) => data.field);
  listTypeUnit = listTypeUnit.map((data) => data.field);
  listWarnaUnit = listWarnaUnit.map((data) => data.field);

  if (!getData) {
    return res.status(500).send("Request Timeout - Internal Server Error \n There is problem when getting data");
  } else {
	// res.sendFile(path.join(__dirname, './views/dashboard.html'));
    // res.render("input-job-order", {
    res.render("input-job-order", {
    // res.render("marketing/input-job-order", {
      // contentTable,
    //   no_joj: findMax(list_no_joj),
      no_joj: 6385,
      listNamaPengirim,
      listAlamatPengirim,
      listKontakPengirim,
      listNamaPenerima,
      listAlamatPenerima,
      listKontakPenerima,
      listMerkUnit,
      listTypeUnit,
      listWarnaUnit,
      // listNopolNokaUnit,
      message:"",
      errorMessage:"",
      resultArr:[]
    });
  }
});

app.post("/input-job-order", async(req, res) => {
	console.log("req body of input-job-order = ", req.body);
  
	// let {
	//   nama_pengirim,
	//   alamat_pengirim,
	//   kontak_pengirim,
	//   nama_penerima,
	//   alamat_penerima,
	//   kontak_penerima,
	//   hr_tgl_ambil,
	//   qty,
	//   merk,
	//   tipe,
	//   nopol_noka,
	//   warna,
	//   status,
	//   nominal,
	//   moda,
	//   invoice,
	//   transfer_by,
	//   opsi_tagihan_top,
	//   opsi_penawaran_kontrak,
	//   no_opsi_penawaran_kontrak,
	//   note
	// } = req.body;
	// let dbo = mongoose.db
  
  
	// try {
	//   // Connect to the MongoDB client
	//   await client.connect();
  
	  
  
	//   // Insert operation after successful connection
	//   const result = await dbo.collection('job-order').insertOne(req.body);
	  
	//   // Insert into collection
	//   console.log('Inserted documents =>', result);
	// } catch (err) {
	//   console.error(err);
	// } finally {
	//   // Ensure the client is closed when done
	//   await client.close();
	// }

	jobOrders.create(req.body)
		.then(() => res.send({message: "Tersimpan"}))
		.catch(err => res.status(500).send({message: err.message}))
});

// app.listen(port, () => {
// 	console.log(`Server started on port ${port}`);
// })


