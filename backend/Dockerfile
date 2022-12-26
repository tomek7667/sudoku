FROM node:latest

RUN npm install -g yarn

COPY src/ /app/src/
WORKDIR /app/src/

RUN yarn install
RUN yarn start

EXPOSE 3000
