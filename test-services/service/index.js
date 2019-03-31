// Environment variables that should be set
//    NAME, PORT
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const morgan = require("morgan");

const app = express();
app.use(morgan('dev'));

const serviceName = process.env.NAME || "unnamed";

app.set('port', (process.env.PORT || 8081));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());

app.use((req, res, next) => {
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    res.setHeader('Service-Name', serviceName);
    next();
});

function addBaseEndpoint(endpoint) {
    return '/' + serviceName + endpoint;
}

app.get(addBaseEndpoint('/health'), (req, res) => {
    res.setHeader('Cache-Control', 'no-cache');
    res.sendStatus(200)
});

const people = [
    "John",
    "Tom",
    "George"
];

app.get(addBaseEndpoint('/people'), (req, res) => {
    res.setHeader('Cache-Control', 'no-cache');
    res.status(200);
    res.json(people);
});

app.post(addBaseEndpoint('/person'), (req, res) => {
    const person = req.body.name;

    people.push(person);

    res.sendStatus(201);
});

app.listen(app.get('port'), () => {
    console.log(`Find the server at: http://localhost:${app.get('port')}/`); // eslint-disable-line no-console
});
