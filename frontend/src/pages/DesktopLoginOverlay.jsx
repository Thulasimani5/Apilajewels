import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import API_BASE_URL from '../config/api';
import { useAuth } from '../context/AuthContext';
import apilaLogo from '../assets/Apila Logo01.svg';
import whatsappIcon from '../assets/icons/whatsapp.svg';
import '../styles/ApilaJewels.css';

export default function DesktopLoginOverlay({ onClose }) {
  const [mode, setMode] = useState('login'); // 'login' or 'register'
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  /* Lock body scroll */
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  /* Close on Escape */
  useEffect(() => {
    const handleKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [onClose]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const endpoint = mode === 'login' ? '/api/auth/login' : '/api/auth/register';
      const payload = mode === 'login'
        ? { mobile, password }
        : { mobile, password, role: 'user' };
      const response = await axios.post(`${API_BASE_URL}${endpoint}`, payload);
      const { token: jwtToken, user: userData } = response.data;
      login(userData, jwtToken);
      onClose();
      if (userData.role === 'admin') navigate('/admin');
    } catch (err) {
      setError(err.response?.data?.error || (mode === 'login' ? 'Invalid credentials' : 'Registration failed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dlo-overlay" role="dialog" aria-modal="true" aria-label="Login">
      {/* Dark backdrop */}
      <div className="dlo-backdrop" onClick={onClose} />

      {/* Right side sliding panel */}
      <div className="dlo-panel">

        {/* Header — matches navbar height */}
        <div className="dlo-header">
          <div className="dlo-logo" onClick={() => { onClose(); navigate('/'); }}>
            <img src={apilaLogo} alt="Apila Jewels" className="nav-logo-img" />
          </div>
          <div className="dlo-nav-icons">
            <button className="nav-icon-btn" aria-label="Wishlist" onClick={() => { onClose(); navigate('/wishlist'); }}>
              <svg width="18" height="16" viewBox="0 0 18 16" fill="none">
                <path d="M8.99887 16C8.83828 16 8.67769 15.9592 8.53717 15.8777C4.1711 13.2582 -0.666706 8.59001 0.0760276 4.0849C0.417284 2.01581 1.97301 0.446155 4.03059 0.0792224C5.89746 -0.246939 7.71414 0.446155 8.98884 1.93427C10.2435 0.486925 11.9899 -0.216362 13.7965 0.0690301C15.8742 0.405385 17.4801 1.96485 17.8916 4.05432C18.7749 8.48808 14.1077 13.0747 9.4405 15.8777C9.29998 15.9592 9.13939 16 8.9788 16H8.99887ZM4.91384 1.82215C4.7131 1.82215 4.53243 1.84254 4.35177 1.87311C3.31796 2.05658 2.11353 2.81083 1.8626 4.38048C1.33064 7.62172 4.99413 11.4847 9.00891 14.0125C12.823 11.6172 16.8277 7.7746 16.1552 4.41106C15.8943 3.07584 14.8604 2.08716 13.5356 1.87311C12.0401 1.62849 10.6449 2.41332 9.79179 3.95239C9.6312 4.23779 9.33009 4.42125 9.00891 4.42125C8.68773 4.42125 8.38662 4.24798 8.22603 3.95239C7.35281 2.37255 6.03798 1.82215 4.92387 1.82215H4.91384Z" fill="currentColor"/>
              </svg>
            </button>
            <button className="nav-icon-btn" aria-label="Cart" onClick={() => { onClose(); navigate('/cart'); }}>
              <svg width="15" height="17" viewBox="0 0 15 17" fill="none">
                <path d="M13.282 13.5346C13.4101 14.7175 12.4834 15.75 11.2936 15.75H2.75034C1.56051 15.75 0.633827 14.7175 0.761975 13.5346L1.62864 5.53459C1.73863 4.51934 2.59581 3.75 3.61701 3.75H10.4269C11.4481 3.75 12.3053 4.51934 12.4153 5.53459L13.282 13.5346Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M7.02516 0.75C8.40732 0.75 9.52197 1.69624 9.52197 2.85753V3.75H4.52197V2.85753C4.52197 1.69086 5.64299 0.75 7.01879 0.75H7.02516Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M5.52197 6.75H8.52197" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            <button className="nav-icon-btn" aria-label="Close" onClick={onClose}>
              <svg width="13" height="15" viewBox="0 0 13 15" fill="none">
                <path d="M0.75 13.63C0.75 10.5388 3.19364 8.03 6.20455 8.03C9.21545 8.03 11.6591 10.5388 11.6591 13.63" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M6.20432 6.35C7.71055 6.35 8.9316 5.0964 8.9316 3.55C8.9316 2.0036 7.71055 0.75 6.20432 0.75C4.69809 0.75 3.47705 2.0036 3.47705 3.55C3.47705 5.0964 4.69809 6.35 6.20432 6.35Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>
        </div>

        {/* Divider */}
        <div className="dlo-divider" />

        {/* Body */}
        <div className="dlo-body">
          <h1 className="dlo-title">{mode === 'login' ? 'Login' : 'Sign up'}</h1>
          <p className="dlo-subtitle">Welcome to Apila Jewels</p>

          <form onSubmit={handleSubmit} className="dlo-form">
            {error && <div className="dlo-error">{error}</div>}

            <div className="dlo-field">
              <input
                type="text"
                required
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                placeholder="Mobile Number *"
                autoFocus
                className="dlo-input"
              />
            </div>

            <div className="dlo-field">
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password *"
                className="dlo-input"
              />
            </div>

            {mode === 'login' && (
              <div className="dlo-forgot">
                <a href="#" className="dlo-forgot-link">Forgot Your Password?</a>
              </div>
            )}

            <button type="submit" disabled={loading} className="dlo-submit-btn">
              {loading
                ? (mode === 'login' ? 'LOGGING IN...' : 'REGISTERING...')
                : (mode === 'login' ? 'LOGIN' : 'SIGN UP')}
            </button>

            <div className="dlo-switch">
              {mode === 'login' ? (
                <span className="dlo-switch-text">
                  or{' '}
                  <button type="button" onClick={() => { setMode('register'); setError(''); }} className="dlo-switch-btn">
                    Sign up
                  </button>
                  {' '}with
                </span>
              ) : (
                <span className="dlo-switch-text">
                  Already have an account?{' '}
                  <button type="button" onClick={() => { setMode('login'); setError(''); }} className="dlo-switch-btn">
                    Log in
                  </button>
                </span>
              )}
            </div>
          </form>

          <div className="dlo-footer">
            <span className="dlo-footer-text">Need help?</span>
            <div className="dlo-whatsapp">
              <img src={whatsappIcon} alt="WhatsApp" className="dlo-wa-icon" />
              <span className="dlo-wa-label">Whatsapp Us</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
