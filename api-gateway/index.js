const express = require('express');
const httpProxy = require('express-http-proxy');
const bodyParser = require('body-parser');
const morgan = require("morgan");
const request = require("request");

const app = express();

app.use(morgan('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.set('port', (process.env.PORT || 8080));

const services = [
    {
        "name": "service-one",
        "url": "http://localhost",
        "port": "8081",
    },
    {
        "name": "service-two",
        "url": "http://localhost",
        "port": "8082"
    }
];

const addService = (service) => {
    services.push(service);
};

const getServiceProxy = (serviceName) => {
    const serviceDetails = services.find((service) => service["name"] === serviceName);

    if(serviceDetails) {
        return httpProxy(`${serviceDetails.url}:${serviceDetails.port}`);
    } else {
        return null;
    }
};

app.post('/service', (req, res) => {
    addService(req.body);
    res.sendStatus(201);
});

app.get('/services', (req, res) => {
    res.status(200);
    res.json(services.map(service => service["name"]));
});

function getRequest(options) {
    return new Promise(function(resolve, reject) {
        request.get(options, function(err, resp, body) {
            if (err) {
                reject(err);
            } else {
                resolve(JSON.parse(body));
            }
        })
    })
}

app.get('/test-call', (req, res) => {
    const options = {
        url: 'http://localhost:8080/service-two/people',
        headers: {
            'User-Agent': 'request',
            'content-type': 'application/json'
        }
    };

    getRequest(options).then(function(result) {
        const userDetails = result;
        res.status(200);
        res.json(userDetails);
    }, function(err) {
        console.log(err);
    });

});

app.all('/:service/:endpoint', (req, res, next) => {
    const serviceName = req.params.service;
    const serviceProxy = getServiceProxy(serviceName);
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