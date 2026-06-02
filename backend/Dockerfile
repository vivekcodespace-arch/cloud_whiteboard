# use node 20 as base image
FROM node:20-alpine

# set working directory inside container
WORKDIR /app

# copy package files first (for better caching)
COPY package*.json ./

# install dependencies
RUN npm install

# copy rest of the source code
COPY . .

# compile TypeScript to JavaScript
RUN npx tsc

# start the compiled server
CMD ["node", "dist/index.js"]