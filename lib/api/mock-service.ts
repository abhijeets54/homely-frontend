/**
 * Mock API Service
 * 
 * This file provides mock implementations of API endpoints for development purposes.
 * It can be used when the backend is not available or for testing the UI without making actual API calls.
 */

import { 
  AuthResponse, 
  LoginCredentials, 
  RegisterData,
  Customer,
  Seller,
  FoodItem,
  Category,
  Cart,
  CartItem,
  Order,
  OrderItem,
  DeliveryPartner,
  DeliveryAssignment,
  Payment
} from '../types/models';

// Mock data
const mockCustomers: Customer[] = [
  {
    id: 'cust1',
    name: 'John Doe',
    email: 'john@example.com',
    address: 'New York',
    createdAt: '2023-01-01T00:00:00.000Z',
    phoneNumber: '1234567890',
    favoriteSellers: ['seller1', 'seller2']
  },
  {
    id: 'cust2',
    name: 'Jane Smith',
    email: 'jane@example.com',
    address: 'Los Angeles',
    createdAt: '2023-01-02T00:00:00.000Z',
    phoneNumber: '0987654321',
    favoriteSellers: ['seller1']
  }
];

const mockSellers: Seller[] = [
  {
    id: 'seller1',
    name: 'Italian Home Kitchen',
    email: 'italian@example.com',
    address: 'Chicago',
    createdAt: '2023-01-01T00:00:00.000Z',
    phoneNumber: '1122334455',
    status: 'open',
    rating: 4.8
  },
  {
    id: 'seller2',
    name: 'Mexican Delights',
    email: 'mexican@example.com',
    address: 'Miami',
    createdAt: '2023-01-02T00:00:00.000Z',
    phoneNumber: '5566778899',
    status: 'closed',
    rating: 4.5
  },
  {
    id: 'seller3',
    name: 'Indian Spices',
    email: 'indian@example.com',
    address: 'San Francisco',
    createdAt: '2023-01-03T00:00:00.000Z',
    phoneNumber: '1231231234',
    status: 'open',
    rating: 4.7
  },
  {
    id: 'seller4',
    name: 'Japanese Sushi',
    email: 'japanese@example.com',
    address: 'Seattle',
    createdAt: '2023-01-04T00:00:00.000Z',
    phoneNumber: '4564564567',
    status: 'open',
    rating: 4.9
  }
];

const mockCategories: Category[] = [
  {
    id: 'cat1',
    name: 'Pasta',
    restaurantId: 'seller1'
  },
  {
    id: 'cat2',
    name: 'Pizza',
    restaurantId: 'seller1'
  },
  {
    id: 'cat3',
    name: 'Tacos',
    restaurantId: 'seller2'
  },
  {
    id: 'cat4',
    name: 'Burritos',
    restaurantId: 'seller2'
  }
];

const mockFoodItems: FoodItem[] = [
  {
    id: 'item1',
    name: 'Spaghetti Carbonara',
    categoryId: 'cat1',
    restaurantId: 'seller1',
    price: 12.99,
    imageUrl: '/images/spaghetti.jpg',
    isAvailable: true,
    createdAt: '2023-01-01T00:00:00.000Z',
    updatedAt: '2023-01-01T00:00:00.000Z',
    stock: 20,
    description: 'Classic Italian pasta with eggs, cheese, pancetta, and pepper.',
    dietaryInfo: 'Contains gluten, dairy, eggs'
  },
  {
    id: 'item2',
    name: 'Margherita Pizza',
    categoryId: 'cat2',
    restaurantId: 'seller1',
    price: 14.99,
    imageUrl: '/images/pizza.jpg',
    isAvailable: true,
    createdAt: '2023-01-01T00:00:00.000Z',
    updatedAt: '2023-01-01T00:00:00.000Z',
    stock: 15,
    description: 'Traditional Neapolitan pizza with tomatoes, mozzarella, and basil.',
    dietaryInfo: 'Vegetarian, contains gluten, dairy'
  },
  {
    id: 'item3',
    name: 'Beef Tacos',
    categoryId: 'cat3',
    restaurantId: 'seller2',
    price: 9.99,
    imageUrl: '/images/tacos.jpg',
    isAvailable: true,
    createdAt: '2023-01-02T00:00:00.000Z',
    updatedAt: '2023-01-02T00:00:00.000Z',
    stock: 25,
    description: 'Corn tortillas filled with seasoned beef, lettuce, cheese, and salsa.',
    dietaryInfo: 'Contains dairy'
  },
  {
    id: 'item4',
    name: 'Vegetarian Burrito',
    categoryId: 'cat4',
    restaurantId: 'seller2',
    price: 11.99,
    imageUrl: '/images/burrito.jpg',
    isAvailable: false,
    createdAt: '2023-01-02T00:00:00.000Z',
    updatedAt: '2023-01-02T00:00:00.000Z',
    stock: 0,
    description: 'Flour tortilla filled with beans, rice, vegetables, guacamole, and sour cream.',
    dietaryInfo: 'Vegetarian, contains gluten, dairy'
  }
];

const mockOrders: Order[] = [
  {
    id: 'order1',
    restaurantId: 'seller1',
    userId: 'cust1',
    status: 'delivered',
    totalPrice: 27.98,
    paymentStatus: 'completed',
    createdAt: '2023-02-01T12:00:00.000Z',
    updatedAt: '2023-02-01T14:00:00.000Z',
    deliveryAddress: '123 Main St, New York',
    specialInstructions: 'Please leave at the door'
  },
  {
    id: 'order2',
    restaurantId: 'seller2',
    userId: 'cust1',
    status: 'preparing',
    totalPrice: 21.98,
    paymentStatus: 'completed',
    createdAt: '2023-02-05T18:00:00.000Z',
    updatedAt: '2023-02-05T18:30:00.000Z',
    deliveryAddress: '123 Main St, New York',
    specialInstructions: ''
  },
  {
    id: 'order3',
    restaurantId: 'seller1',
    userId: 'cust2',
    status: 'pending',
    totalPrice: 14.99,
    paymentStatus: 'pending',
    createdAt: '2023-02-10T09:00:00.000Z',
    updatedAt: '2023-02-10T09:00:00.000Z',
    deliveryAddress: '456 Oak St, Los Angeles',
    specialInstructions: 'Extra napkins please'
  }
];

const mockOrderItems: OrderItem[] = [
  {
    id: 'orderItem1',
    orderId: 'order1',
    foodItemId: 'item1',
    quantity: 1,
    price: 12.99,
    foodItem: mockFoodItems.find(item => item.id === 'item1')
  },
  {
    id: 'orderItem2',
    orderId: 'order1',
    foodItemId: 'item2',
    quantity: 1,
    price: 14.99,
    foodItem: mockFoodItems.find(item => item.id === 'item2')
  },
  {
    id: 'orderItem3',
    orderId: 'order2',
    foodItemId: 'item3',
    quantity: 2,
    price: 19.98,
    foodItem: mockFoodItems.find(item => item.id === 'item3')
  },
  {
    id: 'orderItem4',
    orderId: 'order3',
    foodItemId: 'item2',
    quantity: 1,
    price: 14.99,
    foodItem: mockFoodItems.find(item => item.id === 'item2')
  }
];

// Mock API functions
export const mockAuthApi = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Check credentials
    if (credentials.userType === 'customer') {
      const customer = mockCustomers.find(c => c.email === credentials.email);
      if (customer && credentials.password === 'password') { // In a real app, you'd check hashed passwords
        return {
          token: 'mock-jwt-token',
          user: customer,
          userType: 'customer'
        };
      }
    } else if (credentials.userType === 'seller') {
      const seller = mockSellers.find(s => s.email === credentials.email);
      if (seller && credentials.password === 'password') {
        return {
          token: 'mock-jwt-token',
          user: seller,
          userType: 'seller'
        };
      }
    }
    
    throw new Error('Invalid credentials');
  },
  
  register: async (data: RegisterData): Promise<AuthResponse> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Check if email already exists
    if (
      mockCustomers.some(c => c.email === data.email) ||
      mockSellers.some(s => s.email === data.email)
    ) {
      throw new Error('Email already in use');
    }
    
    // Create new user
    const newUser = {
      id: `new-${Date.now()}`,
      name: data.name,
      email: data.email,
      address: data.address,
      phoneNumber: data.phoneNumber,
      createdAt: new Date().toISOString(),
    };
    
    if (data.userType === 'customer') {
      const newCustomer: Customer = {
        ...newUser,
        favoriteSellers: []
      };
      mockCustomers.push(newCustomer);
      return {
        token: 'mock-jwt-token',
        user: newCustomer,
        userType: 'customer'
      };
    } else {
      const newSeller: Seller = {
        ...newUser,
        status: 'closed',
        rating: 0
      };
      mockSellers.push(newSeller);
      return {
        token: 'mock-jwt-token',
        user: newSeller,
        userType: 'seller'
      };
    }
  },
  
  checkAuth: async (): Promise<AuthResponse> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // In a real app, you'd verify the JWT token
    // For mock purposes, just return the first user
    return {
      token: 'mock-jwt-token',
      user: mockCustomers[0],
      userType: 'customer'
    };
  },
  
  logout: async (): Promise<void> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // In a real app, you might invalidate the token on the server
    return;
  }
};

export const mockCustomerApi = {
  getProfile: async (): Promise<Customer> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return mockCustomers[0];
  },
  
  updateProfile: async (data: Partial<Customer>): Promise<Customer> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Update customer data
    const customer = mockCustomers[0];
    const updatedCustomer = { ...customer, ...data };
    mockCustomers[0] = updatedCustomer;
    
    return updatedCustomer;
  },
  
  getOrders: async (): Promise<Order[]> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Filter orders for the current customer
    return mockOrders.filter(order => order.userId === mockCustomers[0].id);
  },
  
  getOrderById: async (orderId: string): Promise<Order & { orderItems: OrderItem[] }> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Find the order
    const order = mockOrders.find(o => o.id === orderId);
    if (!order) {
      throw new Error('Order not found');
    }
    
    // Get order items
    const orderItems = mockOrderItems.filter(item => item.orderId === orderId);
    
    return { ...order, orderItems };
  }
};

export const mockSellerApi = {
  getProfile: async (): Promise<Seller> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return mockSellers[0];
  },
  
  updateSellerProfile: async (data: Partial<Seller>): Promise<Seller> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Update seller data
    const seller = mockSellers[0];
    const updatedSeller = { ...seller, ...data };
    mockSellers[0] = updatedSeller;
    
    return updatedSeller;
  },
  
  getCategories: async (): Promise<Category[]> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Filter categories for the current seller
    return mockCategories.filter(cat => cat.restaurantId === mockSellers[0].id);
  },
  
  createCategory: async (data: Partial<Category>): Promise<Category> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Create new category
    const newCategory: Category = {
      id: `cat-${Date.now()}`,
      name: data.name || 'New Category',
      restaurantId: mockSellers[0].id
    };
    
    mockCategories.push(newCategory);
    return newCategory;
  },
  
  updateCategory: async (categoryId: string, data: Partial<Category>): Promise<Category> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Find and update category
    const index = mockCategories.findIndex(c => c.id === categoryId);
    if (index === -1) {
      throw new Error('Category not found');
    }
    
    const updatedCategory = { ...mockCategories[index], ...data };
    mockCategories[index] = updatedCategory;
    
    return updatedCategory;
  },
  
  deleteCategory: async (categoryId: string): Promise<void> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Remove category
    const index = mockCategories.findIndex(c => c.id === categoryId);
    if (index === -1) {
      throw new Error('Category not found');
    }
    
    mockCategories.splice(index, 1);
  },
  
  getFoodItems: async (): Promise<FoodItem[]> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Filter food items for the current seller
    return mockFoodItems.filter(item => item.restaurantId === mockSellers[0].id);
  },
  
  getFoodItemById: async (itemId: string): Promise<FoodItem> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Find food item
    const item = mockFoodItems.find(i => i.id === itemId);
    if (!item) {
      throw new Error('Food item not found');
    }
    
    return item;
  },
  
  createFoodItem: async (data: Partial<FoodItem>): Promise<FoodItem> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Create new food item
    const newItem: FoodItem = {
      id: `item-${Date.now()}`,
      name: data.name || 'New Item',
      categoryId: data.categoryId || '',
      restaurantId: mockSellers[0].id,
      price: data.price || 0,
      imageUrl: data.imageUrl || '/images/default.jpg',
      isAvailable: data.isAvailable || true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      stock: data.stock || 0,
      description: data.description || '',
      dietaryInfo: data.dietaryInfo || ''
    };
    
    mockFoodItems.push(newItem);
    return newItem;
  },
  
  updateFoodItem: async (itemId: string, data: Partial<FoodItem>): Promise<FoodItem> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Find and update food item
    const index = mockFoodItems.findIndex(i => i.id === itemId);
    if (index === -1) {
      throw new Error('Food item not found');
    }
    
    const updatedItem = { 
      ...mockFoodItems[index], 
      ...data,
      updatedAt: new Date().toISOString()
    };
    mockFoodItems[index] = updatedItem;
    
    return updatedItem;
  },
  
  deleteFoodItem: async (itemId: string): Promise<void> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Remove food item
    const index = mockFoodItems.findIndex(i => i.id === itemId);
    if (index === -1) {
      throw new Error('Food item not found');
    }
    
    mockFoodItems.splice(index, 1);
  },
  
  getOrders: async (): Promise<Order[]> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Filter orders for the current seller
    return mockOrders.filter(order => order.restaurantId === mockSellers[0].id);
  },
  
  getOrderById: async (orderId: string): Promise<Order & { orderItems: OrderItem[] }> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Find the order
    const order = mockOrders.find(o => o.id === orderId && o.restaurantId === mockSellers[0].id);
    if (!order) {
      throw new Error('Order not found');
    }
    
    // Get order items
    const orderItems = mockOrderItems.filter(item => item.orderId === orderId);
    
    return { ...order, orderItems };
  },
  
  updateOrderStatus: async (orderId: string, data: { status: string }): Promise<Order> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Find and update order
    const index = mockOrders.findIndex(o => o.id === orderId && o.restaurantId === mockSellers[0].id);
    if (index === -1) {
      throw new Error('Order not found');
    }
    
    const updatedOrder = { 
      ...mockOrders[index], 
      status: data.status as any,
      updatedAt: new Date().toISOString()
    };
    mockOrders[index] = updatedOrder;
    
    return updatedOrder;
  }
};

export const mockFoodApi = {
  getSellers: async (): Promise<Seller[]> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return mockSellers;
  },
  
  getSellerById: async (sellerId: string): Promise<Seller & { categories: Category[], foodItems: FoodItem[] }> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Find seller
    const seller = mockSellers.find(s => s.id === sellerId);
    if (!seller) {
      throw new Error('Seller not found');
    }
    
    // Get categories and food items
    const categories = mockCategories.filter(c => c.restaurantId === sellerId);
    const foodItems = mockFoodItems.filter(i => i.restaurantId === sellerId);
    
    return { ...seller, categories, foodItems };
  },
  
  getCart: async (): Promise<Cart & { items: (CartItem & { foodItem: FoodItem })[] }> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Mock cart
    const cart: Cart = {
      id: 'cart1',
      customerId: mockCustomers[0].id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: 'active'
    };
    
    // Mock cart items
    const items: (CartItem & { foodItem: FoodItem })[] = [
      {
        id: 'cartItem1',
        cartId: 'cart1',
        foodItemId: 'item1',
        quantity: 1,
        price: mockFoodItems[0].price,
        foodItem: mockFoodItems[0]
      },
      {
        id: 'cartItem2',
        cartId: 'cart1',
        foodItemId: 'item2',
        quantity: 2,
        price: mockFoodItems[1].price * 2,
        foodItem: mockFoodItems[1]
      }
    ];
    
    return { ...cart, items };
  },
  
  addToCart: async (foodItemId: string, quantity: number): Promise<CartItem> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Find food item
    const foodItem = mockFoodItems.find(i => i.id === foodItemId);
    if (!foodItem) {
      throw new Error('Food item not found');
    }
    
    // Create cart item
    const cartItem: CartItem = {
      id: `cartItem-${Date.now()}`,
      cartId: 'cart1',
      foodItemId,
      quantity,
      price: foodItem.price * quantity,
      foodItem
    };
    
    return cartItem;
  },
  
  updateCartItem: async (cartItemId: string, quantity: number): Promise<CartItem> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Mock updated cart item
    return {
      id: cartItemId,
      cartId: 'cart1',
      foodItemId: 'item1',
      quantity,
      price: mockFoodItems[0].price * quantity,
      foodItem: mockFoodItems[0]
    };
  },
  
  removeCartItem: async (cartItemId: string): Promise<void> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // In a real app, you'd remove the item from the cart
    return;
  },
  
  clearCart: async (): Promise<void> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // In a real app, you'd clear all items from the cart
    return;
  },
  
  checkout: async (data: any): Promise<Order> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Create new order
    const newOrder: Order = {
      id: `order-${Date.now()}`,
      restaurantId: 'seller1',
      userId: mockCustomers[0].id,
      status: 'pending',
      totalPrice: 42.97, // Example total
      paymentStatus: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      deliveryAddress: data.deliveryAddress || mockCustomers[0].address,
      specialInstructions: data.specialInstructions || ''
    };
    
    mockOrders.push(newOrder);
    return newOrder;
  }
}; 