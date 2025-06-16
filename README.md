# Homely - Home-cooked Food Delivery Application

Homely is a comprehensive food delivery platform that connects customers with home chefs and restaurants offering authentic home-cooked meals across India. This application provides a seamless experience for customers to discover, order, and enjoy home-cooked food, while enabling sellers to showcase and sell their culinary creations.

## Features

### Customer Features
- **User Authentication**: Secure login and registration for customers
- **Restaurant Discovery**: Browse and search for restaurants by location and cuisine
- **Menu Exploration**: View restaurant menus with detailed food item descriptions and images
- **Cart Management**: Add items to cart, modify quantities, and proceed to checkout
- **Order Placement**: Complete orders with delivery address and payment options
- **Order Tracking**: Track order status from preparation to delivery
- **Reviews & Ratings**: Leave reviews and ratings for restaurants and food items
- **Payment Options**: Multiple payment methods including COD, card payments, and UPI
- **Refund Management**: Request refunds for completed orders with issues

### Seller Features
- **Restaurant Management**: Create and manage restaurant profile and status
- **Menu Management**: Add, update, and organize food items by categories
- **Order Management**: View and process incoming orders
- **Inventory Control**: Manage food item availability and stock
- **Sales Analytics**: View sales data and performance metrics
- **Customer Feedback**: Access customer reviews and ratings

### Delivery Partner Features
- **Order Acceptance**: View and accept available delivery orders
- **Delivery Management**: Track active deliveries and update delivery status
- **Earnings Tracking**: Monitor daily, weekly, and total earnings
- **Profile Management**: Update profile and vehicle information

## Technology Stack

### Frontend
- **Framework**: Next.js with TypeScript
- **UI Components**: Shadcn UI components
- **Styling**: TailwindCSS for responsive design
- **State Management**: React Query for server state
- **Form Handling**: React Hook Form with Zod validation

### Backend
- **Server**: Node.js with Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT-based authentication
- **File Storage**: Cloud storage for food images
- **Payment Processing**: Integrated payment gateway support

## Project Structure

```
homely/
├── homely-frontend/           # Frontend application
│   ├── app/                   # Next.js app directory
│   │   ├── (auth)/            # Authentication pages
│   │   ├── (customer)/        # Customer-facing pages
│   │   ├── (seller)/          # Seller dashboard pages
│   │   └── (delivery)/        # Delivery partner pages
│   ├── components/            # Reusable UI components
│   ├── lib/                   # Utility functions and API clients
│   │   ├── api/               # API service functions
│   │   ├── hooks/             # Custom React hooks
│   │   ├── types/             # TypeScript type definitions
│   │   └── utils/             # Helper utilities
│   ├── providers/             # React context providers
│   └── public/                # Static assets
│
└── homely-backend/            # Backend application
    ├── controllers/           # Request handlers
    ├── middleware/            # Express middleware
    ├── models/                # MongoDB schema models
    ├── routes/                # API route definitions
    └── utils/                 # Utility functions
```

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- MongoDB
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/homely.git
cd homely
```

2. Install frontend dependencies:
```bash
cd homely-frontend
npm install
```

3. Install backend dependencies:
```bash
cd ../homely-backend
npm install
```

4. Set up environment variables:
   - Create `.env.local` in the frontend directory
   - Create `.env` in the backend directory

5. Start the development servers:

Frontend:
```bash
cd homely-frontend
npm run dev
```

Backend:
```bash
cd homely-backend
npm run dev
```

## API Documentation

The application uses RESTful API endpoints for communication between the frontend and backend:

### Authentication
- `POST /api/auth/register`: Register a new user (customer, seller, or delivery partner)
- `POST /api/auth/login`: Authenticate a user and receive a JWT token

### Customer
- `GET /api/customer/profile`: Get customer profile
- `PUT /api/customer/profile`: Update customer profile
- `GET /api/customer/favorite-sellers`: Get customer's favorite sellers
- `POST /api/customer/favorite-sellers/:sellerId`: Add a seller to favorites
- `DELETE /api/customer/favorite-sellers/:sellerId`: Remove a seller from favorites

### Seller
- `GET /api/seller/profile`: Get seller profile
- `PUT /api/seller/profile`: Update seller profile
- `PUT /api/seller/status`: Update seller's open/closed status
- `GET /api/seller`: Get all sellers (for customer browsing)

### Categories
- `GET /api/category/seller/:sellerId`: Get categories for a specific seller
- `POST /api/category`: Create a new category
- `PUT /api/category/:categoryId`: Update a category
- `DELETE /api/category/:categoryId`: Delete a category

### Food Items
- `GET /api/food-item/seller/:sellerId`: Get all food items for a seller
- `GET /api/food-item/category/:categoryId`: Get food items by category
- `POST /api/food-item`: Create a new food item
- `PUT /api/food-item/:foodItemId`: Update a food item
- `DELETE /api/food-item/:foodItemId`: Delete a food item

### Cart
- `GET /api/cart`: Get current user's cart
- `GET /api/cart/items`: Get items in the cart
- `POST /api/cart/items`: Add item to cart
- `PUT /api/cart/items/:itemId`: Update cart item quantity
- `DELETE /api/cart/items/:itemId`: Remove item from cart
- `PUT /api/cart/checkout`: Update cart status to checkout

### Orders
- `GET /api/order/customer`: Get customer's orders
- `GET /api/order/seller`: Get seller's orders
- `GET /api/order/:orderId`: Get order details
- `POST /api/order`: Create a new order
- `PUT /api/order/:orderId/status`: Update order status
- `PUT /api/order/:orderId/cancel`: Cancel an order

### Payments
- `POST /api/payment/intent`: Create a payment intent
- `POST /api/payment/process/:paymentId`: Process a payment
- `GET /api/payment/:paymentId`: Get payment details
- `GET /api/payment/order/:orderId`: Get payment by order ID
- `GET /api/payment/customer`: Get customer's payments
- `GET /api/payment/seller`: Get seller's payments
- `POST /api/payment/refund/request/:paymentId`: Request a refund
- `PUT /api/payment/refund/process/:paymentId`: Process a refund request
- `GET /api/payment/analytics`: Get payment analytics for sellers

### Delivery
- `GET /api/delivery/profile`: Get delivery partner profile
- `PUT /api/delivery/profile`: Update delivery partner profile
- `GET /api/delivery/available-orders`: Get available orders for delivery
- `POST /api/delivery/accept/:orderId`: Accept a delivery
- `GET /api/delivery/active`: Get active deliveries
- `PUT /api/delivery/status/:deliveryId`: Update delivery status
- `GET /api/delivery/history`: Get delivery history
- `GET /api/delivery/earnings`: Get delivery earnings

### Reviews
- `GET /api/review/restaurant/:restaurantId`: Get reviews for a restaurant
- `GET /api/review/food/:foodItemId`: Get reviews for a food item
- `GET /api/review/customer`: Get customer's reviews
- `GET /api/review/order/:orderId`: Get review for an order
- `POST /api/review`: Create a new review
- `PUT /api/review/:reviewId`: Update a review
- `DELETE /api/review/:reviewId`: Delete a review

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgements

- [Next.js](https://nextjs.org/)
- [React](https://reactjs.org/)
- [TailwindCSS](https://tailwindcss.com/)
- [Shadcn UI](https://ui.shadcn.com/)
- [Express.js](https://expressjs.com/)
- [MongoDB](https://www.mongodb.com/)

## Cloudinary Integration

This project uses Cloudinary for image storage and optimization. To set up Cloudinary:

1. Create a Cloudinary account at [cloudinary.com](https://cloudinary.com)

2. Create an upload preset:
   - Go to Settings > Upload
   - Create a new upload preset with "Unsigned" mode
   - Note the preset name

3. Set up environment variables:
   - Create a `.env.local` file in the project root (if not already present)
   - Add the following variables:
   ```
   NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
   NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=your_upload_preset
   ```

4. Replace `your_cloud_name` with your Cloudinary cloud name and `your_upload_preset` with the name of the upload preset you created.

## Image Components

The project includes two main components for working with images:

- `CloudinaryImage`: A wrapper around Next.js Image component optimized for Cloudinary
- `ImageUploader`: A component for uploading images to Cloudinary

Example usage:

```jsx
// Display an image
<CloudinaryImage 
  src="cloudinary_image_url" 
  alt="Description" 
  width={500} 
  height={300} 
/>

// Upload an image
<ImageUploader
  onImageUpload={(imageUrl) => {
    // Handle the uploaded image URL
    console.log(imageUrl);
  }}
  folder="food"
  buttonText="Upload Image"
/>
```
