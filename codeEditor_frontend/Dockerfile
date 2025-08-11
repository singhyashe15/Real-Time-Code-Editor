FROM node:18-alpine

WORKDIR /frontend

COPY package* .
RUN npm install 

COPY . .
RUN npm run build

EXPOSE 5176

CMD ["npm" , "run" , "dev"]