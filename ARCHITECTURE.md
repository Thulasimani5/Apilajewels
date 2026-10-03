# Apila Jewels - Architecture Specification

## Architecture Overview

Apila Jewels is built on a **Layered Monolithic / Client-Server Architecture** featuring a React 18 SPA frontend (powered by Vite) and a Node.js / Express.js REST API backend connected to MongoDB.

```text
Frontend (React 18 SPA + Vite)
    ↓ HTTP Requests (Axios + JWT)
Backend API Layer (Express.js)
    ↓
Middleware Layer (Auth, CORS, Visitor Cookie, Rate Limiting)
    ↓
Validators Layer (authValidator, productValidator, bookingValidator, categoryValidator)
    ↓
Controllers Layer (authController, jewelleryController, bookingController, categoryController, cartController, paymentController)
    ↓
Services Layer (authService, jewelleryService, bookingService, categoryService, cartService, paymentService, auditLogService)
    ↓
Repositories Layer (userRepository, jewelleryRepository, bookingRepository, categoryRepository, cartRepository, auditLogRepository)
    ↓
Data Store Layer (MongoDB / Mongoose Schemas + Cloudinary CDN)
```

---

## Frontend Architecture

- **Component Organization**:
  - `components/admin/layout/`: Top navigation (`AdminHeader.jsx`) & Sidebar (`AdminSidebar.jsx`).
  - `components/admin/dashboard/`: Overview metrics cards & quick action widgets (`DashboardTab.jsx`).
  - `components/admin/products/`: Catalog inventory management & modal details (`JewelleryTab.jsx`, `JewelDetailsModal.jsx`).
  - `components/admin/bookings/`: Rental booking management, date validation, and invoice generation (`BookingsTab.jsx`, `BookingFormModal.jsx`, `InvoiceModal.jsx`).
  - `components/admin/users/`: User accounts & guest session inspection (`UsersTab.jsx`, `UserCartModal.jsx`, `UserOrdersModal.jsx`).
  - `components/admin/categories/`: Category catalog & type filters management (`CategoriesTab.jsx`, `TypesTab.jsx`).

- **Custom Hook Layer**:
  - `useAdminDashboard.js`: Master composition hook aggregating state for top-level view.
  - `useAdminProducts.js`, `useAdminBookings.js`, `useAdminUsers.js`, `useAdminCategories.js`, `useAdminAnalytics.js`: Modularized sub-domain state hooks.

---

## Backend Architecture & Layers

1. **Controller Layer**: Handles HTTP requests, parses headers/parameters, formats response structures, and invokes appropriate domain services.
2. **Service Layer**: Implements core business logic, booking calculations, discount percentage & amount logic, date conflict detection (`pickupDate <= eventDate <= returnDate`), status state machine transitions, and administrative audit logging.
3. **Repository Layer**: Encapsulates Mongoose database queries, indexes, pagination parameters, and CRUD operations.
4. **Validation Layer**: Validates incoming payload types, string/number constraints, required fields, and date logic before hitting domain services.
5. **Security & Middleware**:
   - `auth.js`: Validates stateless JWT tokens and enforces `admin` role-based access control.
   - `rateLimiter.js`: Rate limits authentication attempts (`/api/auth/login`, `/api/auth/register`).
   - `visitor.js`: Tracks anonymous guest visitor sessions via HTTP-only `visitor_id` cookies.

---

## Database & Indexing Strategy

- **Jewellery Collection**: Compound text indexes on `name`, `jewelId`, and `description`. Single-field indexes on `category`, `type`, `occasion`, `stoneName`, `availability`, `popularity`.
- **Booking Collection**: Compound index on `{ jewelleryIds: 1, status: 1, pickupDate: 1, returnDate: 1 }` for overlapping date reservation checks.
- **GuestCart Collection**: TTL index on `expiresAt` automatically purging abandoned guest carts after 90 days.
- **AdminAuditLog Collection**: Logs administrative CRUD operations for security and tracking.
