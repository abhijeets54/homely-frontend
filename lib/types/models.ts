export interface User {
  id: string;
  name: string;
  email: string;
  phoneNumber: string;
  address?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface Customer extends User {
  favoriteSellers?: string[];
}

export interface Seller extends User {
  status: 'open' | 'closed';
  rating?: number;
  _id?: string; // Add _id property
  image?: string; // Add image property
}

// Menu Types
export interface Category {
  id: string;
  name: string;
  restaurantId: string;
}

export interface FoodItem {
  id: string;
  name: string;
  categoryId: string;
  restaurantId: string;
  price: number;
  imageUrl?: string;
  isAvailable: boolean;
  createdAt: string;
  updatedAt?: string;
  stock?: number;
  description?: string;
  dietaryInfo?: string;
}

// Cart Types
export interface Cart {
  id: string;
  customerId: string;
  createdAt: string;
  updatedAt?: string;
  status: 'active' | 'checkout';
  items?: CartItem[];
}

export interface CartItem {
  id: string;
  cartId: string;
  foodItemId: string;
  quantity: number;
  price: number;
  foodItem?: FoodItem;
}

// Order Types
export interface Order {
  id: string;
  restaurantId: string;
  userId: string;
  status: 'pending' | 'preparing' | 'out for delivery' | 'delivered' | 'cancelled';
  totalPrice: number;
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  createdAt: string;
  updatedAt?: string;
  deliveryAddress: string;
  specialInstructions?: string;
  items?: OrderItem[];
  restaurant?: Seller;
  customer?: Customer;
  deliveryFee?: number;
  deliveryAssignment?: DeliveryAssignment;
}

export interface OrderItem {
  id: string;
  orderId: string;
  foodItemId: string;
  quantity: number;
  price: number;
  foodItem?: FoodItem;
}

// Delivery Types
export interface DeliveryPartner extends User {
  vehicleType: string;
  isAvailable?: boolean;
  currentLocation?: {
    lat: number;
    lng: number;
  };
}

export interface DeliveryAssignment {
  id: string;
  orderId: string;
  deliveryPartnerId: string;
  status: 'assigned' | 'picked up' | 'delivered';
  estimatedDeliveryTime?: string;
  createdAt: string;
  updatedAt?: string;
  order?: Order;
  deliveryPartner?: DeliveryPartner;
}

// Payment Types
export interface Payment {
  id: string;
  orderId: string;
  amount: number;
  paymentMethod: 'cod' | 'online' | 'upi';
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  createdAt: string;
  updatedAt?: string;
  transactionId?: string;
  refundAmount?: number;
  refundReason?: string;
  refundStatus?: 'pending' | 'processed' | 'rejected';
}

// Auth Types
export interface AuthResponse {
  token: string;
  user: Customer | Seller;
  userType: 'customer' | 'seller';
}

export interface LoginCredentials {
  email: string;
  password: string;
  userType: 'customer' | 'seller';
}

export interface RegisterData extends Omit<User, 'id' | 'createdAt'> {
  password: string;
  userType: 'customer' | 'seller';
}

// Review type
export interface Review {
  id: string;
  userId: string;
  restaurantId: string;
  foodItemId?: string;
  orderId: string;
  rating: number;
  comment?: string;
  createdAt: string;
  updatedAt?: string;
  user?: Customer;
}

// API Response types
export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Error Response type
export interface ErrorResponse {
  message: string;
  error?: any;
}
