FROM node:latest

RUN npm install -g yarn --force

COPY src/ /app/src/
WORKDIR /app/src/

RUN yarn install
CMD yarn start

EXPOSE 3000
