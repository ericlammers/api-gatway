const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ServiceSchema = new Schema({
    url: String,
    port: String,
    name: String
});

module.exports = mongoose.model('Service', ServiceSchema);