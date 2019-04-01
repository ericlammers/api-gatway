const axios = require("axios");
const httpProxy = require('express-http-proxy');

const registerUrl = process.env.REGISTER_URL || 'http://localhost:8090';
const userServiceUrl = process.env.USER_SERVICE_URL || 'http://localhost:8080';

const getServicesFromRegister = async () => {
    const servicesResponse = await axios.get(`${registerUrl}/services`);
    return servicesResponse.data;
};

const getServiceProxy = service => httpProxy(`${service.url}:${service.port}`);

const getService = (serviceName, services) => services.find((service) => service["name"] === serviceName);

const isServiceAuthenticated = async (req) => {
    const response = await axios.get(
        `${userServiceUrl}/verifySession`,
        {
            headers: {
                Cookie: `token=${req.cookies["token"]}`
            }
        }
    ).catch(err => console.log(err));

    if(!response) {
        return false;
    }

    return response.status === 200;
};

exports.isServiceAuthenticated = isServiceAuthenticated;
exports.getService = getService;
exports.getServiceProxy = getServiceProxy;
exports.getServicesFromRegister = getServicesFromRegister;