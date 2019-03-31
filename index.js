const express = require('express');
const httpProxy = require('express-http-proxy');
const http = require('http');
const morgan = require("morgan");

const app = express();

app.use(morgan('dev'));
app.set('port', (process.env.PORT || 8080));

const services = [
    {
        "name": "service-one",
        "url": "http://localhost",
        "port": "8081"
    },
    {
        "name": "service-two",
        "url": "http://localhost",
        "port": "8082"
    },
    {
        "name": "service-three",
        "url": "http://localhost",
        "port": "8083"
    },
];

const serviceProxies = {
    "service-one": httpProxy('http://localhost:8081'),
    "service-two": httpProxy('http://localhost:8082'),
    "service-three": httpProxy('http://localhost:8083')
};

app.post('/service', (req, res, next) => {

});

app.get('/services', (req, res, next) => {
    res.status(200);
    res.json(services.map(service => service.name));
});

app.all('/:service/:endpoint', (req, res, next) => {
    const serviceName = req.params.service;
    const serviceProxy = serviceProxies[serviceName];
    if(serviceProxy) {
        serviceProxy(req, res, next)
    } else {
        res.status(400);
        res.json("Unknown service: " + serviceName);
    }

});

app.listen(app.get('port'), () => {
    console.log(`Find the server at: http://localhost:${app.get('port')}/`);
});