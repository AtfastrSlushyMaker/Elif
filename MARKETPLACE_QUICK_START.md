# Marketplace Quick Start Guide

This guide is the fastest way to run the marketplace locally and place a test order.

## Before You Start

Make sure you have:

1. Java 17+ installed
2. Node.js and npm installed
3. MySQL running locally

## 1. Load Demo Data

Import seed data (products and sample orders):

```bash
mysql -u root Elif < backend/community_demo_seed.sql
```

## 2. Start The Backend

From the project root:

### Windows (PowerShell)

```powershell
Set-Location backend
.\mvnw.cmd spring-boot:run
```

### macOS/Linux

```bash
cd backend
./mvnw spring-boot:run
```

Backend base URL: http://localhost:8087/elif

## 3. Start The Frontend

Open a second terminal and run:

```bash
cd frontend
npm install
npm start
```

Frontend URL: http://localhost:4200

## 4. Optional: Enable Stripe Card Payments

Create a `.env` file in either the project root or the `backend` folder:

```bash
STRIPE_SECRET_KEY=sk_test_xxx
```

Important:

1. Use a secret key (`sk_test_...` or `sk_live_...`), not a publishable key
2. If no key is set, cash-on-delivery still works

## 5. Quick Smoke Test

1. Open http://localhost:4200
2. Log in with a sample account
3. Go to Marketplace
4. Add products to cart
5. Checkout with cash-on-delivery or Stripe

## Key Frontend Routes

| Page | Route | What it does |
|------|-------|---------------|
| Marketplace Landing | `/front-office/marketplace` | Entry page with categories and cart summary |
| Product Listing | `/front-office/marketplace/products` | Browse, search, and add products |
| Shopping Cart | `/front-office/marketplace/cart` | Update cart and place orders |

## API Quick Reference

### Get all products

```bash
curl http://localhost:8087/elif/product
```

### Get active products only

```bash
curl http://localhost:8087/elif/product/active
```

### Search products

```bash
curl "http://localhost:8087/elif/product/search?keyword=dog"
```

### Create an order

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

## Sample Test Users

```text
Email: user1@elif.com
Password: password

Email: user5@elif.com
Password: password
```

## Troubleshooting

### Backend fails to start

Port 8087 may already be used. On Windows PowerShell:

```powershell
$listenPid = (Get-NetTCPConnection -LocalPort 8087 -State Listen | Select-Object -First 1 -ExpandProperty OwningProcess)
if ($listenPid) { Stop-Process -Id $listenPid -Force }
Set-Location backend
.\mvnw.cmd spring-boot:run
```

### Frontend cannot reach backend

1. Confirm backend is running on port 8087
2. Confirm frontend is running on port 4200
3. Check browser console for API errors

### Products are missing

1. Re-import `backend/community_demo_seed.sql`
2. Check MySQL connection settings
3. Verify backend starts without DB errors

## What Is Already Implemented

1. Full product catalog and category filtering
2. Search and cart persistence
3. Order creation and order management
4. Stock tracking and tax calculation
5. Authentication integration
6. Stripe hosted checkout with paid-session verification

You are ready to test end-to-end marketplace flows.
