export default function ContactPage() {
  return (
    <main className="content-page" id="contactPage">
      <h1 className="content-title">Contact</h1>
      <div className="content-card">
        <h2>Get in Touch</h2>
        <p>
          MarriageBox is a small passion project. If you have a question, a bug report, or just want to say salaam, reach out by email:
        </p>
        <p style={{ marginTop: '12px' }}>
          <a className="content-link" href="mailto:hello@marriagebox.com">
            hello@marriagebox.com
          </a>
        </p>

        <h2>Song Requests</h2>
        <p>
          We curate playlists based on popular Bollywood wedding songs. We're not a music discovery platform — the playlists are fixed YouTube playlists and change over time as we add new tracks.
        </p>

        <h2>Copyright Concerns</h2>
        <p>
          MarriageBox does not host any audio files. All music plays via the YouTube IFrame API. If you have a copyright concern, please contact YouTube directly or email us and we'll remove any playlist that violates rights.
        </p>

        <h2>Response Time</h2>
        <p>
          We try to respond to emails within 3–5 business days. We're a small team so please be patient — we do read everything!
        </p>
      </div>
    </main>
  );
}
