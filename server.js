const express = require("express")
const app = express()
const session = require('express-session');
// const { check, validationResult } = require('express-validator')
// const engine = require('ejs-locals')
require('dotenv').config();
// console.log("all dot env = ", process.env);
const secret_key = process.env.SECRET_KEY
// Set up session middleware
app.use(session({
    secret: secret_key, // used to sign the session ID cookie
    resave: false, // do not save the session if it's not modified
    // do not save new sessions that have not been modified
    saveUninitialized: false
}));
const path = require("path")
const moment = require('moment');
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const cors = require("cors")
const http = require('http');
const port = process.env.PORT || 8080
const CryptoJS = require("crypto-js");
const jwt = require('jsonwebtoken');
const db = require("./models")
const userRoute = require("./routes/userRoute")
const jobOrderRoute = require("./routes/jobOrderRoute")
const corsOptions = {origin: "*"}

// For each request, provide wildcard Access-Control-* headers via OPTIONS call
app.use(cors(corsOptions))

// This is required to handle urlencoded data
app.use(express.urlencoded({ extended: true }));

// This to handle json data coming from requests mainly post
// convert data into json format
app.use(express.json())

// support parsing of application/x-www-form-urlencoded post data
app.use(bodyParser.urlencoded({ extended: true }));

// const urlencodedParser = bodyParser.urlencoded({ extended: false })

// support parsing of application/json type post data
// For each request, parse request body into a JavaScript object where header Content-Type is application/json
app.use(bodyParser.json());

// For each request, parse cookies
app.use(cookieParser());

const { google } = require("googleapis");
const client_email = process.env.CLIENT_EMAIL
const private_key = process.env.PRIVATE_KEY.split(String.raw`\n`).join('\n')
const { MongoClient } = require("mongodb");
const mongoose = require("mongoose");
var dbo;
console.log("secret_key is = ", secret_key);
console.log("client_email is = ", client_email);
console.log("private_key is = ", private_key);

// use ejs-locals for all ejs templates:
// app.engine('ejs', engine);

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

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


// app.use(function(req, res) {
// 	res.status(404);
// 	return res.send('<h1>404 Error: Resource not found</h1>');
// });

// Main Middleware to log session data
app.use((req, res, next) => {
	console.log("Main Middleware");
	console.log('This is middleware of ', req.originalUrl);
    console.log('Session : ', req.session);
	// Cookies that have not been signed
	console.log('Cookies: ', req.cookies)
	// Cookies that have been signed
	console.log('Signed Cookies: ', req.signedCookies)

	// res.locals.formatString = function(str){
	// 	return str.toUpperCase();
	// };

	// res.locals.globalLang = "en";
	// checkUser(req, res, next());

	console.log("main req locals = ", req.locals);
	console.log("main res locals = ", res.locals);

	console.log("app locals = ", app.locals);

	// console.log('User Req : ', req.user);

	// res.locals.user = req.user;

	// const token = req.cookies.jwt;
	// console.log("token in checkUser = ", token);

	// // making sure token exists in the cookies
	// if (token) {
	// 	// verify the token signature
	//   jwt.verify(token, secret_key, async (err, decodedToken) => {
	// 	// wrong jwt token ( token has been tampered with or has expired )
	// 	// set user to null
	// 	if (err) {
	// 	  res.locals.user = null;
	// 	}
	// 	// best case scenario ( everything is perfect )
	// 	else {
	// 		// find user in db, populate user info
	// 		// let user = await db.Users.findById(decodedToken.id);
	// 		// let user = await db.Users.find({email: decodedToken.email});
	// 		let user = await db.Users.findOne({email: decodedToken.email});
	// 		console.log("findById user in checkUser = ", user);
	// 		res.locals.user = user;
	// 	}
	// 	next();
	//   });
	// }
	// // if token does not exist in cookies, then set user to null, and go to next middleware
	// else {
	//   res.locals.user = null;
	//   next();
	// }
    next();
});

// Route to set session data
app.get('/set-session', (req, res) => {
    req.session.user = { id: 1, username: 'GfG User' };
    res.send('Session data set');
});

// Route to get session data
app.get('/get-session', (req, res) => {
    if (req.session.user) {
        res.send('Session data: ' + JSON.stringify(req.session.user));
    } else {
        res.send('No session data found');
    }
});

// Route to destroy session
app.get('/destroy-session', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error('Error destroying session:', err);
            res.send('Error destroying session');
        } else {
            res.send('Session destroyed');
        }
    });
});

const mongooseConfig = {
	useNewUrlParser: true,
	useUnifiedTopology: true,
}

console.log("db url is = ", db.url);

const client = new MongoClient(db.url);

db.mongoose.connect(db.url, mongooseConfig)
	.then(async () => {
		console.log("Connected to MongoDB");
		await client.connect();         
		console.log('Connected successfully to server');
		console.log("client is = ", client);
		dbo = client.db("united-transindo");
		console.log("dbo is = ", dbo);
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

// Pemanggilan routing (utama)
userRoute(app)
jobOrderRoute(app)

// const db_model = require('./models')
// const { jobOrders, databases, Users  } = db_model

async function readGoogleSheet(sheet) {
	// let secretKey = require("./ut-database-center-c0e311032c53.json"), 
	// const tokens = req.cookies.jwt;
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
	let spreadsheetId = '1oNDJFbl-P5jKE9k0QAdxFoDHORLznv0v-zWEXYhX_pA',
	// let spreadsheetId = '1h5_afIl-tH4faCNGnRO-JjE6_r_e2iCnDfb7lb6Ng-U',
		// sheetRange =  sheet === "database" ? 'DATABASE 2024!A1:AQ' : 'Kode Rute!A1:Z',
		sheetRange,
		sheets = google.sheets('v4');
  
	if (sheet === "database") {
	  sheetRange = 'DATABASE 2025!A:AQ';
	} 
	// else if (sheet === "nama pengirim") {
	//   sheetRange = 'Nama Pengirim!A:A';
	// } else if (sheet === "alamat pengirim") {
	//   sheetRange = 'Alamat Pengirim!A:A';
	// } else if (sheet === "kontak pengirim") {
	//   sheetRange = 'Kontak Pengirim!A:A';
	// } else if (sheet === "nama penerima") {
	//   sheetRange = 'Nama Penerima!A:A';
	// } else if (sheet === "alamat penerima") {
	//   sheetRange = 'Alamat Penerima!A:A';
	// } else if (sheet === "kontak penerima") {
	//   sheetRange = 'Kontak Penerima!A:A';
	// } else if (sheet === "merk") {
	//   sheetRange = 'Merk!A:A';
	// } else if (sheet === "type") {
	//   sheetRange = 'Type!A:A';
	// } else if (sheet === "warna") {
	//   sheetRange = 'Warna!A:A';
	// } else if (sheet === "nopol noka") {
	//   sheetRange = 'Nopol Noka!A:A';
	// } 
	else {
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

		console.log("headerTable db is = ", headerTable);
		// console.log("contentTable db is = ", contentTable);
  
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

//   function isEmptyObject(value) {
// 	if (value == null) {
// 	  // null or undefined
// 	  return false;
// 	}
  
// 	if (typeof value !== 'object') {
// 	  // boolean, number, string, function, etc.
// 	  return false;
// 	}
  
// 	const proto = Object.getPrototypeOf(value);
  
// 	// consider `Object.create(null)`, commonly used as a safe map
// 	// before `Map` support, an empty object as well as `{}`
// 	if (proto !== null && proto !== Object.prototype) {
// 	  return false;
// 	}
  
// 	for (let prop in value) {
// 		if (Object.prototype.hasOwnProperty.call(value, prop)) {
// 		  return false;
// 		}
// 	}

// 	return true;
//   }

  const isObjectEmpty = (objectName) => {
	return (
	  objectName &&
	  Object.keys(objectName).length === 0 &&
	  objectName.constructor === Object
	);
  };

//   const userSchema = new mongoose.Schema({
//   }, {
// 	collection: "user"
//   });
  
//   const userModel = mongoose.model("user", userSchema);

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
  
  const tipeUnitSchema = new mongoose.Schema({
	field: String
  }, {
	collection: "tipe-unit"
  });
  
  const tipeUnitModel = mongoose.model("tipe-unit", tipeUnitSchema);
  
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

// app.get("/", (req, res) => res.type('html').send(`
// 	<!DOCTYPE html>
// 	<html>
// 	  <head>
// 		<title>Hello from Render!</title>
// 		<script src="https://cdn.jsdelivr.net/npm/canvas-confetti@1.5.1/dist/confetti.browser.min.js"></script>
// 		<script>
// 		  setTimeout(() => {
// 			confetti({
// 			  particleCount: 100,
// 			  spread: 70,
// 			  origin: { y: 0.6 },
// 			  disableForReducedMotion: true
// 			});
// 		  }, 500);
// 		</script>
// 		<style>
// 		  @import url("https://p.typekit.net/p.css?s=1&k=vnd5zic&ht=tk&f=39475.39476.39477.39478.39479.39480.39481.39482&a=18673890&app=typekit&e=css");
// 		  @font-face {
// 			font-family: "neo-sans";
// 			src: url("https://use.typekit.net/af/00ac0a/00000000000000003b9b2033/27/l?primer=7cdcb44be4a7db8877ffa5c0007b8dd865b3bbc383831fe2ea177f62257a9191&fvd=n7&v=3") format("woff2"), url("https://use.typekit.net/af/00ac0a/00000000000000003b9b2033/27/d?primer=7cdcb44be4a7db8877ffa5c0007b8dd865b3bbc383831fe2ea177f62257a9191&fvd=n7&v=3") format("woff"), url("https://use.typekit.net/af/00ac0a/00000000000000003b9b2033/27/a?primer=7cdcb44be4a7db8877ffa5c0007b8dd865b3bbc383831fe2ea177f62257a9191&fvd=n7&v=3") format("opentype");
// 			font-style: normal;
// 			font-weight: 700;
// 		  }
// 		  html {
// 			font-family: neo-sans;
// 			font-weight: 700;
// 			font-size: calc(62rem / 16);
// 		  }
// 		  body {
// 			background: white;
// 		  }
// 		  section {
// 			border-radius: 1em;
// 			padding: 1em;
// 			position: absolute;
// 			top: 50%;
// 			left: 50%;
// 			margin-right: -50%;
// 			transform: translate(-50%, -50%);
// 		  }
// 		</style>
// 	  </head>
// 	  <body>
// 		<section>
// 		  Hello from Render!
// 		</section>
// 	  </body>
// 	</html>
// `));


// check current user
const checkUser = (req, res, next) => {
	console.log("checkUser called");
	// res.locals.user = "edwinnn"
	console.log("req originalUrl is = ", req.originalUrl)
	console.log("res locals before in checkUser called = ", res.locals);
// const setUserInfo = (req, res, next) => {
	const token = req.cookies.jwt;
	console.log("token in checkUser = ", token);

	// making sure token exists in the cookies
	if (token) {
		// verify the token signature
	  jwt.verify(token, secret_key, async (err, decodedToken) => {
		// wrong jwt token ( token has been tampered with or has expired )
		// set user to null
		if (err) {
		  res.locals.user = null;
		  delete app.locals.user;
		  return res.redirect('/');
		}
		// best case scenario ( everything is perfect )
		else {
			// find user in db, populate user info
			// let user = await db.Users.findById(decodedToken.id);
			// let user = await db.Users.find({email: decodedToken.email});
			let user = await db.Users.findOne({email: decodedToken.email});
			console.log("findById user in checkUser = ", user);
			res.locals.user = user;
			app.locals.user = user;
		}
		console.log("res locals after in checkUser called = ", res.locals);
		next();
	  });
	}
	// if token does not exist in cookies, then set user to null, and go to next middleware
	else {
	  res.locals.user = null;
	  delete app.locals.user;
	  return res.redirect('/');
	//   next();
	}
  };

  const requireAuth = (req, res, next) => {
	const token = req.cookies.jwt;
	console.log("token in requireAuth = ", token);

	// app.use('/admin', function (req, res, next) { // GET 'http://www.example.com/admin/new?a=b'
		console.log("req originalUrl is = ", req.originalUrl) // '/admin/new?a=b' (WARNING: beware query string)
		// console.log(req.baseUrl) // '/admin'
		// console.log(req.path) // '/new'
		// console.log(req.baseUrl + req.path)

	// console.log("req path = ", req.path);
  
	// check json web token exists & is verified
	if (token) {
	  jwt.verify(token, secret_key, (err, decodedToken) => {
		if (err) {
		  console.log("err message in requireAuth = ", err.message);
		  return res.redirect('/');
		} else {
		  console.log("decodedToken in requireAuth = ", decodedToken);
		  next();
		}
	  });
	} else {
	  return res.redirect('/');
	}
  };

// Our Custom Token-Checker Middleware
function authToken(req, res) {
    const authCookie = req.cookies['authcookie'];

    // If there is no cookie, return an error
    if(!authCookie) return res.sendStatus(401);

    // If there is a cookie, verify it
    jwt.verify(authCookie, secret_key, (err, user) => {
        // If there is an error, return an error
        if(err) return res.sendStatus(403);

        // If there is no error, continue the execution
        req.user = user;
        next();
    })
}

app.get('auth/me', authToken, (req, res) => {
    /* If the checkToken function succeeds, the API reaches this block. 
    At this point, you have the freedom to perform any desired actions. 
    Additionally, you can access req.user, a parameter sent from 
    the checkToken function. */
    
     // If the user is authenticated, return the user
    res.json(req.user);
})

app.get('/auth/register', (req, res) => {
    const {email, username, password} = req.body;

    // Check if email and username exists and blah blah validation steps...

    // If every validation passes, store it in the Database

    // Create a JWT Token
    const token = jwt.sign({email, username}, secret_key);

    // Store the token in the cookie
    res.cookie('authcookie',token,{maxAge:2000,httpOnly:true}) 
})


app.get('/auth/login', (req, res) => {   
    const {email, password} = req.body;

    // Check if email exists and match passwords

    // If every validation passes, create a JWT token
    const token = jwt.sign({email, username}, secret_key);

    // Store the token in the cookie
    res.cookie('authcookie',token,{maxAge:2000,httpOnly:true}) 
})

const authenticateToken = (req, res, next) => {
	const { authorization } = req.headers;

	if (!authorization) {
		return res.status(401).json({message: "Authorization Failed"})
	}

	// if (req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Bearer') { // Authorization: Bearer g1jipjgi1ifjioj
	// 	// Handle token presented as a Bearer token in the Authorization header
	// 	return req.headers.authorization.split(' ')[1];
	//   } else if (req.query && req.query.token) {
	// 	// Handle token presented as URI param
	// 	return req.query.token;
	//   } else if (req.cookies && req.cookies.token) {
	// 	// Handle token presented as a cookie parameter
	// 	return req.cookies.token;
	//   }
	//   // If we return null, we couldn't find a token.
	//   // In this case, the JWT middleware will return a 401 (unauthorized) to the client for this request
	//   return null;

	const token = authorization.split(" ")[1];

	try {
		const jwtDecode = jwt.verify(token, secret_key);
		console.log("jwtDecode is = ", jwtDecode);
		req.userData = jwtDecode
	} catch (error) {
		return res.status(401).json({message: "Unauthorized"})
	}

	accessValidation(req, res, next)
	next()
};

const accessValidation  = (req, res, next) => {
	// if (req.session.user) {
	// 	res.render("dashboard", {
	// 		session: req.session,
	// 		// message:"",
	// 		// errorMessage:"",	
	// 		// resultArr:[]
	// 	});
	// } else {
	// 	// window.history.replaceState(null, 'United Transindo Admin Dashboard', '/sign-in');
	// 	// location.pathname = "/sign-in";
    //     res.status(401).render("sign-in", {
	// 		message:"",
	// 		errorMessage:"",	
	// 		resultArr:[]
	// 	});
    // }
	if (!req.session.user) {
		res.status(401).render("sign-in", {
			message: "User must sign in first",
		});
	}
};

// app.get('*', setUserInfo);
// app.get('*', checkUser);
// app.get('*', requireAuth);

app.get("/", async(req, res,) => {
	res.render("sign-in");
});

// app.get("/listPagi", async(req, res,) => {
// 	res.render("listPagi");
// });

// app.get("/select2", async(req, res,) => {
// 	res.render("select2");
// });

// app.get("/index", async(req, res) => {
// 	res.render("index", {
// 	  message:"",
// 	  errorMessage:"",	
// 	  resultArr:[]
// 	});
// });

app.get("/sign-up", async(req, res) => {
	res.render("sign-up");
});

app.post("/sign-up", async(req, res) => {
	console.log("req body of sign-up = ", req.body);
	// console.log(db.Users);
	const {
		username,
		name,
		email,
		role,
		userLocation,
		password,
		confirm_password,
	} = req.body;
	let errorResult = {}

	console.log("username in req body = ", username);
	console.log("name in req body = ", name);
	console.log("email in req body = ", email);
	console.log("role in req body = ", role);
	console.log("location in req body = ", userLocation);
	console.log("password in req body = ", password);
	console.log("confirm_password in req body = ", confirm_password);

	if (!username || !name || !email || !role || !userLocation || !password || !confirm_password) {
		if (!username) errorResult.username = `Field Username cannot be empty`
		if (!name) errorResult.name = `Field Name cannot be empty`
		if (!email) errorResult.email = `Field Email cannot be empty`
		if (!role) errorResult.role = `Role Option must be selected`
		if (!userLocation) errorResult.location = `Location Option must be selected`
		if (!password) errorResult.password = `Field Password cannot be empty`
		if (!confirm_password) errorResult.confirm_password = `Field Confirm Password cannot be empty`
		if (password && confirm_password && password !== confirm_password) {
			errorResult = {confirm_password: "Incorrect Confirm Password", message: "Field Password and Confirm Password doesn't match"};
		}
		// res.status(400).send(errorResult);
		// res.status(400).json(errorResult);
		return res.status(422).json({errors: errorResult});
	// 	const errors = handleErrors(err);
    // res.status(400).json({ errors:  });
    } else {
		if (password !== confirm_password) {
			// return res.status(400).send({message:"Field Password and Confirm Password doesn't match"});
			errorResult = {confirm_password: "Incorrect Confirm Password", message: "Field Password and Confirm Password doesn't match"};
			return res.status(422).json({errors: errorResult});
		} else {
			// Check if the username already exists in the database
			// const existingUser = await db.Users.findOne({ email: email });
			// const existingUser = await db.Users.find({ email: email });
	
			// db.Users.find({ email: email}, function (err, docs) {
			// 	if (err){
			// 		console.log(err);
			// 	}
			// 	else {
			// 		console.log("Second function call : ", docs);
			// 	}
			// });
			const existingUser = await db.Users.find({ $or:[ {'username':username}, {'email':email} ]})
				.catch(function(err) {
				console.log(err);
				});
				console.log("existingUser is = ", existingUser);
	
			if (existingUser.length) {
				errorResult = {message: "User already exists. Please choose a different email and username"};
				return res.status(409).json({errors: errorResult});
				// res.status(401).send({message:'User already exists. Please choose a different email and username'});
			} else {
				// Hash the password using bcrypt
				// const saltRounds = 10; // Number of salt rounds for bcrypt
				// const hashedPassword = await bcrypt.hash(data.password, saltRounds);
		
				// data.password = hashedPassword; // Replace the original password with the hashed one
	
				const cipherText = CryptoJS.AES.encrypt(password, secret_key).toString();
				console.log("cipherText is = ", cipherText);
	
				const newUser = {
					username: username,
					name: name,
					email: email,
					role: role,
					location: userLocation,
					password: cipherText,
				};
	
				try {
					await client.connect();
	
					const result = await dbo.collection('user').insertOne(newUser);
	
					console.log('New users sucessfully registered =>', result);

					const token = jwt.sign(newUser, secret_key, {expiresIn: 3600 * 1000});
					console.log("jwt token user sign up = ", token);
					
					res.cookie('jwt', token, { httpOnly: true, maxAge: 3 * 24 * 60 * 60 * 1000 });

					res.locals = {
						user: newUser,
						token
					}
					console.log("res locals sign up = ", res.locals);
	
					// res.status(201).render("dashboard");
					res.status(201).json({ user: result });
				} catch (err) {
					console.error(err);
					errorResult = {message: "new user registration failed"};
					return res.status(400).json({errors: errorResult});
				} finally {
					await client.close();
				}

				

				// console.log('Sign In Session : ', res.session);
				// // Cookies that have not been signed
				// console.log('Sign In Cookies: ', res.cookies)
				// Cookies that have been signed
				// console.log('Sign In Signed Cookies: ', req.signedCookies)

				// res.status(200).json({ user: userExist })
	
				// await db.Users.create({
				// 	username: username,
				// 	name: name,
				// 	email: email,
				// 	role: role,
				// 	location: location,
				// 	password: encrypted,
				// })
				// .then(() => res.send({message: `${name} is successfully registered`}))
				// 	.catch(err => res.status(500).send({message: err.message}))
	
				// const insertUser = new userModel({
				// 	username: username,
				// 	name: name,
				// 	email: email,
				// 	role: role,
				// 	location: location,
				// 	password: encrypted,
				// });
	
				// console.log("insertUser before insert = ", insertUser);
	
				// try {
				// 	const insertData = await insertUser.save();
				// 	console.log("insertData is = ", insertData);
				// 	res.status(201).send(insertData); 
				// } catch(err) {
				// 	console.log(err);
				// }
		
				// const userdata = await db.Users.save(req.body);
				// console.log(userdata);
				// res.status(201).send(userdata);
			}
		}
	}
});

app.get("/sign-in", async(req, res) => {
	res.render("sign-in");
});

app.post("/sign-in", async(req, res) => {
	console.log("req body of sign-in = ", req.body);

	const {
		email,
		password,
	} = req.body;
	let errorResult = {}, userExist;

	if (!email || !password) {
        if (!email) errorResult.email = `Field Email cannot be empty`
		else if (/^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(email) === false) {
			errorResult.email = `Email Address is not valid`
		}
        if (!password) errorResult.password = `Field Password cannot be empty`
		return res.status(400).json({errors: errorResult});
    } else {
		const existingUser = await db.Users.findOne({ email })
			.then()
			.catch(function(err) {
				console.log(err);
			});
		console.log("existingUser is = ", existingUser);

		if (isObjectEmpty(existingUser) === false) {
			userExist = existingUser.toObject();

			try {
				const bytes = CryptoJS.AES.decrypt(userExist.password, secret_key);
				if (bytes.sigBytes > 0) {
					const decryptedData = bytes.toString(CryptoJS.enc.Utf8);
					console.log("decryptedData is = ", decryptedData);
					if (password !== decryptedData) {
						errorResult.password = "Incorrect Password";
						return res.status(400).json({errors: errorResult});
					}
				} else {
					throw new Error('Decryption Failed Invalid Key')
				}
			} catch (error) {
				throw new Error('Decryption Failed Invalid Key')
			}

			const token = jwt.sign(userExist, secret_key, {expiresIn: 3600 * 1000});
			console.log("jwt token user sign in = ", token);
			// res.session.user = userExist;
			// res.session.token = token;
			// req.session = {
			// 	user: userExist,
			// 	token
			// }
			res.cookie('jwt', token, { httpOnly: true, maxAge: 3 * 24 * 60 * 60 * 1000 });

			app.locals.user = userExist;

			res.locals = {
				user: userExist,
				token
			}
			console.log("res locals = ", res.locals);

			res.status(200).json({ user: userExist })

			// return res.render("dashboard");

			// return res.redirect("/dashboard");

			// return res.render("dashboard", {
			// 	user: res.locals.user,
			// });

			// return res.status(200).json({ user: userExist }).redirect("dashboard", {
			// 	user: userExist
			// });

			// res.redirect("/dashboard")

			// res.redirect("/dashboard", {
			// 	title: "index"
			// });

			// res.redirect({user: userExist}, "/dashboard")
		} else {
			errorResult = {email: "Incorrect Email Address", message: "User is not found"};
			return res.status(401).json({errors: errorResult});
		}
	}
});

app.get("/sign-out", async(req, res) => {
	// req.session.destroy((err) => {
    //     if (err) {
    //         console.error('Error destroying session:', err);
    //         res.send('Error destroying session');
    //     }
    // });
	// res.render("home");
	res.cookie('jwt', '', { maxAge: 1 });
  	res.redirect('/');
});

function encrypt(data, key) {
    const cipherText = CryptoJS.AES.encrypt(data, key).toString();
    return cipherText;
}

function decrypt(cipherText, key) {
    try {
        const bytes = CryptoJS.AES.decrypt(cipherText, key);
        if (bytes.sigBytes > 0) {
            const decryptedData = bytes.toString(CryptoJS.enc.Utf8);
            return decryptedData;
        } else {
            throw new Error('Decryption Failed Invalid Key')
        }
    } catch (error) {
        throw new Error('Decryption Failed Invalid Key')
    }
}

app.post('/encrypt',(req, res) => {
    const { data, key } = req.body;
    const encrypted = encrypt(data, key);
    res.json({ encrypted });
});

app.post('/decrypt',(req, res) => {
    const { encryptedData, key } = req.body;
    const decryptedData = decrypt(encryptedData, key);
    res.json({ decryptedData });
});

// Route to set session data
// app.get('/set-session', (req, res) => {
//     req.session.user = { id: 1, username: 'GfG User' };
//     res.send('Session data set');
// });

// Route to get session data
// app.get('/get-session', (req, res) => {
//     if (req.session.user) {
//         res.send('Session data: ' + JSON.stringify(req.session.user));
//     } else {
//         res.send('No session data found');
//     }
// });

// Route to destroy session
// app.get('/destroy-session', (req, res) => {
//     req.session.destroy((err) => {
//         if (err) {
//             console.error('Error destroying session:', err);
//             res.send('Error destroying session');
//         } else {
//             res.send('Session destroyed');
//         }
//     });
// });

// app.get("/dashboard", requireAuth, async(req, res) => {
app.get("/dashboard", checkUser, async(req, res) => {
	res.render("dashboard");
});

app.get("/database", checkUser, async(req, res) => {
	// console.log("contentTable = ", await readGoogleSheet("database"));
	// let { headerTable, contentTable } = await readGoogleSheet("database");
	let contentTable = await db.databases.find().catch(err => res.status(500).send({message: err.message})),
		headerTable = Object.keys(contentTable[0].toObject()),
		dataTable = []
		// list_no_joj = contentTable.map((data) => data.toObject()["no_joj"]).map((value) => Number(value));

	// contentTable = 

	// console.log("key bfr = ", Object.keys(contentTable[0]));
	// console.log("key aft = ", Object.keys(contentTable[0].toObject()));
	
	headerTable.splice(headerTable.indexOf("_id"), 1);

	headerTable.splice(headerTable.indexOf("PENGIRIM"), 0, ...["NAMA PENGIRIM", "ALAMAT PENGIRIM", "KONTAK PENGIRIM"]);

	headerTable.splice(headerTable.indexOf("PENGIRIM"), 1);

	headerTable.splice(headerTable.indexOf("PENERIMA"), 0, ...["NAMA PENERIMA", "ALAMAT PENERIMA", "KONTAK PENERIMA"]);

	headerTable.splice(headerTable.indexOf("PENERIMA"), 1);

	console.log("result of headerTable is = ", headerTable);

	const phoneExp = /(?:(?:\+?1\s*(?:[.-]\s*)?)?(?:\(\s*([2-9]1[02-9]|[2-9][02-8]1|[2-9][02-8][02-9])\s*\)|([2-9]1[02-9]|[2-9][02-8]1|[2-9][02-8][02-9]))\s*(?:[.-]\s*)?)?([2-9]1[02-9]|[2-9][02-9]1|[2-9][02-9]{2})\s*(?:[.-]\s*)?([0-9]{4})(?:\s*(?:#|x\.?|ext\.?|extension)\s*(\d+))?/img;

	contentTable.forEach((content) => {
		// console.log(content["_id"]); 
		content = content.toObject();
		// console.log("key content bfr = ", Object.keys(content));
		delete content["_id"]; 
		// console.log("key content aft = ", Object.keys(content));
		// console.log("content = ", content);

		let [nama_pengirim, alamat_pengirim, kontak_pengirim] = content["PENGIRIM"].split(";");
		if (nama_pengirim) nama_pengirim = nama_pengirim.trim();
		if (alamat_pengirim) alamat_pengirim = alamat_pengirim.trim();
		if (kontak_pengirim) kontak_pengirim = kontak_pengirim.trim();
		if (phoneExp.test(alamat_pengirim)) {
			kontak_pengirim = alamat_pengirim;
			alamat_pengirim = undefined;
		}

		let keyValuesPengirim = Object.entries(content);
		keyValuesPengirim.splice(Object.keys(content).indexOf("PENGIRIM"), 1);
		keyValuesPengirim.splice(Object.keys(content).indexOf("PENGIRIM"), 0, ["NAMA PENGIRIM", nama_pengirim],["ALAMAT PENGIRIM", alamat_pengirim],["KONTAK PENGIRIM",kontak_pengirim]);
		content = Object.fromEntries(keyValuesPengirim);

		let [nama_penerima, alamat_penerima, kontak_penerima] = content["PENERIMA"].split(";");
		if (nama_penerima) nama_penerima = nama_penerima.trim();
		if (alamat_penerima) alamat_penerima = alamat_penerima.trim();
		if (kontak_penerima) kontak_penerima = kontak_penerima.trim();
        if (phoneExp.test(alamat_penerima)) {
          kontak_penerima = alamat_penerima;
          alamat_penerima = undefined;
        }

		let keyValuesPenerima = Object.entries(content);
		keyValuesPenerima.splice(Object.keys(content).indexOf("PENERIMA"), 1);
		keyValuesPenerima.splice(Object.keys(content).indexOf("PENERIMA"), 0, ["NAMA PENERIMA", nama_penerima],["ALAMAT PENERIMA", alamat_penerima],["KONTAK PENERIMA",kontak_penerima]);
		content = Object.fromEntries(keyValuesPenerima);
		

		dataTable.push(content)
		return content;
	});
	
	res.locals.headerTable = headerTable
	res.locals.contentTable = dataTable

	return res.status(200).render("database", {
		headerTable,
		contentTable: dataTable,
	});
});

app.get("/profile", checkUser, async(req, res) => {
	let userPassword = decrypt(res.locals.user.toObject().password, secret_key);
	res.render("profile", {
		userPassword,
	});
});

app.get("/input-job-order", checkUser, async(req, res) => {
	// console.log(await readGoogleSheet("database"));
	// let { contentTable } = await readGoogleSheet("database");

	console.log("res locals in get input-job-order called = ", res.locals);
	if (res.locals.user.role !== "Marketing") {
		return res.status(401).send("No Have Access To This Page");
	}
	let contentTable, list_no_joj;

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

	contentTable = await db.JobOrders.find().catch(err => res.status(500).send({message: err.message}))

	// console.log("contentTable is = ", contentTable);

	// list_no_joj = contentTable.map((data) => data["NO"][" JOJ"]).map((value) => Number(value));

	// console.log("headerTable from read google sheet is = ", headerTable);

	// let list_no_joj = contentTable.map((data) => data["NO. JOJ"]).map((value) => Number(value));

	list_no_joj = contentTable.map((data) => data.toObject()["no_joj"]).map((value) => Number(value));

	console.log("list_no_joj is = ", list_no_joj);

	const findMax = value => value.reduce((res, cur) => res < cur ? cur : res, -Infinity);

	console.log("find max of no joj = ", findMax(list_no_joj));

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
  let listTipeUnit = await tipeUnitModel.find({}).select({"field": 1, "_id": 0})
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
  listTipeUnit = listTipeUnit.map((data) => data.field);
  listWarnaUnit = listWarnaUnit.map((data) => data.field);

  if (!getData) {
    return res.status(500).send("Request Timeout - Internal Server Error \n There is problem when getting data");
  } else {
    return res.status(200).render("input-job-order", {
      // contentTable,
      no_joj: Number(findMax(list_no_joj)) + 1,
    //   no_joj: 6385,
      listNamaPengirim,
      listAlamatPengirim,
      listKontakPengirim,
      listNamaPenerima,
      listAlamatPenerima,
      listKontakPenerima,
      listMerkUnit,
      listTipeUnit,
      listWarnaUnit,
      // listNopolNokaUnit,
    //   message:"",
    //   errorMessage:"",
    //   resultArr:[]
    });
  }
});

app.post("/input-job-order", checkUser, async(req, res, next) => {
	console.log("res locals in post input-job-order called = ", res.locals);
	console.log("req body of post input-job-order = ", req.body);
  
	let {
		no_joj,
		city_code,
		tgl_wkt_dibuat,
		nama_pengirim,
		alamat_pengirim,
		kontak_pengirim,
		nama_penerima,
		alamat_penerima,
		kontak_penerima,
		hr_tgl_ambil,
		qty,
		merk,
		tipe,
		nopol_noka,
		warna,
		status,
		kondisi,
		lainnya,
		new_list_nama_pengirim,
		new_list_alamat_pengirim,
		new_list_kontak_pengirim,
		new_list_nama_penerima,
		new_list_alamat_penerima,
		new_list_kontak_penerima,
		new_list_merk_unit,
		new_list_tipe_unit,
		new_list_warna_unit,
		nominal,
		moda,
		invoice,
		transfer_by,
		tagihan,
		tagihan_top,
		opsi_tagihan_top,
		penawaran_kontrak,
		opsi_penawaran_kontrak,
		no_opsi_penawaran_kontrak,
		handling,
		nominal_handling,
		nama_penerima_handling,
		asuransi,
		perincian_asuransi,
		biaya_koord,
		keterangan_biaya_koord,
		note,
		dibuat_oleh,
		ttd_dibuat_oleh
	} = req.body;
	// let dbo = mongoose.db
  
	var newJobOrder = {
		no_joj,
		city_code,
		tgl_wkt_dibuat,
		nama_pengirim,
		alamat_pengirim,
		kontak_pengirim,
		nama_penerima,
		alamat_penerima,
		kontak_penerima,
		hr_tgl_ambil,
		qty,
		merk,
		tipe,
		nopol_noka,
		warna,
		status,
		kondisi,
		lainnya,
		nominal,
		moda,
		invoice,
		transfer_by,
		tagihan,
		tagihan_top,
		opsi_tagihan_top,
		penawaran_kontrak,
		opsi_penawaran_kontrak,
		no_opsi_penawaran_kontrak,
		handling,
		nominal_handling,
		nama_penerima_handling,
		asuransi,
		perincian_asuransi,
		biaya_koord,
		keterangan_biaya_koord,
		note,
		dibuat_oleh,
		ttd_dibuat_oleh
	}
  
	try {
	  // Connect to the MongoDB client
	  await client.connect();

		if (new_list_nama_pengirim.length) {
			await dbo.collection('nama-pengirim').insertMany(new_list_nama_pengirim);
		}

	  if (new_list_alamat_pengirim.length) {
		await dbo.collection('alamat-pengirim').insertMany(new_list_alamat_pengirim);
		}
	 if (new_list_kontak_pengirim.length) {
	  await dbo.collection('kontak-pengirim').insertMany(new_list_kontak_pengirim);
	  } 
	 if (new_list_nama_penerima.length) {
	  await dbo.collection('nama-penerima').insertMany(new_list_nama_penerima);
	  } 
	 if (new_list_alamat_penerima.length) {
	  await dbo.collection('alamat-penerima').insertMany(new_list_alamat_penerima);
	  } 
	 if (new_list_kontak_penerima.length) {
	  await dbo.collection('kontak-penerima').insertMany(new_list_kontak_penerima);
	  } 
	 if (new_list_merk_unit.length) {
	  await dbo.collection('merk-unit').insertMany(new_list_merk_unit);
	  } 
	 if (new_list_tipe_unit.length) {
	  await dbo.collection('tipe-unit').insertMany(new_list_tipe_unit);
	  } 
	 if (new_list_warna_unit.length) {
	  await dbo.collection('warna-unit').insertMany(new_list_warna_unit);
	  }
  
	  // Insert operation after successful connection
	  const result = await dbo.collection('job-order').insertOne(newJobOrder);
	  
	  // Insert into collection
	  console.log('Inserted Job Order =>', result);
	} catch (err) {
	  console.error(err);
		errorResult = {message: "Add new job order failed"};
		return res.status(400).json({errors: errorResult});
	} finally {
	  // Ensure the client is closed when done
	  await client.close();
	}

	// checkUser(req, res, next);

	console.log("req cookies before render to jo detail = ", req.cookies);
	console.log("res locals before render to jo detail = ", res.locals);

	// const token = req.cookies.jwt;
	// console.log("token in checkUser = ", token);

	// // making sure token exists in the cookies
	// if (token) {
	// 	// verify the token signature
	//   jwt.verify(token, secret_key, async (err, decodedToken) => {
	// 	// wrong jwt token ( token has been tampered with or has expired )
	// 	// set user to null
	// 	if (err) {
	// 	  res.locals.user = null;
	// 	}
	// 	// best case scenario ( everything is perfect )
	// 	else {
	// 		// find user in db, populate user info
	// 		// let user = await db.Users.findById(decodedToken.id);
	// 		// let user = await db.Users.find({email: decodedToken.email});
	// 		let user = await db.Users.findOne({email: decodedToken.email});
	// 		console.log("findById user in checkUser = ", user);
	// 		res.locals.user = user.toObject();
	// 	}
	// 	// next();
	//   });
	// }
	// // if token does not exist in cookies, then set user to null, and go to next middleware
	// else {
	//   res.locals.user = null;
	// //   next();
	// }

	// console.log("res locals after when to render to jo detail = ", res.locals);

	// req.session = false;

	// req.session = {
	// 	user: userExist,
	// 	token
	// }

	// let pathname = req.path

	// return res.status(200).render(`job-order/${newJobOrder.no_joj}`, { viewOnly: false, jobOrder })
	// res.setHeader("Content-Type", "text/html");
		// res.writeHead(200, { 'Content-Type':'text/html'});
		res.locals.pathname = req.path
	res.locals.saveFile = req.path.split("/").filter(Boolean)[0] === "approve-job-order" ? false : true;

	res.set('Content-Type', 'text/html');
	res.status(200).render(`job-order-detail`, { viewOnly: false, jobOrder: newJobOrder, }, (err, html) => {
		if (err) {
		  return next(err); // Handle error appropriately
		}
		// console.log("html is = ", html);
		
		res.send(html);
		res.end(html);
		// res.json({success : true})
		// console.log("in render method");
	  })

	//   response.render('the_vacation.ejs', { vacations : vacations, current_user : new_current_user }, function() {
	// 	response.json({success : true});
	// 	console.log("in render method");
	//   }); 

	// jobOrders.create(req.body)
	// 	.then(() => res.send({message: "Tersimpan"}))
	// 	.catch(err => res.status(500).send({message: err.message}))
});

app.put("/input-job-order/:no_joj", checkUser, async(req, res, next) => {
	console.log("req body of update input-job-order = ", req.body);
	const {no_joj} = req.params
	let errorResult = {}
  
	let {
		disetujui_oleh,
		ttd_disetujui_oleh
	} = req.body;
	// let dbo = mongoose.db

	try {
		await client.connect();
	
		const result = await dbo.collection('job-order').updateOne({no_joj},{$set:{disetujui_oleh,
			ttd_disetujui_oleh}});
		
		console.log('Updated Job Order =>', result);
	  } catch (err) {
		console.error(err);
		  errorResult = {message: "Update job order failed"};
		  return res.status(400).json({errors: errorResult});
	  } finally {
		await client.close();
	  }
});

app.get(["/job-order/:no_joj", "/approve-job-order/:no_joj"], checkUser, async(req, res, next) => {
	console.log("req path jo detail is = ", req.path);
	// let pathname = req.path
	const {no_joj} = req.params
	let errorResult = {}
	// console.log(await db.JobOrders.find({no_joj}));
	const jobOrder = await db.JobOrders.findOne({ no_joj })
			.then(data => {return data.toObject();})
			.catch(function(err) {
				console.log(err);
			});
	console.log("get jobOrder by no joj in job-order-detail called is = ", jobOrder);

	// res.locals.jobOrder = jobOrder.toObject();
	// app.locals.jobOrder = jobOrder.toObject();
	

	// let saveFile

	// if (res.locals.user.role === "Marketing") {
	// 	saveFile = 
	// } else if (res.locals.user.role === "Operational") {

	// }

	// if (req.path.split("/")[0] === "approve-job-order") {
	// 	saveFile = false;
	// } else if (req.path.split("/")[0] === "job-order") {
	// 	saveFile = true;
	// }
	
	// console.log("pathname jo detail is = ", pathname);

	// res.locals.title = req.path.split("/")[0]
	res.locals.pathname = req.path
	res.locals.saveFile = req.path.split("/").filter(Boolean)[0] === "approve-job-order" ? false : true;

	console.log("res locals in job-order-detail called = ", res.locals);

	if (!isObjectEmpty(jobOrder)) {
		// return res.status(200).render(`job-order/${jobOrder.no_joj}`, { viewOnly: true, jobOrder })
		return res.status(200).render(`job-order-detail`, { viewOnly: true, jobOrder, })
	} else {
		errorResult = {title: "Invalid No JO", message: "Job Order is not found"};
		return res.status(404).json({errors: errorResult});
	}
});

app.get("/waitlist-approve-job-order", checkUser, async(req, res) => {
	// res.locals.user = null;
	
	const { user } = res.locals
	console.log("user in waitlist = ", user);

	let waitlistJobOrder = [];

	if (user.role === "Marketing") {
		waitlistJobOrder = await db.JobOrders.find({
			dibuat_oleh: res.locals.user.username, 
			disetujui_oleh: null
		})
		.catch(function(err) {
			console.log(err);
		});
	} else if (user.role === "Operational") {
		let city_code
		if (user.location === "Sidoarjo") {
            city_code = "01";
          } else if (user.location === "Cikarang") {
            city_code = "02";
          } else if (user.location === "Jakarta") {
            city_code = "03";
          } else if (user.location === "Makassar") {
            city_code = "04";
          }
			waitlistJobOrder = await db.JobOrders.find({city_code, disetujui_oleh: null})
				.catch(function(err) {
				console.log(err);
				});
	}

	 
	console.log("waitlistJobOrder is = ", waitlistJobOrder.length);

	return res.status(200).render("waitlist-approve-job-order", {
		waitlistJobOrder
	});
});

app.get("/approved-job-order", checkUser, async(req, res) => {
	// res.locals.user = null;
	
	const { user } = res.locals
	console.log("user in approved = ", user);

	let JobOrder = [];

	// if (user.role === "Marketing") {
	// 	waitlistJobOrder = await db.JobOrders.find({
	// 		dibuat_oleh: user.username, 
	// 		disetujui_oleh: 
	// 	})
	// 			.catch(function(err) {
	// 			console.log(err);
	// 			});
	// } else if (user.role === "Operational") {
	// 	let city_code
	// 	if (user.location === "Sidoarjo") {
    //         city_code = "01";
    //       } else if (user.location === "Cikarang") {
    //         city_code = "02";
    //       } else if (user.location === "Jakarta") {
    //         city_code = "03";
    //       } else if (user.location === "Makassar") {
    //         city_code = "04";
    //       }
	// 		waitlistJobOrder = await db.JobOrders.find({city_code})
	// 			.catch(function(err) {
	// 			console.log(err);
	// 			});
	// }

	JobOrder = await db.JobOrders.find({
		disetujui_oleh: user.username, 
	})

	 
				console.log("JobOrder is = ", JobOrder.length);
	
				return res.status(200).render("approved-job-order", {
					JobOrder
				  });
});

app.get("/history-job-order", checkUser, async(req, res) => {
	let contentTable = await db.JobOrders.find().catch(err => res.status(500).send({message: err.message})),
		headerTable = [
			'No. Job Order',
			'Kota',
			'Nama Pengirim',
			'Alamat Pengirim',
			'Kontak Pengirim',
			'Nama Penerima',
			'Alamat Penerima',
			'Kontak Penerima',
			'Hari / Tanggal Pengambilan',
			'Merk Unit',
			'Type Unit',
			'Nopol / Noka Unit',
			'Warna Unit',
			'Status Unit',
			'Kondisi Surat Unit',
			// 'Keterangan Lainnya',
			'Nominal',
			'Moda',
			'Invoice a.n.',
			'Transfer By',
			'Tagihan',
			'TOP Tagihan',
			'Penawaran / Kontrak',
			'No. Penawaran / Kontrak',
			// 'Keterangan Penawaran / Kontrak',
			// 'Handling',
			// 'Keterangan Handling',
			'Nominal Handling',
			'Nama Penerima Handling',
			'Asuransi',
			// 'Rincian Asuransi',
			'Biaya Koordinasi / Kawal',
			'Note',
			'Dibuat Oleh',
			'Tanggal Jam Dibuat',
			'Disetujui Oleh',
			'Tanggal Jam Disetujui',
		],
		dataTable = []
		// list_no_joj = contentTable.map((data) => data.toObject()["no_joj"]).map((value) => Number(value));

	// contentTable = 

	// console.log("key bfr = ", Object.keys(contentTable[0]));
	// console.log("key aft = ", Object.keys(contentTable[0].toObject()));
	
	// headerTable.splice(headerTable.indexOf("_id"), 1);

	// headerTable.splice(headerTable.indexOf("PENGIRIM"), 0, ...["NAMA PENGIRIM", "ALAMAT PENGIRIM", "KONTAK PENGIRIM"]);

	// headerTable.splice(headerTable.indexOf("PENGIRIM"), 1);

	// headerTable.splice(headerTable.indexOf("PENERIMA"), 0, ...["NAMA PENERIMA", "ALAMAT PENERIMA", "KONTAK PENERIMA"]);

	// headerTable.splice(headerTable.indexOf("PENERIMA"), 1);

	// console.log("result of headerTable is = ", headerTable);

	// const phoneExp = /(?:(?:\+?1\s*(?:[.-]\s*)?)?(?:\(\s*([2-9]1[02-9]|[2-9][02-8]1|[2-9][02-8][02-9])\s*\)|([2-9]1[02-9]|[2-9][02-8]1|[2-9][02-8][02-9]))\s*(?:[.-]\s*)?)?([2-9]1[02-9]|[2-9][02-9]1|[2-9][02-9]{2})\s*(?:[.-]\s*)?([0-9]{4})(?:\s*(?:#|x\.?|ext\.?|extension)\s*(\d+))?/img;

	contentTable.forEach((content) => {
		// console.log(content["_id"]); 
		content = content.toObject();
		// console.log("key content bfr = ", Object.keys(content));
		delete content["_id"]; 
		// console.log("key content aft = ", Object.keys(content));
		// console.log("content = ", content);
		
		for (let index = 0; index < Number(content['qty']); index++) {
			let data = {};
			
			data['No. Job Order'] = content['no_joj'] ? content['no_joj'] : "-";
			if (content['city_code']) {
				switch (content['city_code']) {
					case "01":
						data['Kota'] = "Sidoarjo";
						break;
					case "02":
						data['Kota'] = "Cikarang";
						break;
					case "03":
						data['Kota'] = "Jakarta";
						break;
					case "04":
						data['Kota'] = "Makassar";
						break;
				}
			} else {
				data['Kota'] = "-";
			}
			data['Nama Pengirim'] = content['nama_pengirim'] ? content['nama_pengirim'] : "-";
			data['Alamat Pengirim'] = content['alamat_pengirim'] ? content['alamat_pengirim'] : "-";
			data['Kontak Pengirim'] = content['kontak_pengirim'] ? content['kontak_pengirim'] : "-";
			data['Nama Penerima'] = content['nama_penerima'] ? content['nama_penerima'] : "-";
			data['Alamat Penerima'] = content['alamat_penerima'] ? content['alamat_penerima'] : "-";
			data['Kontak Penerima'] = content['kontak_penerima'] ? content['kontak_penerima'] : "-";
			data['Hari / Tanggal Pengambilan'] = content['hr_tgl_ambil'] ? content['hr_tgl_ambil'] : "-";
			data['Merk Unit'] = content['merk'] && content['merk'][index] ? content['merk'][index] : "-";
			data['Type Unit'] = content['tipe'] && content['tipe'][index] ? content['tipe'][index] : "-";
			data['Nopol / Noka Unit'] = content['nopol_noka'] && content['nopol_noka'][index] ? content['nopol_noka'][index] : "-";
			data['Warna Unit'] = content['warna'] && content['warna'][index] ? content['warna'][index] : "-";
			data['Status Unit'] = content['status'] && content['status'][index] ? content['status'][index] : "-";

			if (content['kondisi'] && content['kondisi'][index]) {
				if (content['kondisi'][index] === "lainnya") {
					if (content['lainnya'][index]) {
						data['Kondisi Surat Unit'] = content['lainnya'][index];
					} else {
						data['Kondisi Surat Unit'] = "lainnya";
					}
				} else {
					data['Kondisi Surat Unit'] = content['kondisi'][index];
				}
			} else {
				data['Kondisi Surat Unit'] = "-";
			}
			data['Nominal'] = content['nominal'] ? content['nominal'] : "0";
			data['Moda'] = content['moda'] ? content['moda'] : "-";
			data['Invoice a.n.'] = content['invoice'] ? content['invoice'] : "-";
			data['Transfer By'] = content['transfer_by'] ? content['transfer_by'] : "T/A";
			data['Tagihan'] = content['tagihan'] ? content['tagihan'] : "T/A";
			if (content['tagihan_top']) {
				if (content['opsi_tagihan_top'] === "hari_kerja") {
					data['TOP Tagihan'] = content['tagihan_top'] + " hari kerja";
				} else if (content['opsi_tagihan_top'] === "kalender") {
					data['TOP Tagihan'] = content['tagihan_top'] + " hari kalender";
				}
			} else {
				data['TOP Tagihan'] = "T/A";
			}
			if (content['penawaran_kontrak'] === "ada") {
				if (content['opsi_penawaran_kontrak'] === "penawaran") {
					data['Penawaran / Kontrak'] = "Surat Penawaran";
				} else if (content['opsi_penawaran_kontrak'] === "kontrak") {
					data['Penawaran / Kontrak'] = "Kontrak";
				} else if (content['opsi_penawaran_kontrak'] === "ban") {
					data['Penawaran / Kontrak'] = "BAN (Berita Acara Negosiasi)";
				}
				// if (content['no_opsi_penawaran_kontrak']) {
				// 	data['Penawaran / Kontrak'] += "<br>No. " + content['no_opsi_penawaran_kontrak'];
				// }
			} else {
				data['Penawaran / Kontrak'] = "T/A";
			}
			data['No. Penawaran / Kontrak'] = content['no_opsi_penawaran_kontrak'] ? content['no_opsi_penawaran_kontrak'] : "T/A";

			if (content['handling'] === "ada") {
				// if (!content['nominal_handling'] && !content['nama_penerima_handling']) {

				// }
				data['Nominal Handling'] = content['nominal_handling'] ? content['nominal_handling'] : "0";
				data['Nama Penerima Handling'] = content['nama_penerima_handling'] ? content['nama_penerima_handling'] : "-";
			} else {
				data['Nominal Handling'] = "T/A";
				data['Nama Penerima Handling'] = "T/A";
			}

			if (content['asuransi'] === "ada") {
				data['Asuransi'] = content['perincian_asuransi'] ? content['perincian_asuransi'] : "ada";
			} else {
				data['Asuransi'] = "T/A";
			}

			if (content['biaya_koord'] === "ada") {
				data['Biaya Koordinasi / Kawal'] = content['keterangan_biaya_koord'] ? content['keterangan_biaya_koord'] : "0";
			} else {
				data['Biaya Koordinasi / Kawal'] = "T/A";
			}

			data['Note'] = content['note'] ? content['note'] : "-";
			data['Dibuat Oleh'] = content['dibuat_oleh'] ? content['dibuat_oleh'] : "-";
			// data['Tanggal Jam Dibuat Oleh'] = content['tgl_wkt_dibuat'] ? content['tgl_wkt_dibuat'] : "-";
			data['Tanggal Jam Dibuat'] = content['tgl_wkt_dibuat'] ? `${moment(content['tgl_wkt_dibuat']).format('DD MMMM YYYY')} ${moment(content['tgl_wkt_dibuat']).format('HH:mm')}` : "-";
			data['Disetujui Oleh'] = content['disetujui_oleh'] ? content['disetujui_oleh'] : "-";
			// data['Tanggal Jam Disetujui Oleh'] = content['tgl_wkt_disetujui'] ? content['tgl_wkt_disetujui'] : "-";
			data['Tanggal Jam Disetujui'] = content['tgl_wkt_disetujui'] ? `${moment(content['tgl_wkt_disetujui']).format('DD MMMM YYYY')} ${moment(content['tgl_wkt_disetujui']).format('HH:mm')}` : "-";
			dataTable.push(data);
		}
		return content;
	});
	
	res.locals.headerTable = headerTable
	res.locals.contentTable = dataTable

	// return res.status(200).render("history-job-order", {
	// 	headerTable,
	// 	contentTable: dataTable,
	// });

	let listCreatedBy=[], listApprovedBy=[]

	let getData = true;

	let listUser = await db.Users.find()
				.catch(function(err) {
					getData = false;
				console.log(err);
				});
				
	listUser.forEach((user) => {
		user = user.toObject();
		if (user.role === "Marketing") listCreatedBy.push(user)
		else if (user.role === "Operational") listApprovedBy.push(user)
	});

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
  let listTipeUnit = await tipeUnitModel.find({}).select({"field": 1, "_id": 0})
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
  listTipeUnit = listTipeUnit.map((data) => data.field);
  listWarnaUnit = listWarnaUnit.map((data) => data.field);

  if (!getData) {
    return res.status(500).send("Request Timeout - Internal Server Error \n There is problem when getting data");
  } else {
    return res.status(200).render("history-job-order", {
		headerTable,
		contentTable: dataTable,
      listNamaPengirim,
      listAlamatPengirim,
      listKontakPengirim,
      listNamaPenerima,
      listAlamatPenerima,
      listKontakPenerima,
      listMerkUnit,
      listTipeUnit,
      listWarnaUnit,
	  listCreatedBy,
		listApprovedBy,
    });
  }
});

app.get("/job-order-history-table", checkUser, async(req, res) => {
	let contentTable = await db.JobOrders.find().catch(err => res.status(500).send({message: err.message})),
		headerTable = [
			'No. Job Order',
			'Kota',
			'Nama Pengirim',
			'Alamat Pengirim',
			'Kontak Pengirim',
			'Nama Penerima',
			'Alamat Penerima',
			'Kontak Penerima',
			'Hari / Tanggal Pengambilan',
			'Merk Unit',
			'Type Unit',
			'Nopol / Noka Unit',
			'Warna Unit',
			'Status Unit',
			'Kondisi Surat Unit',
			// 'Keterangan Lainnya',
			'Nominal',
			'Moda',
			'Invoice a.n.',
			'Transfer By',
			'Tagihan',
			'TOP Tagihan',
			'Penawaran / Kontrak',
			'No. Penawaran / Kontrak',
			// 'Keterangan Penawaran / Kontrak',
			// 'Handling',
			// 'Keterangan Handling',
			'Nominal Handling',
			'Nama Penerima Handling',
			'Asuransi',
			// 'Rincian Asuransi',
			'Biaya Koordinasi / Kawal',
			'Note',
			'Dibuat Oleh',
			'Tanggal Jam Dibuat',
			'Disetujui Oleh',
			'Tanggal Jam Disetujui',
		],
		dataTable = []
		// list_no_joj = contentTable.map((data) => data.toObject()["no_joj"]).map((value) => Number(value));

	// contentTable = 

	// console.log("key bfr = ", Object.keys(contentTable[0]));
	// console.log("key aft = ", Object.keys(contentTable[0].toObject()));
	
	// headerTable.splice(headerTable.indexOf("_id"), 1);

	// headerTable.splice(headerTable.indexOf("PENGIRIM"), 0, ...["NAMA PENGIRIM", "ALAMAT PENGIRIM", "KONTAK PENGIRIM"]);

	// headerTable.splice(headerTable.indexOf("PENGIRIM"), 1);

	// headerTable.splice(headerTable.indexOf("PENERIMA"), 0, ...["NAMA PENERIMA", "ALAMAT PENERIMA", "KONTAK PENERIMA"]);

	// headerTable.splice(headerTable.indexOf("PENERIMA"), 1);

	// console.log("result of headerTable is = ", headerTable);

	// const phoneExp = /(?:(?:\+?1\s*(?:[.-]\s*)?)?(?:\(\s*([2-9]1[02-9]|[2-9][02-8]1|[2-9][02-8][02-9])\s*\)|([2-9]1[02-9]|[2-9][02-8]1|[2-9][02-8][02-9]))\s*(?:[.-]\s*)?)?([2-9]1[02-9]|[2-9][02-9]1|[2-9][02-9]{2})\s*(?:[.-]\s*)?([0-9]{4})(?:\s*(?:#|x\.?|ext\.?|extension)\s*(\d+))?/img;

	contentTable.forEach((content) => {
		// console.log(content["_id"]); 
		content = content.toObject();
		// console.log("key content bfr = ", Object.keys(content));
		delete content["_id"]; 
		// console.log("key content aft = ", Object.keys(content));
		// console.log("content = ", content);
		
		for (let index = 0; index < Number(content['qty']); index++) {
			let data = {};
			
			data['No. Job Order'] = content['no_joj'] ? content['no_joj'] : "-";
			if (content['city_code']) {
				switch (content['city_code']) {
					case "01":
						data['Kota'] = "Sidoarjo";
						break;
					case "02":
						data['Kota'] = "Cikarang";
						break;
					case "03":
						data['Kota'] = "Jakarta";
						break;
					case "04":
						data['Kota'] = "Makassar";
						break;
				}
			} else {
				data['Kota'] = "-";
			}
			data['Nama Pengirim'] = content['nama_pengirim'] ? content['nama_pengirim'] : "-";
			data['Alamat Pengirim'] = content['alamat_pengirim'] ? content['alamat_pengirim'] : "-";
			data['Kontak Pengirim'] = content['kontak_pengirim'] ? content['kontak_pengirim'] : "-";
			data['Nama Penerima'] = content['nama_penerima'] ? content['nama_penerima'] : "-";
			data['Alamat Penerima'] = content['alamat_penerima'] ? content['alamat_penerima'] : "-";
			data['Kontak Penerima'] = content['kontak_penerima'] ? content['kontak_penerima'] : "-";
			data['Hari / Tanggal Pengambilan'] = content['hr_tgl_ambil'] ? content['hr_tgl_ambil'] : "-";
			data['Merk Unit'] = content['merk'] && content['merk'][index] ? content['merk'][index] : "-";
			data['Type Unit'] = content['tipe'] && content['tipe'][index] ? content['tipe'][index] : "-";
			data['Nopol / Noka Unit'] = content['nopol_noka'] && content['nopol_noka'][index] ? content['nopol_noka'][index] : "-";
			data['Warna Unit'] = content['warna'] && content['warna'][index] ? content['warna'][index] : "-";
			data['Status Unit'] = content['status'] && content['status'][index] ? content['status'][index] : "-";

			if (content['kondisi'] && content['kondisi'][index]) {
				if (content['kondisi'][index] === "lainnya") {
					if (content['lainnya'][index]) {
						data['Kondisi Surat Unit'] = content['lainnya'][index];
					} else {
						data['Kondisi Surat Unit'] = "lainnya";
					}
				} else {
					data['Kondisi Surat Unit'] = content['kondisi'][index];
				}
			} else {
				data['Kondisi Surat Unit'] = "-";
			}
			data['Nominal'] = content['nominal'] ? content['nominal'] : "0";
			data['Moda'] = content['moda'] ? content['moda'] : "-";
			data['Invoice a.n.'] = content['invoice'] ? content['invoice'] : "-";
			data['Transfer By'] = content['transfer_by'] ? content['transfer_by'] : "T/A";
			data['Tagihan'] = content['tagihan'] ? content['tagihan'] : "T/A";
			if (content['tagihan_top']) {
				if (content['opsi_tagihan_top'] === "hari_kerja") {
					data['TOP Tagihan'] = content['tagihan_top'] + " hari kerja";
				} else if (content['opsi_tagihan_top'] === "kalender") {
					data['TOP Tagihan'] = content['tagihan_top'] + " hari kalender";
				}
			} else {
				data['TOP Tagihan'] = "T/A";
			}
			if (content['penawaran_kontrak'] === "ada") {
				if (content['opsi_penawaran_kontrak'] === "penawaran") {
					data['Penawaran / Kontrak'] = "Surat Penawaran";
				} else if (content['opsi_penawaran_kontrak'] === "kontrak") {
					data['Penawaran / Kontrak'] = "Kontrak";
				} else if (content['opsi_penawaran_kontrak'] === "ban") {
					data['Penawaran / Kontrak'] = "BAN (Berita Acara Negosiasi)";
				}
				// if (content['no_opsi_penawaran_kontrak']) {
				// 	data['Penawaran / Kontrak'] += "<br>No. " + content['no_opsi_penawaran_kontrak'];
				// }
			} else {
				data['Penawaran / Kontrak'] = "T/A";
			}
			data['No. Penawaran / Kontrak'] = content['no_opsi_penawaran_kontrak'] ? content['no_opsi_penawaran_kontrak'] : "T/A";

			if (content['handling'] === "ada") {
				// if (!content['nominal_handling'] && !content['nama_penerima_handling']) {

				// }
				data['Nominal Handling'] = content['nominal_handling'] ? content['nominal_handling'] : "0";
				data['Nama Penerima Handling'] = content['nama_penerima_handling'] ? content['nama_penerima_handling'] : "-";
			} else {
				data['Nominal Handling'] = "T/A";
				data['Nama Penerima Handling'] = "T/A";
			}

			if (content['asuransi'] === "ada") {
				data['Asuransi'] = content['perincian_asuransi'] ? content['perincian_asuransi'] : "ada";
			} else {
				data['Asuransi'] = "T/A";
			}

			if (content['biaya_koord'] === "ada") {
				data['Biaya Koordinasi / Kawal'] = content['keterangan_biaya_koord'] ? content['keterangan_biaya_koord'] : "0";
			} else {
				data['Biaya Koordinasi / Kawal'] = "T/A";
			}

			data['Note'] = content['note'] ? content['note'] : "-";
			data['Dibuat Oleh'] = content['dibuat_oleh'] ? content['dibuat_oleh'] : "-";
			// data['Tanggal Jam Dibuat Oleh'] = content['tgl_wkt_dibuat'] ? content['tgl_wkt_dibuat'] : "-";
			data['Tanggal Jam Dibuat'] = content['tgl_wkt_dibuat'] ? `${moment(content['tgl_wkt_dibuat']).format('DD MMMM YYYY')} ${moment(content['tgl_wkt_dibuat']).format('HH:mm')}` : "-";
			data['Disetujui Oleh'] = content['disetujui_oleh'] ? content['disetujui_oleh'] : "-";
			// data['Tanggal Jam Disetujui Oleh'] = content['tgl_wkt_disetujui'] ? content['tgl_wkt_disetujui'] : "-";
			data['Tanggal Jam Disetujui'] = content['tgl_wkt_disetujui'] ? `${moment(content['tgl_wkt_disetujui']).format('DD MMMM YYYY')} ${moment(content['tgl_wkt_disetujui']).format('HH:mm')}` : "-";
			dataTable.push(data);
		}
		return content;
	});
	
	res.locals.headerTable = headerTable
	res.locals.contentTable = dataTable

	// return res.status(200).render("history-job-order", {
	// 	headerTable,
	// 	contentTable: dataTable,
	// });

	let listCreatedBy=[], listApprovedBy=[]

	let getData = true;

	let listUser = await db.Users.find()
				.catch(function(err) {
					getData = false;
				console.log(err);
				});
				
	listUser.forEach((user) => {
		user = user.toObject();
		if (user.role === "Marketing") listCreatedBy.push(user)
		else if (user.role === "Operational") listApprovedBy.push(user)
	});

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
  let listTipeUnit = await tipeUnitModel.find({}).select({"field": 1, "_id": 0})
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
  listTipeUnit = listTipeUnit.map((data) => data.field);
  listWarnaUnit = listWarnaUnit.map((data) => data.field);

  if (!getData) {
    return res.status(500).send("Request Timeout - Internal Server Error \n There is problem when getting data");
  } else {
    return res.status(200).render("job-order-history-table", {
		headerTable,
		contentTable: dataTable,
      listNamaPengirim,
      listAlamatPengirim,
      listKontakPengirim,
      listNamaPenerima,
      listAlamatPenerima,
      listKontakPenerima,
      listMerkUnit,
      listTipeUnit,
      listWarnaUnit,
	  listCreatedBy,
		listApprovedBy,
    });
  }
});

// app.listen(port, () => {
// 	console.log(`Server started on port ${port}`);
// })


