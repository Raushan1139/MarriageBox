import { useEffect, useRef } from 'react';

export default function WeddingLights() {
  const svgRef = useRef(null);

  useEffect(() => {
    if (!svgRef.current) return;
    let svgContent = '';
    for (let x = 20; x < 1440; x += 44) {
      const y = Math.sin(x / 90) * 6 + 10;
      const delay = (x % 9) / 4;
      svgContent += `<circle class="bulb" cx="${x}" cy="${y}" r="4" style="animation-delay:${delay}s"/>`;
    }
    svgRef.current.innerHTML = `<svg width="1440" height="34" viewBox="0 0 1440 34" xmlns="http://www.w3.org/2000/svg" style="position:absolute; left:0; top:0;">${svgContent}</svg>`;
  }, []);

  return <div className="lights" id="lights" ref={svgRef} />;
}
