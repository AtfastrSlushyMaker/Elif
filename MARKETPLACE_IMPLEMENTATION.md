# Elif Community Marketplace Implementation

## Overview
A complete marketplace and shopping cart system has been implemented for the Elif community platform. Users can browse products, add them to their cart (panier), and checkout to place orders.

---

## Backend Implementation (Java/Spring Boot)

### Database Entities

#### 1. **Product** (`Product.java`)
- Stores product information
- Fields: id, name, description, category, price, stock, imageUrl, active, timestamps
- Categories: Food & Feed, Health Essentials, Accessories, Merchandise

#### 2. **Order** (`Order.java`)
- Represents a shopping order/cart
- Statuses: PENDING, CONFIRMED, SHIPPED, DELIVERED, CANCELLED
- Related to User via userId
- Contains OrderItems collection

#### 3. **OrderItem** (`OrderItem.java`)
- Individual line items in an order
- Stores product details at time of purchase (productId, productName, quantity, unitPrice, subtotal)
- Enables proper accounting even if product details change later

### Repositories
- `ProductRepository` - Query products by active status, category, search
- `OrderRepository` - Query orders by user ID
- `OrderItemRepository` - Basic CRUD operations

### Services

#### ProductService
- **Methods:**
  - `addProduct()` - Create new product (admin)
  - `updateProduct()` - Update product details
  - `deleteProduct()` - Remove product
  - `getProductById()` - Fetch single product
  - `getAllProducts()` - Get all products
  - `getActiveProducts()` - Get only active/available products
  - `getProductsByCategory()` - Filter by category
  - `searchProducts()` - Search by keyword

#### OrderService
- **Methods:**
  - `createOrder()` - Place new order with cart items
  - `getOrderById()` - Fetch order details
  - `getOrdersByUserId()` - Get user's order history
  - `confirmOrder()` - Mark order as confirmed
  - `cancelOrder()` - Cancel order and restore stock
  - `getAllOrders()` - Get all orders (admin)
- **Features:**
  - Stock validation before order creation
  - Automatic stock reduction on order creation
  - Stock restoration on order cancellation

### API Endpoints

#### Product Endpoints
```
GET    /elif/product                  - Get all products
GET    /elif/product/active           - Get active products only
GET    /elif/product/{id}             - Get product by ID
GET    /elif/product/category/{name}  - Get products by category
GET    /elif/product/search?keyword   - Search products
POST   /elif/product/add              - Create product
PUT    /elif/product/{id}             - Update product
DELETE /elif/product/{id}             - Delete product
```

#### Order Endpoints
```
POST   /elif/order/create             - Create order from cart
GET    /elif/order/{id}               - Get order details
GET    /elif/order/user/{userId}      - Get user's orders
GET    /elif/order                    - Get all orders
PUT    /elif/order/{id}/confirm       - Confirm order
PUT    /elif/order/{id}/cancel        - Cancel order
```

### DTOs
- `ProductRequest` / `ProductResponse`
- `OrderResponse`
- `OrderItemRequest` / `OrderItemResponse`
- `CreateOrderRequest`

---

## Frontend Implementation (Angular)

### Services

#### ProductService
- Fetches products from `/elif/product` endpoints
- Methods: getAllProducts, getActiveProducts, getProductById, getProductsByCategory, searchProducts, add/update/delete

#### CartService
- **Local Storage:**
  - Persists cart data in browser (`elif_cart`)
  - Survives page refreshes
  
- **Observables:**
  - `cart$` - Observable stream of cart items
  - `total$` - Observable stream of cart total
  
- **Methods:**
  - `addToCart()` - Add product or increase quantity
  - `removeFromCart()` - Remove item completely
  - `updateQuantity()` - Adjust quantity or remove if 0
  - `getCart()` / `getTotal()` - Get current state
  - `clearCart()` - Empty entire cart
  - `checkout()` - Process order via API
  - `getUserOrders()` - Fetch order history
  - `confirmOrder()` - Confirm pending order

### Components

#### MarketplaceComponent (Landing Page)
- **Features:**
  - Hero banner with call-to-action buttons
  - Category showcase cards (clickable)
  - Cart summary widget
  - "How it works" section
  - Login prompt for non-authenticated users
  - Real-time cart item count and total

#### ProductListComponent
- **Features:**
  - Grid display of all active products
  - Category filter buttons
  - Real-time search functionality
  - Stock status display (In stock / Out of stock)
  - "Add to Cart" buttons (disabled when out of stock or logged out)
  - Product images, descriptions, prices
  - Category pre-selection via sessionStorage

#### CartComponent (Panier)
- **Features:**
  - Displays all items in shopping cart
  - Quantity adjustment controls (+ / −)
  - Remove item button
  - Clear cart button
  - Order summary sidebar showing:
    - Subtotal
    - Tax calculation (10%)
    - Total amount
    - Item count
  - "Proceed to Checkout" button
  - "Continue Shopping" link
  - Empty cart state with helpful message
  - Real-time total updates

### Routes
```
/front-office/marketplace              - Landing page
/front-office/marketplace/products     - Product listing
/front-office/marketplace/cart         - Shopping cart
```

### Features
- **Authentication Required** for checkout
- **Stock Management** - Products can't be purchased if out of stock
- **Persistent Cart** - Uses localStorage to maintain cart across sessions
- **Category Navigation** - Can navigate from landing page to filtered products
- **Search** - Real-time search across product names and descriptions

---

## Database Schema

```sql
-- Products table
CREATE TABLE product (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(200) NOT NULL,
  description TEXT NOT NULL,
  category VARCHAR(100) NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  stock INT NOT NULL,
  image_url VARCHAR(500),
  active BOOLEAN NOT NULL,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);

-- Orders table
CREATE TABLE order_tb (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  user_id BIGINT NOT NULL,
  status ENUM('PENDING','CONFIRMED','SHIPPED','DELIVERED','CANCELLED'),
  total_amount DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);

-- Order items table
CREATE TABLE order_item (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  order_id BIGINT NOT NULL,
  product_id BIGINT NOT NULL,
  product_name VARCHAR(255) NOT NULL,
  quantity INT NOT NULL,
  unit_price DECIMAL(10,2) NOT NULL,
  subtotal DECIMAL(10,2) NOT NULL,
  FOREIGN KEY (order_id) REFERENCES order_tb(id)
);
```

---

## Seed Data

15 sample products have been added to the database covering all categories:

### Food & Feed (3 products)
- Premium Dog Kibble - $45.99
- Salmon Oil Supplement - $24.99
- Organic Cat Food - $32.50

### Health Essentials (3 products)
- Vitamin D Tablets - $18.99
- Flea & Tick Prevention - $35.00
- Dental Chews - $12.99

### Accessories (6 products)
- Adjustable Collar with Bell - $15.99
- Extendable Leash 16ft - $22.50
- Stainless Steel Food Bowl Set - $19.99
- Pet Carrier Backpack - $54.99
- Interactive Toy Ball - $14.99
- Pet Grooming Brush - $26.99

### Merchandise (3 products)
- Elif Community T-Shirt - $29.99
- Elif Pet Mug - $16.50
- Elif Plushie Toy - $34.99

**Sample Orders:** 3 orders with 7 line items total are pre-loaded for reference.

---

## How to Use

### For End Users

1. **Browse Products:**
   - Navigate to `/front-office/marketplace`
   - Click "Shop Now" button
   - Use category filters or search to find products

2. **Add to Cart:**
   - Click "Add to Cart" on any product
   - Must be logged in (will prompt if not)
   - Product must be in stock

3. **Manage Cart:**
   - Click "View Cart" from marketplace or navigate to `/front-office/marketplace/cart`
   - Adjust quantities using +/− buttons
   - Remove items or clear entire cart
   - See real-time total with tax

4. **Checkout:**
   - Click "Proceed to Checkout"
   - Order is created with PENDING status
   - Cart is automatically cleared
   - User can view order history

### For Admins

1. **Add Products:**
   ```
   POST /elif/product/add
   {
     "name": "Product Name",
     "description": "Product Description",
     "category": "Food & Feed",
     "price": 29.99,
     "stock": 100,
     "imageUrl": "images/product.jpg",
     "active": true
   }
   ```

2. **Update Products:**
   ```
   PUT /elif/product/{id}
   { updated fields }
   ```

3. **Manage Orders:**
   - View order: `GET /elif/order/{id}`
   - Confirm order: `PUT /elif/order/{id}/confirm`
   - Cancel order: `PUT /elif/order/{id}/cancel`
   - View all orders: `GET /elif/order`

---

## Key Features

✅ **Complete CRUD Operations** - Products and Orders fully managed
✅ **Stock Management** - Automatic tracking and validation
✅ **Shopping Cart** - Persistent, client-side storage with server sync on checkout
✅ **Order Statuses** - Full lifecycle from PENDING to DELIVERED
✅ **Tax Calculation** - 10% tax automatically calculated
✅ **Search & Filter** - Category and keyword search
✅ **Authentication** - Cart and checkout require login
✅ **Responsive Design** - Works on desktop and mobile
✅ **Error Handling** - Proper validation and error messages
✅ **Transactional** - Stock management is atomic

---

## Next Steps / Enhancements

- [ ] Payment processing integration (Stripe, PayPal)
- [ ] Order tracking and notifications
- [ ] Product reviews and ratings
- [ ] Wishlist feature
- [ ] Coupon codes and discounts
- [ ] Seller dashboard (for multiple sellers)
- [ ] Advanced inventory management
- [ ] Order analytics and reporting
- [ ] Email notifications
- [ ] Shipping integration

---

## Files Created

### Backend (Java)
- Entities: Product, Order, OrderItem
- Repositories: ProductRepository, OrderRepository, OrderItemRepository
- Services: ProductService, OrderService (interfaces + implementations)
- Controllers: ProductController, OrderController
- DTOs: ProductRequest, ProductResponse, OrderResponse, OrderItemRequest, OrderItemResponse, CreateOrderRequest

### Frontend (Angular)
- Services: ProductService, CartService
- Components: ProductListComponent, CartComponent
- Updated: MarketplaceComponent, MarketplaceRoutingModule, MarketplaceModule

### Database
- Updated: community_demo_seed.sql (15 products + 3 sample orders)

---

**Status:** ✅ COMPLETE - Full marketplace and shopping cart system ready for use!
