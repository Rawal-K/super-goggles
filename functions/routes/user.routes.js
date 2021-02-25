module.exports = (app) => {
    const users = require('../controllers/user.controller.js');

    app.post('/user', users.create);

    app.get('/users', users.findAll);

    app.get('/user/:userId', users.findOne);

    app.delete('/users', users.deleteAll);	
}
