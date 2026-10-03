# Apila Jewels

A full-stack e-commerce platform for jewellery rental and booking — built to bring a premium, mobile-first shopping experience to traditional jewellery businesses.

[Live Demo](https://apilajewels.in) · [GitHub](https://github.com/Thulasimani5/Apilajewels) · [API Docs](#api-documentation) · [Demo Video](#screenshots--demo)

---

## Overview

- **What it does:** Apila Jewels is an end-to-end jewellery rental and booking platform that lets customers browse, filter, wishlist, and book jewellery online with a modern, responsive UI.
- **Problem it solves:** Traditional jewellery stores lack a digital storefront for showcasing and renting out their collections — this platform bridges that gap with a seamless online experience.
- **Who it is for:** Jewellery rental businesses and their customers, especially bridal and occasion-wear shoppers.
- **What makes it interesting:** Responsive design with separate mobile and desktop views, guest cart support, Cloudinary-powered image management, role-based admin dashboard with full product/booking/category/user management, and a visitor tracking system.

---

## Key Features

- 🛍️ **Product Catalog** — Browse jewellery with rich image galleries, pricing, and detailed descriptions
- 🔍 **Advanced Filtering** — Filter by category, type, price range, and more with a mobile-optimized bottom sheet
- 🛒 **Cart & Wishlist** — Persistent cart with guest support (syncs on login) and wishlist functionality
- 📅 **Booking System** — Book jewellery for rental with date selection, payment tracking, and status management
- 👤 **Authentication** — JWT-based auth with email login, registration, and role-based access control
- 🛡️ **Admin Dashboard** — Full CRUD for products, bookings, categories, users, and analytics
- 📱 **Responsive Design** — Dedicated mobile and desktop views for an optimized experience on every device
- 💳 **Payment Tracking** — Record payments against bookings with admin-managed payment summaries
- ☁️ **Cloud Image Management** — Cloudinary integration for product and category image uploads
- 📊 **Visitor Tracking** — Built-in middleware for tracking site visitors and guest carts

---

## Screenshots / Demo

> *Screenshots and demo video coming soon.*

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 19, Tailwind CSS 3, Vite 5, Framer Motion, React Router 7 |
| **Backend** | Node.js, Express 5 |
| **Database** | MongoDB, Mongoose 9 |
| **State Management** | TanStack React Query 5 (with persistence) |
| **Authentication** | JWT (JSON Web Tokens) |
| **Image Storage** | Cloudinary |
| **Icons** | Lucide React |
| **HTTP Client** | Axios |
| **Deployment** | Vercel (Backend & Frontend) |
| **Tools** | Git, GitHub, Nodemon |

---

## Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                        CLIENT (React)                        │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌───────────────┐  │
│  │  Pages   │  │Components│  │  Hooks  │  │ Services/API  │  │
│  └─────────┘  └─────────┘  └─────────┘  └───────┬───────┘  │
└──────────────────────────────────────────────────┼───────────┘
                                                   │ Axios
                                                   ▼
┌──────────────────────────────────────────────────────────────┐
│                      SERVER (Express 5)                      │
│  ┌──────────┐  ┌────────────┐  ┌───────────┐  ┌──────────┐ │
│  │  Routes   │→│ Middleware  │→│Controllers │→│ Services  │ │
│  │          │  │(Auth, Rate │  │           │  │          │  │
│  │          │  │ Limit, CORS)│  │           │  │          │  │
│  └──────────┘  └────────────┘  └─────┬─────┘  └────┬─────┘ │
└──────────────────────────────────────┼──────────────┼────────┘
                                       │              │
                              ┌────────▼──────┐  ┌────▼──────┐
                              │   MongoDB     │  │ Cloudinary│
                              │  (Mongoose)   │  │  (Images) │
                              └───────────────┘  └───────────┘
```

**Data Flow:** Client → Axios → Express Routes → Middleware (Auth, Rate Limiting, Visitor Tracking) → Controllers → Services/Repositories → MongoDB / Cloudinary → Response

---

## Project Structure

```
Apilajewels/
├── backend/
│   ├── config/          # DB connection, Cloudinary, env validation
│   ├── controllers/     # Route handlers (auth, jewellery, bookings, cart, category, payment)
│   ├── middleware/       # Auth (JWT), rate limiter, visitor tracking
│   ├── models/          # Mongoose schemas (User, Jewellery, Booking, Category, Cart, AuditLog)
│   ├── repositories/    # Data access layer
│   ├── routes/          # Express route definitions
│   ├── scripts/         # DB backup, migration, and seeding scripts
│   ├── services/        # Business logic layer
│   ├── validators/      # Input validation (auth, product, booking, category)
│   ├── server.js        # App entry point
│   └── vercel.json      # Vercel deployment config
├── frontend/
│   ├── src/
│   │   ├── components/  # Reusable UI components (ShopCard, HeroSection, FilterBottomSheet, etc.)
│   │   │   ├── admin/   # Admin dashboard components (products, bookings, users, categories)
│   │   │   └── mobileHome/ # Mobile-specific home components
│   │   ├── constants/   # App-wide constants and config
│   │   ├── context/     # React Context (Auth, Category)
│   │   ├── hooks/       # Custom hooks (useFilteredProducts, useAdminProducts, etc.)
│   │   │   └── admin/   # Admin-specific hooks
│   │   ├── pages/       # Route pages (Home, Shop, ProductDetails, Cart, Wishlist, Admin, etc.)
│   │   ├── services/    # API service functions
│   │   ├── styles/      # CSS styles
│   │   └── utils/       # Utility functions (filters, constants)
│   └── package.json
├── .gitignore
└── README.md
```

---

## Prerequisites

- [Node.js](https://nodejs.org/) (v18+)
- [npm](https://www.npmjs.com/) (v9+)
- [MongoDB](https://www.mongodb.com/) (local or Atlas)
- [Cloudinary](https://cloudinary.com/) account (for image uploads)

---

## Installation

```bash
# Clone the repository
git clone https://github.com/Thulasimani5/Apilajewels.git
cd Apilajewels

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

---

## Environment Variables

Create a `.env` file in the `backend/` directory:

```env
# Server
PORT=5000
NODE_ENV=development

# Database
MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/apilajewels

# Authentication
JWT_SECRET=your_jwt_secret_key

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

Create a `.env` file in the `frontend/` directory:

```env
VITE_API_URL=http://localhost:5000/api
```

---

## Usage

```bash
# Run both frontend and backend concurrently (from root)
node run-dev.js

# Or run separately:

# Backend (from /backend)
npm run dev

# Frontend (from /frontend)
npm run dev
```

- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:5000

---

## API Documentation

### Authentication

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| `POST` | `/api/auth/register` | Register a new user | Public |
| `POST` | `/api/auth/login` | Login with credentials | Public |
| `POST` | `/api/auth/email-login` | Login with email only | Public |
| `GET` | `/api/auth/me` | Get current user profile | Private |
| `GET` | `/api/auth/users` | Get all users | Admin |
| `PUT` | `/api/auth/cart` | Update user cart | Private |

### Jewellery

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| `GET` | `/api/jewellery` | Get all jewellery items | Public |
| `GET` | `/api/jewellery/:id` | Get single jewellery item | Public |
| `POST` | `/api/jewellery` | Create jewellery (with images) | Admin |
| `PUT` | `/api/jewellery/:id` | Update jewellery (with images) | Admin |
| `PATCH` | `/api/jewellery/:id/field` | Patch a single field | Admin |
| `DELETE` | `/api/jewellery/:id` | Delete jewellery | Admin |

### Bookings

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| `GET` | `/api/bookings` | Get all bookings | Public (optional auth) |
| `POST` | `/api/bookings` | Create a booking | Public (optional auth) |
| `GET` | `/api/bookings/my-bookings` | Get current user's bookings | Private |
| `GET` | `/api/bookings/:id` | Get single booking | Public (optional auth) |
| `PUT` | `/api/bookings/:id` | Update booking | Admin |
| `PATCH` | `/api/bookings/:id/status` | Update booking status | Admin |
| `DELETE` | `/api/bookings/:id` | Delete booking | Admin |

### Categories

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| `GET` | `/api/categories` | Get all categories | Public |
| `POST` | `/api/categories` | Create category (with image) | Admin |
| `PUT` | `/api/categories/:id` | Update category (with image) | Admin |
| `DELETE` | `/api/categories/:id` | Delete category | Admin |

### Cart

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| `GET` | `/api/cart` | Get cart | Public (optional auth) |
| `PUT` | `/api/cart` | Sync/update cart | Public (optional auth) |
| `GET` | `/api/cart/all-guests` | Get all guest carts | Admin |

### Payments

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| `GET` | `/api/payments/booking/:bookingId` | Get payment summary | Private |
| `POST` | `/api/payments/record` | Record a payment | Admin |
| `POST` | `/api/payments/create-order` | Create payment gateway order | Private |

### Health

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| `GET` | `/api/health` | API health check | Public |

---

## Deployment

| Service | Platform | URL |
|---------|----------|-----|
| **Frontend** | Vercel | [apilajewels.in](https://apilajewels.in) |
| **Backend** | Vercel | [apilajewels.vercel.app](https://apilajewels.vercel.app) |
| **Database** | MongoDB Atlas | Cloud hosted |
| **Images** | Cloudinary | Cloud hosted |

---

## Security

- 🔐 **JWT Authentication** — Secure token-based auth with Bearer tokens
- 🔑 **Password Hashing** — bcryptjs for secure password storage
- ✅ **Input Validation** — Request validation on auth, products, bookings, and categories
- 🚦 **Rate Limiting** — In-memory rate limiter on sensitive routes (login, register)
- 🛡️ **Security Headers** — X-Content-Type-Options, X-Frame-Options, X-XSS-Protection
- 🌐 **CORS** — Origin-based whitelisting for cross-origin requests
- 🔒 **Role-Based Access** — Admin-only routes protected with `authorize('admin')` middleware
- 📦 **Environment Secrets** — All sensitive config via environment variables with validation

---

## Challenges & Solutions

### Challenge 1: Guest Cart Persistence

**Problem:** Users who aren't logged in should still be able to add items to their cart and not lose them on login.

**Solution:** Implemented a visitor tracking middleware that assigns a unique visitor ID. Guest carts are stored in MongoDB and synced/merged with the user's account cart upon authentication.

### Challenge 2: Mobile-First Responsive Design

**Problem:** Jewellery shopping requires a rich visual experience that works seamlessly on both mobile and desktop.

**Solution:** Built dedicated mobile and desktop page variants (`MobileHome` / `DesktopHome`, `MobileShopView` / `DesktopShop`) with device-specific components like `FilterBottomSheet` for mobile and `ShopFilterSidebar` for desktop.

### Challenge 3: Image Management at Scale

**Problem:** Jewellery products require multiple high-quality images that need to be optimized and served efficiently.

**Solution:** Integrated Cloudinary for image upload, storage, and transformation — supporting up to 20 images per product with automatic optimization and CDN delivery.

---

## Future Improvements

- 💳 Razorpay/Stripe payment gateway integration
- 🔔 Real-time booking status notifications (email/SMS)
- 📊 Advanced analytics dashboard with revenue charts
- 🔍 Full-text search with Elasticsearch
- 📱 Progressive Web App (PWA) support
- 🌐 Multi-language support (Tamil, Hindi, English)
- ⭐ Customer reviews and ratings system

---

## License

MIT License

---

## Author

**Thulasimani**

[GitHub](https://github.com/Thulasimani5) · [LinkedIn](#) · [Portfolio](#) · [Email](#)
