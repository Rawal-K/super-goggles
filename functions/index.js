const express = require('express');
const bodyParser = require('body-parser');
const schedule = require('node-schedule');
const dbConfig = require('./config/database.config.js');
const mongoose = require('mongoose');
const Request = require("request");
const fs = require('fs');
const zlib = require('zlib')
const User = require('./models/user.model.js');
const Country = require('./models/country.model.js');
const functions = require("firebase-functions");
const admin = require("firebase-admin");
const shell = require('shelljs');
const app = express();

const firebaseConfig = {
	apiKey: "AIzaSyA0bb-xuGm0WYjY8Bw26y9Jn6FbDwp2HXQ",
        authDomain: "cron-71d50.firebaseapp.com",
        databaseURL: "https://cron-71d50-default-rtdb.europe-west1.firebasedatabase.app",
        projectId: "cron-71d50",
        storageBucket: "cron-71d50.appspot.com",
        messagingSenderId: "1084167836113",
        appId: "1:1084167836113:web:ef3ef4b9e7d16d24f750f0",
        measurementId: "G-8KTQCSC6K6"
};

app.use(bodyParser.json()); 
app.use(bodyParser.urlencoded({ extended: true })); 

app.get('/', (req, res) => {
    res.json({"message": "Welcome to Test application."});
});

//const postUrl = "http://localhost:3000/user";
const postUrl = "http://localhost:3000/country";

postDataInDB = () => {
	return new Promise((resolve, reject) => {
        Request.post({url:postUrl, form: {"name":'India', "config": {
		"code": "IN",
		"content": "This is the test content.",
		"translate": {
			"loginElement": {
				"email": "test@testmail.com",
				"password": "passwrd"
			}
		}
	}}}, (err, httpResponse, body) => {
		if(err) return reject(err);
                        try{
                                resolve(JSON.parse(body));
                        }catch(error){
                                reject(error);
                        }
                });
	});
}



writeDataInFile = (path, data) => {
	return new Promise((resolve, reject) => {
		fs.writeFile(path, data, (err, data) => {
			if(err) return reject(err);
			resolve(1);
		});					
	});
}

getLastMinuteData = () => {
	return new Promise((resolve, reject) => {
		try{	
			const query = {
    				createdAt: {
        				$gt: new Date(new Date().getTime() - 1000 * 60 * 1/2)
    				}
			}	

			const user = User.find(query);
			resolve((user));
		}catch(error){
			reject(error);	
		}	
	});
}

convertDateTimeFormatForFileName = () => { 
	return new Promise((resolve, reject) => {
		try{
			const d = new Date();
        		const date = `${d.getFullYear()}${d.getMonth() + 1}${d.getDate()}${d.getHours()}${d.getMinutes()}${d.getSeconds()}`;
        		resolve(date);				
		}catch(error){
			reject(error);
		}
	});
}

convertFileToGzip = (fileName) => {
	return new Promise((resolve, reject) => {
		try{
			const gzip = zlib.createGzip();
			const r = fs.createReadStream(`./${fileName}.json`);
			const w = fs.createWriteStream(`./${fileName}.json.gz`);
			r.pipe(gzip).pipe(w);
			resolve(1);
		}catch(error){
			reject(error);
		}	
	});	
}

unlinkJSONFile = (fileName) => {
	return new Promise((resolve, reject) => {
                fs.unlink(`./${fileName}.json`, (err) => {
                        if(err) return reject(err);
                        resolve(1);
                });
        });
}

writeUserDataInFirebase = (countryId, data) => {
	return new Promise((resolve, reject) => {
		admin.database().ref('countries/' + countryId).set({
			name: data.name,
			config: data.config
		});
		resolve(1);
	});
}

updateDataInFirebase = (countryId, data) => {
	const countryData = data;
	delete countryData._id;
	delete countryData.__v;
	const updates = {};
	updates['/countries/' + countryId] = countryData;
	countryData.name = "New Zealand";
	countryData.config.code = "NZ";
	countryData.config.translate.loginElement.email = "Hello@hello.com";
	return new Promise((resolve, reject) => {
		admin.database().ref().update(updates);
		resolve(1);
	});
}

(async () => {
	try{
		//admin.initializeApp({credential: admin.credential.applicationDefault()});
		//const db = await admin.firestore();
		admin.initializeApp(firebaseConfig);
		const remoteConfig = await admin.remoteConfig();
		const template = await remoteConfig.getTemplate();
		const parsedTemplate = (template);
		const value = JSON.parse(parsedTemplate.parameters.processes.defaultValue.value);
		const cron1 = (value[0].cron1);
		const cron2 = value[1].cron2;
		/** cron job that write files in DB at every cronWriteTime **/
		if(cron2.active){
			const job = schedule.scheduleJob(cron2.scheduled, async() => {
				const data = await postDataInDB();
				console.log('data', data);
				await writeUserDataInFirebase(data._id, data);
				await updateDataInFirebase(data._id, data);
				/** firestore db **/
				/**await db.collection("test").add({
					name: data.name,
					hobbies: data.hobbies
				});**/
			});
		}

		if(cron1.active){
			/* Cron that backups data in file every cronBackupTime */
			const job1 = schedule.scheduleJob(cron1.scheduled, async () => {
				console.log('data in every cronBackupTime');
				shell.exec('./shell.sh');
			});
		}
	}catch(error){
		console.log(error);
	}
})();


require('./routes/user.routes.js')(app);
app.listen(3000, () => {
    console.log("Server is listening on port 3000");
});

mongoose.Promise = global.Promise;

mongoose.connect(dbConfig.url, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log("Successfully connected to the database");    
}).catch(err => {
    console.log('Could not connect to the database. Exiting now...', err);
    process.exit();
});

exports.app = functions.https.onRequest(app);
