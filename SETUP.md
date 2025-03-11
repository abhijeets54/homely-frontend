# Homely Application Setup Guide

This guide will help you set up and run the Homely application, a home-cooked food delivery web application built with Next.js, TypeScript, and TailwindCSS.

## Prerequisites

Before you begin, make sure you have the following installed on your system:

- Node.js (v18.0.0 or higher)
- npm (v8.0.0 or higher) or yarn (v1.22.0 or higher)
- Git

## Setup Steps

### 1. Clone the Repository

If you haven't already cloned the repository, do so with the following command:

```bash
git clone <repository-url>
cd homely-frontend
```

### 2. Install Dependencies

Install all the required dependencies:

```bash
cd homely-app
npm install
# or
yarn install
```

### 3. Environment Setup

Create a `.env.local` file in the `homely-app` directory with the following content:

```
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

Replace the API URL with your actual backend API URL if it's different.

### 4. Backend Setup

Make sure your backend server is running and accessible at the URL specified in the `.env.local` file. The frontend application expects the backend to follow the structure outlined in the project documentation.

If you're running the backend locally, start it before proceeding to the next step.

### 5. Start the Development Server

Start the Next.js development server:

```bash
npm run dev
# or
yarn dev
```

This will start the application in development mode. Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

### 6. Build for Production

When you're ready to deploy the application, build it for production:

```bash
npm run build
# or
yarn build
```

Then start the production server:

```bash
npm run start
# or
yarn start
```

## Application Structure

The Homely application follows a feature-based organization:

- `app/` - Next.js App Router pages and layouts
- `components/` - Reusable UI components
- `lib/` - Utility functions, API clients, and types
  - `api/` - API client and endpoints
  - `hooks/` - Custom React hooks
  - `types/` - TypeScript type definitions
  - `utils/` - Utility functions
  - `validation/` - Zod validation schemas

## User Flows

The application supports two main user types:

1. **Customers** can:
   - Browse sellers and their menus
   - Add items to cart
   - Place orders
   - Track order status
   - Manage their profile

2. **Sellers** can:
   - Manage their menu (add/edit/delete items and categories)
   - Manage orders (update status)
   - Update their profile and availability

## Troubleshooting

### API Connection Issues

If you're having trouble connecting to the API:

1. Check that your backend server is running
2. Verify the API URL in your `.env.local` file
3. Check the browser console for any CORS errors

### Authentication Issues

If you're experiencing authentication problems:

1. Clear your browser cookies
2. Try logging in again
3. Check that your backend authentication endpoints are working correctly

### Build Errors

If you encounter build errors:

1. Make sure all dependencies are installed correctly
2. Check for TypeScript errors in your code
3. Clear the Next.js cache with `npm run dev -- --clear` or `yarn dev --clear`

## Support

If you need further assistance, please contact the development team or create an issue in the repository. 