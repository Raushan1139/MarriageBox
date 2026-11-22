/**
 * useYouTubePlayer.js
 *
 * Logic ported directly from the original deluxshaadi.com Player script.
 * Variable names, timeouts, and state-machine transitions match the original
 * wherever possible so behaviour is identical.
 */
import { useEffect, useRef, useState, useCallback } from 'react';
import { PLAYLISTS } from '../data/playlists';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatTime(sec) {
  if (isNaN(sec) || sec < 0) return '0:00';
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s < 10 ? '0' : ''}${s}`;
}

function parseTrackTitle(raw, fallbackFilm) {
  let name = raw.trim();
  let film = fallbackFilm || 'YouTube';
  if (name.includes(' | ')) {
    const p = name.split(' | '); name = p[0].trim(); film = p[1].trim();
  } else if (name.includes('|')) {
    const p = name.split('|'); name = p[0].trim(); film = p[1].trim();
  } else if (name.includes(' - ')) {
    const p = name.split(' - '); name = p[0].trim(); film = p.slice(1).join(' - ').trim();
  }
  const initials = Array.from(name.trim())[0] || '🎵';
  return { name, film, initials };
}

async function fetchTrackMeta(videoIds) {
  return Promise.all(
    videoIds.map(async (id) => {
      try {
        const res = await fetch(
          `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${id}&format=json`
        );
        if (!res.ok) throw new Error('oembed failed');
        const data = await res.json();
        return parseTrackTitle(data.title || 'Untitled', data.author_name || 'YouTube');
      } catch {
        return { name: `Track ${id}`, film: 'YouTube', initials: '🎵' };
      }
    })
  );
}

// ─── Direct DOM mutations — zero-lag, exactly as original ────────────────────

function domSetPlaying(playing) {
  const btn = document.getElementById('playBtn');
  if (!btn) return;
  btn.innerHTML = playing
    ? `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M6 5h4v14H6zM14 5h4v14h-4z"/></svg>`
    : `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>`;
  btn.setAttribute('aria-label', playing ? 'Pause' : 'Play');
}

function domSetTrack({ name, film, initials }) {
  const thumb = document.getElementById('thumbText');
  const tname = document.getElementById('trackName');
  const tfilm = document.getElementById('trackFilm');
  if (thumb) thumb.textContent = initials || name.charAt(0) || '🎵';
  if (tname) tname.textContent = name;
  if (tfilm) tfilm.textContent = film;
}

// Sync progress bar + time — called every 500ms and on state changes
// Matches original's F() function exactly.
function domSyncProgress(player, isSeeking, syncTrackIndex) {
  if (!player || isSeeking.current) return;
  try {
    const ct  = player.getCurrentTime?.() ?? 0;
    const dur = player.getDuration?.()    ?? 0;
    const fillEl = document.getElementById('scrubFill');
    const timeEl = document.getElementById('currentTime');
    const durEl  = document.getElementById('durationTime');
    if (timeEl) timeEl.textContent = formatTime(ct);
    if (durEl)  durEl.textContent  = formatTime(dur);
    if (fillEl) fillEl.style.width = dur > 0 ? `${(ct / dur) * 100}%` : '0%';
    const idx = player.getPlaylistIndex?.();
    if (typeof idx === 'number' && idx >= 0) syncTrackIndex(idx);
  } catch {}
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useYouTubePlayer() {
  const playerRef      = useRef(null);
  const isReadyRef     = useRef(false);
  const cmdRef         = useRef(null);    // 'play' | 'pause' | null
  const tracksRef      = useRef([]);
  const currentIdxRef  = useRef(0);
  const isSeeking      = useRef(false);
  const loadGenRef     = useRef(0);

  const [isPlaying,    setIsPlaying]    = useState(false);
  const [currentTime,  setCurrentTime]  = useState(0);
  const [duration,     setDuration]     = useState(0);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [tracks,       setTracks]       = useState([]);
  const [currentTrack, setCurrentTrack] = useState({
    name: 'Mehndi Laga Ke Rakhna',
    film: 'Dilwale Dulhania Le Jayenge',
    initials: 'म',
  });
  const [category,  setCategory]    = useState('90s');
  const [volume,    setVolumeState] = useState(70);

  // Stable ref to syncTrackIndex for use in domSyncProgress
  const syncTrackIndexRef = useRef(null);

  const syncTrackIndex = useCallback((idx) => {
    if (idx < 0 || idx === currentIdxRef.current) return;
    currentIdxRef.current = idx;
    setCurrentIndex(idx);
    const t = tracksRef.current[idx];
    if (t) { setCurrentTrack(t); domSetTrack(t); }
  }, []);

  useEffect(() => { syncTrackIndexRef.current = syncTrackIndex; }, [syncTrackIndex]);

  // ── YT Player init ────────────────────────────────────────────────────────
  useEffect(() => {
    // Guard: only init once — StrictMode double-invoke protection
    if (playerRef.current) return;

    const initPlayer = () => {
      // Guard: don't double-init if already created
      if (playerRef.current) return;

      const cfg = PLAYLISTS['90s'];
      const playerVars = {
        autoplay: 0, controls: 0, disablekb: 1,
        fs: 0, iv_load_policy: 3, modestbranding: 1, rel: 0,
      };
      if (cfg?.playlistId) {
        playerVars.listType = 'playlist';
        playerVars.list     = cfg.playlistId;
      }

      playerRef.current = new window.YT.Player('yt-player', {
        height: '0', width: '0',
        playerVars,
        events: {
          onReady: () => {
            // Simply mark ready — the initial playlist loads via loadCategory()
            // below (called in a separate useEffect after mount).
            isReadyRef.current = true;
          },

          onStateChange: (e) => {
            const state = e.data;
            const YTS   = window.YT.PlayerState;

            // Sync progress on every transition
            domSyncProgress(
              playerRef.current, isSeeking,
              (idx) => syncTrackIndexRef.current?.(idx)
            );

            if (cmdRef.current === 'play') {
              if (state === YTS.PLAYING) {
                cmdRef.current = null; domSetPlaying(true); setIsPlaying(true);
              } else if (state === YTS.ENDED || state === YTS.UNSTARTED) {
                cmdRef.current = null; domSetPlaying(false); setIsPlaying(false);
              }
              return;
            }
            if (cmdRef.current === 'pause') {
              if (state !== YTS.PLAYING) {
                cmdRef.current = null; domSetPlaying(false); setIsPlaying(false);
              }
              return;
            }

            // No pending command — sync to YT reality
            if (state === YTS.PLAYING) {
              domSetPlaying(true); setIsPlaying(true);
              const idx = playerRef.current?.getPlaylistIndex?.();
              if (typeof idx === 'number') syncTrackIndexRef.current?.(idx);
            } else if (state === YTS.PAUSED || state === YTS.ENDED || state === YTS.UNSTARTED) {
              domSetPlaying(false); setIsPlaying(false);
            }
            // BUFFERING (3) — keep optimistic state, do nothing
          },
        },
      });
    };

    if (window.YT?.Player) {
      initPlayer();
    } else {
      window.onYouTubeIframeAPIReady = initPlayer;
      if (!document.querySelector('script[src="https://www.youtube.com/iframe_api"]')) {
        const s = document.createElement('script');
        s.src = 'https://www.youtube.com/iframe_api';
        const first = document.getElementsByTagName('script')[0];
        first?.parentNode ? first.parentNode.insertBefore(s, first) : document.head.appendChild(s);
      }
    }
  }, []); // eslint-disable-line

  // ── Load initial playlist after player is ready ────────────────────────────
  // Poll until isReadyRef is true (player may finish onReady after effect runs)
  useEffect(() => {
    let cancelled = false;
    const tryLoad = async () => {
      // Wait up to 10s for player to become ready
      for (let i = 0; i < 100; i++) {
        if (cancelled) return;
        if (isReadyRef.current && playerRef.current) break;
        await new Promise((r) => setTimeout(r, 100));
      }
      if (cancelled || !isReadyRef.current) return;
      loadCategoryFnRef.current?.('90s');
    };
    tryLoad();
    return () => { cancelled = true; };
  }, []); // eslint-disable-line

  // ── Progress poll — 500ms, matches original ───────────────────────────────
  useEffect(() => {
    const timer = setInterval(() => {
      const p = playerRef.current;
      if (!p || isSeeking.current) return;
      try {
        const ct  = p.getCurrentTime?.() ?? 0;
        const dur = p.getDuration?.()    ?? 0;
        setCurrentTime(ct);
        setDuration(dur);
        domSyncProgress(p, isSeeking, (idx) => syncTrackIndexRef.current?.(idx));
      } catch {}
    }, 500);
    return () => clearInterval(timer);
  }, []);

  // ─── Controls ──────────────────────────────────────────────────────────────

  const play = useCallback(() => {
    return new Promise((resolve) => {
      const p = playerRef.current;
      if (!p || !isReadyRef.current || cmdRef.current) { resolve(false); return; }

      cmdRef.current = 'play';
      domSetPlaying(true); setIsPlaying(true);

      try {
        if (p.getPlayerState?.() === 1) { cmdRef.current = null; resolve(true); return; }
        p.playVideo?.();
      } catch { cmdRef.current = null; resolve(false); return; }

      setTimeout(() => {
        try { if (p.getPlayerState?.() !== 1) p.playVideo?.(); } catch {}
        setTimeout(() => {
          try {
            const playing = p.getPlayerState?.() === 1;
            if (!playing) { cmdRef.current = null; domSetPlaying(false); setIsPlaying(false); }
            else cmdRef.current = null;
            resolve(playing);
          } catch { cmdRef.current = null; resolve(false); }
        }, 250);
      }, 200);
    });
  }, []);

  const pause = useCallback(() => {
    const p = playerRef.current;
    if (!p) return;
    cmdRef.current = 'pause';
    domSetPlaying(false); setIsPlaying(false);
    try { p.pauseVideo?.(); } catch { cmdRef.current = null; }
  }, []);

  const nextTrack = useCallback(() => {
    const p = playerRef.current;
    if (!p) return;
    const nextIdx = currentIdxRef.current + 1 < tracksRef.current.length
      ? currentIdxRef.current + 1 : 0;
    currentIdxRef.current = nextIdx; setCurrentIndex(nextIdx);
    const t = tracksRef.current[nextIdx];
    if (t) { setCurrentTrack(t); domSetTrack(t); }
    domSetPlaying(true); setIsPlaying(true);
    setCurrentTime(0); setDuration(0);
    try { p.nextVideo?.(); } catch {}
  }, []);

  const prevTrack = useCallback(() => {
    const p = playerRef.current;
    if (!p) return;
    const ct = p.getCurrentTime?.() ?? 0;
    if (ct > 3) { setCurrentTime(0); try { p.seekTo(0, true); } catch {} return; }
    const prevIdx = currentIdxRef.current - 1 >= 0
      ? currentIdxRef.current - 1
      : Math.max(0, tracksRef.current.length - 1);
    currentIdxRef.current = prevIdx; setCurrentIndex(prevIdx);
    const t = tracksRef.current[prevIdx];
    if (t) { setCurrentTrack(t); domSetTrack(t); }
    domSetPlaying(true); setIsPlaying(true);
    setCurrentTime(0); setDuration(0);
    try { p.previousVideo?.(); } catch {}
  }, []);

  const seekTo = useCallback((fraction) => {
    const p = playerRef.current;
    if (!p) return;
    isSeeking.current = false;
    const dur = p.getDuration?.() || 0;
    if (dur > 0) {
      setCurrentTime(fraction * dur);
      try { p.seekTo(fraction * dur, true); } catch {}
    }
    domSyncProgress(p, isSeeking, (idx) => syncTrackIndexRef.current?.(idx));
  }, []);

  const setVolume = useCallback((val) => {
    setVolumeState(val);
    try { playerRef.current?.setVolume(val); } catch {}
  }, []);

  const jumpToTrack = useCallback((idx) => {
    const p = playerRef.current;
    if (!p || typeof p.playVideoAt !== 'function') return;
    cmdRef.current = 'play';
    currentIdxRef.current = idx; setCurrentIndex(idx);
    const t = tracksRef.current[idx];
    if (t) { setCurrentTrack(t); domSetTrack(t); }
    domSetPlaying(true); setIsPlaying(true);
    setCurrentTime(0); setDuration(0);
    try { p.playVideoAt(idx); } catch {}
  }, []);

  // loadCategory — stored in a ref so the initial-load effect can call it
  const loadCategoryFnRef = useRef(null);

  const loadCategory = useCallback(async (key) => {
    const cfg = PLAYLISTS[key];
    if (!cfg || !playerRef.current) return;
    const gen = ++loadGenRef.current;

    try { playerRef.current.stopVideo?.(); } catch {}
    setCategory(key);
    tracksRef.current = []; setTracks([]);
    currentIdxRef.current = 0; setCurrentIndex(0);
    setCurrentTime(0); setDuration(0);
    domSetPlaying(false); setIsPlaying(false);

    const loading = { name: 'Loading…', film: '', initials: '🎵' };
    setCurrentTrack(loading); domSetTrack(loading);

    // Reset scrub + time displays
    const fillEl = document.getElementById('scrubFill');
    const timeEl = document.getElementById('currentTime');
    const durEl  = document.getElementById('durationTime');
    if (fillEl) fillEl.style.width = '0%';
    if (timeEl) timeEl.textContent = '0:00';
    if (durEl)  durEl.textContent  = '0:00';

    if (cfg.playlistId) {
      // Mix playlists (RD...) embed the seed video ID after the 'RD' prefix.
      // We must pass it explicitly so the IFrame API doesn't skip the first song.
      const isMix = cfg.playlistId.startsWith('RD');
      const seedVideoId = isMix ? cfg.playlistId.slice(2) : null;

      try {
        if (isMix && seedVideoId) {
          // Load the mix starting from the seed video — this ensures the first song plays
          playerRef.current.loadPlaylist({
            list: cfg.playlistId,
            listType: 'playlist',
            index: 0,
            startSeconds: 0,
          });
          // Also cue the seed video so it's the first to play
          playerRef.current.cueVideoById({ videoId: seedVideoId, startSeconds: 0 });
          // Brief pause then load the full mix playlist again (seed video was cued first to avoid skip)
          await new Promise((r) => setTimeout(r, 300));
          if (gen !== loadGenRef.current) return;
          playerRef.current.loadPlaylist({
            list: cfg.playlistId,
            listType: 'playlist',
            index: 0,
            startSeconds: 0,
          });
        } else {
          playerRef.current.loadPlaylist({ list: cfg.playlistId, listType: 'playlist' });
        }
      } catch {}

      // Mix playlists may take longer to fully resolve their track list
      await new Promise((r) => setTimeout(r, isMix ? 2500 : 1500));
      if (gen !== loadGenRef.current) return;

      try {
        const pl = playerRef.current?.getPlaylist?.();
        if (Array.isArray(pl) && pl.length > 0) {
          // If seed video is missing from the front, prepend it
          const videoIds = (isMix && seedVideoId && pl[0] !== seedVideoId)
            ? [seedVideoId, ...pl]
            : pl;
          const meta = await fetchTrackMeta(videoIds);
          if (gen !== loadGenRef.current) return;
          tracksRef.current = meta; setTracks(meta);
          currentIdxRef.current = 0; setCurrentIndex(0);
          if (meta[0]) { setCurrentTrack(meta[0]); domSetTrack(meta[0]); }
        } else if (isMix && seedVideoId) {
          // Playlist list not yet available — fetch just the seed video metadata
          const meta = await fetchTrackMeta([seedVideoId]);
          if (gen !== loadGenRef.current) return;
          const placeholder = meta[0] || { name: 'Mix Playing', film: 'YouTube Radio', initials: '🔥' };
          tracksRef.current = [placeholder]; setTracks([placeholder]);
          setCurrentTrack(placeholder); domSetTrack(placeholder);
        }
      } catch {}
    }
  }, []);

  // Keep the ref in sync with the latest loadCategory function
  useEffect(() => { loadCategoryFnRef.current = loadCategory; }, [loadCategory]);

  const progress = duration > 0 ? currentTime / duration : 0;

  return {
    playerRef, isReady: isReadyRef.current, isPlaying,
    currentTime: formatTime(currentTime),
    duration:    formatTime(duration),
    progress, currentIndex, tracks, currentTrack, category, volume, isSeeking,
    play, pause, nextTrack, prevTrack, seekTo, setVolume, jumpToTrack, loadCategory,
  };
}
