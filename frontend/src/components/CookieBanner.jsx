import React, { useState, useEffect } from 'react';
import '../styles/CookieBanner.css';

const CookieBanner = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const cookiesAccepted = localStorage.getItem('cookiesAccepted');
    
    if (!cookiesAccepted) {
      setIsVisible(true);
    }
  }, []);

  const handleAcceptAll = () => {
    setIsVisible(false);
    localStorage.setItem('cookiesAccepted', 'true');
  };

  const handleDecline = () => {
    setIsVisible(false);
    // Optionally set a flag that they declined if you need it, but generally just hiding is enough.
  };

  return (
    <>
      {isVisible && (
        <div className="cookie-banner-overlay">
          <div className="cookie-banner">
            <div className="cb-left">
              <h4 className="cb-title">WELCOME TO APILA JEWELS</h4>
              <p className="cb-text">
                We Use Cookies To Enhance Your Browsing Experience, Analyse Website Traffic, And Improve Our Services.
                By Continuing To Use Our Site, You Agree To Our Use Of Cookies. <a href="/terms" className="cb-link">Cookies Policy.</a>
              </p>
            </div>
            
            <div className="cb-right">
              <button className="cb-continue-text" onClick={handleDecline}>
                Continue Without Accepting
              </button>
              <div className="cb-buttons">
                <button className="cb-btn-outline" onClick={() => {}}>COOKIE SETTINGS</button>
                <button className="cb-btn-filled" onClick={handleAcceptAll}>ACCEPT ALL</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default CookieBanner;
