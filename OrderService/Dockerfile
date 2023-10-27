FROM node:20-alpine


RUN mkdir -p /home/order-service

WORKDIR /home/order-service

ADD package*.json .

RUN npm install

COPY . .

EXPOSE 9600

CMD [ "node", "app.js" ]