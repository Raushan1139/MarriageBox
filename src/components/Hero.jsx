export default function Hero({ bride, groom, shimmer, onPersonalizeClick, onEditClick, onBaraatToggle, baraatActive }) {
  const hasNames = !!(bride || groom);

  const namesHTML = bride && groom
    ? `💍 ${bride.toUpperCase()} ❤️ ${groom.toUpperCase()}`
    : bride
    ? `💍 ${bride.toUpperCase()} ❤️`
    : `❤️ ${groom.toUpperCase()}`;

  return (
    <div className="hero" id="heroSection">
      <div className="kicker">now playing · dhol ke saath</div>

      {!hasNames ? (
        <div id="heroDefault">
          <h1>
            शादी रेडियो
            <span className="eng">wedding songs, playing all night</span>
          </h1>
        </div>
      ) : (
        <div id="heroPersonalized" className="hero-personalized">
          <h1
            className={`hero-names${shimmer ? ' shimmer' : ''}`}
            id="heroNames"
            dangerouslySetInnerHTML={{
              __html: bride && groom
                ? `💍 ${bride.toUpperCase()} <span class="heart">❤️</span> ${groom.toUpperCase()}`
                : bride
                ? `💍 ${bride.toUpperCase()} <span class="heart">❤️</span>`
                : `<span class="heart">❤️</span> ${groom.toUpperCase()}`,
            }}
          />
          <h1 className="hero-brand">MARRIAGEBOX RADIO</h1>
          <button className="shaadi-edit" id="shaadiEdit" onClick={onEditClick}>
            ✏️ Edit
          </button>
        </div>
      )}

      <p className="tagline">
        Baraat to vidaai, one long tape that never stops — old favourites and new sangeet hits on loop, the way the DJ at every wedding hall keeps it going till 2am.
      </p>

      {!hasNames && (
        <button className="shaadi-cta" id="shaadiCta" onClick={onPersonalizeClick}>
          <span className="shaadi-cta-icon">💍</span>
          <span className="shaadi-cta-text">Personalize Shaadi</span>
        </button>
      )}

      <button
        className={`baraat-btn${baraatActive ? ' active' : ''}`}
        id="baraatBtn"
        onClick={onBaraatToggle}
      >
        <span className="baraat-btn-icon">{baraatActive ? '🔥' : '🥁'}</span>
        <span className="baraat-btn-text">{baraatActive ? 'BARAAT IN PROGRESS' : 'START BARAAT'}</span>
      </button>
    </div>
  );
}
