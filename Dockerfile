FROM node:20

# setting port (default 8080)
ARG port=8080
ENV SERVER_PORT $port
EXPOSE $port

WORKDIR /app
COPY . .
RUN npm install

CMD ["node", "server.js"]
