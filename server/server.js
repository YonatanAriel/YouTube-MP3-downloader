import express from 'express';
import cors from 'cors';
import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3001;

// WARP Proxy Configuration
// Cloudflare WARP allows yt-dlp to bypass YouTube's datacenter IP blocking
// by routing traffic through Cloudflare's edge network (residential-like IPs)
const WARP_PROXY = process.env.WARP_PROXY || null;

app.use(cors());
app.use(express.json());

const ytDlpPath = (() => {
  return 'yt-dlp';
})();

function runYtDlp(args) {
  return new Promise((resolve, reject) => {
    const proc = spawn(ytDlpPath, args, { windowsHide: true });
    let stdout = '';
    let stderr = '';

    proc.stdout.on('data', (chunk) => { stdout += chunk.toString(); });
    proc.stderr.on('data', (chunk) => { stderr += chunk.toString(); });

    proc.on('close', (code) => {
      if (code !== 0) {
        return reject(new Error(`yt-dlp exited with code ${code}: ${stderr}`));
      }
      const lines = stdout.trim().split('\n').filter(Boolean);
      const results = [];
      for (const line of lines) {
        try { results.push(JSON.parse(line)); } catch { }
      }
      resolve(results);
    });

    proc.on('error', (err) => reject(err));
  });
}

function sanitiseFilename(name) {
  return name
    .replace(/[<>:"/\\|?*\x00-\x1F]/g, '')
    .replace(/[^\x20-\x7E]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 200)
    .replace(/^\s+|\s+$/g, '') || 'download';
}

app.get('/api/search', async (req, res) => {
  const query = req.query.q;
  if (!query || typeof query !== 'string' || !query.trim()) {
    return res.status(400).json({ error: 'Missing search query parameter "q".' });
  }

  try {
    const args = [
      `ytsearch10:${query.trim()}`,
      '--dump-json',
      '--flat-playlist',
      '--no-download',
      '--no-warnings',
    ];

    // Add WARP proxy if available
    if (WARP_PROXY) {
      args.push('--proxy', WARP_PROXY);
    }

    const results = await runYtDlp(args);

    const videos = results.map((v) => ({
      id: v.id,
      title: v.title,
      url: v.webpage_url || v.url || `https://www.youtube.com/watch?v=${v.id}`,
      thumbnail: v.thumbnail || v.thumbnails?.[v.thumbnails.length - 1]?.url || null,
      duration: v.duration,
      durationString: v.duration_string || formatDuration(v.duration),
      channel: v.channel || v.uploader || 'Unknown',
      viewCount: v.view_count ?? null,
      estimatedSizeMB: v.duration ? Math.round((v.duration / 60) * 2.4 * 10) / 10 : null,
    }));

    return res.json({ results: videos });
  } catch (err) {
    console.error('[search]', err.message);
    return res.status(500).json({ error: 'Search failed. Please try again.' });
  }
});

app.get('/api/info', async (req, res) => {
  const url = req.query.url;
  if (!url || typeof url !== 'string') {
    return res.status(400).json({ error: 'Missing "url" query parameter.' });
  }

  if (!/(?:youtube\.com|youtu\.be)/i.test(url)) {
    return res.status(400).json({ error: 'Invalid YouTube URL.' });
  }

  try {
    const args = [
      url.trim(),
      '--dump-json',
      '--no-download',
      '--no-warnings',
      '--no-playlist',
      '--user-agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      '--extractor-args', 'youtube:player_client=web_safari,android',
      '--geo-bypass',
      '--no-color',
    ];

    // Add WARP proxy if available
    if (WARP_PROXY) {
      args.push('--proxy', WARP_PROXY);
    }

    const results = await runYtDlp(args);

    if (results.length === 0) {
      return res.status(404).json({ error: 'Video not found.' });
    }

    const v = results[0];
    return res.json({
      id: v.id,
      title: v.title,
      url: v.webpage_url || url,
      thumbnail: v.thumbnail || v.thumbnails?.[v.thumbnails.length - 1]?.url || null,
      duration: v.duration,
      durationString: v.duration_string || formatDuration(v.duration),
      channel: v.channel || v.uploader || 'Unknown',
      viewCount: v.view_count ?? null,
      estimatedSizeMB: v.duration ? Math.round((v.duration / 60) * 2.4 * 10) / 10 : null,
    });
  } catch (err) {
    console.error('[info]', err.message);
    return res.status(500).json({ error: 'Failed to fetch video info.' });
  }
});

app.get('/api/download', async (req, res) => {
  const url = req.query.url;
  if (!url || typeof url !== 'string') {
    return res.status(400).json({ error: 'Missing "url" query parameter.' });
  }

  if (!/(?:youtube\.com|youtu\.be)/i.test(url)) {
    return res.status(400).json({ error: 'Invalid YouTube URL.' });
  }

  let proc;
  let timeoutId;

  try {
    const infoArgs = [
      url.trim(),
      '--dump-json',
      '--no-download',
      '--no-warnings',
      '--no-playlist',
    ];

    // Add WARP proxy if available
    if (WARP_PROXY) {
      infoArgs.push('--proxy', WARP_PROXY);
    }

    const infoResults = await runYtDlp(infoArgs);

    if (!infoResults || infoResults.length === 0) {
      return res.status(404).json({ error: 'Video not found or not accessible.' });
    }

    const title = infoResults[0]?.title || 'download';
    const filename = sanitiseFilename(title) + '.mp3';

    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');

    proc = spawn(ytDlpPath, [
      url.trim(),
      '-x',
      '--audio-format', 'mp3',
      '--audio-quality', '0',
      '-o', '-',
      '--no-warnings',
      '--no-playlist',
      '--no-part',
      '--no-mtime',
      '--socket-timeout', '30',
      '--fragment-retries', '10',
      '--extractor-args', 'youtube:player_client=web_safari,android;skip=dash,hls,translated_subs',
      '--no-check-certificate',
      '-f', 'bestaudio[ext=m4a]/bestaudio',
      '--user-agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      '--geo-bypass',
      '--no-color',
      '--sleep-interval', '1',
      '--max-sleep-interval', '3',
      ...(WARP_PROXY ? ['--proxy', WARP_PROXY] : []),
    ], { windowsHide: true });

    let dataReceived = false;

    proc.stdout.on('data', (chunk) => {
      dataReceived = true;
      res.write(chunk);
    });

    proc.stderr.on('data', (chunk) => {
      const msg = chunk.toString();
      console.log('[download stderr]', msg.trim());
    });

    proc.on('error', (err) => {
      errorOccurred = true;
      console.error('[download spawn error]', err.message);
      if (!res.headersSent) {
        res.status(500).json({ error: 'Download failed to start.' });
      } else if (!res.writableEnded) {
        res.end();
      }
    });

    proc.on('close', (code) => {
      if (timeoutId) clearTimeout(timeoutId);
      
      if (code !== 0) {
        console.error('[download] Process exited with code', code);
        if (!res.headersSent) {
          res.status(500).json({ error: 'Download failed.' });
        } else if (!res.writableEnded) {
          res.end();
        }
      } else if (dataReceived && !res.writableEnded) {
        res.end();
      }
    });

    timeoutId = setTimeout(() => {
      if (!dataReceived && proc && !proc.killed) {
        proc.kill('SIGTERM');
        if (!res.headersSent) {
          res.status(408).json({ error: 'Download timeout.' });
        } else if (!res.writableEnded) {
          res.end();
        }
      }
    }, 5 * 60 * 1000);

    req.on('close', () => {
      if (proc && !proc.killed) {
        proc.kill('SIGTERM');
      }
      if (timeoutId) clearTimeout(timeoutId);
    });
  } catch (err) {
    console.error('[download]', err.message);
    if (proc && !proc.killed) {
      proc.kill('SIGTERM');
    }
    if (timeoutId) clearTimeout(timeoutId);
    if (!res.headersSent) {
      return res.status(500).json({ error: 'Download failed: ' + err.message });
    } else if (!res.writableEnded) {
      res.end();
    }
  }
});

function formatDuration(seconds) {
  if (!seconds && seconds !== 0) return '--:--';
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  return `${m}:${String(s).padStart(2, '0')}`;
}

const clientDistPath = path.join(__dirname, '../client/dist');
app.use(express.static(clientDistPath));

app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) {
    return next();
  }
  res.sendFile(path.join(clientDistPath, 'index.html'), (err) => {
    if (err) {
      next();
    }
  });
});

app.listen(PORT, () => {
  console.log(`🎵 YouTube MP3 Downloader API running on http://localhost:${PORT}`);
});
