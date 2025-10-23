FROM node:22

# Create app directory
WORKDIR /app

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
#
# Note when using COPY with more than one source file, 
# the destination must be a directory and end with a /
COPY package*.json ./
RUN npm ci

# Bundle app source
COPY src ./src
COPY views ./views
COPY public ./public
COPY tsconfig*.json ./
COPY nest-cli.json .
COPY tailwind.config.js .
COPY .env .

# Build app from source
RUN npm run build

# Remove the source
RUN rm -rf ./src

EXPOSE 8080
CMD [ "npm", "run", "start:prod" ]