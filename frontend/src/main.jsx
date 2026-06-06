import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { AuthProvider } from './context/AuthContext'
import { CartProvider } from './context/CartContext'
import { WishlistProvider } from './context/WishlistContext'
import { CategoryProvider } from './context/CategoryContext'
import { QueryClientProvider } from '@tanstack/react-query'
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client'
import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister'
import { queryClient } from './lib/queryClient'

const persister = createSyncStoragePersister({
  storage: window.localStorage,
  key: 'apila-query-cache',
})

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{ persister, maxAge: 30 * 60 * 1000 }}
    >
      <AuthProvider>
        <WishlistProvider>
          <CartProvider>
            <CategoryProvider>
              <App />
            </CategoryProvider>
          </CartProvider>
        </WishlistProvider>
      </AuthProvider>
    </PersistQueryClientProvider>
  </StrictMode>,
)
