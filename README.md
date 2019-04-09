# Trade Watch API Gateway and Register

## Description
This repository contains the code for two services. The api-gateway which acts as the single point of entry for the microservices
and the register which allows for dynamic addition and deletion of services by communicates with a mongodb service-registry. 

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes. See deployment for notes on how to deploy the project on a live system.

### Prerequisites
The following will need to be installed on your local environment:
- [Node.js](https://nodejs.org/en/) 
- [npm](https://www.npmjs.com/)
- [Docker](https://www.docker.com/) (optional for development, required if you need to build a deployable container)
- [Docker-Compose](https://docs.docker.com/compose/) (optional)
- [Postman](https://www.getpostman.com/)

### Installing

1. Start the MongoDB database (service-registry) and some microservices for testing  
    a. In the terminal navigate to the root folder  
    b. Run: *docker-compose up*  
    Note: This starts the MongoDB database and 3 microservices inside docker containers. See the [docker-compose file](./docker-compose.yml) for
    more details.  
2. Start the register service  
    a. In the terminal navigate to the [register folder](./register)  
    b. Run: *npm install* (this installs all dependencies)
    c. Run: *node index.js* (this starts the service on port 8090)     
    d. Verify the service is up by sending a GET request to it's health endpoint *http://localhost:8090/health*  
3. Start the api-gateway service  
    a. In the terminal navigate to the [api-gateway folder](./api-gateway)    
    b. Run: *npm install* (this installs all dependencies)  
    c. Run: *node index.js* (this starts the service on port 8080)  
    d. Verify the service is up by sending a GET request to it's health endpoint *http://localhost:8080/health*      
4. Add the available microservices to the service registry  
    a. Open up postman   
    b. For each microservice make a POST request to *http://localhost:8080/service* to add the microservices. For details on what 
    port each test microservice is exposed on see the *docker-compose* file. The body of the request should have
    the following structure:
    ```json
    {
        "name": "service-one",
        "url": "http://localhost",
        "port": "8081",
        "loginRequired": "false"
    }
    ```  
    Where name is the name of the service and also becomes the endpoint to access that service at. 
5. Check that the microservices are now added to the service registry  
    a. Open up postman     
    b. Send a GET request to *http://localhost:8080/services*. This should return an array of available services.
6. Access a microservice through the gateway   
    a. Send a GET request to *http:localhost:8080/service-one/health* (Should return 200)
    
### Test Microservice
The test microservice were built to help with local development of the api-gateway and registry. See the [/test-services/service/index.js fil](./test-services/service/index.js) 
for details on the available endpoints.

## Built With
- [Node.js](https://nodejs.org/en/) 
- [Express](https://www.express.com/)
- [express-http-proxy](https://www.npmjs.com/package/express-http-proxy)
- [axios](https://github.com/axios/axios)
- [MongoDB](https://www.mongodb.com/)
- [Mongoose](https://mongoosejs.com/)
    
## Deployment    
To deploy a new version of either the register or the api-gateway first build a new docker container for that service and 
push it to the registry. Make sure to give it the appropriate version as it's tag. Then see the Trade Watch Kubernetes repository 
for additional details on how to deploy the new containers to the cluster.    
        


