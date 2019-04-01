const express = require('express');
const bodyParser = require('body-parser');
const morgan = require("morgan");
const axios = require("axios");
const mongoose = require("mongoose");
const Service = require('./model/service');

const app = express();

mongoose.connect('mongodb://localhost:27017/admin');

app.use(morgan('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.set('port', (process.env.PORT || 8090));

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
    Service.find(async (err, services) => {
        if (err) {
            res.send(err);
        } else {
            const availableServices = await determineAvailableServices(services);

            res.status(200);
            res.json(availableServices);
        }
    });
});

app.post('/service', (req, res) => {
    const service = new Service();

    service.name = req.body.name;
    service.url = req.body.url;
    service.port = req.body.port;

    // TODO - Replace Service with identical name
    // First delete, then add
    service.save((err) => {
        if (err) {
            res.send(err);
        } else {
            res.sendStatus(201);
        }
    });
});

app.listen(app.get('port'), () => {
    console.log(`Find the server at: http://localhost:${app.get('port')}/`);
});