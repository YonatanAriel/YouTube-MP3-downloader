# Melodl - Audio Downloader

A premium, lightweight, self-hosted web application to download high-quality MP3 audio from videos.

Built with **React, Vite, TypeScript, Express, and Three.js**.

> **⚠️ Important:** This app requires **self-hosting on your personal machine or server** to work reliably. Cloud-hosted deployments (Heroku, Render, etc.) are blocked by YouTube's datacenter IP detection. See [Self-Hosting](#self-hosting) below.

---

## Key Features
- **Pasted Link Resolution**: Paste a direct video link to trigger instant metadata extraction and download options.
- **In-App Search**: Search for videos directly in the app.
- **Premium 3D Experience**: A glassmorphic dark-theme UI floating over an interactive 3D particle background (React Three Fiber).
- **Simple Loading Indicator**: Animated spinner showing search, download, and resolution states.
- **Download Queue**: Keep track of all downloaded songs in order for easy reference.
- **Download Completion Indicator**: Clear visual feedback showing when a download has successfully started.
- **Keyboard Navigation Controls**:
  - `ArrowUp` / `ArrowDown` to navigate search results.
  - `Enter` to search or download the selected video.
  - `d` or `D` to download the selected video.
  - `/` to instantly refocus the search input.
  - `Escape` to clear search results and reset inputs.

---

## Technical Architecture
- **No API Keys Required**: Uses `yt-dlp`'s built-in search capabilities.
- **Streaming Pipeline**: Backend streams data directly from `yt-dlp` output, piped through `ffmpeg` into the HTTP response. No temporary files are written to the server's disk, keeping resource footprint minimal.
- **Audio Quality**: Automatic transcoding to high-quality VBR MP3 (variable bitrate average ~245–320kbps) matching the highest available source audio stream.
- **Robust Error Handling**: Enhanced timeout and error detection for reliable downloads.

---

## Prerequisites
Ensure the following are installed on your host system:
1. **Node.js** (v20 or higher)
2. **Python 3** (Required by `yt-dlp`)
3. **FFmpeg** (Required for MP3 audio conversion)
4. **yt-dlp** (Install globally or ensure it is in your system's PATH):
   ```bash
   pip install yt-dlp
   ```

---

## Self-Hosting

### Why Self-Hosting?
YouTube blocks automated downloads from cloud datacenter IPs (Render, Heroku, etc.). Self-hosting on your personal machine avoids this restriction entirely.

### Option 1: Run Locally (Recommended)
Perfect for personal use on your machine:

```bash
# Install dependencies
npm install
npm install --prefix server

# Run both frontend and backend
npm run dev
```
Then open [http://localhost:5173](http://localhost:5173).

### Option 2: Production Build
For a production-ready setup on your machine:

```bash
npm run build
npm run start --prefix server
```
Then visit [http://localhost:3001](http://localhost:3001).

### Option 3: Docker (Advanced)
Run in a Docker container on your machine:

```bash
docker build -t melodl .
docker run -p 3001:3001 melodl
```

### Option 4: Raspberry Pi / Always-On Server
Deploy to a Raspberry Pi or home server for 24/7 access:

1. Clone the repository on your Pi
2. Install prerequisites: `sudo apt-get install python3 python3-pip ffmpeg nodejs npm`
3. Follow "Option 2: Production Build" above
4. Use a service like **Ngrok** or **Tailscale** for remote access if needed

---

## Troubleshooting

### Downloads Not Working
**Issue**: "Sign in to confirm you're not a bot" error on cloud deployment  
**Solution**: This app **must be self-hosted** on your personal machine or home server. Cloud providers' IPs are blocked by YouTube.

### Downloads Not Working in Development Mode
If downloads fail in dev mode with errors, use production mode instead:
```bash
npm run build
npm run start --prefix server
```

### FFmpeg Not Found
If you get FFmpeg errors, install it:
- **Windows (Chocolatey)**: `choco install ffmpeg`
- **macOS (Homebrew)**: `brew install ffmpeg`
- **Linux (Ubuntu)**: `sudo apt-get install ffmpeg`

### yt-dlp Updates
YouTube occasionally changes its API. If downloads stop working, update yt-dlp:
```bash
pip install --upgrade yt-dlp
```

### HTTP 403 Forbidden Errors
Some videos may be restricted or require authentication. These are typically:
- Copyright-restricted videos
- Geographically blocked content
- Private or unlisted videos

Try with a different video to verify the app works.

---

## Legal & Disclaimer
This application is for **personal use only**. `yt-dlp` is [legally protected](https://github.com/yt-dlp/yt-dlp/issues/380) and maintained on GitHub. Always respect copyright laws in your jurisdiction.
