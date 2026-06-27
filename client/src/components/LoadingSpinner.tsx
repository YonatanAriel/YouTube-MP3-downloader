interface LoadingSpinnerProps {
  state: 'searching' | 'downloading' | 'resolving';
}

export default function LoadingSpinner({ state }: LoadingSpinnerProps) {
  const messages: Record<string, string> = {
    searching: '🔍 Searching for videos...',
    downloading: '📥 Downloading MP3...',
    resolving: '🔗 Resolving video...',
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', padding: '1.5rem 1rem' }}>
      <div style={{ position: 'relative', width: '40px', height: '40px' }}>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          .spinner {
            width: 40px;
            height: 40px;
            border: 3px solid rgba(192, 132, 252, 0.2);
            border-top: 3px solid #c084fc;
            border-radius: 50%;
            animation: spin 1s linear infinite;
          }
        `}</style>
        <div className="spinner"></div>
      </div>

      <div style={{ textAlign: 'center' }}>
        <p style={{ fontSize: '0.95rem', fontWeight: 600, color: '#c084fc', margin: 0 }}>
          {messages[state]}
        </p>
      </div>
    </div>
  );
}
