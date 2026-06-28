#!/bin/bash

# Start WARP proxy in background
echo "Starting Cloudflare WARP proxy..."
warp-cli set-mode proxy &
WARP_PID=$!

# Give WARP time to initialize
sleep 5

# Connect WARP
warp-cli connect &

# Wait a bit for WARP to connect
sleep 10

# Start the backend API
echo "Starting backend API..."
export WARP_PROXY="socks5h://127.0.0.1:40000"
cd /app/server && node server.js
