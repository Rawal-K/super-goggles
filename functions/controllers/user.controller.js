const User = require('../models/user.model.js');
exports.create = (req, res) => {
     if(!req.body.hobbies) {
        return res.status(400).send({
            message: "User hobbies cannot be empty"
        });
    }

    const user = new User({
        name: req.body.name || "Unnamed User",
        hobbies: req.body.hobbies
    });

    user.save()
    .then(data => {
        res.send(data);
    }).catch(err => {
        res.status(500).send({
            message: err.message || "Some error occurred while creating the User."
        });
    });
};


exports.findAll = (req, res) => {
    User.find()
    .then(users => {
        res.send(users);
    }).catch(err => {
        res.status(500).send({
            message: err.message || "Some error occurred while retrieving users."
        });
    });
};

exports.findOne = (req, res) => {
    User.findById(req.params.userId)
    .then(user => {
        if(!user) {
            return res.status(404).send({
                message: "User not found with id " + req.params.userId
            });            
        }
        res.send(user);
    }).catch(err => {
        if(err.kind === 'ObjectId') {
            return res.status(404).send({
                message: "User not found with id " + req.params.userId
            });                
        }
        return res.status(500).send({
            message: "Error retrieving user with id " + req.params.userId
        });
    });
};

exports.deleteAll = (req, res) => {
	User.deleteMany()
	.then(user => {
	    if(!user){
		return res.status(404).send({
		    message: "No user found. Database is empty"	
		});		    					
	    }
	    res.send(user);	
	}).catch(err => {
	    return res.status(500).send({
	        message: "Error deleting the users."		
	    });	
	});
};



