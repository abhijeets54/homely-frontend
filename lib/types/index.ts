export type UserRole = 'customer' | 'seller' | 'delivery';

export interface BaseUser {
  id: string;
  name: string;
  email: string;
  address: string;
  phoneNumber: string;
  createdAt: string;
}

export interface Customer extends BaseUser {
  favoriteSellers: string[];
}

export interface Seller extends BaseUser {
  status: 'open' | 'closed';
  rating?: number;
}

export interface DeliveryPartner extends BaseUser {
  vehicleType: string;
}

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
  imageUrl: string;
  isAvailable: boolean;
  createdAt: string;
  updatedAt: string;
  stock: number;
  description: string;
  dietaryInfo: string;
}

export interface CartItem {
  id: string;
  cartId: string;
  foodItemId: string;
  quantity: number;
  price: number;
  foodItem?: FoodItem;
}

export interface Cart {
  id: string;
  customerId: string;
  createdAt: string;
  updatedAt: string;
  status: 'active' | 'checkout';
  items: CartItem[];
}

export interface OrderItem {
  id: string;
  orderId: string;
  foodItemId: string;
  quantity: number;
  price: number;
  foodItem?: FoodItem;
}

export interface Order {
  id: string;
  restaurantId: string;
  userId: string;
  status: 'pending' | 'preparing' | 'out for delivery' | 'delivered';
  totalPrice: number;
  paymentStatus: 'pending' | 'completed' | 'failed';
  createdAt: string;
  updatedAt: string;
  deliveryAddress: string;
  specialInstructions?: string;
  items: OrderItem[];
}

export interface DeliveryAssignment {
  id: string;
  orderId: string;
  deliveryPartnerId: string;
  status: 'assigned' | 'picked up' | 'delivered';
  estimatedDeliveryTime: string;
  deliveryPartner?: DeliveryPartner;
}

export interface Payment {
  id: string;
  orderId: string;
  amount: number;
  paymentMethod: string;
  paymentStatus: 'pending' | 'completed' | 'failed';
}

export interface LoginData {
  email: string;
  password: string;
  role: UserRole;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  phoneNumber: string;
  address: string;
  role: UserRole;
  vehicleType?: string;
}

export interface AuthResponse {
  token: string;
  user: Customer | Seller | DeliveryPartner;
  userType: UserRole;
}

export interface Review {
  id: string;
  orderId: string;
  sellerId: string;
  customerId: string;
  rating: number;
  comment: string;
  createdAt: string;
  customerName?: string;
}

export interface ReviewResponse {
  id: string;
  reviewId: string;
  sellerId: string;
  comment: string;
  createdAt: string;
}

export * from './models';
export * from './auth';
export * from './payment';
export * from './notification'; 