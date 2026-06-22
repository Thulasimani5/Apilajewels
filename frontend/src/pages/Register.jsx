import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import API_BASE_URL from '../config/api';
import { ArrowLeft, X } from 'lucide-react';
import useIsDesktop from '../hooks/useIsDesktop';
import whatsappIcon from '../assets/icons/whatsapp.svg';

const Register = () => {
  const isDesktop = useIsDesktop();
  const [formData, setFormData] = useState({
    mobile: '',
    password: '',
    role: 'user'
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await axios.post(`${API_BASE_URL}/api/auth/register`, {
        mobile: formData.mobile,
        password: formData.password,
        role: formData.role
      });

      const { token: jwtToken, user: userData } = response.data;
      login(userData, jwtToken);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  if (!isDesktop) {
    return (
      <div className="min-h-screen bg-white flex flex-col">
        {/* Header */}
        <div className="flex items-center px-6 py-5 border-b border-gray-100">
          <button onClick={() => navigate(-1)} className="text-[#111] focus:outline-none">
            <X size={20} strokeWidth={1} />
          </button>
        </div>

        {/* Body */}
        <div className="pt-10 px-8 flex-1 flex flex-col">
          <h1 className="mb-2" style={{ color: "#000", fontFamily: "'Bacasime Antique', serif", fontSize: "30px", fontStyle: "normal", fontWeight: 400, lineHeight: "39px", letterSpacing: "-0.96px" }}>Sign up</h1>
          <p className="text-[11.5px] text-[#333] mb-6" style={{ fontFamily: "'Gotham Book', sans-serif" }}>Welcome to Apila Jewels</p>

          <form className="flex flex-col" onSubmit={handleSubmit}>
            {error && <div className="text-red-500 text-[11px] mb-4 text-center" style={{ fontFamily: "'Gotham Book', sans-serif" }}>{error}</div>}

            {/* Mobile Number Input */}
            <div className="mb-4">
              <input
                name="mobile"
                type="tel"
                required
                value={formData.mobile}
                onChange={handleChange}
                placeholder="Mobile Number *"
                className="w-full bg-[#FAFAFA] border border-gray-100 text-[11.5px] px-4 py-4 text-[#111] placeholder-[#888] focus:outline-none focus:border-[#B07A85]"
                style={{ fontFamily: "'Gotham Book', sans-serif" }}
              />
            </div>

            {/* Password Input */}
            <div className="mb-20">
              <input
                name="password"
                type="password"
                required
                value={formData.password}
                onChange={handleChange}
                placeholder="Password *"
                className="w-full bg-[#FAFAFA] border border-gray-100 text-[11.5px] px-4 py-4 text-[#111] placeholder-[#888] focus:outline-none focus:border-[#B07A85]"
                style={{ fontFamily: "'Gotham Book', sans-serif" }}
              />
            </div>

            {/* Signup Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#ab6281] text-white py-4 text-[12px] tracking-[0.1em] uppercase transition-opacity hover:opacity-90 flex justify-center"
              style={{ fontFamily: "'Gotham Book', sans-serif" }}
            >
              {loading ? 'SIGNING UP...' : 'SIGN UP'}
            </button>
          </form>

          {/* Already have an account */}
          <div className="mt-4 flex justify-center items-center">
            <span className="text-[11px] text-[#333]" style={{ fontFamily: "'Gotham Book', sans-serif" }}>
              Already have a account? <Link to="/login" className="text-[#ab6281] border-b border-[#ab6281] pb-[1px]">Log in</Link>
            </span>
          </div>

          {/* Footer */}
          <div className="mt-auto pb-8 flex justify-center items-center gap-2">
            <span className="text-[11.5px] text-[#333]" style={{ fontFamily: "'Gotham Book', sans-serif" }}>Need help?</span>
            <div className="flex items-center gap-1.5 cursor-pointer">
              <img src={whatsappIcon} alt="WhatsApp" className="w-[18px] h-[18px]" style={{ filter: 'brightness(0)' }} />
              <span className="text-[11.5px] font-bold text-[#111]" style={{ fontFamily: "'Gotham Book', sans-serif" }}>Whatsapp Us</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FFF8F3] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-serif font-extrabold text-gray-900">
          Create an Account
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && <div className="text-red-500 text-sm text-center">{error}</div>}

            <div>
              <label className="block text-sm font-medium text-gray-700">Mobile Number</label>
              <div className="mt-1">
                <input
                  name="mobile"
                  type="tel"
                  required
                  value={formData.mobile}
                  onChange={handleChange}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#B07A85] focus:border-[#B07A85] sm:text-sm"
                  placeholder="Enter your mobile number"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Password</label>
              <div className="mt-1">
                <input
                  name="password"
                  type="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#B07A85] focus:border-[#B07A85] sm:text-sm"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#B07A85] hover:bg-[#9E6A75] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#B07A85]"
              >
                {loading ? 'Registering...' : 'Register'}
              </button>
            </div>
          </form>

          <div className="mt-6 text-center text-sm">
            Already have an account?{' '}
            <Link to="/login" className="font-medium text-[#B07A85] hover:text-[#9E6A75]">
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
