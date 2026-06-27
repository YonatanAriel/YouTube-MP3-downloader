import { spawn } from 'child_process';
import { default as ytdl } from 'youtube-dl-exec';

const ytDlpPath = ytdl.constants.YOUTUBE_DL_PATH;
console.log('Spawning path:', ytDlpPath);

const proc = spawn(ytDlpPath, ['--version'], { windowsHide: true });
let out = '';
let err = '';

proc.stdout.on('data', d => out += d);
proc.stderr.on('data', d => err += d);
proc.on('close', code => {
  console.log('Exit code:', code);
  console.log('Stdout:', out.trim());
  console.log('Stderr:', err.trim());
});
proc.on('error', e => {
  console.error('Spawn error:', e);
});
