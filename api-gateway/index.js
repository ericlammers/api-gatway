const express = require('express');
const httpProxy = require('express-http-proxy');
const bodyParser = require('body-parser');
const morgan = require("morgan");
const axios = require("axios");
const registerUrl = 'http://localhost:8090';

const app = express();

app.use(morgan('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.set('port', (process.env.PORT || 8080));

const getServicesFromRegister = async () => {
    const servicesResponse = await axios.get(`${registerUrl}/services`);
    return servicesResponse.data;
};

app.get('/services', async (req, res) => {
    try {
        const services = await getServicesFromRegister();
        res.status(200);
        res.json(services.map(service => service["name"]));
    } catch {
        res.status(400);
        res.json('Could not retrieve services from register');
    }
});

app.post('/service', (req, res, next) => {
    const registerProxy = httpProxy(registerUrl);
    registerProxy(req, res, next);
});

const getServiceProxy = (serviceName, services) => {
    const serviceDetails = services.find((service) => service["name"] === serviceName);

    if(serviceDetails) {
        return httpProxy(`${serviceDetails.url}:${serviceDetails.port}`);
    } else {
        return null;
    }
};

const doesServiceExist = (serviceName, services) => services.find((service) => service["name"] === serviceName);

app.all('/:service/:endpoint', async (req, res, next) => {
    try {
        const services = await getServices();
        const serviceName = req.params.service;

        if(doesServiceExist(serviceName, services)) {
            const serviceProxy = getServiceProxy(serviceName, services);
            serviceProxy(req, res, next)
        } else {
            res.status(400);
            res.json("Unknown service: " + serviceName);
        }
    } catch {
        res.status(400);
        res.json("Request Failed");
    }
});

app.listen(app.get('port'), () => {
    console.log(`Find the server at: http://localhost:${app.get('port')}/`);
});