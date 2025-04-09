// User roles
export type UserRole = 'customer' | 'seller' | 'delivery' | 'admin';

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
  vehicleType?: string; // For delivery partners
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
  vehicleType?: string; // For delivery partners
}

// Update profile data interface
export interface UpdateProfileData {
  name?: string;
  phoneNumber?: string; // Frontend uses phoneNumber
  address?: string;
  password?: string;
  vehicleType?: string; // For delivery partners
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