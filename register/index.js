const express = require('express');
const bodyParser = require('body-parser');
const morgan = require("morgan");
const axios = require("axios");
const mongoose = require("mongoose");
const Service = require('./model/service');
require('dotenv').config();

const app = express();

mongoose.connect(process.env.MONGO_URL);

app.use(morgan('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.set('port', (process.env.PORT || 8080));

app.get('/register/health', async (req, res) => {
    res.sendStatus(200);
});

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

app.get('/healthy-services', async (req, res) => {
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

app.get('/all-services', async (req, res) => {
    Service.find(async (err, services) => {
        if (err) {
            res.send(err);
        } else {
            res.status(200);
            res.json(services);
        }
    });
});

app.delete('/services/:serviceName', (req, res) => {
    Service.remove({
        name: req.params.serviceName
    }, (err, service) => {
        if (err) {
            res.send(err);
        }
        res.json({ message: 'Successfully deleted' });
    });
});

app.post('/service', (req, res) => {
    const service = new Service();

    service.name = req.body.name;
    service.url = req.body.url;
    service.port = req.body.port;
    service.loginRequired = req.body.loginRequired;

    service.save((err) => {
        if (err) {
            res.send(err);
        } else {
            res.sendStatus(201);
        }
    });
});

app.post('/services', (req, res) => {
    const newServices = req.body;

    newServices.forEach(newService => {
        const service = new Service();

        service.name = newService.name;
        service.url = newService.url;
        service.port = newService.port;
        service.loginRequired = newService.loginRequired;

        service.save((err) => {
            if (err) {
                console.log(err);
            } else {
                console.log("Inserted");
            }
        });
    });

    res.sendStatus(201);
});

app.listen(app.get('port'), () => {
    console.log(`Find the server at: http://localhost:${app.get('port')}/`);
});