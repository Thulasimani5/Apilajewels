import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import API_BASE_URL from '../config/api';
import whatsappIcon from '../assets/icons/whatsapp.svg';

const Icon = {
  heart: (
    <svg width="18" height="16" viewBox="0 0 18 16" fill="none">
      <path d="M8.99887 16C8.83828 16 8.67769 15.9592 8.53717 15.8777C4.1711 13.2582 -0.666706 8.59001 0.0760276 4.0849C0.417284 2.01581 1.97301 0.446155 4.03059 0.0792224C5.89746 -0.246939 7.71414 0.446155 8.98884 1.93427C10.2435 0.486925 11.9899 -0.216362 13.7965 0.0690301C15.8742 0.405385 17.4801 1.96485 17.8916 4.05432C18.7749 8.48808 14.1077 13.0747 9.4405 15.8777C9.29998 15.9592 9.13939 16 8.9788 16H8.99887ZM4.91384 1.82215C4.7131 1.82215 4.53243 1.84254 4.35177 1.87311C3.31796 2.05658 2.11353 2.81083 1.8626 4.38048C1.33064 7.62172 4.99413 11.4847 9.00891 14.0125C12.823 11.6172 16.8277 7.7746 16.1552 4.41106C15.8943 3.07584 14.8604 2.08716 13.5356 1.87311C12.0401 1.62849 10.6449 2.41332 9.79179 3.95239C9.6312 4.23779 9.33009 4.42125 9.00891 4.42125C8.68773 4.42125 8.38662 4.24798 8.22603 3.95239C7.35281 2.37255 6.03798 1.82215 4.92387 1.82215H4.91384Z" fill="currentColor"/>
    </svg>
  ),
  cart: (
    <svg width="15" height="17" viewBox="0 0 15 17" fill="none">
      <path d="M13.282 13.5346C13.4101 14.7175 12.4834 15.75 11.2936 15.75H2.75034C1.56051 15.75 0.633827 14.7175 0.761975 13.5346L1.62864 5.53459C1.73863 4.51934 2.59581 3.75 3.61701 3.75H10.4269C11.4481 3.75 12.3053 4.51934 12.4153 5.53459L13.282 13.5346Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M7.02516 0.75C8.40732 0.75 9.52197 1.69624 9.52197 2.85753V3.75H4.52197V2.85753C4.52197 1.69086 5.64299 0.75 7.01879 0.75H7.02516Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M5.52197 6.75H8.52197" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  account: (
    <svg width="13" height="15" viewBox="0 0 13 15" fill="none">
      <path d="M0.75 13.63C0.75 10.5388 3.19364 8.03 6.20455 8.03C9.21545 8.03 11.6591 10.5388 11.6591 13.63" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M6.20432 6.35C7.71055 6.35 8.9316 5.0964 8.9316 3.55C8.9316 2.0036 7.71055 0.75 6.20432 0.75C4.69809 0.75 3.47705 2.0036 3.47705 3.55C3.47705 5.0964 4.69809 6.35 6.20432 6.35Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
};

const LoginSidebar = ({ isOpen, onClose, initialMode = 'login' }) => {
  const [mode, setMode] = useState(initialMode);
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const { login } = useAuth();

  useEffect(() => {
    if (isOpen) {
      setMobile('');
      setPassword('');
      setError('');
    }
  }, [isOpen, mode]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (mode === 'login') {
        const response = await axios.post(`${API_BASE_URL}/api/auth/login`, {
          mobile,
          password
        });
        const { token: jwtToken, user: userData } = response.data;
        login(userData, jwtToken);
        onClose();
        if (userData.role === 'admin') {
          window.location.href = '/admin';
        }
      } else {
        const response = await axios.post(`${API_BASE_URL}/api/auth/register`, {
          mobile,
          password,
          role: 'user'
        });
        const { token: jwtToken, user: userData } = response.data;
        login(userData, jwtToken);
        onClose();
      }
    } catch (err) {
      const raw = err.response?.data?.error || '';
      if (mode === 'login') {
        if (raw.includes('Invalid credentials') || raw.includes('not found')) {
          setError('Incorrect mobile number or password. Please try again.');
        } else if (raw.includes('password')) {
          setError('Password must be at least 6 characters.');
        } else {
          setError(raw || 'Login failed. Please try again.');
        }
      } else {
        if (raw.includes('duplicate') || raw.includes('already') || raw.includes('E11000')) {
          setError('This mobile number is already registered. Please log in instead.');
        } else if (raw.includes('password') || raw.includes('minlength')) {
          setError('Password must be at least 6 characters long.');
        } else if (raw.includes('mobile') || raw.includes('phone')) {
          setError('Please enter a valid 10-digit mobile number.');
        } else {
          setError(raw || 'Registration failed. Please try again.');
        }
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={`fixed inset-0 z-[200] transition-opacity duration-300 ${
        isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
      }`}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Drawer Content */}
      <div
        className={`absolute top-0 right-0 h-full bg-white shadow-2xl flex flex-col transition-transform duration-300 overflow-y-auto ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
        style={{ width: "100%", maxWidth: "420px" }}
      >
        {/* Header matching image - icons on right, bottom border */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", padding: "26px 48px", borderBottom: "1px solid #EAEAEA" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "24px", color: "#111" }}>
            <button aria-label="Wishlist" onClick={() => { onClose(); navigate('/wishlist'); }} style={{ background: "none", border: "none", cursor: "pointer" }}>
              {Icon.heart}
            </button>
            <button aria-label="Cart" onClick={() => { onClose(); navigate('/cart'); }} style={{ background: "none", border: "none", cursor: "pointer" }}>
              {Icon.cart}
            </button>
            <button aria-label="Account" onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer" }}>
              {Icon.account}
            </button>
          </div>
        </div>

        {/* Form Body - Explicit inline styles to bypass tailwind caching issues */}
        <div style={{ padding: "56px 48px 0 48px", flex: 1, display: "flex", flexDirection: "column" }}>
          <h1 style={{ color: "#111", fontFamily: "'Bacasime Antique', serif", fontSize: "28px", fontStyle: "normal", fontWeight: 400, letterSpacing: "0.5px", margin: "0" }}>
            {mode === 'login' ? 'Login' : 'Sign up'}
          </h1>
          
          <p style={{ margin: "20px 0 32px 0", fontFamily: "'Gotham Book', sans-serif", fontSize: "12px", color: "#222", letterSpacing: "0.2px" }}>
            Welcome to Apila Jewels
          </p>

          <form style={{ display: "flex", flexDirection: "column", width: "100%" }} onSubmit={handleSubmit}>
            {error && (
              <div style={{
                display: 'flex', alignItems: 'flex-start', gap: '8px',
                background: '#FFF0F2', border: '1px solid #F5C2CB',
                borderRadius: '6px', padding: '10px 14px', marginBottom: '16px'
              }}>
                <svg width="16" height="16" viewBox="0 0 20 20" fill="none" style={{ flexShrink: 0, marginTop: '1px' }}>
                  <circle cx="10" cy="10" r="9" stroke="#C0392B" strokeWidth="1.5"/>
                  <path d="M10 6v4M10 14h.01" stroke="#C0392B" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
                <span style={{ fontFamily: "'Gotham Book', sans-serif", fontSize: '11.5px', color: '#C0392B', lineHeight: '1.5' }}>{error}</span>
              </div>
            )}

            {/* Mobile Number Input */}
            <div style={{ marginBottom: "16px" }}>
              <input
                type="text"
                required
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                placeholder="Mobile Number *"
                style={{ width: "100%", boxSizing: "border-box", background: "#FAFAFA", border: "1px solid #EAEAEA", color: "#111", outline: "none", fontFamily: "'Gotham Book', sans-serif", fontSize: "12px", padding: "14px 16px" }}
              />
            </div>

            {/* Password Input */}
            <div style={{ marginBottom: "16px" }}>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password *"
                style={{ width: "100%", boxSizing: "border-box", background: "#FAFAFA", border: "1px solid #EAEAEA", color: "#111", outline: "none", fontFamily: "'Gotham Book', sans-serif", fontSize: "12px", padding: "14px 16px" }}
              />
            </div>

            {/* Forgot Password */}
            {mode === 'login' && (
              <div style={{ marginBottom: "40px" }}>
                <a href="#" style={{ color: "#333", textDecoration: "underline", textUnderlineOffset: "4px", textDecorationColor: "#999", fontFamily: "'Gotham Book', sans-serif", fontSize: "11px", letterSpacing: "0.3px" }}>
                  Forgot Your Password?
                </a>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              style={{ width: "100%", background: "#AA6C81", color: "white", border: "none", cursor: "pointer", display: "flex", justifyContent: "center", alignItems: "center", fontFamily: "'Gotham Book', sans-serif", fontSize: "12px", letterSpacing: "1.5px", height: "46px", marginTop: mode === 'login' ? '0' : '32px' }}
            >
              {loading ? (mode === 'login' ? 'LOGGING IN...' : 'SIGNING UP...') : (mode === 'login' ? 'LOGIN' : 'SIGN UP')}
            </button>
          </form>

          {/* Toggle Mode */}
          <div style={{ marginTop: "24px", display: "flex", justifyContent: "center", alignItems: "center" }}>
            <span style={{ fontFamily: "'Gotham Book', sans-serif", fontSize: "12px", color: "#333" }}>
              {mode === 'login' ? (
                <>
                  or <button type="button" onClick={() => setMode('register')} style={{ color: "#AA6C81", background: "none", border: "none", borderBottom: "1px solid #AA6C81", padding: "0 0 1px 0", margin: "0 4px", cursor: "pointer", fontSize: "12px", fontFamily: "'Gotham Book', sans-serif" }}>Sign up</button> with
                </>
              ) : (
                <>
                  Already have an account? <button type="button" onClick={() => setMode('login')} style={{ color: "#AA6C81", background: "none", border: "none", borderBottom: "1px solid #AA6C81", padding: "0 0 1px 0", margin: "0 4px", cursor: "pointer", fontSize: "12px", fontFamily: "'Gotham Book', sans-serif" }}>Log in</button>
                </>
              )}
            </span>
          </div>

          {/* Need help footer section */}
          <div style={{ marginTop: "auto", paddingBottom: "40px", display: "flex", justifyContent: "center", alignItems: "center", gap: "12px" }}>
            <span style={{ fontFamily: "'Gotham Book', sans-serif", fontSize: "12.5px", color: "#222" }}>Need help?</span>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" }}>
              <img src={whatsappIcon} alt="WhatsApp" style={{ width: "20px", height: "20px", filter: 'brightness(0)' }} />
              <span style={{ fontFamily: "'Gotham Book', sans-serif", fontWeight: 600, fontSize: "12.5px", color: "#111" }}>Whatsapp Us</span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default LoginSidebar;
