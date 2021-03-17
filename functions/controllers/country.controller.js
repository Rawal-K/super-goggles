const ResponseObject = require('../helpers/responseObjectClass');
const AppError = require('../helpers/AppError');
const Country = require('../models/country.model.js');
const responseObject = new ResponseObject();


exports.create = (req, res) => {
    if(!req.body) {
	return next(new AppError("Country cannot be empty", 400)); 
    }

    const country = new Country({
        name: req.body.name,
        config: req.body.config
    });

    country.save()
    .then(data => {
	const returnObj = responseObject.create({
		code: 200,
		success: true,
		data: data,
		message: 'Country has been created successfully'
	});    
        return res.send(returnObj);
    }).catch(err => {
	return next(new AppError(err.message, 500));    
    });
};

exports.findAll = (req, res) => {
    Country.find()
    .then(countries => {
	const returnObj = responseObject.create({
                code: 200,
                success: true,
                data: countries,
                message: 'Country has been fetched successfully'
        });    
        res.send(returnObj);
    }).catch(err => {
	return next(new AppError(err.message, 500));
    });
};
