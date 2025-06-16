import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Order } from '@/lib/types/models'; // Import from models file to get the complete type

// Define metrics structure for customer dashboard
export interface CustomerMetrics {
  totalOrders: number;
  pendingOrders: number;
  completedOrders: number;
  totalSpent: number;
  recentOrders: Order[];
}

// Define metrics structure for seller dashboard
export interface SellerMetrics {
  totalOrders: number;
  pendingOrders: number;
  completedOrders: number;
  totalRevenue: number;
  popularItems: { name: string; count: number }[];
  recentOrders: Order[];
}

// Define a store order type that can handle both API and local orders
export interface StoreOrder extends Omit<Order, 'status'> {
  status: string; // Allow string type for status to be more flexible
  restaurantInfo?: { 
    id?: string;
    _id?: string;
    name?: string;
  };
}

// Define store structure
interface OrderMetricsStore {
  // Store all orders for reference
  orders: StoreOrder[];
  
  // Last update timestamp to track when metrics were last calculated
  lastUpdated: number;
  
  // Metrics to display on dashboards
  customerMetrics: CustomerMetrics;
  sellerMetrics: Record<string, SellerMetrics>; // Keyed by restaurantId
  
  // Flag to prevent recalculation loops
  isCalculating: boolean;
  
  // Methods to update the store
  addOrder: (order: Order | any) => void; // Allow any type to accommodate various order formats
  updateOrderStatus: (orderId: string, status: string) => void;
  calculateMetrics: () => void;
  
  // Get specific metrics
  getCustomerMetrics: () => CustomerMetrics;
  getSellerMetrics: (restaurantId: string) => SellerMetrics;
}

// Initialize default metrics
const defaultCustomerMetrics: CustomerMetrics = {
  totalOrders: 0,
  pendingOrders: 0,
  completedOrders: 0,
  totalSpent: 0,
  recentOrders: [],
};

const defaultSellerMetrics: SellerMetrics = {
  totalOrders: 0,
  pendingOrders: 0,
  completedOrders: 0,
  totalRevenue: 0,
  popularItems: [],
  recentOrders: [],
};

// Local storage keys
const STORE_NAME = 'order-metrics-storage';
const VERSION = 'v1'; // Version to help with future migrations

// Create the store
export const useOrderMetricsStore = create<OrderMetricsStore>()(
  persist(
    (set, get) => ({
      orders: [],
      lastUpdated: Date.now(),
      customerMetrics: defaultCustomerMetrics,
      sellerMetrics: {},
      isCalculating: false,
      
      // Add a new order to the store
      addOrder: (order) => {
        const { isCalculating } = get();
        if (isCalculating) return;
        
        if (!order || !order.id) {
          console.error('Invalid order data:', order);
          return;
        }
        
        set((state) => {
          // Check if order already exists to avoid duplicates
          const orderExists = state.orders.some(o => o.id === order.id);
          if (orderExists) return state;
          
          // Extract and normalize restaurantId with enhanced logic
          let restaurantId = order.restaurantId || 'unknown';
          let restaurantName = '';
          
          // Check for restaurantInfo object (added in checkout page)
          if (order.restaurantInfo) {
            if (typeof order.restaurantInfo === 'object') {
              restaurantId = order.restaurantInfo.id || order.restaurantInfo._id || restaurantId;
              restaurantName = order.restaurantInfo.name || '';
            }
          }
          
          // Check for restaurant object
          if (order.restaurant) {
            if (typeof order.restaurant === 'object') {
              const restaurantObj = order.restaurant;
              if (!restaurantId || restaurantId === 'unknown') {
                restaurantId = restaurantObj.id || restaurantObj._id || restaurantId;
              }
              if (!restaurantName) {
                restaurantName = restaurantObj.name || '';
              }
            }
          }
          
          // Normalize restaurant ID (strip any object wrappers if present)
          if (typeof restaurantId === 'object' && restaurantId !== null) {
            restaurantId = (restaurantId as any)._id || (restaurantId as any).id || 'unknown';
          }
          
          // Ensure restaurant ID is a string
          const restaurantIdStr = String(restaurantId);
          
          // Log restaurant ID in dev environment
          if (process.env.NODE_ENV !== 'production') {
            console.log('Normalized restaurant ID:', restaurantIdStr, 'from', order.restaurantId);
            console.log('Full order object:', order);
          }
          
          // Normalize order structure to ensure compatibility
          const normalizedOrder: StoreOrder = {
            id: order.id,
            restaurantId: restaurantIdStr,
            userId: order.userId || 'unknown',
            status: order.status || 'pending',
            totalPrice: Number(order.totalPrice || order.total) || 0,
            paymentStatus: order.paymentStatus || 'pending',
            createdAt: order.createdAt || new Date().toISOString(),
            updatedAt: order.updatedAt || order.createdAt || new Date().toISOString(),
            deliveryAddress: order.deliveryAddress || '',
            specialInstructions: order.specialInstructions || '',
            items: Array.isArray(order.items) ? [...order.items] : [],
            // Store original restaurantInfo if available
            restaurantInfo: {
              id: restaurantIdStr,
              _id: restaurantIdStr,
              name: restaurantName || 'Restaurant'
            }
          };
          
          // Add order to list
          const updatedOrders = [...state.orders, normalizedOrder];
          
          // Return updated state
          return {
            orders: updatedOrders,
            lastUpdated: Date.now(),
          };
        });
        
        // Force a metrics calculation after adding order
        setTimeout(() => {
          // Force a full recalculation to ensure metrics are updated
          set(state => ({ 
            ...state,
            customerMetrics: { ...defaultCustomerMetrics },
            sellerMetrics: {}
          }));
          
          // Then calculate metrics
          setTimeout(() => {
            get().calculateMetrics();
            
            // Log the order addition
            if (process.env.NODE_ENV !== 'production') {
              console.log('Order added to metrics store:', order.id);
              console.log('Orders in store:', get().orders.length);
              
              // Log all restaurant IDs in orders for debugging
              const allOrders = get().orders;
              console.log('All restaurant IDs in orders:', allOrders.map(o => o.restaurantId));
            }
          }, 50);
        }, 0);
      },
      
      // Update an existing order status
      updateOrderStatus: (orderId: string, status: string) => {
        const { isCalculating } = get();
        if (isCalculating) return;
        
        set((state) => {
          const updatedOrders = state.orders.map(order => 
            order.id === orderId 
              ? { ...order, status } 
              : order
          );
          
          return {
            orders: updatedOrders,
            lastUpdated: Date.now(),
          };
        });
        
        // Recalculate metrics after status update
        setTimeout(() => {
          get().calculateMetrics();
          
          // Log the status update
          if (process.env.NODE_ENV !== 'production') {
            console.log('Order status updated in metrics store:', orderId, status);
          }
        }, 0);
      },
      
      // Calculate all metrics based on current orders
      calculateMetrics: () => {
        const { orders, isCalculating } = get();
        
        // Prevent concurrent calculations or empty data
        if (isCalculating || !orders || orders.length === 0) {
          console.log('Skipping metrics calculation - already calculating or no orders');
          return;
        }
        
        // Log the calculation attempt
        if (process.env.NODE_ENV !== 'production') {
          console.log('Calculating metrics for', orders.length, 'orders');
        }
        
        set({ isCalculating: true });
        
        try {
          // Calculate customer metrics - ensure all values are numbers
          const totalOrders = orders.length || 0;
          const pendingOrders = orders.filter(o => 
            ['pending', 'preparing', 'on-the-way', 'out for delivery'].includes(o.status.toLowerCase())
          ).length || 0;
          const completedOrders = orders.filter(o => 
            o.status.toLowerCase() === 'delivered'
          ).length || 0;
          const totalSpent = orders
            .filter(o => o.status.toLowerCase() === 'delivered')
            .reduce((sum, o) => sum + (Number(o.totalPrice) || 0), 0);
            
          // Get recent orders (last 5)
          const recentOrders = [...orders]
            .sort((a, b) => 
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            )
            .slice(0, 5) as unknown as Order[];
            
          // Calculate seller metrics per restaurant
          const sellerMetricsMap: Record<string, SellerMetrics> = {};
          
          // Group orders by restaurant with improved ID handling
          const ordersByRestaurant: Record<string, StoreOrder[]> = {};
          
          // Log all restaurantIds in dev environment
          if (process.env.NODE_ENV !== 'production') {
            console.log('All restaurant IDs in orders:', orders.map(o => o.restaurantId));
          }
          
          orders.forEach(order => {
            let restaurantId = order.restaurantId || 'unknown';
            
            // Check for restaurantInfo object (added in checkout page)
            if (order.restaurantInfo) {
              if (typeof order.restaurantInfo === 'object') {
                const possibleId = order.restaurantInfo.id || order.restaurantInfo._id;
                if (possibleId) {
                  restaurantId = possibleId;
                }
              }
            }
            
            // Normalize restaurant ID (strip any object wrappers if present)
            if (typeof restaurantId === 'object' && restaurantId !== null) {
              restaurantId = (restaurantId as any)._id || (restaurantId as any).id || 'unknown';
            }
            
            // Ensure restaurant ID is a string
            const restaurantIdStr = String(restaurantId);
            
            if (!ordersByRestaurant[restaurantIdStr]) {
              ordersByRestaurant[restaurantIdStr] = [];
            }
            ordersByRestaurant[restaurantIdStr].push(order);
          });
          
          // For each restaurant, calculate metrics
          for (const restaurantId in ordersByRestaurant) {
            const restaurantOrders = ordersByRestaurant[restaurantId] || [];
            
            if (restaurantOrders.length > 0) {
              // Calculate restaurant metrics
              const totalOrders = restaurantOrders.length;
              const pendingOrders = restaurantOrders.filter(o => 
                ['pending', 'preparing', 'on-the-way', 'out for delivery'].includes(o.status.toLowerCase())
              ).length;
              const completedOrders = restaurantOrders.filter(o => 
                o.status.toLowerCase() === 'delivered'
              ).length;
              const totalRevenue = restaurantOrders
                .filter(o => o.status.toLowerCase() === 'delivered')
                .reduce((sum, o) => sum + (Number(o.totalPrice) || 0), 0);
                
              // Calculate popular items
              const itemCounts: Record<string, number> = {};
              restaurantOrders.forEach(order => {
                if (Array.isArray(order.items)) {
                  order.items.forEach((item: any) => {
                    const itemName = item.name || 'Unknown Item';
                    itemCounts[itemName] = (itemCounts[itemName] || 0) + (item.quantity || 1);
                  });
                }
              });
                
              // Convert to array and sort
              const popularItems = Object.entries(itemCounts)
                .map(([name, count]) => ({ name, count }))
                .sort((a, b) => b.count - a.count)
                .slice(0, 5);
                
                // Get recent orders for this restaurant (last 5)
                const recentOrders = [...restaurantOrders]
                  .sort((a, b) => 
                    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
                  )
                  .slice(0, 5) as unknown as Order[];
                
                // Store restaurant metrics
                sellerMetricsMap[restaurantId] = {
                  totalOrders,
                  pendingOrders,
                  completedOrders,
                  totalRevenue,
                  popularItems,
                  recentOrders: recentOrders,
                };
            }
          }
          
          // Update the store with all calculated metrics at once to minimize state updates
          // Copy the new metrics to ensure they're fresh objects
          const newCustomerMetrics = {
            totalOrders,
            pendingOrders,
            completedOrders,
            totalSpent,
            recentOrders: [...recentOrders],
          };
          
          const newSellerMetrics = { ...sellerMetricsMap };
          
          set({
            customerMetrics: newCustomerMetrics,
            sellerMetrics: newSellerMetrics,
            lastUpdated: Date.now(),
            isCalculating: false
          });
          
          // Log the calculation results
          if (process.env.NODE_ENV !== 'production') {
            console.log('Metrics calculation completed', {
              customer: newCustomerMetrics,
              sellers: Object.keys(newSellerMetrics).length
            });
          }
        } catch (error) {
          console.error('Error calculating metrics:', error);
          set({ isCalculating: false });
        }
      },
      
      // Get customer metrics - now memoized to avoid unnecessary recalculations
      getCustomerMetrics: () => {
        return get().customerMetrics;
      },
      
      // Get seller metrics for a specific restaurant - now memoized to avoid unnecessary recalculations
      getSellerMetrics: (restaurantId: string) => {
        const metrics = get().sellerMetrics;
        const orders = get().orders;
        
        // Try direct match first
        if (metrics[restaurantId]) {
          console.log('Found direct metrics match for restaurant ID:', restaurantId);
          return metrics[restaurantId];
        }
        
        // If we don't have a direct match, let's try to find any orders for this restaurant
        // and see if they have metrics calculated with a different ID format
        const matchingOrderIds = new Set<string>();
        
        // Check all orders for any that match this seller (using all potential ID formats)
        orders.forEach(order => {
          // Get all versions of order's restaurant ID
          const orderRestaurantId = String(order.restaurantId || '').toLowerCase();
          const sellerIdStr = String(restaurantId || '').toLowerCase();
          
          // Check restaurantInfo object
          let restaurantInfoId = '';
          if (order.restaurantInfo) {
            if (typeof order.restaurantInfo === 'object') {
              restaurantInfoId = String(order.restaurantInfo.id || order.restaurantInfo._id || '').toLowerCase();
            }
          }
          
          // Check for match using all possible formats
          const hasMatch = 
            orderRestaurantId === sellerIdStr || 
            orderRestaurantId.includes(sellerIdStr) || 
            sellerIdStr.includes(orderRestaurantId) ||
            (restaurantInfoId && (restaurantInfoId === sellerIdStr || 
                                  restaurantInfoId.includes(sellerIdStr) || 
                                  sellerIdStr.includes(restaurantInfoId)));
          
          if (hasMatch) {
            // If we found an order that matches, check if we have metrics for its restaurant ID
            matchingOrderIds.add(orderRestaurantId);
            if (restaurantInfoId) matchingOrderIds.add(restaurantInfoId);
          }
        });
        
        // Now check if we have metrics for any of the matching restaurant IDs
        for (const orderId of matchingOrderIds) {
          if (metrics[orderId]) {
            console.log('Found metrics using order\'s restaurant ID:', orderId);
            return metrics[orderId];
          }
        }
        
        // If not found, try to find a fuzzy match (to handle different formats of the same ID)
        const allKeys = Object.keys(metrics);
        
        // Log available keys in dev environment
        if (process.env.NODE_ENV !== 'production' && allKeys.length > 0) {
          console.log('Available restaurant IDs:', allKeys);
          console.log('Looking for restaurant ID:', restaurantId);
          console.log('Potential matching IDs from orders:', Array.from(matchingOrderIds));
        }
        
        // Try for a partial match (case insensitive)
        const lowerRestaurantId = restaurantId.toLowerCase();
        for (const key of allKeys) {
          if (key.toLowerCase().includes(lowerRestaurantId) || 
              lowerRestaurantId.includes(key.toLowerCase())) {
            console.log('Found partial restaurant ID match:', key);
            return metrics[key];
          }
        }
        
        // If still no metrics found, manually calculate metrics from matching orders
        if (orders.length > 0) {
          console.log('No metrics found in store, manually calculating from orders');
          
          // Filter orders that belong to this seller
          const sellerOrders = orders.filter(order => {
            const orderRestaurantId = String(order.restaurantId || '').toLowerCase();
            const sellerIdStr = String(restaurantId || '').toLowerCase();
            
            // Check restaurantInfo object
            let restaurantInfoId = '';
            if (order.restaurantInfo) {
              if (typeof order.restaurantInfo === 'object') {
                restaurantInfoId = String(order.restaurantInfo.id || order.restaurantInfo._id || '').toLowerCase();
              }
            }
            
            // Check for match using all possible formats
            return orderRestaurantId === sellerIdStr || 
                  orderRestaurantId.includes(sellerIdStr) || 
                  sellerIdStr.includes(orderRestaurantId) ||
                  (restaurantInfoId && (restaurantInfoId === sellerIdStr || 
                                        restaurantInfoId.includes(sellerIdStr) || 
                                        sellerIdStr.includes(restaurantInfoId)));
          });
          
          console.log('Manually filtered seller orders:', sellerOrders.length);
          
          if (sellerOrders.length > 0) {
            // Calculate restaurant metrics
            const totalOrders = sellerOrders.length;
            const pendingOrders = sellerOrders.filter(o => 
              ['pending', 'preparing', 'on-the-way', 'out for delivery'].includes(o.status.toLowerCase())
            ).length;
            const completedOrders = sellerOrders.filter(o => 
              o.status.toLowerCase() === 'delivered'
            ).length;
            const totalRevenue = sellerOrders
              .filter(o => o.status.toLowerCase() === 'delivered')
              .reduce((sum, o) => sum + (Number(o.totalPrice) || 0), 0);
              
            // Calculate popular items
            const itemCounts: Record<string, number> = {};
            sellerOrders.forEach(order => {
              if (Array.isArray(order.items)) {
                order.items.forEach((item: any) => {
                  const itemName = item.name || 'Unknown Item';
                  itemCounts[itemName] = (itemCounts[itemName] || 0) + (item.quantity || 1);
                });
              }
            });
              
            // Convert to array and sort
            const popularItems = Object.entries(itemCounts)
              .map(([name, count]) => ({ name, count }))
              .sort((a, b) => b.count - a.count)
              .slice(0, 5);
              
            // Get recent orders for this restaurant (last 5)
            const recentOrders = [...sellerOrders]
              .sort((a, b) => 
                new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
              )
              .slice(0, 5) as unknown as Order[];
            
            // Return manually calculated metrics
            console.log('Returning manually calculated metrics for seller:', restaurantId);
            return {
              totalOrders,
              pendingOrders,
              completedOrders,
              totalRevenue,
              popularItems,
              recentOrders,
            };
          }
        }
        
        return defaultSellerMetrics;
      },
    }),
    {
      name: `${STORE_NAME}-${VERSION}`,
      storage: createJSONStorage(() => {
        // Use localStorage with fallbacks and error handling
        return {
          getItem: (name) => {
            try {
              const value = localStorage.getItem(name);
              return value ? JSON.parse(value) : null;
            } catch (error) {
              console.error('Error getting from localStorage:', error);
              return null;
            }
          },
          setItem: (name, value) => {
            try {
              localStorage.setItem(name, JSON.stringify(value));
            } catch (error) {
              console.error('Error setting to localStorage:', error);
            }
          },
          removeItem: (name) => {
            try {
              localStorage.removeItem(name);
            } catch (error) {
              console.error('Error removing from localStorage:', error);
            }
          }
        };
      }),
      partialize: (state) => ({
        orders: state.orders,
        customerMetrics: state.customerMetrics,
        sellerMetrics: state.sellerMetrics,
        lastUpdated: state.lastUpdated,
        // Don't persist isCalculating flag
      }),
      version: 1, // Zustand persist version for potential migrations
      onRehydrateStorage: () => (state) => {
        if (state) {
          // Calculate metrics on rehydration to ensure they're up to date
          setTimeout(() => {
            if (process.env.NODE_ENV !== 'production') {
              console.log('Rehydrated metrics store with', state.orders.length, 'orders');
            }
            state.calculateMetrics();
          }, 100);
        }
      },
      skipHydration: true,
    }
  )
); 