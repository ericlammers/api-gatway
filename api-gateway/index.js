const express = require('express');
const httpProxy = require('express-http-proxy');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const axios = require("axios");
const morgan = require("morgan");
require('dotenv').config();
const helpers = require("./helpers");
const cors = require('cors');

const registerUrl = process.env.REGISTER_URL || 'http://localhost:8090';
const userServiceUrl = process.env.USER_SERVICE_URL || 'http://localhost:8080';

const app = express();

app.use(morgan('dev'));
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());
app.set('port', (process.env.PORT || 8080));

/***************************************************************************************
 *      Health Endpoint
 ***************************************************************************************/

app.get('/health', async (req, res) => {
    res.sendStatus(200);
});



/***************************************************************************************
 *      User Service Requests
 ***************************************************************************************/

app.post('/login', (req, res, next) => {
    const registerProxy = httpProxy(userServiceUrl);
    registerProxy(req, res, next);
});

app.post('/logout', (req, res, next) => {
    const registerProxy = httpProxy(userServiceUrl);
    registerProxy(req, res, next);
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



/***************************************************************************************
 *      Service Register Requests
 ***************************************************************************************/

app.get('/register/health', (req, res, next) => {
    const registerProxy = httpProxy(registerUrl);
    registerProxy(req, res, next);
});

app.post('/service', (req, res, next) => {
    const registerProxy = httpProxy(registerUrl);
    registerProxy(req, res, next);
});

app.post('/services', (req, res, next) => {
    const registerProxy = httpProxy(registerUrl);
    registerProxy(req, res, next);
});

app.delete('/services/:serviceName', (req, res, next) => {
    const registerProxy = httpProxy(registerUrl);
    registerProxy(req, res, next);
});

app.get('/services', async (req, res) => {
    try {
        const services = await helpers.getHealthyServicesFromRegister();
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

app.get('/services/admin-details', async (req, res) => {
    try {
        const services = await helpers.getAllServicesFromRegister();
        res.status(200);
        res.json(services);
    } catch {
        res.status(400);
        res.json('Could not retrieve services from register');
    }
});


/***************************************************************************************
 *      Microservices Requests
 ***************************************************************************************/

app.post('/:serviceName/*', async (req, res) => {
    const services = await helpers.getHealthyServicesFromRegister();
    const service = helpers.getService(req.params.serviceName, services);

    if(service) {
        if(service.loginRequired) {
            if(!(await helpers.isServiceAuthenticated(req))) {
                console.log("Not Authenticated");
                res.status(400);
                res.json("Service is not authenticated");
            }
        }

        const response = await axios({
                method: 'post',
                url: `${service.url}:${service.port}${req.originalUrl}`,
                data: req.body
            }
        ).catch((err) => console.log(err));

        res.status(response ? response.status : 400);
        res.json(response ? response.data : '');
    } else {
        res.status(400);
        res.json("Unknown service: " + serviceName);
    }
});


app.get('/:serviceName/*', async (req, res) => {
    const services = await helpers.getHealthyServicesFromRegister();
    const service = helpers.getService(req.params.serviceName, services);

    if(service) {
        if(service.loginRequired) {
            if(!(await helpers.isServiceAuthenticated(req))) {
                console.log("Not Authenticated");
                res.status(400);
                res.json("Service is not authenticated");
            }
        }

        console.log(`${service.url}:${service.port}${req.originalUrl}`);

        const response = await axios({
                method: 'get',
                url: `${service.url}:${service.port}${req.originalUrl}`,
            }
        ).catch((err) => console.log("Error"));

        res.status(response ? response.status : 400);
        res.json(response ? response.data : '');
    } else {
        res.status(400);
        res.json("Unknown service: " + serviceName);
    }
});

app.all('/:serviceName/*', async (req, res, next) => {
    try {
        const services = await helpers.getHealthyServicesFromRegister();
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