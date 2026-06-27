export interface VideoResult {
  id: string;
  title: string;
  url: string;
  thumbnail: string | null;
  duration: number | null;
  durationString: string;
  channel: string;
  viewCount: number | null;
  estimatedSizeMB: number | null;
}

export interface SearchResponse {
  results: VideoResult[];
}

export interface DownloadState {
  videoId: string;
  status: 'idle' | 'downloading' | 'done' | 'error';
  error?: string;
}
