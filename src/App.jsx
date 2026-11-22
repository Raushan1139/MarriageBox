import { useState, useEffect, useRef } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import MusicPlayer from './components/MusicPlayer';
import StageScene from './components/StageScene';
import BaraatStrip from './components/BaraatStrip';
import CategoryTabs from './components/CategoryTabs';
import EnergyMeter from './components/EnergyMeter';
import WeddingLights from './components/WeddingLights';
import SongQueue from './components/SongQueue';
import PersonalizeModal from './components/PersonalizeModal';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import PrivacyPage from './pages/PrivacyPage';
import TermsPage from './pages/TermsPage';
import NotFoundPage from './pages/NotFoundPage';
import { useYouTubePlayer } from './hooks/useYouTubePlayer';
import { useQuietMode } from './hooks/useQuietMode';
import { useBaraat } from './hooks/useBaraat';
import { usePersonalize } from './hooks/usePersonalize';
import { PLAYLISTS } from './data/playlists';
import FAQ from './components/FAQ';

// Stars generator
function generateStars(n) {
  return Array.from({ length: n }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    top: Math.random() * 100,
    delay: Math.random() * 3,
    duration: 2 + Math.random() * 2,
    size: Math.random() > 0.8 ? 3 : 2,
  }));
}

const STARS = generateStars(55);

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
}

function HomePage({ player, quiet, baraatState, personalize }) {
  const { bride, groom, shimmer, setNames, openModal, isModalOpen, closeModal } = personalize;
  const { active: baraatActive, energy, energyVisible, bannerVisible, toggle: toggleBaraat } = baraatState;
  const [queueOpen, setQueueOpen] = useState(false);
  const category = player.category;
  const theme = PLAYLISTS[category]?.theme || '90s';

  // Apply theme to body
  useEffect(() => {
    document.body.dataset.theme = theme;
    document.documentElement.style.setProperty('--scene-gradient', getSceneGradient(theme));
  }, [theme]);

  return (
    <div className={`scene theme-${theme}`}>
      {/* Theme overlays */}
      <div className={`theme-overlay theme-overlay-90s${theme === '90s' ? ' active' : ''}`} aria-hidden="true" />
      <div className={`theme-overlay theme-overlay-sangeet${theme === 'sangeet' ? ' active' : ''}`} aria-hidden="true" />
      <div className={`theme-overlay theme-overlay-dj${theme === 'dj' ? ' active' : ''}`} aria-hidden="true" />
      <div className={`theme-overlay theme-overlay-vidaai${theme === 'vidaai' ? ' active' : ''}`} aria-hidden="true" />
      <div className={`theme-overlay theme-overlay-mix${theme === 'mix' ? ' active' : ''}`} aria-hidden="true" />
      <div className={`theme-overlay theme-overlay-mix2${theme === 'mix2' ? ' active' : ''}`} aria-hidden="true" />

      {/* Scanlines (90s) */}
      <div className={`scanlines${theme === '90s' ? ' active' : ''}`} aria-hidden="true" />

      {/* Stars */}
      <div className="stars" aria-hidden="true">
        {STARS.map((s) => (
          <div
            key={s.id}
            className="star"
            style={{
              left: `${s.left}%`,
              top: `${s.top}%`,
              animationDelay: `${s.delay}s`,
              animationDuration: `${s.duration}s`,
              width: s.size,
              height: s.size,
            }}
          />
        ))}
      </div>

      {/* Rangoli */}
      <div className="rangoli" aria-hidden="true" />

      {/* Particle layers */}
      <div className="petal-layer" id="petalLayer" aria-hidden="true" />
      <div className="confetti-layer" id="confettiLayer" aria-hidden="true" />
      <div className="vidaai-petals" id="vidaaiPetals" aria-hidden="true" />

      {/* String lights */}
      <WeddingLights />

      {/* Baraat banner */}
      {bannerVisible && (
        <div className="baraat-banner" id="baraatBanner" aria-live="polite">
          🥁 BARAAT MODE — शादी की धुन 🎊
        </div>
      )}

      {/* Energy meter */}
      {energyVisible && <EnergyMeter energy={energy} />}

      {/* Stage scene (quiet mode: hidden) */}
      {!quiet && <StageScene />}

      {/* Hero */}
      <Hero
        bride={bride}
        groom={groom}
        shimmer={shimmer}
        onPersonalizeClick={openModal}
        onEditClick={openModal}
        onBaraatToggle={toggleBaraat}
        baraatActive={baraatActive}
      />

      {/* Baraat strip */}
      {baraatActive && !quiet && <BaraatStrip />}

      {/* Category tabs */}
      <CategoryTabs
        category={category}
        onSelect={player.loadCategory}
      />

      {/* Disclaimer */}
      <p className="disclaimer">
        Music plays through YouTube. All rights belong to original labels &amp; artists. This site doesn't host or download any audio.
      </p>

      {/* FAQ Section */}
      <FAQ />

      {/* Song queue panel */}
      <SongQueue
        open={queueOpen}
        tracks={player.tracks}
        currentIndex={player.currentIndex}
        category={category}
        onJump={player.jumpToTrack}
        onClose={() => setQueueOpen(false)}
      />

      {/* Personalize modal */}
      {isModalOpen && (
        <PersonalizeModal
          bride={bride}
          groom={groom}
          onSave={setNames}
          onClose={closeModal}
        />
      )}

      {/* Fixed music player */}
      <MusicPlayer
        currentTrack={player.currentTrack}
        isPlaying={player.isPlaying}
        currentTime={player.currentTime}
        duration={player.duration}
        progress={player.progress}
        volume={player.volume}
        onPlay={player.play}
        onPause={player.pause}
        onNext={player.nextTrack}
        onPrev={player.prevTrack}
        onSeek={player.seekTo}
        onVolumeChange={player.setVolume}
        onQueueToggle={() => setQueueOpen((o) => !o)}
        isSeeking={player.isSeeking}
        playerRef={player.playerRef}
      />
    </div>
  );
}

function getSceneGradient(theme) {
  const gradients = {
    '90s': 'linear-gradient(180deg, #140a24 0%, #2e0f3d 20%, #6b1140 44%, #8c1f3b 64%, #a3491c 84%, #c2701e 100%)',
    sangeet: 'linear-gradient(180deg, #1a0828 0%, #3d0a2e 25%, #7a1a4a 50%, #a0254e 70%, #c03a2a 90%, #d4821e 100%)',
    dj: 'linear-gradient(180deg, #060616 0%, #0d0d2e 20%, #1a0a3a 40%, #120830 60%, #0a0620 80%, #060412 100%)',
    vidaai: 'linear-gradient(180deg, #150c24 0%, #2a1040 25%, #4a1a4e 50%, #7a2458 75%, #3a1428 100%)',
    mix: 'linear-gradient(180deg, #0a1628 0%, #0f2a1a 20%, #1a3a0a 40%, #2a4a10 60%, #1e3a20 80%, #0a2010 100%)',
    mix2: 'linear-gradient(180deg, #1a0a06 0%, #2e1a06 20%, #4a2a0a 40%, #6a3a10 60%, #8a5a1a 80%, #c4821e 100%)',
  };
  return gradients[theme] || gradients['90s'];
}

function PageWrapper({ quiet, children }) {
  return (
    <div className="scene scene-page">
      <div className="stars" aria-hidden="true">
        {STARS.slice(0, 30).map((s) => (
          <div
            key={s.id}
            className="star"
            style={{
              left: `${s.left}%`,
              top: `${s.top}%`,
              animationDelay: `${s.delay}s`,
              animationDuration: `${s.duration}s`,
              width: s.size,
              height: s.size,
            }}
          />
        ))}
      </div>
      <div className="rangoli" aria-hidden="true" />
      {children}
    </div>
  );
}

function AppInner() {
  const player = useYouTubePlayer();
  const { quiet, toggle: toggleQuiet } = useQuietMode();
  const baraatState = useBaraat(player.playerRef, player.isPlaying, player.play);
  const personalize = usePersonalize();

  return (
    <>
      <ScrollToTop />
      <Navbar quiet={quiet} onQuietToggle={toggleQuiet} />

      <Routes>
        <Route
          path="/"
          element={
            <HomePage
              player={player}
              quiet={quiet}
              baraatState={baraatState}
              personalize={personalize}
            />
          }
        />
        <Route path="/about" element={<PageWrapper quiet={quiet}><AboutPage /></PageWrapper>} />
        <Route path="/contact" element={<PageWrapper quiet={quiet}><ContactPage /></PageWrapper>} />
        <Route path="/privacy" element={<PageWrapper quiet={quiet}><PrivacyPage /></PageWrapper>} />
        <Route path="/terms" element={<PageWrapper quiet={quiet}><TermsPage /></PageWrapper>} />
        <Route path="*" element={<PageWrapper quiet={quiet}><NotFoundPage /></PageWrapper>} />
      </Routes>
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppInner />
    </BrowserRouter>
  );
}
