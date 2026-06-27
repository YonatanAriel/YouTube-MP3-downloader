import type { VideoResult, SearchResponse } from './types';

const API_BASE = '/api';

export async function searchVideos(query: string): Promise<VideoResult[]> {
  const res = await fetch(`${API_BASE}/search?q=${encodeURIComponent(query)}`);
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || 'Search failed');
  }
  const data: SearchResponse = await res.json();
  return data.results;
}

export async function getVideoInfo(url: string): Promise<VideoResult> {
  const res = await fetch(`${API_BASE}/info?url=${encodeURIComponent(url)}`);
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || 'Failed to fetch video info');
  }
  return res.json();
}

export function getDownloadUrl(videoUrl: string): string {
  return `${API_BASE}/download?url=${encodeURIComponent(videoUrl)}`;
}

export function triggerDownload(videoUrl: string, filename?: string): void {
  const a = document.createElement('a');
  a.href = getDownloadUrl(videoUrl);
  if (filename) a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

export function isYouTubeUrl(str: string): boolean {
  return /(?:youtube\.com\/watch|youtu\.be\/|youtube\.com\/shorts\/)/i.test(str);
}
