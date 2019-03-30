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