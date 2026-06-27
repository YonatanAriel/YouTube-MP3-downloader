import { default as ytdl } from 'youtube-dl-exec';

const query = 'rick astley';
console.log('Searching for:', query);

try {
  const result = await ytdl(`ytsearch10:${query}`, {
    dumpJson: true,
    flatPlaylist: true,
    noDownload: true,
    noWarnings: true,
    noPlaylist: true,
  });
  console.log('Result type:', typeof result);
  if (typeof result === 'object') {
    console.log('Keys:', Object.keys(result));
    console.log('First result title:', result.entries?.[0]?.title || result.title);
  } else {
    console.log('String result first 500 chars:', String(result).substring(0, 500));
  }
} catch (e) {
  console.error('Search failed:', e);
}
