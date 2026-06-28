FROM node:20-alpine

RUN apk add --no-cache python3 py3-pip ffmpeg curl

WORKDIR /app

# Copy and install server dependencies only
COPY server/package*.json ./server/
RUN npm install --prefix server --ignore-scripts

# Install yt-dlp
RUN pip3 install --break-system-packages --upgrade yt-dlp

# Copy server code
COPY server ./server

EXPOSE 3001

CMD ["node", "server/server.js"]
