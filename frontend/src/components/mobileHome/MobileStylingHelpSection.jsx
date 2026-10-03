import React from 'react';

const MobileStylingHelpSection = ({ onChatNow }) => {
  return (
    <section className="bg-white py-12 text-center px-6">
      <h2
        className="text-black mb-4"
        style={{
          fontFamily: "'Belgant Aesthetic', Georgia, serif",
          fontSize: '30px',
        }}
      >
        Need Styling Help?
      </h2>
      <p
        className="text-black text-center max-w-[342px] mx-auto mb-8"
        style={{
          fontFamily: "'Gotham Book', sans-serif",
          fontSize: '12px',
          lineHeight: '22px',
        }}
      >
        Tell us your outfit colour, event date, and budget. We&apos;ll suggest matching pieces instantly on WhatsApp.
      </p>
      <button
        type="button"
        onClick={onChatNow}
        className="bg-[#ab6281] text-white hover:bg-[#935b67] transition-colors flex items-center justify-center mx-auto"
        style={{
          fontFamily: "'Gotham', sans-serif",
          fontSize: '11px',
          letterSpacing: '1.54px',
          width: '159px',
          height: '44px',
        }}
      >
        CHAT NOW
      </button>
    </section>
  );
};

export default MobileStylingHelpSection;
