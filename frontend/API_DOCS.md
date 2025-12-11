# Upstart Platform - API Documentation

This is a client-side only application using **localStorage** for data persistence. All data is stored locally in the browser.

---

## ⚠️ Important Note
**This is currently a client-side only application.** All functions use localStorage instead of real API endpoints. The endpoints below are provided as reference for future backend implementation.

---

## Table of Contents
1. [Data Models](#data-models)
2. [Authentication Endpoints](#authentication-endpoints)
3. [Product Endpoints](#product-endpoints)
4. [Vendor Endpoints](#vendor-endpoints)
5. [Cart Endpoints](#cart-endpoints)
6. [Chat & Messaging Endpoints](#chat--messaging-endpoints)
7. [Wallet & Transactions Endpoints](#wallet--transactions-endpoints)
8. [User Profile Endpoints](#user-profile-endpoints)
9. [Analytics Endpoints](#analytics-endpoints)
10. [Leaderboard Endpoints](#leaderboard-endpoints)
11. [Notification Endpoints](#notification-endpoints)
12. [Video Viewer Endpoints](#video-viewer-endpoints)

---

## Data Models

### User
```javascript
{
  id: number,
  username: string,
  email: string,
  password: string,
  phone: string,
  university: string,
  role: "buyer" | "vendor",
  profilePicture: string | null,
  walletBalance: number,
  createdAt: string (ISO date)
}
```

### Vendor
```javascript
{
  id: number,
  name: string,
  email: string,
  phone: string,
  university: string,
  department: string,
  role: "vendor",
  profilePicture: string | null,
  averageRating: number,
  totalSales: number,
  reviews: number,
  walletBalance: number,
  createdAt: string (ISO date)
}
```

### Product
```javascript
{
  id: number,
  name: string,
  price: number,
  category: string,
  description: string,
  color: string,
  location: string,
  quantity: number,
  images: string[],
  vendorId: number,
  rating: number,
  reviews: number,
  viewCount: number,
  likes: number,
  comments: Comment[],
  videoUrl: string | null,
  createdAt: string (ISO date)
}
```

### Comment
```javascript
{
  user: string,
  rating: number,
  text: string,
  timestamp: string
}
```

### Message
```javascript
{
  id: number,
  fromId: number (userId),
  toId: number (userId),
  text: string,
  date: string (ISO date)
}
```

### Cart Item
```javascript
{
  productId: number,
  quantity: number,
  addedAt: string (ISO date)
}
```

### Transaction
```javascript
{
  userId: number,
  type: "credit" | "debit",
  amount: number,
  description: string,
  date: string (ISO date)
}
```

### Notification
```javascript
{
  id: number,
  userId: number,
  type: string,
  message: string,
  read: boolean,
  date: string (ISO date)
}
```

---

## REST API Endpoints Reference

### Base URL
```
http://localhost:3000/api
```

---

## Authentication Endpoints

### POST `/api/auth/register`
Register a new user account.

**Request:**
```json
{
  "username": "john_doe",
  "email": "john@student.edu",
  "password": "securePassword123",
  "phone": "5551234567",
  "university": "State University",
  "role": "buyer" | "vendor"
}
```

**Response (201):**
```json
{
  "id": 1,
  "username": "john_doe",
  "email": "john@student.edu",
  "phone": "5551234567",
  "university": "State University",
  "role": "buyer",
  "profilePicture": null,
  "walletBalance": 0,
  "createdAt": "2025-12-04T10:00:00Z"
}
```

**Current Implementation:** `signup.js` (form validation only, localStorage storage)

---

### POST `/api/auth/login`
Authenticate user and return session token.

**Request:**
```json
{
  "email": "john@student.edu",
  "password": "securePassword123"
}
```

**Response (200):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": 1,
    "username": "john_doe",
    "email": "john@student.edu",
    "role": "buyer",
    "walletBalance": 150.00
  }
}
```

**Current Implementation:** `login.js` (form validation, localStorage storage)

---

### POST `/api/auth/logout`
Logout current user.

**Response (200):**
```json
{
  "message": "Logged out successfully"
}
```

**Current Implementation:** `shared-nav.js` (button click handler)

---

### POST `/api/auth/validate`
Validate current session token.

**Response (200):**
```json
{
  "valid": true,
  "user": {...}
}
```

**Current Implementation:** `analytics.js` - `checkAuth()`

---

## Product Endpoints

### GET `/api/products`
Get all products with optional filters.

**Query Parameters:**
- `category`: Filter by category (electronics, furniture, clothing, sports, books)
- `vendorId`: Filter by vendor ID
- `search`: Search product name
- `limit`: Results per page (default: 50)
- `offset`: Pagination offset (default: 0)

**Response (200):**
```json
{
  "data": [
    {
      "id": 1,
      "name": "MacBook Pro 13\"",
      "price": 899,
      "category": "electronics",
      "description": "Barely used, excellent condition.",
      "color": "Space Gray",
      "location": "Library Building",
      "quantity": 1,
      "images": ["/macbook.jpg"],
      "vendorId": 101,
      "rating": 4.8,
      "reviews": 12,
      "viewCount": 234,
      "likes": 45,
      "videoUrl": null,
      "createdAt": "2023-10-01T00:00:00Z"
    }
  ],
  "total": 150,
  "limit": 50,
  "offset": 0
}
```

**Current Implementation:** `index.js` - `renderProducts()`, localStorage source

---

### GET `/api/products/:id`
Get single product details.

**Response (200):**
```json
{
  "id": 1,
  "name": "MacBook Pro 13\"",
  "price": 899,
  "category": "electronics",
  "description": "Barely used, excellent condition. Includes charger and box.",
  "color": "Space Gray",
  "location": "Library Building",
  "quantity": 1,
  "images": ["/macbook.jpg"],
  "vendorId": 101,
  "rating": 4.8,
  "reviews": 12,
  "viewCount": 234,
  "likes": 45,
  "comments": [
    {
      "user": "Alex Chen",
      "rating": 5,
      "text": "Perfect condition! Fast delivery.",
      "timestamp": "2 days ago"
    }
  ],
  "videoUrl": "https://commondatastorage.googleapis.com/gtv-videos-library/sample/BigBuckBunny.mp4",
  "createdAt": "2023-10-01T00:00:00Z"
}
```

**Current Implementation:** `index.js` - `openProductModal()`

---

### POST `/api/products`
Create new product (vendor only).

**Headers:**
```
Authorization: Bearer {token}
```

**Request:**
```json
{
  "name": "New Product",
  "price": 99.99,
  "category": "electronics",
  "description": "Product description",
  "color": "Black",
  "location": "Campus Location",
  "quantity": 5,
  "images": ["url1", "url2"]
}
```

**Response (201):**
```json
{
  "id": 20,
  "name": "New Product",
  "price": 99.99,
  "vendorId": 101,
  "createdAt": "2025-12-04T10:00:00Z"
}
```

**Current Implementation:** `inventory.js` (implied)

---

### PUT `/api/products/:id`
Update product (vendor only).

**Headers:**
```
Authorization: Bearer {token}
```

**Request:**
```json
{
  "price": 89.99,
  "quantity": 3,
  "description": "Updated description"
}
```

**Response (200):**
```json
{
  "id": 20,
  "name": "New Product",
  "price": 89.99,
  "quantity": 3,
  "updatedAt": "2025-12-04T11:00:00Z"
}
```

---

### DELETE `/api/products/:id`
Delete product (vendor only).

**Headers:**
```
Authorization: Bearer {token}
```

**Response (204):** No content

---

## Vendor Endpoints

### GET `/api/vendors`
Get all vendors.

**Query Parameters:**
- `search`: Search vendor name
- `rating`: Filter by minimum rating
- `limit`: Results per page
- `offset`: Pagination offset

**Response (200):**
```json
{
  "data": [
    {
      "id": 101,
      "name": "TechSmart",
      "email": "tech@upstart.com",
      "phone": "5551234567",
      "university": "State University",
      "department": "Computer Science",
      "profilePicture": null,
      "averageRating": 4.7,
      "totalSales": 25,
      "reviews": 50,
      "createdAt": "2024-01-15T00:00:00Z"
    }
  ],
  "total": 15
}
```

**Current Implementation:** `index.js` - localStorage source

---

### GET `/api/vendors/:id`
Get vendor profile and products.

**Response (200):**
```json
{
  "vendor": {
    "id": 101,
    "name": "TechSmart",
    "email": "tech@upstart.com",
    "phone": "5551234567",
    "university": "State University",
    "department": "Computer Science",
    "profilePicture": null,
    "averageRating": 4.7,
    "totalSales": 25,
    "reviews": 50
  },
  "products": [
    {
      "id": 1,
      "name": "MacBook Pro 13\"",
      "price": 899,
      "rating": 4.8,
      "reviews": 12
    }
  ]
}
```

**Current Implementation:** `vendor-profile.js` - `loadVendorProfile()`

---

### GET `/api/vendors/:id/videos`
Get all videos from vendor's products.

**Response (200):**
```json
{
  "data": [
    {
      "id": 1,
      "productName": "MacBook Pro 13\"",
      "videoUrl": "https://example.com/video.mp4",
      "likes": 45,
      "viewCount": 234,
      "comments": 12
    }
  ],
  "total": 2
}
```

**Current Implementation:** `vendor-profile.js` - `loadVendorVideos()`

---

## Cart Endpoints

### GET `/api/cart`
Get user's shopping cart.

**Headers:**
```
Authorization: Bearer {token}
```

**Response (200):**
```json
{
  "items": [
    {
      "productId": 1,
      "quantity": 2,
      "product": {
        "id": 1,
        "name": "MacBook Pro 13\"",
        "price": 899,
        "images": ["/macbook.jpg"]
      },
      "addedAt": "2025-12-04T09:00:00Z"
    }
  ],
  "total": 1798.00,
  "itemCount": 2
}
```

**Current Implementation:** `cart.js` - localStorage source

---

### POST `/api/cart/items`
Add product to cart.

**Headers:**
```
Authorization: Bearer {token}
```

**Request:**
```json
{
  "productId": 1,
  "quantity": 2
}
```

**Response (201):**
```json
{
  "message": "Added to cart",
  "cart": {...}
}
```

**Current Implementation:** `index.js` - `addToCart()`

---

### PUT `/api/cart/items/:productId`
Update cart item quantity.

**Headers:**
```
Authorization: Bearer {token}
```

**Request:**
```json
{
  "quantity": 3
}
```

**Response (200):**
```json
{
  "message": "Cart updated",
  "cart": {...}
}
```

---

### DELETE `/api/cart/items/:productId`
Remove item from cart.

**Headers:**
```
Authorization: Bearer {token}
```

**Response (204):** No content

---

### DELETE `/api/cart`
Clear entire cart.

**Headers:**
```
Authorization: Bearer {token}
```

**Response (204):** No content

---

## Chat & Messaging Endpoints

### GET `/api/messages`
Get all conversations for current user.

**Headers:**
```
Authorization: Bearer {token}
```

**Response (200):**
```json
{
  "conversations": [
    {
      "participantId": 101,
      "participantName": "TechSmart",
      "lastMessage": "Hi! Is the MacBook still available?",
      "lastMessageTime": "2025-12-04T08:30:00Z",
      "unreadCount": 2
    }
  ]
}
```

**Current Implementation:** `chat.js` - `getConversations()`

---

### GET `/api/messages/:userId`
Get message history with specific user.

**Headers:**
```
Authorization: Bearer {token}
```

**Query Parameters:**
- `limit`: Number of messages (default: 50)
- `offset`: Pagination offset (default: 0)

**Response (200):**
```json
{
  "messages": [
    {
      "id": 1,
      "fromId": 1,
      "toId": 101,
      "text": "Hi! Is the MacBook still available?",
      "date": "2025-12-04T08:30:00Z",
      "read": true
    }
  ],
  "total": 8
}
```

**Current Implementation:** `chat.js` - `loadMessages()`

---

### POST `/api/messages`
Send a message.

**Headers:**
```
Authorization: Bearer {token}
```

**Request:**
```json
{
  "toId": 101,
  "text": "Hi! Is the MacBook still available?"
}
```

**Response (201):**
```json
{
  "id": 1,
  "fromId": 1,
  "toId": 101,
  "text": "Hi! Is the MacBook still available?",
  "date": "2025-12-04T08:30:00Z"
}
```

**Current Implementation:** `chat.js` - Send button click handler

---

### PUT `/api/messages/:id/read`
Mark message as read.

**Headers:**
```
Authorization: Bearer {token}
```

**Response (200):**
```json
{
  "message": "Message marked as read"
}
```

---

## Wallet & Transactions Endpoints

### GET `/api/wallet`
Get wallet balance and account info.

**Headers:**
```
Authorization: Bearer {token}
```

**Response (200):**
```json
{
  "balance": 250.50,
  "currency": "USD",
  "bankAccount": "****5678",
  "accountHolder": "John Doe"
}
```

**Current Implementation:** `wallet.js` - `loadWalletData()`

---

### GET `/api/transactions`
Get transaction history.

**Headers:**
```
Authorization: Bearer {token}
```

**Query Parameters:**
- `type`: Filter by "credit" or "debit"
- `limit`: Number of transactions
- `offset`: Pagination offset

**Response (200):**
```json
{
  "transactions": [
    {
      "id": 1,
      "type": "credit",
      "amount": 100,
      "description": "Added to wallet",
      "date": "2025-12-04T08:00:00Z"
    }
  ],
  "total": 10
}
```

**Current Implementation:** `wallet.js` - `loadTransactionHistory()`

---

### POST `/api/wallet/add-money`
Add funds to wallet.

**Headers:**
```
Authorization: Bearer {token}
```

**Request:**
```json
{
  "amount": 100,
  "paymentMethod": "credit_card",
  "cardToken": "tok_visa"
}
```

**Response (201):**
```json
{
  "transaction": {
    "id": 2,
    "type": "credit",
    "amount": 100,
    "date": "2025-12-04T09:00:00Z"
  },
  "newBalance": 350.50
}
```

**Current Implementation:** `wallet.js` - Add money form

---

### POST `/api/wallet/withdraw`
Withdraw funds from wallet.

**Headers:**
```
Authorization: Bearer {token}
```

**Request:**
```json
{
  "amount": 50,
  "bankAccount": "1234567890",
  "routingNumber": "021000021"
}
```

**Response (201):**
```json
{
  "transaction": {
    "id": 3,
    "type": "debit",
    "amount": 50,
    "date": "2025-12-04T09:15:00Z"
  },
  "newBalance": 300.50
}
```

**Current Implementation:** `wallet.js` - Withdraw form

---

## User Profile Endpoints

### GET `/api/users/:id`
Get user profile.

**Headers:**
```
Authorization: Bearer {token}
```

**Response (200):**
```json
{
  "id": 1,
  "username": "john_doe",
  "email": "john@student.edu",
  "phone": "5551234567",
  "university": "State University",
  "role": "buyer",
  "profilePicture": "url",
  "walletBalance": 250.50,
  "createdAt": "2025-12-04T00:00:00Z"
}
```

**Current Implementation:** `profile.js` - `loadProfile()`

---

### PUT `/api/users/:id`
Update user profile.

**Headers:**
```
Authorization: Bearer {token}
```

**Request:**
```json
{
  "username": "john_doe_updated",
  "phone": "5559876543",
  "profilePicture": "url"
}
```

**Response (200):**
```json
{
  "id": 1,
  "username": "john_doe_updated",
  "phone": "5559876543",
  "updatedAt": "2025-12-04T10:00:00Z"
}
```

---

## Analytics Endpoints

### GET `/api/analytics/dashboard`
Get vendor analytics dashboard.

**Headers:**
```
Authorization: Bearer {token}
```

**Response (200):**
```json
{
  "totalSales": 150,
  "totalRevenue": 35000.00,
  "totalViews": 2500,
  "averageRating": 4.7,
  "reviewCount": 50
}
```

**Current Implementation:** `analytics.js` - `loadAnalytics()`

---

### GET `/api/analytics/sales-chart`
Get sales data for chart.

**Headers:**
```
Authorization: Bearer {token}
```

**Query Parameters:**
- `period`: "week" | "month" | "year"

**Response (200):**
```json
{
  "labels": ["Mon", "Tue", "Wed", "Thu", "Fri"],
  "data": [10, 15, 12, 20, 18]
}
```

**Current Implementation:** `analytics.js` - `drawSalesChart()`

---

### GET `/api/analytics/top-products`
Get top performing products.

**Headers:**
```
Authorization: Bearer {token}
```

**Response (200):**
```json
{
  "products": [
    {
      "id": 1,
      "name": "MacBook Pro 13\"",
      "sales": 15,
      "revenue": 13485.00,
      "rating": 4.8
    }
  ]
}
```

**Current Implementation:** `analytics.js` - `loadTopProducts()`

---

## Leaderboard Endpoints

### GET `/api/leaderboard/vendors`
Get top vendors ranked.

**Query Parameters:**
- `sortBy`: "rating" | "sales" | "reviews"
- `limit`: Top N vendors

**Response (200):**
```json
{
  "vendors": [
    {
      "rank": 1,
      "id": 105,
      "name": "Audio Pro",
      "averageRating": 4.9,
      "totalSales": 42,
      "reviews": 75
    }
  ]
}
```

**Current Implementation:** `leaderboard.js` - `loadLeaderboard()`

---

### GET `/api/leaderboard/products`
Get top products ranked.

**Query Parameters:**
- `sortBy`: "rating" | "likes" | "views"
- `limit`: Top N products

**Response (200):**
```json
{
  "products": [
    {
      "rank": 1,
      "id": 1,
      "name": "MacBook Pro 13\"",
      "price": 899,
      "rating": 4.8,
      "likes": 45,
      "viewCount": 234
    }
  ]
}
```

---

## Notification Endpoints

### GET `/api/notifications`
Get user notifications.

**Headers:**
```
Authorization: Bearer {token}
```

**Query Parameters:**
- `unread`: true (get only unread)

**Response (200):**
```json
{
  "notifications": [
    {
      "id": 1,
      "type": "message",
      "message": "New message from TechSmart",
      "read": false,
      "date": "2025-12-04T08:30:00Z"
    }
  ]
}
```

---

### PUT `/api/notifications/:id/read`
Mark notification as read.

**Headers:**
```
Authorization: Bearer {token}
```

**Response (200):**
```json
{
  "message": "Notification marked as read"
}
```

---

### DELETE `/api/notifications/:id`
Delete notification.

**Headers:**
```
Authorization: Bearer {token}
```

**Response (204):** No content

---

## Video Viewer Endpoints

### GET `/api/videos`
Get all videos across platform.

**Query Parameters:**
- `vendorId`: Filter by vendor
- `limit`: Results per page
- `offset`: Pagination

**Response (200):**
```json
{
  "videos": [
    {
      "id": 1,
      "productId": 1,
      "productName": "MacBook Pro 13\"",
      "vendorId": 101,
      "videoUrl": "https://example.com/video.mp4",
      "likes": 45,
      "viewCount": 234,
      "commentCount": 12,
      "createdAt": "2025-12-01T00:00:00Z"
    }
  ]
}
```

**Current Implementation:** `vendor-profile.js` - `loadVendorVideos()`

---

### POST `/api/videos/:id/like`
Like a video.

**Headers:**
```
Authorization: Bearer {token}
```

**Response (200):**
```json
{
  "liked": true,
  "likes": 46
}
```

**Current Implementation:** `video-viewer.js` - `toggleLikeVideo()`

---

### POST `/api/videos/:id/comments`
Add comment to video.

**Headers:**
```
Authorization: Bearer {token}
```

**Request:**
```json
{
  "text": "Great product!",
  "rating": 5
}
```

**Response (201):**
```json
{
  "comment": {
    "id": 100,
    "author": "john_doe",
    "text": "Great product!",
    "rating": 5,
    "date": "2025-12-04T09:30:00Z"
  },
  "totalComments": 13
}
```

**Current Implementation:** `video-viewer.js` - `submitVideoComment()`

---

### GET `/api/videos/:id/comments`
Get video comments.

**Query Parameters:**
- `limit`: Comments per page
- `offset`: Pagination

**Response (200):**
```json
{
  "comments": [
    {
      "id": 1,
      "author": "Alex Chen",
      "text": "Perfect condition! Fast delivery.",
      "rating": 5,
      "date": "2025-12-02T00:00:00Z"
    }
  ],
  "total": 12
}
```

**Current Implementation:** `video-viewer.js` - `loadVideoComments()`

---

## Error Responses

All endpoints follow standard HTTP status codes:

### 400 Bad Request
```json
{
  "error": "Invalid request",
  "message": "Missing required field: email"
}
```

### 401 Unauthorized
```json
{
  "error": "Unauthorized",
  "message": "Token expired or invalid"
}
```

### 403 Forbidden
```json
{
  "error": "Forbidden",
  "message": "You don't have permission to access this resource"
}
```

### 404 Not Found
```json
{
  "error": "Not found",
  "message": "Product with ID 999 not found"
}
```

### 500 Internal Server Error
```json
{
  "error": "Server error",
  "message": "An unexpected error occurred"
}
```

---

## Authentication

All endpoints requiring authentication use Bearer token in Authorization header:

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

Token is obtained from `/api/auth/login` endpoint.

---

## Rate Limiting

Suggested rate limits for backend implementation:
- Authentication endpoints: 5 requests per minute
- Data endpoints: 100 requests per minute
- Search endpoints: 30 requests per minute

---

## CORS Headers

All endpoints should include:
```
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS
Access-Control-Allow-Headers: Content-Type, Authorization
```

---

## Pagination

Endpoints supporting pagination use:
- `limit`: Items per page (default: 50, max: 500)
- `offset`: Number of items to skip (default: 0)

Example:
```
GET /api/products?limit=20&offset=40
```

---



### `initializeAppData()`
**Location:** `index.js`  
**Description:** Initializes sample products and vendors in localStorage if they don't exist.  
**Returns:** void  
**Usage:** Call on app startup

```javascript
initializeAppData()
```

### `isValidEmail(email)`
**Location:** `login.js`, `signup.js`  
**Description:** Validates email format using regex.  
**Parameters:**
- `email` (string): Email to validate

**Returns:** boolean

```javascript
if (isValidEmail("user@example.com")) {
  // Valid email
}
```

### `isValidPhone(phone)`
**Location:** `login.js`, `signup.js`  
**Description:** Validates phone format (10-15 digits).  
**Parameters:**
- `phone` (string): Phone number to validate

**Returns:** boolean

```javascript
if (isValidPhone("5551234567")) {
  // Valid phone
}
```

### `checkAuth()`
**Location:** `analytics.js`  
**Description:** Checks if user is authenticated and is a vendor.  
**Returns:** Object (current vendor) or null

```javascript
const vendor = checkAuth()
if (!vendor) {
  window.location.href = "login.html"
}
```

---

## Product APIs

### `getVendor(vendorId)`
**Location:** `index.js`  
**Description:** Retrieves vendor information by ID.  
**Parameters:**
- `vendorId` (number): Vendor ID

**Returns:** Vendor object or undefined

```javascript
const vendor = getVendor(101)
```

### `renderProducts(products)`
**Location:** `index.js`  
**Description:** Renders product grid on the home page.  
**Parameters:**
- `products` (Product[] | null): Optional array of products to render. If null, uses all products from localStorage

**Returns:** void

```javascript
renderProducts() // Render all products
renderProducts(filteredProducts) // Render filtered products
```

### `openProductModal(productId)`
**Location:** `index.js`, `analytics.js`, `vendor-profile.js`  
**Description:** Opens product detail modal.  
**Parameters:**
- `productId` (number): Product ID to display

**Returns:** void

```javascript
openProductModal(1)
```

### `closeProductModal()`
**Location:** `index.js`, `analytics.js`, `vendor-profile.js`  
**Description:** Closes the product modal.  
**Returns:** void

```javascript
closeProductModal()
```

### `setupCategoryFilters()`
**Location:** `index.js`  
**Description:** Sets up product category filtering functionality.  
**Returns:** void

```javascript
setupCategoryFilters()
```

---

## Vendor APIs

### `loadVendorProfile()`
**Location:** `vendor-profile.js`  
**Description:** Loads and displays vendor profile information.  
**URL Parameters:** `vendorId` (from query string)  
**Returns:** void

```javascript
// Called automatically when vendor-profile.html loads
// Expects: window.location.search contains ?vendorId=101
loadVendorProfile()
```

### `loadVendorProducts()`
**Location:** `vendor-profile.js`  
**Description:** Loads and displays all products from a specific vendor.  
**Returns:** void

```javascript
loadVendorProducts()
```

### `loadVendorVideos()`
**Location:** `vendor-profile.js`  
**Description:** Loads and displays videos from vendor's products.  
**Returns:** void

```javascript
loadVendorVideos()
```

---

## Cart APIs

### `addToCart(productId)`
**Location:** `index.js`  
**Description:** Adds product to shopping cart.  
**Parameters:**
- `productId` (number): Product ID to add

**Returns:** void

```javascript
addToCart(1)
```

### `updateCartBadge()`
**Location:** `index.js`  
**Description:** Updates cart count badge in navbar.  
**Returns:** void

```javascript
updateCartBadge()
```

### `updateWalletBalance()`
**Location:** `index.js`  
**Description:** Updates wallet balance display in navbar.  
**Returns:** void

```javascript
updateWalletBalance()
```

---

## Chat & Messaging APIs

### `initializeChat()`
**Location:** `chat.js`  
**Description:** Initializes chat system and loads conversations.  
**Returns:** void

```javascript
initializeChat()
```

### `initializeDummyConversations()`
**Location:** `chat.js`  
**Description:** Creates sample messages if none exist.  
**Returns:** void

```javascript
initializeDummyConversations()
```

### `getConversations()`
**Location:** `chat.js`  
**Description:** Retrieves all conversations for current user grouped by participant.  
**Returns:** Object (keys are participantIds, values are arrays of messages)

```javascript
const conversations = getConversations()
// Returns: { "101": [msg1, msg2], "102": [msg3, msg4] }
```

### `loadConversations()`
**Location:** `chat.js`  
**Description:** Loads and displays all conversations in sidebar.  
**Returns:** void

```javascript
loadConversations()
```

### `openConversation(participantId, participantName)`
**Location:** `chat.js`  
**Description:** Opens chat conversation with specific participant.  
**Parameters:**
- `participantId` (number): User ID of conversation partner
- `participantName` (string): Display name of partner

**Returns:** void

```javascript
openConversation(101, "TechSmart Vendor")
```

### `loadMessages()`
**Location:** `chat.js`  
**Description:** Loads and displays messages for current conversation.  
**Returns:** void

```javascript
loadMessages()
```

### `sendMessage()`
**Location:** `chat.js` (event listener on #sendBtn)  
**Description:** Sends message in current conversation.  
**Returns:** void (triggered by send button click)

```javascript
// Automatically triggered when send button is clicked
// Uses: currentConversationId (global variable)
```

---

## Wallet & Transactions APIs

### `loadWalletData()`
**Location:** `wallet.js`  
**Description:** Loads and displays wallet balance and transaction history.  
**Returns:** void

```javascript
loadWalletData()
```

### `loadTransactionHistory()`
**Location:** `wallet.js`  
**Description:** Loads user's transaction history.  
**Returns:** void

```javascript
loadTransactionHistory()
```

### `addMoney(amount)`
**Location:** `wallet.js` (event listener)  
**Description:** Adds money to wallet.  
**Parameters:**
- `amount` (number): Amount to add

**Returns:** void

```javascript
// Triggered by "Add Money" form submission
```

### `withdraw(amount, bankAccount, routingNumber)`
**Location:** `wallet.js` (event listener)  
**Description:** Withdraws money from wallet to bank account.  
**Parameters:**
- `amount` (number): Amount to withdraw
- `bankAccount` (string): Bank account number
- `routingNumber` (string): Routing number

**Returns:** void

```javascript
// Triggered by "Withdraw" form submission
```

### `closeDrawer(drawerId)`
**Location:** `wallet.js`  
**Description:** Closes a specific drawer (add money or withdraw).  
**Parameters:**
- `drawerId` (string): Drawer element ID

**Returns:** void

```javascript
closeDrawer("addMoneyDrawer")
```

### `closeAllDrawers()`
**Location:** `wallet.js`  
**Description:** Closes all open drawers.  
**Returns:** void

```javascript
closeAllDrawers()
```

---

## User Profile APIs

### `loadProfile()`
**Location:** `profile.js`  
**Description:** Loads and displays current user's profile information.  
**Returns:** void

```javascript
loadProfile()
```

### `updateProfile(userData)`
**Location:** `profile.js` (implied)  
**Description:** Updates user profile information.  
**Parameters:**
- `userData` (Object): User data to update

**Returns:** void

---

## Analytics APIs

### `loadAnalytics()`
**Location:** `analytics.js`  
**Description:** Loads vendor analytics dashboard with sales, revenue, and views data.  
**Returns:** void

```javascript
loadAnalytics()
```

### `drawSalesChart()`
**Location:** `analytics.js`  
**Description:** Renders sales chart visualization.  
**Returns:** void

```javascript
drawSalesChart()
```

### `drawCategoryChart(products)`
**Location:** `analytics.js`  
**Description:** Renders product category distribution chart.  
**Parameters:**
- `products` (Product[]): Array of vendor's products

**Returns:** void

```javascript
const vendorProducts = products.filter(p => p.vendorId === currentUser.id)
drawCategoryChart(vendorProducts)
```

### `loadTopProducts(products)`
**Location:** `analytics.js`  
**Description:** Loads and displays top performing products.  
**Parameters:**
- `products` (Product[]): Array of products to analyze

**Returns:** void

```javascript
loadTopProducts(vendorProducts)
```

### `loadRecentOrders()`
**Location:** `analytics.js`  
**Description:** Loads and displays recent orders/transactions.  
**Returns:** void

```javascript
loadRecentOrders()
```

---

## Leaderboard APIs

### `loadLeaderboard()`
**Location:** `leaderboard.js` (implied)  
**Description:** Loads top vendors and products ranked by various metrics.  
**Returns:** void

```javascript
loadLeaderboard()
```

---

## Notification APIs

### `loadNotifications()`
**Location:** `shared-nav.js` (implied)  
**Description:** Loads user's notifications.  
**Returns:** void

```javascript
loadNotifications()
```

### Notification Triggers:
- Order placed
- New message received
- Product listed
- Rating received

---

## Video Viewer APIs

### `initVideoViewer(videos, startIndex)`
**Location:** `video-viewer.js`  
**Description:** Initializes and opens video viewer modal in TikTok-style interface.  
**Parameters:**
- `videos` (Product[]): Array of products with videoUrl
- `startIndex` (number): Starting video index (default: 0)

**Returns:** void

```javascript
const videosWithUrls = products.filter(p => p.vendorId === 101 && p.videoUrl)
initVideoViewer(videosWithUrls, 0)
```

### `openVideoViewer()`
**Location:** `video-viewer.js`  
**Description:** Opens the video modal if not already open.  
**Returns:** void

```javascript
openVideoViewer()
```

### `closeVideoViewer()`
**Location:** `video-viewer.js`  
**Description:** Closes the video modal.  
**Returns:** void

```javascript
closeVideoViewer()
```

### `displayCurrentVideo()`
**Location:** `video-viewer.js`  
**Description:** Displays current video data in modal.  
**Returns:** void

```javascript
displayCurrentVideo()
```

### `loadVideoComments()`
**Location:** `video-viewer.js`  
**Description:** Loads and displays comments for current video.  
**Returns:** void

```javascript
loadVideoComments()
```

### `toggleLikeVideo()`
**Location:** `video-viewer.js`  
**Description:** Toggles like status for current video.  
**Returns:** void

```javascript
toggleLikeVideo()
```

### `submitVideoComment()`
**Location:** `video-viewer.js`  
**Description:** Submits a comment on current video.  
**Returns:** void

```javascript
submitVideoComment()
```

### `nextVideo()`
**Location:** `video-viewer.js`  
**Description:** Navigates to next video in viewer.  
**Returns:** void

```javascript
nextVideo()
```

### `previousVideo()`
**Location:** `video-viewer.js`  
**Description:** Navigates to previous video in viewer.  
**Returns:** void

```javascript
previousVideo()
```

---

## Navigation APIs

### `initializeNavigation()`
**Location:** `shared-nav.js`  
**Description:** Initializes shared navigation component with dropdowns and mobile menu.  
**Returns:** void

```javascript
initializeNavigation()
```

### `updateVendorMenu()`
**Location:** `index.js`  
**Description:** Shows/hides vendor-only menu items based on user role.  
**Returns:** void

```javascript
updateVendorMenu()
```

---

## localStorage Keys Reference

| Key | Type | Description |
|-----|------|-------------|
| `products` | JSON Array | All products available for sale |
| `vendors` | JSON Array | All vendor profiles |
| `users` | JSON Array | All user accounts |
| `currentUser` | JSON Object | Currently logged-in user |
| `cart` | JSON Array | Items in shopping cart |
| `messages` | JSON Array | All messages/conversations |
| `transactions` | JSON Array | User transaction history |
| `notifications` | JSON Array | User notifications |
| `selectedVendor` | String | Last selected vendor ID |

---

## Data Flow Examples

### Buying a Product
```javascript
1. renderProducts() - Display products
2. openProductModal(productId) - Show product details
3. addToCart(productId) - Add to cart
4. updateCartBadge() - Update cart count
5. Navigate to cart.html or checkout
```

### Messaging a Vendor
```javascript
1. loadVendorProfile() - View vendor
2. Click "Contact" button
3. openConversation(vendorId, vendorName) - Open chat
4. loadMessages() - Display messages
5. sendMessage() - Send message (triggered by send button)
```

### Vendor Analytics
```javascript
1. checkAuth() - Verify vendor
2. loadAnalytics() - Load dashboard
3. drawSalesChart() - Render sales chart
4. drawCategoryChart() - Render category chart
5. loadTopProducts() - Show top products
6. loadRecentOrders() - Show recent transactions
```

### Video Viewing
```javascript
1. loadVendorVideos() - Get vendor's videos
2. initVideoViewer(videos, 0) - Open viewer
3. displayCurrentVideo() - Show current video
4. loadVideoComments() - Load comments
5. toggleLikeVideo() / submitVideoComment() / nextVideo() - Interact
```

---

## Error Handling

Most functions handle errors silently or display alerts. Common error scenarios:

- **Invalid vendor ID**: Returns null from `getVendor()`
- **No authentication**: `checkAuth()` returns null
- **Network-dependent**: All operations use localStorage (local-only)
- **Missing product**: Product modal won't open if ID not found

---

## Notes

- This is a **client-side only** application
- All data persists in browser's localStorage
- No backend API calls are made
- Data is cleared when browser cache is cleared
- Maximum storage is typically 5-10MB per domain
- Phone validation accepts 10-15 digit numbers
- Email validation uses basic regex pattern

---

**Last Updated:** December 4, 2025  
**Version:** 1.0
