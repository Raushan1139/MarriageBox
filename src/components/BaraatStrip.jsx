export default function BaraatStrip() {
  const DancerSVG = ({ color1 = '#E8871E', color2 = '#8C1F3B', delay = '0s', mirror = false }) => (
    <svg width="40" height="60" viewBox="0 0 40 60" style={mirror ? { transform: 'scaleX(-1)' } : {}}>
      <circle cx="20" cy="9" r="6" fill="#F7ECD9"/>
      <path d="M20 15 L20 44" stroke={color1} strokeWidth="5" strokeLinecap="round"/>
      <line className="arm-l" x1="20" y1="20" x2="8" y2="30" stroke={color1} strokeWidth="4" strokeLinecap="round" style={{ animationDelay: delay }}/>
      <line className="arm-r" x1="20" y1="20" x2="32" y2="12" stroke={color1} strokeWidth="4" strokeLinecap="round" style={{ animationDelay: delay }}/>
      <line className="leg-l" x1="20" y1="44" x2="12" y2="58" stroke={color2} strokeWidth="4" strokeLinecap="round" style={{ animationDelay: delay }}/>
      <line className="leg-r" x1="20" y1="44" x2="28" y2="58" stroke={color2} strokeWidth="4" strokeLinecap="round" style={{ animationDelay: delay }}/>
    </svg>
  );

  const DholPlayerSVG = ({ delay = '0s' }) => (
    <svg width="44" height="60" viewBox="0 0 44 60">
      <circle cx="22" cy="9" r="6" fill="#F7ECD9"/>
      <rect x="12" y="22" width="20" height="14" rx="3" fill="#D4A017"/>
      <path d="M22 15 L22 24" stroke="#AD1F5C" strokeWidth="5" strokeLinecap="round"/>
      <line className="arm-l" x1="22" y1="20" x2="10" y2="24" stroke="#AD1F5C" strokeWidth="4" strokeLinecap="round" style={{ animationDelay: '0s' }}/>
      <line className="arm-r" x1="22" y1="20" x2="34" y2="24" stroke="#AD1F5C" strokeWidth="4" strokeLinecap="round" style={{ animationDelay: '0.15s' }}/>
      <line x1="22" y1="36" x2="15" y2="58" stroke="#8C1F3B" strokeWidth="4" strokeLinecap="round"/>
      <line x1="22" y1="36" x2="29" y2="58" stroke="#8C1F3B" strokeWidth="4" strokeLinecap="round"/>
    </svg>
  );

  return (
    <div className="baraat-strip">
      <div className="dancer" style={{ animationDelay: '0.1s' }}>
        <DancerSVG color1="#E8871E" color2="#8C1F3B" delay="0.1s" />
      </div>
      <div className="dancer dhol-player" style={{ animationDelay: '0.25s' }}>
        <DholPlayerSVG delay="0.25s" />
      </div>
      <div className="dancer" style={{ animationDelay: '0s' }}>
        <DancerSVG color1="#AD1F5C" color2="#E8871E" delay="0s" mirror />
      </div>
      <div className="dancer" style={{ animationDelay: '0.4s' }}>
        <DancerSVG color1="#D4A017" color2="#8C1F3B" delay="0.3s" />
      </div>
      <div className="dancer" style={{ animationDelay: '0.55s' }}>
        <DancerSVG color1="#E8871E" color2="#AD1F5C" delay="0.2s" mirror />
      </div>
    </div>
  );
}
