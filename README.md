### Local Set Up
1. Start the mongo container   
    a. Install docker and docker compose    
    b. Run `docker-compose up`  
2. Start the register service  
    a. Install node and npm    
    b. Navigate to the registry folder from the terminal    
    c. Run `npm install` (gets the dependencies)  
    d. Run `node index.js` (starts the register on port 8080, can update the port if needed in the index.js file)  
3. Start the api-gateway  
    a. Need to have started the user-service and the register before starting this service
    b. Navigate to the api-gateway folder from the terminal    
    c. Run `npm install` (gets the dependencies)  
    d. Set the port for the service to listen on (can set this in .env file)  
    e. Specify the urls for the register service and the user service in the .env file  
    f. Run `node index.js` (starts the api-gateway)         
    g. Add services to the register by sending post requests to the api-gateways /services endpoint 
    with the following body:
    ```json
    {
        "name": "csv-uploader",
        "url": "http://168.1.140.177",
        "port": "30647",
        "loginRequired": "false"
    }
    ```
    h. See services added by sending a get request to the `/services` endpoint or `/services/admin-details`    
    i. Delete services by sending delete requests to the endpoint `/services/{service-name}`

## Local Development
For development purposes a docker-compose file has been included that will start three services that
the API gateway can communicate with.

To start the services run: *docker-compose up*.

#### What this does
This starts three services for testing the gateway listening on localhost at port 8081, 8082 and 8083. There functionality 
is identical. To tell each service apart all responses will contain the header *service-name* indicating which service
is responsible for generating the response 

The services have three endpoints:
- GET */health* 
- GET */people* 
- POST */person*, body json with the following structure `{"name": "John"}`