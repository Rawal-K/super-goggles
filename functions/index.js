const express = require('express');
const bodyParser = require('body-parser');
const schedule = require('node-schedule');
const dbConfig = require('./config/database.config.js');
const mongoose = require('mongoose');
const Request = require("request");
const fs = require('fs');
const zlib = require('zlib')
const User = require('./models/user.model.js');
const functions = require("firebase-functions");
const admin = require("firebase-admin");

const app = express();

app.use(bodyParser.json()); 
app.use(bodyParser.urlencoded({ extended: true })); 

app.get('/', (req, res) => {
    res.json({"message": "Welcome to Test application."});
});

const postUrl = "http://localhost:3000/user";

postDataInDB = () => {
	return new Promise((resolve, reject) => {
        Request.post({url:postUrl, form: {"name":'John Doe', "hobbies": "Computer Programming"}}, (err, httpResponse, body) => { 
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

(async () => {
	try{
		admin.initializeApp();
		const remoteConfig = await admin.remoteConfig();
		const template = await remoteConfig.getTemplate();
		const value = JSON.stringify(template);
        	cronWriteTime = JSON.parse(value).parameters.cronWriteTime.defaultValue.value;
		cronBackupTime = JSON.parse(value).parameters.cronBackupTime.defaultValue.value;

		/** cron job that write files in DB at every cronWriteTime **/
		const job = schedule.scheduleJob(cronWriteTime, async() => {
        		const data = await postDataInDB();
			console.log('data', data);
		});

		/* Cron that backups data in file every cronBackupTime */
		const job1 = schedule.scheduleJob(cronBackupTime, async () => {
        		const jsonData = await getLastMinuteData();
        		const fileName = await convertDateTimeFormatForFileName();
			console.log('fileName', fileName);
        		await writeDataInFile(`${fileName}.json`, jsonData);
        		await convertFileToGzip(fileName);
        		await unlinkJSONFile(fileName);
		});
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
