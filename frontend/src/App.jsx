import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

import Home from './pages/Home';
import Shop from './pages/Shop';
import ProductDetails from './pages/ProductDetails';
import Cart from './pages/Cart';
import Wishlist from './pages/Wishlist';
import AdminDashboard from './pages/AdminDashboard';
import CookieBanner from './components/CookieBanner';
import LoginSidebar from './components/LoginSidebar';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';

function App() {
  // Simple check for admin route to hide navbar
  const isAdmin = window.location.pathname.startsWith('/admin');
  const { isLoginOpen, closeLogin } = useAuth();

  return (
    <Router>
      <div className="min-h-screen bg-brand-white relative">
        
        <div className="">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/shop/:id" element={<ProductDetails />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/wishlist" element={<Wishlist />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/profile" element={<Profile />} />
        </Routes>
        </div>
        <CookieBanner />
        
        {/* Global Login Sidebar */}
        <LoginSidebar isOpen={isLoginOpen} onClose={closeLogin} />
      </div>
    </Router>
  );
}

export default App;
