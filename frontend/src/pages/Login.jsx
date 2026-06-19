import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import useIsDesktop from '../hooks/useIsDesktop';
import whatsappIcon from '../assets/icons/whatsapp.svg';
import axios from 'axios';
import API_BASE_URL from '../config/api';

const Login = () => {
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from || '/';
  const isDesktop = useIsDesktop();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      const response = await axios.post(`${API_BASE_URL}/api/auth/login`, {
        mobile,
        password
      });
      
      const { token: jwtToken, user: userData } = response.data;
      login(userData, jwtToken);
      
      if (userData.role === 'admin') {
        navigate('/admin');
      } else {
        navigate(from);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  if (!isDesktop) {
    return (
      <div className="min-h-screen bg-white flex flex-col">
        {/* Header */}
        <div className="flex items-center px-6 py-5 border-b border-gray-100">
          <button onClick={() => navigate(from)} className="text-[#111] focus:outline-none">
            <X size={20} strokeWidth={1} />
          </button>
        </div>
        
        {/* Body */}
        <div className="pt-10 px-8 flex-1 flex flex-col">
          <h1 className="text-[28px] text-[#111] mb-2" style={{ fontFamily: "'Belgant Aesthetic', serif" }}>Login</h1>
          <p className="text-[11.5px] text-[#333] mb-8" style={{ fontFamily: "'Gotham', sans-serif" }}>Welcome to Apila Jewels</p>
          
          <form className="flex flex-col" onSubmit={handleSubmit}>
             {error && <div className="text-red-500 text-[11px] mb-4 text-center" style={{ fontFamily: "'Gotham', sans-serif" }}>{error}</div>}

             {/* Mobile Number Input */}
             <div className="mb-4">
               <input 
                 type="text"
                 required
                 value={mobile}
                 onChange={(e) => setMobile(e.target.value)}
                 placeholder="Mobile Number *"
                 className="w-full bg-[#FAFAFA] border border-gray-100 text-[11.5px] px-4 py-4 text-[#111] placeholder-[#888] focus:outline-none focus:border-[#B07A85]"
                 style={{ fontFamily: "'Gotham', sans-serif" }}
               />
             </div>

             {/* Password Input */}
             <div className="mb-6">
               <input 
                 type="password"
                 required
                 value={password}
                 onChange={(e) => setPassword(e.target.value)}
                 placeholder="Password *"
                 className="w-full bg-[#FAFAFA] border border-gray-100 text-[11.5px] px-4 py-4 text-[#111] placeholder-[#888] focus:outline-none focus:border-[#B07A85]"
                 style={{ fontFamily: "'Gotham', sans-serif" }}
               />
             </div>

             {/* Forgot Password */}
             <div className="mb-14">
               <a href="#" className="text-[11.5px] font-bold text-[#111] border-b border-gray-300 pb-[1px] tracking-wide" style={{ fontFamily: "'Gotham', sans-serif" }}>Forgot Your Password?</a>
             </div>

             {/* Login Button */}
             <button 
               type="submit"
               disabled={loading}
               className="w-full bg-[#ab6281] text-white py-4 text-[11px] font-bold tracking-[0.1em] uppercase transition-opacity hover:opacity-90 flex justify-center"
               style={{ fontFamily: "'Gotham', sans-serif" }}
             >
               {loading ? 'LOGGING IN...' : 'LOGIN'}
             </button>
          </form>
          
          {/* Footer */}
          <div className="mt-8 flex justify-center items-center gap-2">
            <span className="text-[11.5px] text-[#333]" style={{ fontFamily: "'Gotham', sans-serif" }}>Need help?</span>
            <div className="flex items-center gap-1.5 cursor-pointer">
               <img src={whatsappIcon} alt="WhatsApp" className="w-[18px] h-[18px]" style={{ filter: 'brightness(0)' }} />
               <span className="text-[11.5px] font-bold text-[#111]" style={{ fontFamily: "'Gotham', sans-serif" }}>Whatsapp Us</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FFF8F3] flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative">
      {/* Back Button */}
      <button
        onClick={() => navigate('/')}
        className="absolute top-5 left-4 flex items-center gap-1.5 text-gray-600 hover:text-gray-900 transition-colors"
        aria-label="Go back"
      >
        <ArrowLeft size={22} strokeWidth={2} />
      </button>
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-serif font-extrabold text-gray-900">
          Welcome to Apila
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Sign in to your account
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && <div className="text-red-500 text-sm text-center">{error}</div>}
            <div>
              <label className="block text-sm font-medium text-gray-700">Mobile Number</label>
              <div className="mt-1">
                <input
                  type="text"
                  required
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#B07A85] focus:border-[#B07A85] sm:text-sm"
                  placeholder="Enter your mobile number"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Password</label>
              <div className="mt-1">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#B07A85] focus:border-[#B07A85] sm:text-sm"
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input id="remember-me" name="remember-me" type="checkbox" className="h-4 w-4 text-[#B07A85] focus:ring-[#B07A85] border-gray-300 rounded" />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">Remember me</label>
              </div>
              <div className="text-sm">
                <a href="#" className="font-medium text-[#B07A85] hover:text-[#9E6A75]">Forgot your password?</a>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#B07A85] hover:bg-[#9E6A75] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#B07A85]"
              >
                {loading ? 'Signing in...' : 'Sign in'}
              </button>
            </div>
          </form>

          <div className="mt-6 text-center text-sm">
            Don't have an account?{' '}
            <Link to="/register" className="font-medium text-[#B07A85] hover:text-[#9E6A75]">
              Register now
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
