import React, { useState, useEffect, useRef } from 'react';
import Scene3D from './components/Scene3D';
import LoadingSpinner from './components/LoadingSpinner';
import { searchVideos, getVideoInfo, triggerDownload, isYouTubeUrl } from './api';
import type { VideoResult } from './types';

type LoadingState = 'idle' | 'searching' | 'downloading' | 'resolving';

export default function App() {
  const [query, setQuery] = useState('');
  const [loadingState, setLoadingState] = useState<LoadingState>('idle');
  const [results, setResults] = useState<VideoResult[]>([]);
  const [downloadedVideos, setDownloadedVideos] = useState<VideoResult[]>([]);
  const [activeIndex, setActiveIndex] = useState<number>(-1);
  const [error, setError] = useState<string | null>(null);
  const [downloadingTitle, setDownloadingTitle] = useState<string | null>(null);
  const [downloadSuccess, setDownloadSuccess] = useState<string | null>(null);
  
  const searchInputRef = useRef<HTMLInputElement>(null);
  const resultsRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    searchInputRef.current?.focus();
  }, []);

  const handleURLDirect = async (url: string) => {
    setLoadingState('resolving');
    setError(null);
    try {
      const info = await getVideoInfo(url);
      setDownloadingTitle(info.title);
      setLoadingState('downloading');
      triggerDownload(info.url, `${info.title}.mp3`);
      
      setQuery('');
      setResults([]);
      
      setTimeout(() => {
        setDownloadedVideos(prev => [info, ...prev]);
        
        setDownloadSuccess(info.title);
        setTimeout(() => setDownloadSuccess(null), 3000);
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Failed to resolve URL.');
    } finally {
      setLoadingState('idle');
      setDownloadingTitle(null);
    }
  };

  const handleSearch = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!query.trim()) return;

    if (isYouTubeUrl(query.trim())) {
      await handleURLDirect(query.trim());
      return;
    }

    setLoadingState('searching');
    setError(null);
    setResults([]);
    setActiveIndex(-1);

    try {
      const data = await searchVideos(query.trim());
      setResults(data);
      if (data.length > 0) {
        setActiveIndex(0);
      } else {
        setError('No videos found.');
      }
    } catch (err: any) {
      setError(err.message || 'Something went wrong.');
    } finally {
      setLoadingState('idle');
    }
  };

  const handleDownload = (video: VideoResult) => {
    setDownloadingTitle(video.title);
    setLoadingState('downloading');
    triggerDownload(video.url, `${video.title}.mp3`);
    
    setTimeout(() => {
      setDownloadedVideos(prev => {
        if (prev.some(v => v.id === video.id)) {
          return prev;
        }
        return [video, ...prev];
      });
      
      setDownloadSuccess(video.title);
      setTimeout(() => {
        setDownloadSuccess(null);
        setLoadingState('idle');
        setDownloadingTitle(null);
      }, 3000);
    }, 2000);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '/' && document.activeElement !== searchInputRef.current) {
        e.preventDefault();
        searchInputRef.current?.focus();
        searchInputRef.current?.select();
        return;
      }

      if (results.length > 0) {
        if (e.key === 'ArrowDown') {
          e.preventDefault();
          setActiveIndex((prev) => {
            const next = prev < results.length - 1 ? prev + 1 : 0;
            resultsRefs.current[next]?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
            return next;
          });
        } else if (e.key === 'ArrowUp') {
          e.preventDefault();
          setActiveIndex((prev) => {
            const next = prev > 0 ? prev - 1 : results.length - 1;
            resultsRefs.current[next]?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
            return next;
          });
        } else if (e.key === 'Enter') {
          if (document.activeElement === searchInputRef.current) return;

          if (activeIndex >= 0 && activeIndex < results.length) {
            e.preventDefault();
            handleDownload(results[activeIndex]);
          }
        } else if (e.key.toLowerCase() === 'd') {
          if (document.activeElement === searchInputRef.current) return;

          if (activeIndex >= 0 && activeIndex < results.length) {
            e.preventDefault();
            handleDownload(results[activeIndex]);
          }
        } else if (e.key === 'Escape') {
          e.preventDefault();
          setResults([]);
          setActiveIndex(-1);
          setQuery('');
          searchInputRef.current?.focus();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [results, activeIndex]);

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: '100vh', padding: '2rem 1rem' }}>
      <Scene3D />

      <main style={{ maxWidth: '800px', width: '100%', margin: 'auto', display: 'flex', flexDirection: 'column', gap: '2rem', zIndex: 10 }}>
        
        <header style={{ textAlign: 'center', marginBottom: '1rem' }}>
          <h1 className="glow-text" style={{ fontFamily: 'var(--font-heading)', fontSize: '3rem', fontWeight: 800, margin: 0, background: 'linear-gradient(to right, #c084fc, #ec4899)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', letterSpacing: '-0.05em' }}>
            Melodl
          </h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem', fontSize: '1.1rem' }}>
            High-quality YouTube MP3 Downloader
          </p>
        </header>

        <section className="glass-panel" style={{ padding: '1.5rem', border: '1px solid var(--glass-border)' }}>
          <form onSubmit={handleSearch} style={{ display: 'flex', gap: '0.75rem' }}>
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Paste YouTube Link or Search Query..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              disabled={loadingState !== 'idle'}
              style={{
                flex: 1,
                padding: '1rem 1.25rem',
                borderRadius: '12px',
                border: '1px solid var(--glass-border)',
                backgroundColor: 'rgba(0,0,0,0.5)',
                color: 'var(--text-primary)',
                fontSize: '1rem',
                outline: 'none',
                transition: 'border-color 0.2s',
              }}
              className="search-input"
            />
            <button
              type="submit"
              disabled={loadingState !== 'idle' || !query.trim()}
              style={{
                padding: '0 1.75rem',
                borderRadius: '12px',
                border: 'none',
                background: 'linear-gradient(135deg, #c084fc, #ec4899)',
                color: '#fff',
                fontSize: '1rem',
                fontWeight: 600,
                cursor: 'pointer',
                opacity: (loadingState !== 'idle' || !query.trim()) ? 0.6 : 1,
                transition: 'transform 0.1s, opacity 0.2s',
              }}
            >
              {loadingState !== 'idle' ? 'Processing...' : 'Go'}
            </button>
          </form>
          
          <div style={{ marginTop: '0.75rem', display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            <span>Tip: Paste link to start instant download</span>
            <span className="float-hint">Press <kbd style={{ background: '#221a36', padding: '2px 6px', borderRadius: '4px', border: '1px solid #443366', color: '#c084fc' }}>/</kbd> to focus search</span>
          </div>
        </section>

        {loadingState !== 'idle' && (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <LoadingSpinner state={loadingState} />
          </div>
        )}

        {downloadSuccess && (
          <div className="glass-panel pulse-border" style={{ padding: '1rem 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderLeft: '4px solid #10b981', backgroundColor: 'rgba(16, 185, 129, 0.1)', borderColor: 'rgba(16, 185, 129, 0.3)' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                ✅ Download initiated successfully!
              </span>
              <strong style={{ fontSize: '0.95rem', color: '#10b981', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '500px' }}>
                {downloadSuccess}
              </strong>
            </div>
            <button 
              onClick={() => setDownloadSuccess(null)}
              style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '1.2rem' }}
            >
              ×
            </button>
          </div>
        )}

        {downloadingTitle && loadingState === 'downloading' && (
          <div className="glass-panel pulse-border" style={{ padding: '1rem 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderLeft: '4px solid #c084fc' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                ⚡ Downloading...
              </span>
              <strong style={{ fontSize: '0.95rem', color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '500px' }}>
                {downloadingTitle}
              </strong>
            </div>
          </div>
        )}

        {error && (
          <div className="glass-panel" style={{ padding: '1rem 1.5rem', backgroundColor: 'rgba(239, 68, 68, 0.1)', borderColor: 'rgba(239, 68, 68, 0.3)', color: '#f87171' }}>
            {error}
          </div>
        )}

        {results.length > 0 && (
          <section style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'flex', justifyContent: 'space-between' }}>
              <span>Search Results ({results.length})</span>
              <span style={{ fontSize: '0.85rem', fontWeight: 'normal', color: 'var(--text-muted)' }}>
                Use <kbd style={{ background: '#221a36', padding: '2px 6px', borderRadius: '4px', border: '1px solid #443366' }}>↑</kbd> <kbd style={{ background: '#221a36', padding: '2px 6px', borderRadius: '4px', border: '1px solid #443366' }}>↓</kbd> and <kbd style={{ background: '#221a36', padding: '2px 6px', borderRadius: '4px', border: '1px solid #443366' }}>Enter</kbd> / <kbd style={{ background: '#221a36', padding: '2px 6px', borderRadius: '4px', border: '1px solid #443366' }}>D</kbd>
              </span>
            </h2>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '500px', overflowY: 'auto', paddingRight: '0.5rem', paddingLeft: '20px' , paddingTop: '10px', paddingBottom: '20px' }}>
              {results.map((video, index) => {
                const isActive = index === activeIndex;
                return (
                  <div
                    key={video.id}
                    ref={(el) => { resultsRefs.current[index] = el; }}
                    onClick={() => {
                      setActiveIndex(index);
                      handleDownload(video);
                    }}
                    onMouseEnter={() => setActiveIndex(index)}
                    className="glass-panel"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '1rem',
                      padding: '0.75rem',
                      cursor: 'pointer',
                      border: isActive ? '1px solid #c084fc' : '1px solid var(--glass-border)',
                      boxShadow: isActive ? '0 0 15px rgba(192, 132, 252, 0.2)' : 'none',
                      transform: isActive ? 'scale(1.01)' : 'scale(1)',
                      transition: 'all 0.15s cubic-bezier(0.4, 0, 0.2, 1)',
                    }}
                  >
                    <div style={{ position: 'relative', width: '120px', height: '68px', flexShrink: 0, borderRadius: '8px', overflow: 'hidden', backgroundColor: '#000' }}>
                      {video.thumbnail ? (
                        <img src={video.thumbnail} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>🎵</div>
                      )}
                      <span style={{ position: 'absolute', bottom: '4px', right: '4px', background: 'rgba(0,0,0,0.8)', padding: '2px 6px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600 }}>
                        {video.durationString}
                      </span>
                    </div>

                    <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                      <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 600, color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {video.title}
                      </h3>
                      <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                        {video.channel}
                        {video.estimatedSizeMB && <span style={{ color: 'var(--text-muted)', marginLeft: '0.5rem' }}>• ~{video.estimatedSizeMB}MB</span>}
                      </span>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDownload(video);
                      }}
                      style={{
                        padding: '0.6rem 1.2rem',
                        borderRadius: '8px',
                        border: 'none',
                        background: isActive ? 'linear-gradient(135deg, #c084fc, #ec4899)' : 'rgba(255,255,255,0.05)',
                        color: isActive ? '#fff' : 'var(--text-primary)',
                        fontSize: '0.85rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        transition: 'background 0.2s',
                      }}
                    >
                      Download
                    </button>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {downloadedVideos.length > 0 && (
          <section style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.25rem', fontWeight: 600, color: '#10b981' }}>
              ✅ Downloaded ({downloadedVideos.length})
            </h2>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '300px', overflowY: 'auto', paddingRight: '0.5rem' }}>
              {downloadedVideos.map((video) => (
                <div
                  key={video.id}
                  className="glass-panel"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    padding: '0.6rem',
                    border: '1px solid rgba(16, 185, 129, 0.3)',
                    backgroundColor: 'rgba(16, 185, 129, 0.05)',
                  }}
                >
                  <span style={{ fontSize: '1.2rem' }}>✅</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ margin: 0, fontSize: '0.95rem', fontWeight: 500, color: '#10b981', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {video.title}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        <footer style={{ marginTop: 'auto', textAlign: 'center', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          <span>Melodl YouTube MP3 Downloader • Personal Use Only</span>
        </footer>

      </main>
    </div>
  );
}
