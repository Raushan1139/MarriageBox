import { useEffect, useRef } from 'react';

/* ─────────────────────────────────────────────────────────────────────────────
   SliderTrack — ZERO React state during drag.
   Mirrors the original site's W() function exactly:
     - fill div updated directly on mousemove/touchmove
     - onDrag(fraction) called on each move (for time display)
     - onCommit(fraction) called once on mouseup/touchend (for seekTo)
   ───────────────────────────────────────────────────────────────────────── */
function SliderTrack({ id, fillId, value, onDrag, onCommit }) {
  const trackRef = useRef(null);

  // Returns clamped 0–1 fraction from a clientX coordinate
  const getFraction = (clientX) => {
    if (!trackRef.current) return value;
    const rect = trackRef.current.getBoundingClientRect();
    return Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
  };

  // Direct fill update — no React re-render
  const applyFill = (frac) => {
    const fill = document.getElementById(fillId);
    if (fill) fill.style.width = `${frac * 100}%`;
  };

  // ── Mouse ──────────────────────────────────────────────────────────────
  const handleMouseDown = (e) => {
    e.preventDefault();
    let last = getFraction(e.clientX);
    applyFill(last);
    onDrag?.(last);

    const onMove = (ev) => {
      last = getFraction(ev.clientX);
      applyFill(last);
      onDrag?.(last);
    };
    const onUp = (ev) => {
      last = getFraction(ev.clientX);
      applyFill(last);
      onCommit?.(last);
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
    };
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  };

  // ── Touch ──────────────────────────────────────────────────────────────
  const handleTouchStart = (e) => {
    e.preventDefault();
    let last = getFraction(e.touches[0].clientX);
    applyFill(last);
    onDrag?.(last);

    const onMove = (ev) => {
      ev.preventDefault();
      last = getFraction(ev.touches[0].clientX);
      applyFill(last);
      onDrag?.(last);
    };
    const onEnd = (ev) => {
      last = getFraction(ev.changedTouches[0].clientX);
      applyFill(last);
      onCommit?.(last);
      document.removeEventListener('touchmove', onMove);
      document.removeEventListener('touchend', onEnd);
    };
    document.addEventListener('touchmove', onMove, { passive: false });
    document.addEventListener('touchend', onEnd);
  };

  return (
    <div
      ref={trackRef}
      id={id}
      className="track"
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
      role="slider"
      aria-valuenow={Math.round(value * 100)}
      aria-valuemin={0}
      aria-valuemax={100}
      style={{ cursor: 'pointer' }}
    >
      <div id={fillId} className="fill" style={{ width: `${value * 100}%` }} />
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   VolumeSlider — mirrors original's W(volTrack, onChange) pattern.
   Direct DOM fill update, no React input[range].
   ───────────────────────────────────────────────────────────────────────── */
function VolumeSlider({ volume, onVolumeChange }) {
  const trackRef  = useRef(null);
  const fillRef   = useRef(null);
  const svgRef    = useRef(null);
  const savedVol  = useRef(volume); // for mute toggle

  // Keep fill in sync when volume prop changes from outside
  useEffect(() => {
    if (fillRef.current) fillRef.current.style.width = `${volume}%`;
    if (svgRef.current)  svgRef.current.style.opacity = volume === 0 ? '0.45' : '1';
  }, [volume]);

  const getFraction = (clientX) => {
    if (!trackRef.current) return volume / 100;
    const rect = trackRef.current.getBoundingClientRect();
    return Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
  };

  const applyFrac = (frac) => {
    const val = Math.round(frac * 100);
    if (fillRef.current) fillRef.current.style.width = `${val}%`;
    if (svgRef.current)  svgRef.current.style.opacity = val === 0 ? '0.45' : '1';
    onVolumeChange?.(val);
    if (val > 0) savedVol.current = val;
  };

  const handleMouseDown = (e) => {
    e.preventDefault();
    applyFrac(getFraction(e.clientX));
    const onMove = (ev) => applyFrac(getFraction(ev.clientX));
    const onUp   = () => {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
    };
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  };

  const handleTouchStart = (e) => {
    e.preventDefault();
    applyFrac(getFraction(e.touches[0].clientX));
    const onMove = (ev) => { ev.preventDefault(); applyFrac(getFraction(ev.touches[0].clientX)); };
    const onEnd  = () => {
      document.removeEventListener('touchmove', onMove);
      document.removeEventListener('touchend', onEnd);
    };
    document.addEventListener('touchmove', onMove, { passive: false });
    document.addEventListener('touchend', onEnd);
  };

  // Icon click = mute toggle (original behaviour)
  const handleIconClick = () => {
    if (fillRef.current) {
      const isMuted = fillRef.current.style.width === '0%';
      const newVal  = isMuted ? savedVol.current : 0;
      fillRef.current.style.width = `${newVal}%`;
      if (svgRef.current) svgRef.current.style.opacity = isMuted ? '1' : '0.45';
      onVolumeChange?.(newVal);
    }
  };

  return (
    <div className="vol">
      <svg
        ref={svgRef}
        className="vol-icon"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        style={{ cursor: 'pointer', flexShrink: 0 }}
        onClick={handleIconClick}
      >
        <path d="M11 5 6 9H2v6h4l5 4V5z" />
        <path d="M15.5 8.5a5 5 0 0 1 0 7" />
      </svg>
      <div
        ref={trackRef}
        className="vol-track"
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
        style={{ cursor: 'pointer' }}
      >
        <div ref={fillRef} className="vol-fill" style={{ width: `${volume}%` }} />
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   Main Player
   HTML structure matches the original deluxshaadi.com player exactly,
   including IDs (scrubTrack, scrubFill) so domSyncProgress() in the hook
   finds the right elements.
   ───────────────────────────────────────────────────────────────────────── */
export default function MusicPlayer({
  currentTrack,
  isPlaying,
  currentTime,
  duration,
  progress,
  volume,
  onPlay,
  onPause,
  onNext,
  onPrev,
  onSeek,
  onVolumeChange,
  onQueueToggle,
  isSeeking,
  playerRef,
}) {
  const fillRef = useRef(null);

  // getDuration() — read directly from YT player (no stale closure)
  const getDuration = () => {
    try { return playerRef?.current?.getDuration?.() || 0; } catch { return 0; }
  };

  const handlePlayPause = () => {
    if (isPlaying) onPause();
    else onPlay();
  };

  // onDrag: update currentTime display while scrubbing (original behaviour)
  const handleScrubDrag = (frac) => {
    if (isSeeking) isSeeking.current = true;
    const dur = getDuration();
    const timeEl = document.getElementById('currentTime');
    if (timeEl && dur > 0) timeEl.textContent = formatTime(frac * dur);
  };

  // onCommit: seek only once on release (no buffering stutter during drag)
  const handleScrubCommit = (frac) => {
    if (isSeeking) isSeeking.current = false;
    onSeek(frac);
  };

  return (
    <div className="player">
      {/* YT iframe API mounts here — display:none matches original exactly */}
      <div id="yt-player" style={{ display: 'none' }} />

      {/* Thumbnail */}
      <div className={`thumb${isPlaying ? ' spinning' : ''}`} id="thumb">
        <span id="thumbText">{currentTrack.initials || '🎵'}</span>
      </div>

      {/* Track info */}
      <div className="track-info">
        <div className="name" id="trackName">{currentTrack.name}</div>
        <div className="film" id="trackFilm">{currentTrack.film}</div>
      </div>

      {/* Prev */}
      <button className="navbtn ctrl-btn" id="prevBtn" aria-label="Previous song" onClick={onPrev}>
        <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M6 6h2v12H6zM20 6 10 12l10 6z"/></svg>
      </button>

      {/* Play/Pause — innerHTML overwritten by domSetPlaying() for zero-lag feedback */}
      <button className="playbtn ctrl-btn" id="playBtn" aria-label={isPlaying ? 'Pause' : 'Play'} onClick={handlePlayPause}>
        {isPlaying
          ? <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M6 5h4v14H6zM14 5h4v14h-4z"/></svg>
          : <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M8 5v14l11-7z"/></svg>
        }
      </button>

      {/* Next */}
      <button className="navbtn ctrl-btn" id="nextBtn" aria-label="Next song" onClick={onNext}>
        <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M16 6h2v12h-2zM4 6l10 6-10 6z"/></svg>
      </button>

      {/* Queue toggle */}
      <button className="navbtn queue-btn ctrl-btn" id="queueBtn" aria-label="Song list" onClick={onQueueToggle}>
        <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M3 5h18v2H3zm0 4h18v2H3zm0 4h12v2H3zm0 4h12v2H3z"/></svg>
      </button>

      {/* Scrubber — IDs match original: scrubTrack / scrubFill */}
      <div className="scrub">
        <span className="time" id="currentTime">{currentTime}</span>
        <SliderTrack
          id="scrubTrack"
          fillId="scrubFill"
          value={progress}
          onDrag={handleScrubDrag}
          onCommit={handleScrubCommit}
        />
        <span className="time" id="durationTime">{duration}</span>
      </div>

      {/* Decorative divider */}
      <svg className="player-divider" width="18" height="18" viewBox="0 0 24 24" style={{ flexShrink: 0, opacity: 0.55 }} aria-hidden="true">
        <g fill="var(--marigold)">
          <circle cx="12" cy="6" r="3.4"/>
          <circle cx="12" cy="18" r="3.4"/>
          <circle cx="6" cy="12" r="3.4"/>
          <circle cx="18" cy="12" r="3.4"/>
        </g>
        <circle cx="12" cy="12" r="2.6" fill="var(--gold)"/>
      </svg>

      {/* Volume — direct DOM, no React input[range], matches original's W() */}
      <VolumeSlider volume={volume} onVolumeChange={onVolumeChange} />
    </div>
  );
}

// Local helper (only used in this file for drag time display)
function formatTime(sec) {
  if (isNaN(sec) || sec < 0) return '0:00';
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s < 10 ? '0' : ''}${s}`;
}
