FROM node:18-alpine

RUN mkdir -p /home/product-service

WORKDIR /home/product-service

ADD package*.json .

RUN npm install

COPY . .

EXPOSE 9601

CMD [ "node", "app.js"]