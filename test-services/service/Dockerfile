# Environment variables that need to be passed in
# NAME, PORT
FROM node:11
WORKDIR app
COPY ./docker/package.json /app
RUN npm install
COPY . /app
CMD node index.js
