# Marketplace Quick Start Guide

## 🚀 Getting Started

### 1. Database Setup
```bash
# Import the seed data (includes 15 products + sample orders)
mysql -u root Elif < backend/community_demo_seed.sql
```

### 2. Start Backend
```bash
cd backend
./mvnw spring-boot:run
# Backend runs on http://localhost:8087/elif
```

### 3. Start Frontend
```bash
cd frontend
npm install
ng serve
# Frontend runs on http://localhost:4200
```

---

## 📍 Key URLs

| Page | URL | Description |
|------|-----|-------------|
| Marketplace Landing | `/front-office/marketplace` | Hero page with categories and cart widget |
| Product Listing | `/front-office/marketplace/products` | Browse and search all products |
| Shopping Cart | `/front-office/marketplace/cart` | View, manage, and checkout |

---

## 🛍️ User Flow

```
1. Login/Register
2. Navigate to Marketplace
3. Browse products by category or search
4. Add items to cart
5. View cart and adjust quantities
6. Proceed to checkout
7. Order placed! (Status: PENDING)
```

---

## 💻 API Quick Reference

### Get All Products
```bash
curl http://localhost:8087/elif/product
```

### Get Active Products
```bash
curl http://localhost:8087/elif/product/active
```

### Search Products
```bash
curl "http://localhost:8087/elif/product/search?keyword=dog"
```

### Get Products by Category
```bash
curl "http://localhost:8087/elif/product/category/Food%20%26%20Feed"
```

### Create an Order
```bash
curl -X POST http://localhost:8087/elif/order/create \
  -H "Content-Type: application/json" \
  -d '{
    "userId": 1005,
    "items": [
      {"productId": 9001, "quantity": 2},
      {"productId": 9007, "quantity": 1}
    ]
  }'
```

### Get User Orders
```bash
curl http://localhost:8087/elif/order/user/1005
```

### Confirm an Order
```bash
curl -X PUT http://localhost:8087/elif/order/10001/confirm
```

---

## 📦 Sample Credentials

Use these to test the marketplace:

```
Email: user1@elif.com
Password: password

Email: user5@elif.com
Password: password
```

---

## 🎨 UI Components Overview

### Marketplace Landing Page
- Hero banner with action buttons
- Category cards (clickable)
- Cart summary widget
- How it works section

### Product Listing Page
- Search bar
- Category filter buttons
- Product grid (image, name, price, stock status)
- Add to cart buttons

### Shopping Cart Page
- Cart items with quantity controls
- Remove/Clear buttons
- Order summary (subtotal, tax, total)
- Checkout button

---

## ✨ Features Implemented

✅ Full product catalog system
✅ Shopping cart with persistent storage
✅ Order management
✅ Stock tracking
✅ Category filtering
✅ Product search
✅ Responsive design
✅ Tax calculation
✅ Authentication integration

---

## 🐛 Troubleshooting

### Cart not saving?
- Check browser's localStorage is enabled
- Verify all products are being added correctly

### Can't checkout?
- Ensure you're logged in
- Verify cart is not empty
- Check backend is running on port 8087

### Products not showing?
- Confirm database seed was imported
- Check backend database connection
- Verify frontend is pointing to correct API

### Stock issues?
- Ensure backend JPA is auto-creating tables
- Check product stock values in database

---

## 📝 Next Development Tasks

1. **Payment Integration**
   - Add Stripe or PayPal payment gateway
   - Update order status to CONFIRMED after payment

2. **Order Tracking**
   - Add order status updates to user profile
   - Send email notifications

3. **Advanced Features**
   - Wishlist functionality
   - Product reviews and ratings
   - Coupon codes and promotions

4. **Admin Dashboard**
   - Product management interface
   - Order management interface
   - Sales analytics

---

**Happy Shopping! 🎉**
