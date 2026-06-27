#!/bin/bash
set -e

echo "Installing dependencies..."
cd server
npm install --ignore-scripts

echo "Installing yt-dlp globally..."
npm install -g yt-dlp || pip3 install yt-dlp || echo "Warning: yt-dlp installation may have failed"

echo "Build complete!"
