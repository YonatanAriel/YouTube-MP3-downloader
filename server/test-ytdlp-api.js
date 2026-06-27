import { default as ytdl } from 'youtube-dl-exec';

console.log('Testing youtube-dl-exec library call...');
try {
  const version = await ytdl(null, { version: true });
  console.log('Version:', version);
} catch (e) {
  console.error('Error running library:', e);
}
