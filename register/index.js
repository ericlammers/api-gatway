const express = require('express');
const bodyParser = require('body-parser');
const morgan = require("morgan");
const axios = require("axios");

const app = express();

app.use(morgan('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.set('port', (process.env.PORT || 8090));

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
    },
    {
        "name": "service-4",
        "url": "http://localhost",
        "port": "8082"
    },
    {
        "name": "service-three",
        "url": "http://localhost",
        "port": "8083"
    }
];

const getRequest = async url => await axios.get(url);

const createServiceUrl = service => `${service.url}:${service.port}/${service.name}`;

const getRequestToHealthEndpoint = async service => await getRequest(`${createServiceUrl(service)}/health`);

const determineAvailableServices = async (services) => {
    const availableServices = [];

    for(let i = 0; i < services.length; i++) {
        const service = services[i];
        try {
            const response = await getRequestToHealthEndpoint(service);
            if(response.status === 200) {
                availableServices.push(service);
            }
        } catch(error) {}
    }

    return availableServices;
};

app.get('/services', async (req, res) => {
    const availableServices = await determineAvailableServices(services);

    res.status(200);
    res.json(availableServices);
});

const addService = (service) => {
    services.push(service);
};

app.post('/service', (req, res) => {
    addService(req.body);
    res.sendStatus(201);
});

app.listen(app.get('port'), () => {
    console.log(`Find the server at: http://localhost:${app.get('port')}/`);
});