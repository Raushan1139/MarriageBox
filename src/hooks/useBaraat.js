import { useState, useEffect, useCallback, useRef } from 'react';

export function useBaraat(playerRef, isPlaying, play) {
  const [active, setActive] = useState(false);
  const [energy, setEnergy] = useState(0);
  const [energyVisible, setEnergyVisible] = useState(false);
  const [bannerVisible, setBannerVisible] = useState(false);
  const petalIntervalRef = useRef(null);
  const confettiIntervalRef = useRef(null);
  const bannerTimerRef = useRef(null);
  const rafRef = useRef(null);
  const energyValRef = useRef(0);

  const spawnPetal = () => {
    const layer = document.getElementById('petalLayer');
    if (!layer || layer.children.length >= 20) return;
    const el = document.createElement('div');
    el.className = 'baraat-petal';
    const colors = ['#E8871E', '#FFD23F', '#FF6B6B', '#AD1F5C', '#F7ECD9', '#FF9ECD'];
    el.style.background = colors[Math.floor(Math.random() * colors.length)];
    el.style.left = Math.random() * 100 + '%';
    el.style.setProperty('--fall-duration', 2 + Math.random() * 2 + 's');
    el.style.setProperty('--drift', Math.random() * 80 - 40 + 'px');
    el.style.setProperty('--spin', Math.random() * 720 - 360 + 'deg');
    el.addEventListener('animationend', () => el.remove());
    layer.appendChild(el);
  };

  const spawnConfetti = () => {
    const layer = document.getElementById('confettiLayer');
    if (!layer || layer.children.length >= 25) return;
    const el = document.createElement('div');
    el.className = 'baraat-confetti';
    const colors = ['#FF6B9D', '#FFD23F', '#E8871E', '#AD1F5C', '#FF9ECD', '#fff', '#00D4FF'];
    el.style.background = colors[Math.floor(Math.random() * colors.length)];
    el.style.left = Math.random() * 100 + '%';
    el.style.setProperty('--fall-duration', 2.5 + Math.random() * 2.5 + 's');
    el.style.setProperty('--drift', Math.random() * 70 - 35 + 'px');
    el.style.setProperty('--spin', Math.random() * 900 - 450 + 'deg');
    el.addEventListener('animationend', () => el.remove());
    layer.appendChild(el);
  };

  const startParticles = () => {
    if (!petalIntervalRef.current) petalIntervalRef.current = setInterval(spawnPetal, 200);
    if (!confettiIntervalRef.current) confettiIntervalRef.current = setInterval(spawnConfetti, 280);
  };

  const stopParticles = () => {
    clearInterval(petalIntervalRef.current); petalIntervalRef.current = null;
    clearInterval(confettiIntervalRef.current); confettiIntervalRef.current = null;
  };

  const animateEnergy = (from, to, durationMs) => {
    cancelAnimationFrame(rafRef.current);
    const start = performance.now();
    const tick = (now) => {
      const elapsed = now - start;
      const t = Math.min(elapsed / durationMs, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      const val = Math.round(from + (to - from) * eased);
      energyValRef.current = val;
      setEnergy(val);
      if (t < 1) rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
  };

  const startBaraat = useCallback(async () => {
    setActive(true);
    document.body.classList.add('baraat-active');
    setEnergyVisible(true);

    // Try to play music
    if (!isPlaying && playerRef.current && typeof playerRef.current.playVideo === 'function') {
      await play();
    }

    animateEnergy(energyValRef.current, 100, 2500);

    // Show banner
    setBannerVisible(true);
    clearTimeout(bannerTimerRef.current);
    bannerTimerRef.current = setTimeout(() => setBannerVisible(false), 3000);

    startParticles();
  }, [isPlaying, playerRef, play]);

  const stopBaraat = useCallback(() => {
    setActive(false);
    document.body.classList.remove('baraat-active');
    stopParticles();
    animateEnergy(energyValRef.current, 0, 1200);
    clearTimeout(bannerTimerRef.current);
    setBannerVisible(false);
    setTimeout(() => {
      if (!active) setEnergyVisible(false);
    }, 1500);
  }, [active]);

  const toggle = useCallback(() => {
    if (active) stopBaraat();
    else startBaraat();
  }, [active, startBaraat, stopBaraat]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopParticles();
      cancelAnimationFrame(rafRef.current);
      clearTimeout(bannerTimerRef.current);
      document.body.classList.remove('baraat-active');
    };
  }, []);

  return { active, energy, energyVisible, bannerVisible, toggle };
}
