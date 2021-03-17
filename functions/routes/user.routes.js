module.exports = (app) => {
    const users = require('../controllers/user.controller.js');
    const countries = require('../controllers/country.controller.js');

    app.post('/user', users.create);
    app.post('/country', countries.create);
    app.get('/users', users.findAll);
    app.get('/countries', countries.findAll);
    app.get('/user/:userId', users.findOne);
    app.delete('/users', users.deleteAll);	
}
