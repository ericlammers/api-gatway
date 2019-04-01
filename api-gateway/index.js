const express = require('express');
const httpProxy = require('express-http-proxy');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const axios = require("axios");
const morgan = require("morgan");
require('dotenv').config();
const helpers = require("./helpers");

const registerUrl = process.env.REGISTER_URL || 'http://localhost:8090';
const userServiceUrl = process.env.USER_SERVICE_URL || 'http://localhost:8080';

const app = express();

app.use(morgan('dev'));
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.set('port', (process.env.PORT || 8070));

app.get('/health', async (req, res) => {
    res.sendStatus(200);
});

app.post('/login', (req, res, next) => {
    const registerProxy = httpProxy(userServiceUrl);
    registerProxy(req, res, next);
});

app.post('/logout', (req, res, next) => {
    const registerProxy = httpProxy(userServiceUrl);
    registerProxy(req, res, next);
});

app.post('/service', (req, res, next) => {
    const registerProxy = httpProxy(registerUrl);
    registerProxy(req, res, next);
});

app.get('/services', async (req, res) => {
    try {
        const services = await helpers.getServicesFromRegister();
        res.status(200);
        res.json(services.map(service => ({
            name: service.name,
            loginRequired: service.loginRequired || false,
        })));
    } catch {
        res.status(400);
        res.json('Could not retrieve services from register');
    }
});

app.get('/verifySession', async (req, res) => {
    const response = await axios.get(
        `${userServiceUrl}/verifySession`,
        {
            headers: {
                Cookie: `token=${req.cookies["token"]}`
            }
        }
    ).catch(() => console.log("Could not authenticate"));

    res.sendStatus(response ? response.status : 400);
});

app.all('/:serviceName/:endpoint', async (req, res, next) => {
    try {
        const services = await helpers.getServicesFromRegister();
        const service = helpers.getService(req.params.serviceName, services);

        if(service) {
            if(service.loginRequired) {

                if(!(await helpers.isServiceAuthenticated(req))) {
                    console.log("Not Authenticated");
                    res.status(400);
                    res.json("Service is not authenticated");
                }
            }
            const serviceProxy = helpers.getServiceProxy(service);
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