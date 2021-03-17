const admin = require("firebase-admin");
const Request = require("request");
const fs = require('fs');
const zlib = require('zlib');
const postUrl = "http://localhost:3000/country";


writeDataInFile = (path, data) => {
        return new Promise((resolve, reject) => {
                fs.writeFile(path, data, (err, data) => {
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


module.exports = {
	writeDataInFile,
	writeUserDataInFirebase,
	postDataInDB,
	getLastMinuteData,
	convertDateTimeFormatForFileName,
	convertFileToGzip,
	unlinkJSONFile,
	updateDataInFirebase
}
