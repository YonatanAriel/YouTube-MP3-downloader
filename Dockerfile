FROM node:20-alpine

RUN apk add --no-cache python3 py3-pip ffmpeg curl

WORKDIR /app

COPY package*.json ./
COPY server/package*.json ./server/

RUN npm install --prefix server --ignore-scripts

RUN pip3 install --break-system-packages --upgrade yt-dlp

# Optional: Install wgcf for local WARP setup if needed
RUN curl -fsSL https://github.com/ViRb3/wgcf/releases/download/v2.2.23/wgcf_2.2.23_linux_amd64 -o /usr/local/bin/wgcf && \
    chmod +x /usr/local/bin/wgcf || true

COPY server ./server

EXPOSE 3001

CMD ["node", "server/server.js"]
