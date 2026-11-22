import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <main className="error-page" id="notFoundPage">
      <div className="error-code" aria-hidden="true">404</div>
      <h1 className="error-title">
        रास्ता नहीं मिला
        <span className="eng">Page not found</span>
      </h1>
      <p className="error-desc">
        This page doesn't exist — maybe the baraat took a wrong turn. Head back to the homepage to get the music going again.
      </p>
      <Link to="/" className="error-btn" id="errorHomeBtn">
        🏠 Back to Wedding Radio
      </Link>
    </main>
  );
}
