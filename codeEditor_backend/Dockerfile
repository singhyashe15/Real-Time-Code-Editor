FROM node:18-alpine

WORKDIR /backend

COPY package* .

RUN npm install

COPY . .

EXPOSE 3000

CMD ["node", "server.js"]