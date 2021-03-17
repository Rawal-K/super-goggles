const ResponseObject = require('../helpers/responseObjectClass');
const AppError = require('../helpers/AppError');
const User = require('../models/user.model.js');
const responseObject = new ResponseObject();


exports.create = (req, res) => {
     if(!req.body.hobbies) {
	return next(new AppError("User hobbies can't be empty", 400));     
    }

    const user = new User({
        name: req.body.name || "Unnamed User",
        hobbies: req.body.hobbies
    });

    user.save()
    .then(data => {
	const returnObj = responseObject.create({
                code: 200,
                success: true,
                data: data,
                message: 'User has been created successfully'
        });
        return res.send(returnObj);
    }).catch(err => {
	return next(new AppError(err.message, 500));    
    });
};


exports.findAll = (req, res) => {
    User.find()
    .then(users => {
	const returnObj = responseObject.create({
                code: 200,
                success: true,
                data: users,
                message: 'Users has been fetched successfully'
        });
        return res.send(returnObj);
    }).catch(err => {
	return next(new AppError(err.message, 500));    
    });
};

exports.findOne = (req, res) => {
    User.findById(req.params.userId)
    .then(user => {
        if(!user) {
	    return next(new AppError(`User not found with id + {req.params.userId}`, 404));			
        }
	const returnObj = responseObject.create({
                code: 200,
                success: true,
                data: user,
                message: 'User has been fetched successfully'
        });
        return res.send(returnObj);
    }).catch(err => {
        if(err.kind === 'ObjectId') {
	    return next(new AppError(`User not found with id + ${req.params.userId}`, 404));	
        }
	return next(new AppError(`Error retrieving user with id + ${req.params.userId}`, 500));    
    });
};

exports.deleteAll = (req, res) => {
	User.deleteMany()
	.then(user => {
	    if(!user){
		return next(new AppError("No user found. Database is empty", 404));    		    					
	    }
	    const returnObj = responseObject.create({
                code: 200,
                success: true,
                data: user,
                message: 'Users has been deleted successfully'
        });
        return res.send(returnObj);
	}).catch(err => {
	    return next(new AppError('Error deleting the users', 500));	
	});
};



