const mongoose = require('mongoose');

const CountriesSchema = mongoose.Schema({
        name: String,
        config: {
                code: String,
                content: String,
                translate: {
                        loginElement: {
                                email: String,
                                password: String
                        }
                }
        }
});

module.exports = mongoose.model('Country', CountriesSchema);

