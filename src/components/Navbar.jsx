import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

export default function Navbar({ quiet, onQuietToggle }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const { pathname } = useLocation();

  const closeMenu = () => setMenuOpen(false);

  const isActive = (path) =>
    path === '/' ? pathname === '/' : pathname.startsWith(path);

  return (
    <>
      <header>
        <Link to="/" className="brandmark" onClick={closeMenu}>
          <div className="glyph">श</div>
          <span>MarriageBox</span>
        </Link>

        <div className="listener-badge" id="listenerBadge">
          <span className="listener-dot" />
          <span className="listener-count" id="listenerCount">1</span>
          <span className="listener-label">listening now</span>
        </div>

        <nav className="nav-links">
          <Link to="/about" className={isActive('/about') ? 'active' : ''}>About</Link>
          <Link to="/privacy" className={isActive('/privacy') ? 'active' : ''}>Privacy</Link>
          <Link to="/terms" className={isActive('/terms') ? 'active' : ''}>Terms</Link>
          <Link to="/contact" className={isActive('/contact') ? 'active' : ''}>Contact</Link>
          <button
            className="navbtn"
            id="quietCornerToggle"
            onClick={onQuietToggle}
            aria-label="Quiet corner mode"
            title={quiet ? 'Disable quiet mode' : 'Enable quiet mode'}
          >
            {quiet ? '🌞' : '🌚'}
          </button>
        </nav>

        <button
          className={`hamburger${menuOpen ? ' open' : ''}`}
          id="hamburgerBtn"
          aria-label="Open menu"
          onClick={() => setMenuOpen((o) => !o)}
        >
          <span />
          <span />
          <span />
        </button>
      </header>

      <div className={`nav-overlay${menuOpen ? ' open' : ''}`} id="navOverlay">
        <button className="overlay-close" id="navClose" aria-label="Close menu" onClick={closeMenu}>
          &times;
        </button>
        <Link to="/" onClick={closeMenu} className={isActive('/') ? 'active' : ''}>Home</Link>
        <Link to="/about" onClick={closeMenu} className={isActive('/about') ? 'active' : ''}>About</Link>
        <Link to="/privacy" onClick={closeMenu} className={isActive('/privacy') ? 'active' : ''}>Privacy</Link>
        <Link to="/terms" onClick={closeMenu} className={isActive('/terms') ? 'active' : ''}>Terms</Link>
        <Link to="/contact" onClick={closeMenu} className={isActive('/contact') ? 'active' : ''}>Contact</Link>
        <button
          className="overlay-toggle"
          id="quietCornerToggleOverlay"
          onClick={() => { onQuietToggle(); closeMenu(); }}
          aria-label="Quiet corner mode"
        >
          {quiet ? '🌞' : '🌚'}
        </button>
      </div>
    </>
  );
}
