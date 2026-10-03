# Apila Jewels - REST API Documentation

Base URL: `http://localhost:5000/api`

## Health & System

### GET `/api/health`
- **Description**: Returns server operational status and timestamp.
- **Auth**: None
- **Response**:
```json
{
  "success": true,
  "status": "healthy",
  "timestamp": "2026-10-03T13:55:00.000Z",
  "service": "Apila Jewels API"
}
```

---

## Authentication Endpoints

### POST `/api/auth/register`
- **Description**: Register a new user account. Auto-merges guest cart items if `visitor_id` cookie is present.
- **Rate Limit**: Max 20 requests per 15 minutes.
- **Request Body**:
```json
{
  "name": "Customer Name",
  "email": "customer@example.com",
  "phone": "9876543210",
  "password": "secretpassword"
}
```
- **Response**: `{ "success": true, "token": "JWT...", "user": { ... } }`

### POST `/api/auth/login`
- **Description**: Authenticate with phone or email.
- **Rate Limit**: Max 20 requests per 15 minutes.
- **Request Body**:
```json
{
  "emailOrPhone": "9876543210",
  "password": "secretpassword"
}
```

---

## Product Endpoints

### GET `/api/jewellery`
- **Description**: Search and list catalog jewelry items. Supports server-side pagination and filters.
- **Query Parameters**: `category`, `type`, `occasion`, `stoneName`, `search`, `page`, `limit`
- **Response**:
```json
{
  "success": true,
  "count": 20,
  "pagination": { "page": 1, "limit": 20, "total": 150, "totalPages": 8 },
  "data": [ ... ]
}
```

### POST `/api/jewellery`
- **Description**: Create new jewelry listing (Multipart form-data).
- **Auth**: Admin (`Bearer JWT`)

---

## Booking Endpoints

### POST `/api/bookings`
- **Description**: Place a new jewelry rental or purchase reservation. Validates `pickupDate <= eventDate <= returnDate` and checks for overlapping reserved dates.
- **Request Body**:
```json
{
  "jewelleryIds": ["60d5ecb8b5c9c80015f8e001"],
  "tempJewelleries": [],
  "pickupDate": "2026-10-10",
  "eventDate": "2026-10-12",
  "returnDate": "2026-10-15",
  "rentalAmount": 1500,
  "advancePaid": 500,
  "customerDetails": {
    "name": "Customer Name",
    "phone": "9876543210",
    "address": "Chennai, Tamil Nadu"
  }
}
```

---

## Payment Endpoints

### GET `/api/payments/booking/:bookingId`
- **Description**: Get financial payment summary for a booking.
- **Auth**: Protected

### POST `/api/payments/record`
- **Description**: Record manual advance/balance payment.
- **Auth**: Admin
