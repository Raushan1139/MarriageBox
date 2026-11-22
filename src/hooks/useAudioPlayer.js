import { useEffect, useRef, useState, useCallback } from 'react';
import { PLAYLISTS } from '../data/playlists';

// ─────────────────────────────────────────────────────────────────────────────
//  Helpers
// ─────────────────────────────────────────────────────────────────────────────

function formatTime(sec) {
  if (!sec || isNaN(sec) || sec < 0) return '0:00';
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s < 10 ? '0' : ''}${s}`;
}

function parseTitle(title, channel) {
  let name = (title || '').trim();
  let film = channel || 'YouTube';
  if (name.includes(' | ')) {
    const p = name.split(' | ');
    name = p[0].trim(); film = p[1].trim();
  } else if (name.includes('|')) {
    const p = name.split('|');
    name = p[0].trim(); film = p[1].trim();
  } else if (name.includes(' - ')) {
    const p = name.split(' - ');
    name = p[0].trim(); film = p.slice(1).join(' - ').trim();
  }
  const initials = Array.from(name)[0] || '🎵';
  return { name, film, initials };
}

// ─────────────────────────────────────────────────────────────────────────────
//  Piped API  —  fetches audio-only stream URLs for YouTube videos.
//  Tries multiple public instances in order until one responds.
//  Audio quality is the same regardless of video resolution — we just
//  skip the video track entirely, so there is nothing to buffer.
// ─────────────────────────────────────────────────────────────────────────────

const PIPED_INSTANCES = [
  'https://pipedapi.kavin.rocks',
  'https://api.piped.yt',
  'https://watchapi.whatever.social',
  'https://pipedapi.in',
];

async function pipedFetch(path) {
  const errors = [];
  for (const base of PIPED_INSTANCES) {
    try {
      const ctrl = new AbortController();
      const tid  = setTimeout(() => ctrl.abort(), 9000);
      const res  = await fetch(`${base}${path}`, { signal: ctrl.signal });
      clearTimeout(tid);
      if (res.ok) return await res.json();
      errors.push(`${base}: HTTP ${res.status}`);
    } catch (e) {
      errors.push(`${base}: ${e.message}`);
    }
  }
  throw new Error(`Piped unavailable — ${errors.join(' | ')}`);
}

/** Fetch all tracks in a YouTube playlist via Piped. */
async function fetchPlaylistTracks(playlistId) {
  const data = await pipedFetch(`/playlists/${playlistId}`);
  return (data.relatedStreams || [])
    .filter(v => v.url)
    .map(v => {
      const videoId = v.url.replace('/watch?v=', '').split('&')[0];
      const parsed  = parseTitle(v.title, v.uploaderName);
      return { videoId, ...parsed };
    });
}

// Cache audio URLs — Piped-proxied URLs last several hours.
const audioUrlCache = new Map(); // videoId → { url, fetchedAt }

/** Get the lowest-bitrate audio stream URL for a YouTube video. */
async function getAudioStreamUrl(videoId) {
  const cached = audioUrlCache.get(videoId);
  if (cached && Date.now() - cached.fetchedAt < 2 * 3600 * 1000) return cached.url;

  const data    = await pipedFetch(`/streams/${videoId}`);
  const streams = (data.audioStreams || []).filter(s => s.url);
  if (!streams.length) throw new Error('No audio streams');

  // Sort ascending by bitrate — lowest = fastest to buffer, same perceived quality
  streams.sort((a, b) => (a.bitrate || 0) - (b.bitrate || 0));
  const url = streams[0].url;

  audioUrlCache.set(videoId, { url, fetchedAt: Date.now() });
  return url;
}

// ─────────────────────────────────────────────────────────────────────────────
//  DOM helpers — zero-lag, no React re-render required
// ─────────────────────────────────────────────────────────────────────────────

function domSetPlaying(playing) {
  const btn = document.getElementById('playBtn');
  if (!btn) return;
  btn.innerHTML = playing
    ? `<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M6 5h4v14H6zM14 5h4v14h-4z"/></svg>`
    : `<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M8 5v14l11-7z"/></svg>`;
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

function domSetProgress(currentTime, duration) {
  // Current-time display
  const timeEl = document.getElementById('currentTime');
  if (timeEl) timeEl.textContent = formatTime(currentTime);
  // Scrub fill — direct style mutation (same as SliderTrack does during drag)
  const fill = document.querySelector('.scrub-fill');
  if (fill && duration > 0) {
    fill.style.width = `${(currentTime / duration) * 100}%`;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
//  Hook
// ─────────────────────────────────────────────────────────────────────────────

export function useAudioPlayer() {
  const audioRef       = useRef(null);   // HTML5 Audio element
  const tracksRef      = useRef([]);
  const currentIdxRef  = useRef(0);
  const isSeeking      = useRef(false);
  const loadGenRef     = useRef(0);
  const nextFnRef      = useRef(null);   // stable ref for 'ended' event

  const [isPlaying,    setIsPlaying]    = useState(false);
  const [currentTime,  setCurrentTime]  = useState(0);
  const [duration,     setDuration]     = useState(0);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [tracks,       setTracks]       = useState([]);
  const [currentTrack, setCurrentTrack] = useState({
    name: 'Mehndi Laga Ke Rakhna',
    film: 'Dilwale Dulhania Le Jayenge',
    initials: 'म',
    videoId: '',
  });
  const [category,  setCategory]  = useState('90s');
  const [volume,    setVolumeState] = useState(70);

  // ── Create the Audio element once ─────────────────────────────────────────
  useEffect(() => {
    const audio  = new Audio();
    audio.preload = 'auto';
    audio.volume  = 0.7;
    audioRef.current = audio;

    // timeupdate fires 4-15×/sec — update DOM directly, React state throttled by browser
    const onTimeUpdate = () => {
      if (isSeeking.current) return;
      const ct  = audio.currentTime;
      const dur = isNaN(audio.duration) ? 0 : audio.duration;
      setCurrentTime(ct);
      setDuration(dur);
      domSetProgress(ct, dur);
    };

    const onDurationChange = () => {
      const dur = isNaN(audio.duration) ? 0 : audio.duration;
      setDuration(dur);
    };

    const onEnded  = () => nextFnRef.current?.();
    const onPlay   = () => { setIsPlaying(true);  domSetPlaying(true);  };
    const onPause  = () => { setIsPlaying(false); domSetPlaying(false); };
    const onError  = (e) => console.warn('[Audio] error', e.target?.error);

    audio.addEventListener('timeupdate',     onTimeUpdate);
    audio.addEventListener('durationchange', onDurationChange);
    audio.addEventListener('ended',          onEnded);
    audio.addEventListener('play',           onPlay);
    audio.addEventListener('pause',          onPause);
    audio.addEventListener('error',          onError);

    return () => {
      audio.removeEventListener('timeupdate',     onTimeUpdate);
      audio.removeEventListener('durationchange', onDurationChange);
      audio.removeEventListener('ended',          onEnded);
      audio.removeEventListener('play',           onPlay);
      audio.removeEventListener('pause',          onPause);
      audio.removeEventListener('error',          onError);
      audio.pause();
      audio.src = '';
    };
  }, []);

  // ── loadTrack — fetch audio URL and set src ────────────────────────────────
  const loadTrack = useCallback(async (idx, autoplay = false) => {
    const all = tracksRef.current;
    if (!all[idx]) return;

    const track = all[idx];
    currentIdxRef.current = idx;
    setCurrentIndex(idx);
    setCurrentTrack(track);
    domSetTrack(track);
    setCurrentTime(0);
    setDuration(0);
    domSetProgress(0, 1);

    // Optimistically show play icon immediately
    if (autoplay) { domSetPlaying(true); setIsPlaying(true); }

    try {
      const url   = await getAudioStreamUrl(track.videoId);
      const audio = audioRef.current;
      if (!audio) return;

      audio.src = url;
      audio.load();
      if (autoplay) {
        try { await audio.play(); } catch (err) {
          // Autoplay blocked — user needs to click
          console.warn('[Audio] autoplay blocked:', err.message);
          domSetPlaying(false); setIsPlaying(false);
        }
      }
    } catch (err) {
      console.error('[useAudioPlayer] loadTrack error:', err);
      if (autoplay) { domSetPlaying(false); setIsPlaying(false); }
    }
  }, []);

  // ── Background URL prefetch for the next track ────────────────────────────
  const preloadNext = useCallback((idx) => {
    const next = tracksRef.current[idx + 1];
    if (next?.videoId && !audioUrlCache.has(next.videoId)) {
      getAudioStreamUrl(next.videoId).catch(() => {});
    }
  }, []);

  // ── Public controls ───────────────────────────────────────────────────────

  const play = useCallback(async () => {
    const audio = audioRef.current;
    if (!audio) return;
    domSetPlaying(true);
    setIsPlaying(true);
    try {
      await audio.play();
      preloadNext(currentIdxRef.current);
    } catch {
      domSetPlaying(false);
      setIsPlaying(false);
    }
  }, [preloadNext]);

  const pause = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    domSetPlaying(false);
    setIsPlaying(false);
    audio.pause();
  }, []);

  const nextTrack = useCallback(() => {
    const all     = tracksRef.current;
    const nextIdx = currentIdxRef.current + 1 < all.length
      ? currentIdxRef.current + 1
      : 0;
    loadTrack(nextIdx, true);
    preloadNext(nextIdx);
  }, [loadTrack, preloadNext]);

  // Keep stable ref so the 'ended' event always calls the latest nextTrack
  useEffect(() => { nextFnRef.current = nextTrack; }, [nextTrack]);

  const prevTrack = useCallback(() => {
    const audio = audioRef.current;
    if (audio && audio.currentTime > 3) {
      audio.currentTime = 0;
      return;
    }
    const prevIdx = currentIdxRef.current - 1 >= 0
      ? currentIdxRef.current - 1
      : Math.max(0, tracksRef.current.length - 1);
    loadTrack(prevIdx, true);
  }, [loadTrack]);

  const seekTo = useCallback((fraction) => {
    const audio = audioRef.current;
    if (!audio) return;
    const dur = isNaN(audio.duration) ? 0 : audio.duration;
    if (dur > 0) {
      const t = fraction * dur;
      audio.currentTime = t;        // instant — no network round-trip
      setCurrentTime(t);
      domSetProgress(t, dur);
    }
    isSeeking.current = false;
  }, []);

  const setVolume = useCallback((val) => {
    setVolumeState(val);
    if (audioRef.current) audioRef.current.volume = val / 100;
  }, []);

  const jumpToTrack = useCallback((idx) => {
    loadTrack(idx, true);
    preloadNext(idx);
  }, [loadTrack, preloadNext]);

  const loadCategory = useCallback(async (key) => {
    const cfg = PLAYLISTS[key];
    if (!cfg) return;
    const gen = ++loadGenRef.current;

    setCategory(key);
    tracksRef.current = [];
    setTracks([]);
    currentIdxRef.current = 0;
    setCurrentIndex(0);
    setCurrentTime(0);
    setDuration(0);
    domSetPlaying(false);
    setIsPlaying(false);

    const audio = audioRef.current;
    if (audio) { audio.pause(); audio.src = ''; }

    const loading = { videoId: '', name: 'Loading…', film: '', initials: '⏳' };
    setCurrentTrack(loading);
    domSetTrack(loading);

    try {
      const fetched = await fetchPlaylistTracks(cfg.playlistId);
      if (gen !== loadGenRef.current) return;    // stale — another category was chosen

      tracksRef.current = fetched;
      setTracks(fetched);

      if (fetched[0]) {
        await loadTrack(0, false);  // load first track, don't autoplay
        preloadNext(0);             // silently prefetch second track URL
      }
    } catch (err) {
      console.error('[useAudioPlayer] loadCategory failed:', err);
      const errTrack = { videoId: '', name: 'Could not load playlist', film: 'Check console', initials: '⚠️' };
      setCurrentTrack(errTrack);
      domSetTrack(errTrack);
    }
  }, [loadTrack, preloadNext]);

  // ── Initial load ──────────────────────────────────────────────────────────
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { loadCategory('90s'); }, []);

  const progress = duration > 0 ? currentTime / duration : 0;

  return {
    playerRef: audioRef,   // kept for interface compatibility
    isReady:   true,
    isPlaying,
    currentTime: formatTime(currentTime),
    duration:    formatTime(duration),
    progress,
    currentIndex,
    tracks,
    currentTrack,
    category,
    volume,
    isSeeking,
    play, pause, nextTrack, prevTrack, seekTo, setVolume, jumpToTrack, loadCategory,
  };
}
