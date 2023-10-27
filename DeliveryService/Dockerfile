FROM node:20-alpine

ENV MONGO_DB_USERNAME=root\
    MONGO_DB_PASSWORD=example

RUN mkdir -p /home/delivery-service

COPY . /home/delivery-service

WORKDIR /home/delivery-service

RUN npm install

EXPOSE 9603

CMD [ "node", "app.js"]