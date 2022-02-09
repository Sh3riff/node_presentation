FROM node:14.16.1-slim

WORKDIR /app

COPY package*.json ./

COPY . .

RUN npm install --production=false

RUN npm run build


FROM node:14.16.1-slim

WORKDIR /app

COPY package*.json ./

RUN npm install --production

COPY --from=0 /app/src ./src
EXPOSE 8080

CMD [ "npm", "start" ]