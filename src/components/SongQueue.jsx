function WaveformBars() {
  return (
    <span className="queue-waveform" aria-hidden="true">
      <span className="queue-wave-bar" style={{ '--delay': '0s', '--height': '10px' }} />
      <span className="queue-wave-bar" style={{ '--delay': '0.15s', '--height': '16px' }} />
      <span className="queue-wave-bar" style={{ '--delay': '0.08s', '--height': '12px' }} />
      <span className="queue-wave-bar" style={{ '--delay': '0.22s', '--height': '8px' }} />
    </span>
  );
}

export default function SongQueue({ open, tracks, currentIndex, category, onJump, onClose }) {
  const categoryLabels = {
    '90s': '90s Songs',
    sangeet: 'Sangeet',
    dj: 'DJ Songs',
    vidaai: 'Vidaai',
  };

  return (
    <div className={`queue-panel${open ? ' open' : ''}`} id="queuePanel" role="dialog" aria-label="Song list" aria-hidden={!open}>
      <div className="queue-header">
        <span className="queue-title" id="queueTitle">
          {categoryLabels[category] || 'Song List'}
        </span>
        <button className="queue-close" id="queueClose" aria-label="Close song list" onClick={onClose}>
          &times;
        </button>
      </div>

      <div className="queue-list" id="queueList">
        {tracks.length === 0 ? (
          <div className="queue-empty">
            <span>🎵</span>
            <p>Loading songs…</p>
          </div>
        ) : (
          tracks.map((track, i) => (
            <button
              key={i}
              className={`queue-item${i === currentIndex ? ' active' : ''}`}
              onClick={() => { onJump(i); onClose(); }}
              aria-label={`Play ${track.name}`}
            >
              <span className="queue-thumb">{track.initials || '🎵'}</span>
              <span className="queue-info">
                <span className="queue-name">{track.name}</span>
                <span className="queue-film">{track.film}</span>
              </span>
              {i === currentIndex && <WaveformBars />}
            </button>
          ))
        )}
      </div>
    </div>
  );
}
