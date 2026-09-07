FROM node:20-alpine

WORKDIR /app

 
COPY ./package* .

COPY ./routes/* ./routes/

COPY ./app.js .

COPY ./server.js .

COPY ./db.js .

COPY ./data/* ./data/


RUN npm install



CMD ["npm","start"]
