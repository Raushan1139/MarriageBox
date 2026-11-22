import { useEffect, useRef, useState } from 'react';
import { PLAYLISTS } from '../data/playlists';

export default function CategoryTabs({ category, onSelect }) {
  const categories = Object.entries(PLAYLISTS);

  return (
    <div className="category-tabs" id="categoryTabs" role="tablist" aria-label="Music categories">
      {categories.map(([key, cfg]) => (
        <button
          key={key}
          id={`tab-${key}`}
          role="tab"
          aria-selected={category === key}
          className={`cat-tab${category === key ? ' active' : ''}`}
          onClick={() => onSelect(key)}
        >
          {getCatIcon(key)}
          <span>{cfg.label}</span>
        </button>
      ))}
    </div>
  );
}

function getCatIcon(key) {
  const icons = {
    '90s': '🎸',
    sangeet: '🎉',
    dj: '🎧',
    vidaai: '🌸',
    mix: '🔥',
    mix2: '✨',
  };
  return <span className="cat-tab-icon">{icons[key] || '🎵'}</span>;
}
