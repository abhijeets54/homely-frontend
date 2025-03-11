# Homely Application Flow

## Authentication Flow

### Registration
1. User selects role (Customer, Seller, or Delivery Partner)
2. User fills registration form with required fields:
   - Name
   - Email
   - Password
   - Phone Number
   - Address (for Customer and Seller)
   - Vehicle Type (for Delivery Partner)
3. Form validation occurs client-side
4. On submission, data is sent to the appropriate endpoint:
   - `/auth/register/customer`
   - `/auth/register/seller`
   - `/auth/register/delivery`
5. Upon successful registration:
   - JWT token is stored in cookies
   - User is redirected to their respective dashboard

### Login
1. User enters email, password, and selects role
2. Credentials are validated client-side
3. On submission, data is sent to `/auth/login`
4. Upon successful login:
   - JWT token is stored in cookies
   - User is redirected to their respective dashboard

### Authentication State Management
- JWT token is stored in HTTP-only cookies
- Token is included in all authenticated API requests
- Protected routes check for valid authentication
- Role-based access control for different sections

## Customer Journey

### 1. Browse Restaurants
- View list of all restaurants on homepage
- Filter restaurants by:
  - Cuisine type
  - Rating
  - Location
- Search for specific restaurants

### 2. View Restaurant Details
- See restaurant information:
  - Name, address, status (open/closed)
  - Rating and reviews
  - Menu categories and items
- Add items to cart

### 3. Cart Management
- View items in cart
- Modify quantities
- Remove items
- View total price
- Proceed to checkout

### 4. Checkout Process
- Review order details
- Enter delivery address
- Add special instructions
- Select payment method:
  - Cash on Delivery (COD)
  - Online Payment
  - UPI

### 5. Payment
- For COD: Order is placed directly
- For Online/UPI:
  - Payment intent is created
  - Payment is processed
  - Order is confirmed upon successful payment

### 6. Order Tracking
- View all orders in order history
- Check order status:
  - Placed
  - Preparing
  - Out for delivery
  - Delivered
- View order details:
  - Items ordered
  - Quantities
  - Prices
  - Delivery address
  - Payment status

### 7. Reviews and Ratings
- Submit reviews for completed orders
- Rate restaurants and food items
- View own reviews

### 8. Profile Management
- View and update profile information
- Change password
- View favorite restaurants
- Manage saved addresses

## Seller Journey

### 1. Dashboard Overview
- View key metrics:
  - Total orders
  - Total revenue
  - Average rating
  - Active orders
- See recent orders
- Toggle restaurant status (open/closed)

### 2. Menu Management
- View all menu categories
- Add/edit/delete categories
- View all food items
- Add/edit/delete food items:
  - Name, price, description
  - Category assignment
  - Availability status
  - Image upload

### 3. Order Management
- View all incoming orders
- Filter orders by status
- Update order status:
  - Accept order (changes to "preparing")
  - Mark as ready for delivery
  - Assign to delivery partner

### 4. Payment Management
- View all payment transactions
- Filter by payment method and status
- Process refunds if necessary
- View payment analytics

### 5. Reviews Management
- View all customer reviews
- Respond to reviews
- Monitor overall rating

### 6. Profile Management
- Update restaurant information
- Change password
- Update operating hours
- Manage bank account details for payments

## Delivery Partner Journey

### 1. Dashboard Overview
- View available orders for pickup
- See active deliveries
- Track earnings

### 2. Order Management
- Accept delivery assignments
- Update delivery status:
  - Picked up
  - In transit
  - Delivered
- View delivery history

### 3. Profile Management
- Update personal information
- Change password
- Update vehicle information
- Manage availability status

## Data Flow

### API Integration
- All data is fetched from the backend API
- API endpoints are organized by resource:
  - `/auth` - Authentication
  - `/customer` - Customer operations
  - `/seller` - Seller operations
  - `/food` - Food items and categories
  - `/cart` - Cart operations
  - `/order` - Order operations
  - `/payment` - Payment operations
  - `/delivery` - Delivery operations
  - `/review` - Reviews and ratings

### State Management
- Authentication state is managed globally
- Cart state is managed globally for customers
- React Query is used for server state management
- Local state is used for UI interactions

### Error Handling
- API errors are caught and displayed to users
- Form validation errors are shown inline
- Network errors trigger retry mechanisms
- Fallback UI for loading and error states

## Security Considerations

- JWT tokens for authentication
- Role-based access control
- Input validation on both client and server
- HTTPS for all API communications
- Secure storage of sensitive information 