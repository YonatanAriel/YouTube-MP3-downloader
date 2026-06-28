FROM node:20-alpine

RUN apk add --no-cache python3 py3-pip ffmpeg

WORKDIR /app

COPY package*.json ./
COPY server/package*.json ./server/

RUN npm install --prefix server --ignore-scripts

RUN pip3 install --break-system-packages yt-dlp

COPY server ./server

EXPOSE 3001

CMD ["node", "server/server.js"]
