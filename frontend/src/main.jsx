import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { AuthProvider } from './context/AuthContext'
import { CartProvider } from './context/CartContext'
import { WishlistProvider } from './context/WishlistContext'
import { CategoryProvider } from './context/CategoryContext'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <WishlistProvider>
        <CartProvider>
          <CategoryProvider>
            <App />
          </CategoryProvider>
        </CartProvider>
      </WishlistProvider>
    </AuthProvider>
  </StrictMode>,
)
