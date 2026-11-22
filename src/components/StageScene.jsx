export default function StageScene() {
  return (
    <div className="stage-wrap">
      {/* Mandap SVG */}
      <svg className="mandap" viewBox="0 0 1440 260" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
        {/* Pillars */}
        <path d="M0,260 L0,180 Q30,175 40,150 L40,60 Q40,40 60,40 L110,40 Q130,40 130,60 L130,150 Q140,175 170,180 L170,260 Z" fill="#2A0F12" opacity="0.9"/>
        <path d="M1440,260 L1440,180 Q1410,175 1400,150 L1400,60 Q1400,40 1380,40 L1330,40 Q1310,40 1310,60 L1310,150 Q1300,175 1270,180 L1270,260 Z" fill="#2A0F12" opacity="0.9"/>
        {/* Arch */}
        <path d="M120,260 L120,120 Q120,20 300,20 L1140,20 Q1320,20 1320,120 L1320,260 Z" fill="none" stroke="#3A1418" strokeWidth="18"/>
        <path d="M120,260 L120,120 Q120,20 300,20 L1140,20 Q1320,20 1320,120 L1320,260" fill="none" stroke="#5C1220" strokeWidth="6" opacity="0.6"/>
        {/* Top marigold bulbs */}
        <g opacity="0.85">
          {[300,330,360,390,420,450,480,510,540,570,600,630,660,690,720,750,780,810,840,870,900,930,960,990,1020,1050,1080,1110,1140].map((cx, i) => (
            <circle key={cx} cx={cx} cy={i % 2 === 0 ? 45 : 55} r="7" fill={i % 2 === 0 ? "#E8871E" : "#D4A017"}/>
          ))}
        </g>
        {/* Inner garland */}
        <g opacity="0.7">
          <path d="M120,120 Q400,170 720,175 Q1040,170 1320,120" fill="none" stroke="#7A2416" strokeWidth="3" opacity="0.5"/>
          {[200,260,340,420,500,580,660,740,820,900,980,1060,1140,1240].map((cx, i) => (
            <circle key={cx} cx={cx} cy={130 + Math.sin(i) * 20 + 10} r="6" fill={i % 2 === 0 ? "#AD1F5C" : "#E8871E"}/>
          ))}
        </g>
        {/* Floor shadows */}
        <g opacity="0.5" fill="#0F0812">
          <ellipse cx="60" cy="255" rx="70" ry="14"/>
          <ellipse cx="720" cy="258" rx="220" ry="16"/>
          <ellipse cx="1380" cy="255" rx="70" ry="14"/>
        </g>
        {/* Diyas */}
        <g>
          <circle className="diya" cx="60" cy="238" r="5" fill="#FFC93C" style={{animationDelay:'0s'}}/>
          <circle className="diya" cx="1380" cy="238" r="5" fill="#FFC93C" style={{animationDelay:'0.6s'}}/>
          <circle className="diya" cx="560" cy="242" r="5" fill="#FFC93C" style={{animationDelay:'1.1s'}}/>
          <circle className="diya" cx="880" cy="242" r="5" fill="#FFC93C" style={{animationDelay:'0.3s'}}/>
        </g>
      </svg>

      {/* Stage characters */}
      <div className="stage-chars">
        {/* Baraati — left */}
        <div className="stage-char char-baraati" style={{left:'8%', bottom:'38%'}}>
          <svg width="28" height="42" viewBox="0 0 40 60">
            <circle cx="20" cy="9" r="6" fill="#F7ECD9"/>
            <path d="M20 15 L20 42" stroke="#E8871E" strokeWidth="5" strokeLinecap="round"/>
            <line className="char-arm-l" x1="20" y1="20" x2="6" y2="16" stroke="#E8871E" strokeWidth="3.5" strokeLinecap="round"/>
            <line className="char-arm-r" x1="20" y1="20" x2="34" y2="14" stroke="#E8871E" strokeWidth="3.5" strokeLinecap="round"/>
            <line className="char-leg-l" x1="20" y1="42" x2="10" y2="58" stroke="#8C1F3B" strokeWidth="3.5" strokeLinecap="round"/>
            <line className="char-leg-r" x1="20" y1="42" x2="30" y2="58" stroke="#8C1F3B" strokeWidth="3.5" strokeLinecap="round"/>
            <rect x="14" y="2" width="12" height="4" rx="2" fill="#D4A017" opacity=".8"/>
          </svg>
        </div>

        {/* Sangeet dancer — right */}
        <div className="stage-char char-dancer" style={{right:'8%', bottom:'36%'}}>
          <svg width="28" height="44" viewBox="0 0 40 60">
            <circle cx="20" cy="9" r="6" fill="#F7ECD9"/>
            <path d="M12 42 L20 28 L28 42 Z" fill="#AD1F5C" opacity=".9"/>
            <path d="M20 15 L20 28" stroke="#AD1F5C" strokeWidth="5" strokeLinecap="round"/>
            <line className="char-arm-l" x1="20" y1="20" x2="6" y2="12" stroke="#AD1F5C" strokeWidth="3.5" strokeLinecap="round"/>
            <line className="char-arm-r" x1="20" y1="20" x2="34" y2="10" stroke="#AD1F5C" strokeWidth="3.5" strokeLinecap="round"/>
            <line className="char-leg-l" x1="14" y1="42" x2="8" y2="58" stroke="#8C1F3B" strokeWidth="3" strokeLinecap="round"/>
            <line className="char-leg-r" x1="26" y1="42" x2="32" y2="58" stroke="#8C1F3B" strokeWidth="3" strokeLinecap="round"/>
            <path d="M20 18 Q30 22 32 30" stroke="#FFD23F" strokeWidth="2" fill="none" opacity=".6"/>
          </svg>
        </div>

        {/* Dhol wala — center-left */}
        <div className="stage-char char-dhol" style={{left:'22%', bottom:'34%'}}>
          <svg width="30" height="42" viewBox="0 0 44 60">
            <circle cx="22" cy="9" r="6" fill="#F7ECD9"/>
            <rect x="12" y="22" width="20" height="13" rx="3" fill="#D4A017"/>
            <path d="M22 15 L22 24" stroke="#E8871E" strokeWidth="5" strokeLinecap="round"/>
            <line className="char-arm-l" x1="22" y1="20" x2="8" y2="22" stroke="#E8871E" strokeWidth="3.5" strokeLinecap="round"/>
            <line className="char-arm-r" x1="22" y1="20" x2="36" y2="22" stroke="#E8871E" strokeWidth="3.5" strokeLinecap="round"/>
            <line x1="22" y1="35" x2="14" y2="58" stroke="#8C1F3B" strokeWidth="3.5" strokeLinecap="round"/>
            <line x1="22" y1="35" x2="30" y2="58" stroke="#8C1F3B" strokeWidth="3.5" strokeLinecap="round"/>
            <line className="char-stick-l" x1="8" y1="22" x2="2" y2="18" stroke="#F7ECD9" strokeWidth="2" strokeLinecap="round"/>
            <line className="char-stick-r" x1="36" y1="22" x2="42" y2="18" stroke="#F7ECD9" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </div>

        {/* Chachi — center-right */}
        <div className="stage-char char-chachi" style={{right:'22%', bottom:'35%'}}>
          <svg width="26" height="40" viewBox="0 0 40 60">
            <circle cx="20" cy="9" r="6" fill="#F7ECD9"/>
            <path d="M14 42 L20 28 L26 42 Z" fill="#E8871E" opacity=".85"/>
            <path d="M20 15 L20 28" stroke="#E8871E" strokeWidth="5" strokeLinecap="round"/>
            <line className="char-arm-l" x1="20" y1="20" x2="10" y2="18" stroke="#E8871E" strokeWidth="3.5" strokeLinecap="round"/>
            <line className="char-arm-r" x1="20" y1="20" x2="30" y2="18" stroke="#E8871E" strokeWidth="3.5" strokeLinecap="round"/>
            <line className="char-leg-l" x1="16" y1="42" x2="10" y2="58" stroke="#8C1F3B" strokeWidth="3" strokeLinecap="round"/>
            <line className="char-leg-r" x1="24" y1="42" x2="30" y2="58" stroke="#8C1F3B" strokeWidth="3" strokeLinecap="round"/>
          </svg>
        </div>

        {/* Uncle — far left */}
        <div className="stage-char char-uncle" style={{left:'3%', bottom:'30%'}}>
          <svg width="24" height="38" viewBox="0 0 40 60">
            <circle cx="20" cy="9" r="6" fill="#F7ECD9"/>
            <path d="M20 15 L20 42" stroke="#D4A017" strokeWidth="5" strokeLinecap="round"/>
            <line className="char-arm-l" x1="20" y1="20" x2="8" y2="28" stroke="#D4A017" strokeWidth="3.5" strokeLinecap="round"/>
            <line className="char-arm-r" x1="20" y1="20" x2="32" y2="28" stroke="#D4A017" strokeWidth="3.5" strokeLinecap="round"/>
            <line className="char-leg-l" x1="20" y1="42" x2="12" y2="58" stroke="#8C1F3B" strokeWidth="3.5" strokeLinecap="round"/>
            <line className="char-leg-r" x1="20" y1="42" x2="28" y2="58" stroke="#8C1F3B" strokeWidth="3.5" strokeLinecap="round"/>
          </svg>
        </div>

        {/* Photographer — far right */}
        <div className="stage-char char-photo" style={{right:'3%', bottom:'32%'}}>
          <svg width="26" height="40" viewBox="0 0 40 60">
            <circle cx="20" cy="9" r="6" fill="#F7ECD9"/>
            <path d="M20 15 L20 42" stroke="#6B1140" strokeWidth="5" strokeLinecap="round"/>
            <line className="char-arm-l" x1="20" y1="20" x2="8" y2="18" stroke="#6B1140" strokeWidth="3.5" strokeLinecap="round"/>
            <line className="char-arm-r" x1="20" y1="20" x2="34" y2="14" stroke="#6B1140" strokeWidth="3.5" strokeLinecap="round"/>
            <line className="char-leg-l" x1="20" y1="42" x2="12" y2="58" stroke="#8C1F3B" strokeWidth="3.5" strokeLinecap="round"/>
            <line className="char-leg-r" x1="20" y1="42" x2="28" y2="58" stroke="#8C1F3B" strokeWidth="3.5" strokeLinecap="round"/>
            <rect className="char-camera" x="30" y="10" width="8" height="6" rx="1.5" fill="#241220" stroke="#F7ECD9" strokeWidth="1"/>
            <circle cx="34" cy="13" r="2" fill="#D4A017"/>
          </svg>
        </div>
      </div>
    </div>
  );
}
