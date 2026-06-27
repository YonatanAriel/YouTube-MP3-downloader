# Melodl - YouTube MP3 Downloader

A premium, lightweight, self-hosted web application to download high-quality MP3 audio from YouTube videos. 

Built with **React, Vite, TypeScript, Express, and Three.js**.

---

## Key Features
- **Pasted Link Resolution**: Paste a direct YouTube link to trigger instant metadata extraction and download options.
- **In-App YouTube Search**: Search for YouTube videos directly in the app.
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
- **No API Keys Required**: Uses `yt-dlp`'s built-in search capabilities, avoiding Google API key quotas.
- **Streaming Pipeline**: Backend streams data directly from `yt-dlp` output, piped through `ffmpeg` into the HTTP response. No temporary files are written to the server's disk, keeping resource footprint minimal.
- **Audio Quality**: Automatic transcoding to high-quality VBR MP3 (variable bitrate average ~245–320kbps) matching the highest available source audio stream.
- **Robust Error Handling**: Enhanced timeout and error detection for reliable downloads from various sources.

---

## Prerequisites
Ensure the following are installed on your host system:
1. **Node.js** (v20 or higher)
2. **Python 3** (Required by `yt-dlp`)
3. **FFmpeg** (Required for MP3 audio conversion)
4. **yt-dlp** (Install globally or ensure it is in your system's PATH, though the app will try to download a copy automatically):
   ```bash
   pip install yt-dlp
   ```

---

## Installation & Running

### 1. Install Dependencies
Run the install command from the root workspace directory:
```bash
npm run install:all
npm install
```

### 2. Run in Development Mode
Start both backend API and React frontend dev server concurrently:
```bash
npm run dev
```
Open your browser to the local URL (typically [http://localhost:5173](http://localhost:5173)).

### 3. Production Build
To build the static frontend assets and serve them directly from the Express server:
```bash
npm run build
npm run start --prefix server
```
Then visit [http://localhost:3001](http://localhost:3001).

---

## Troubleshooting

### Downloads Not Working in Development Mode
If downloads fail in dev mode with vite proxy errors, use production mode instead:
```bash
npm run build
npm run start --prefix server
```

### HTTP 403 Forbidden Errors
Some YouTube videos may be restricted or require authentication. These are typically:
- Copyright-restricted videos
- Geographically blocked content
- Private or unlisted videos

Try with a different video to verify the app works.

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
