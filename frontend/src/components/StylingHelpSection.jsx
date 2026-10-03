import React from 'react';

export default function StylingHelpSection() {
  return (
    <section className="style-section">
      <h2 className="style-title">Need Styling Help?</h2>
      <p className="style-body">
        Tell us your outfit colour, event date, and budget. We'll suggest matching pieces instantly on WhatsApp.
      </p>
      <button className="btn-chat"
        onClick={() => window.open(`https://wa.me/+917397721122?text=${encodeURIComponent('Hi, I need styling help!')}`, "_blank")}>
        <span>Chat Now</span>
      </button>
    </section>
  );
}
