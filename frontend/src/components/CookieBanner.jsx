import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/CookieBanner.css';
import useIsDesktop from '../hooks/useIsDesktop';

const CookieBanner = () => {
  const [isVisible, setIsVisible] = useState(false);
  const isDesktop = useIsDesktop();
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    const cookiesAccepted = localStorage.getItem('cookiesAccepted');
    
    if (!cookiesAccepted) {
      setIsVisible(true);
    }
  }, []);

  const handleAcceptAll = () => {
    setIsVisible(false);
    localStorage.setItem('cookiesAccepted', 'true');
    if (user) {
      navigate('/profile');
    }
  };

  const handleDecline = () => {
    setIsVisible(false);
    if (user) {
      navigate('/profile');
    }
  };

  const handleCookieSettings = () => {
    setIsVisible(false);
    localStorage.setItem('cookiesAccepted', 'true');
    if (user) {
      navigate('/profile');
    }
  };

  if (!isVisible) return null;

  if (isDesktop) {
    return (
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
              <button className="cb-btn-outline" onClick={handleCookieSettings}>COOKIE SETTINGS</button>
              <button className="cb-btn-filled" onClick={handleAcceptAll}>ACCEPT ALL</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/70 z-[9999] flex flex-col justify-end pointer-events-auto">
      <div className="bg-white w-full px-6 pt-8 pb-10 shadow-2xl">
        <h4 className="text-[12px] font-bold tracking-[0.08em] text-[#111] uppercase mb-4" style={{ fontFamily: "'Gotham', sans-serif" }}>
          WELCOME TO APILA JEWELS
        </h4>
        <p className="text-[11.5px] leading-[1.7] text-[#333] mb-8" style={{ fontFamily: "'Gotham', sans-serif" }}>
          We Use Cookies To Enhance Your Browsing Experience, Analyse Website Traffic, And Improve Our Services. By Continuing To Use Our Site, You Agree To Our Use Of Cookies. <a href="/terms" className="font-bold underline text-[#111]">Cookies Policy.</a>
        </p>
        
        <div className="flex gap-3 mb-6">
          <button 
            className="flex-1 py-4 border border-[#ab6281] text-[#111] text-[10.5px] font-bold tracking-[0.1em] uppercase bg-white transition-opacity hover:opacity-70" 
            style={{ fontFamily: "'Gotham', sans-serif" }} 
            onClick={handleCookieSettings}
          >
            COOKIE SETTINGS
          </button>
          <button 
            className="flex-1 py-4 bg-[#ab6281] text-white text-[10.5px] font-bold tracking-[0.1em] uppercase transition-opacity hover:opacity-90" 
            style={{ fontFamily: "'Gotham', sans-serif" }} 
            onClick={handleAcceptAll}
          >
            ACCEPT ALL
          </button>
        </div>
        
        <div className="text-center">
          <button 
            className="text-[11px] font-bold underline text-[#111] hover:text-[#555] transition-colors" 
            style={{ fontFamily: "'Gotham', sans-serif" }} 
            onClick={handleDecline}
          >
            Continue Without Accepting
          </button>
        </div>
      </div>
    </div>
  );
};

export default CookieBanner;
