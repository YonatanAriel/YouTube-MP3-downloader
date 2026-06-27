FROM node:20-alpine

RUN apk add --no-cache python3 ffmpeg

WORKDIR /app

COPY package*.json ./
COPY server/package*.json ./server/

RUN npm install --prefix server --ignore-scripts

RUN npm install -g yt-dlp

COPY server ./server

EXPOSE 3001

CMD ["node", "server/server.js"]
