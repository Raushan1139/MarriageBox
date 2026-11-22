import { useState } from 'react';
import { FAQ_DATA } from '../data/faqData';

export default function FAQ() {
  const [openIdx, setOpenIdx] = useState(null);

  const toggle = (i) => setOpenIdx(openIdx === i ? null : i);

  return (
    <section className="faq-section" id="faq" aria-label="Frequently asked questions">
      <h2 className="faq-heading">Frequently Asked Questions</h2>
      <div className="faq-list">
        {FAQ_DATA.map((item, i) => (
          <div key={i} className={`faq-item${openIdx === i ? ' open' : ''}`}>
            <button
              className="faq-question"
              id={`faq-q-${i}`}
              aria-expanded={openIdx === i}
              aria-controls={`faq-a-${i}`}
              onClick={() => toggle(i)}
            >
              <span>{item.q}</span>
              <span className="faq-chevron" aria-hidden="true">{openIdx === i ? '▲' : '▼'}</span>
            </button>
            <div
              id={`faq-a-${i}`}
              className="faq-answer"
              role="region"
              aria-labelledby={`faq-q-${i}`}
              hidden={openIdx !== i}
            >
              <p>{item.a}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
