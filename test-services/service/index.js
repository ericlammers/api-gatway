// Environment variables that should be set
//    NAME, PORT


const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();

const serviceName = process.env.NAME || "unnamed";

app.set('port', (process.env.PORT || 8080));
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

app.get('/health', (req, res) => {
    res.setHeader('Cache-Control', 'no-cache');
    res.sendStatus(200)
});

const people = [
    "John",
    "Tom",
    "George"
];

app.get('/people', (req, res) => {
    res.setHeader('Cache-Control', 'no-cache');
    res.status(200);
    res.json(people);
});

app.post('/person', (req, res) => {
    const person = req.body.name;

    people.push(person);

    res.sendStatus(201);
});

app.listen(app.get('port'), () => {
    console.log(`Find the server at: http://localhost:${app.get('port')}/`); // eslint-disable-line no-console
});
