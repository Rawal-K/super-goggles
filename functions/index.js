const express = require('express');
const bodyParser = require('body-parser');
const schedule = require('node-schedule');
const dbConfig = require('./config/database.config.js');
const mongoose = require('mongoose');
const User = require('./models/user.model.js');
const Country = require('./models/country.model.js');
const functions = require("firebase-functions");
const admin = require("firebase-admin");
const shell = require('shelljs');
const app = express();
const { postDataInDB, writeUserDataInFirebase, updateDataInFirebase } = require('./helpers/helperFunctions.js');
const { firebaseConfig } = require('./helpers/firebaseConfigFile.js');

app.use(bodyParser.json()); 
app.use(bodyParser.urlencoded({ extended: true })); 

app.get('/', (req, res) => {
    res.json({"message": "Welcome to Test application."});
});

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
				await writeUserDataInFirebase(data.data._id, data.data);
				await updateDataInFirebase(data.data._id, data.data);
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
