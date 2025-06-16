// User roles
export type UserRole = 'customer' | 'seller' | 'admin';

// Base user interface
export interface User {
  _id: string;
  name: string;
  email: string;
  phoneNumber?: string; // Frontend uses phoneNumber
  address?: string;
  createdAt: string;
  role: UserRole;
  // Additional fields based on role
  status?: 'open' | 'closed'; // For sellers
  rating?: number; // For sellers
  favoriteSellers?: string[]; // For customers
  imageUrl?: string; // For sellers - cover image
}

// Login data interface
export interface LoginData {
  email: string;
  password: string;
  role: UserRole;
  phoneNumber?: string; // Frontend uses phoneNumber
}

// Register data interface
export interface RegisterData {
  name: string;
  email: string;
  password: string;
  phoneNumber?: string; // Frontend uses phoneNumber
  address?: string;
  role: UserRole;
  imageUrl?: string; // For sellers - cover image
}

// Update profile data interface
export interface UpdateProfileData {
  name?: string;
  phoneNumber?: string; // Frontend uses phoneNumber
  address?: string;
  password?: string;
  imageUrl?: string; // For sellers - cover image
}

// Auth response interface
export interface AuthResponse {
  token: string;
  user: User;
  userType: UserRole; // Add userType to the response
  message?: string;
}

// Error response interface
export interface ErrorResponse {
  message: string;
  error?: any;
} 