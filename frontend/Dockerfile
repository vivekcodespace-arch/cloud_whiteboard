# use node 20 as base image
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

# build Next.js for production
RUN npm run build

# start Next.js
CMD ["npm", "start"]