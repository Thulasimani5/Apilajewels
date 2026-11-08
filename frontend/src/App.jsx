import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
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
import Terms from './pages/Terms';
import ScrollRestorationManager from './components/ScrollRestorationManager';

function App() {
  const { isLoginOpen, closeLogin } = useAuth();

  return (
    <Router>
      <ScrollRestorationManager />
      <div className="min-h-screen bg-brand-white relative">
        <div className="">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/shop" element={<Shop />} />
            <Route path="/sale" element={<Shop />} />
            <Route path="/shop/:id" element={<ProductDetails />} />
            <Route path="/cart" element={<Cart isSale={false} />} />
            <Route path="/sale/cart" element={<Cart isSale={true} />} />
            <Route path="/sales/cart" element={<Cart isSale={true} />} />
            <Route path="/wishlist" element={<Wishlist isSale={false} />} />
            <Route path="/sale/wishlist" element={<Wishlist isSale={true} />} />
            <Route path="/sales/wishlist" element={<Wishlist isSale={true} />} />

            {/* Admin Routes with dedicated URLs */}
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/dashboard" element={<AdminDashboard initialTab="dashboard" />} />
            <Route path="/admin/manage-jewellery" element={<AdminDashboard initialTab="jewellery" />} />
            <Route path="/admin/jewellery" element={<AdminDashboard initialTab="jewellery" />} />
            <Route path="/admin/bookings" element={<AdminDashboard initialTab="bookings" />} />
            <Route path="/admin/users" element={<AdminDashboard initialTab="users" />} />
            <Route path="/admin/categories" element={<AdminDashboard initialTab="categories" />} />
            <Route path="/admin/types" element={<AdminDashboard initialTab="types" />} />
            <Route path="/admin/jewellery-types" element={<AdminDashboard initialTab="types" />} />
            <Route path="/admin/sales" element={<AdminDashboard initialTab="sales" />} />
            <Route path="/admin/analytics" element={<AdminDashboard initialTab="analytics" />} />
            <Route path="/admin/:tab" element={<AdminDashboard />} />

            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/rental-policy" element={<Terms />} />
            <Route path="/terms-and-conditions" element={<Terms />} />
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
