export default function PrivacyPage() {
  return (
    <main className="content-page" id="privacyPage">
      <h1 className="content-title">Privacy Policy</h1>
      <div className="content-card">
        <h2>What We Collect</h2>
        <p>
          MarriageBox does not collect personal data. We don't require registration, login, or any form of account. The only data stored is in your own browser's <code>localStorage</code>:
        </p>
        <ul style={{ marginTop: '10px', paddingLeft: '20px', opacity: 0.82, fontSize: '14px', lineHeight: '1.75' }}>
          <li><strong>quietCornerMode</strong> — your quiet/animated mode preference</li>
        </ul>

        <h2>Bride &amp; Groom Names</h2>
        <p>
          If you use the Personalize Shaadi feature, the bride and groom names are stored only in the URL as query parameters. They are not sent to or stored on any server. The URL is shareable by you if you choose to share it.
        </p>

        <h2>Third-Party Services</h2>
        <p>
          MarriageBox embeds content via the <strong>YouTube IFrame API</strong>. YouTube may collect data subject to Google's Privacy Policy. We also use Cloudflare for site delivery. Please refer to their respective privacy policies for details.
        </p>

        <h2>Cookies</h2>
        <p>
          We do not set any cookies ourselves. YouTube's embedded player may set cookies as part of Google's services. You can manage these through your browser settings.
        </p>

        <h2>Analytics</h2>
        <p>
          We may use Cloudflare Web Analytics or similar privacy-respecting analytics that don't use cookies and don't track individuals. We only collect aggregated, anonymous visitor counts.
        </p>

        <h2>Contact</h2>
        <p>
          For any privacy-related questions, contact us at{' '}
          <a className="content-link" href="mailto:hello@marriagebox.com">hello@marriagebox.com</a>.
        </p>
      </div>
    </main>
  );
}
