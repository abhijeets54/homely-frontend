import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import apiClient from './client';
import { 
  Notification, 
  CreateNotificationRequest, 
  NotificationType,
  NotificationsListResponse,
  UpdateNotificationRequest
} from '../types/notification';

// API functions
export const notificationApi = {
  /**
   * Get all notifications for the authenticated user
   */
  getNotifications: async (): Promise<NotificationsListResponse> => {
    try {
      const response = await apiClient.get('/api/notifications');
      return response.data;
    } catch (error) {
      console.error('Error fetching notifications:', error);
      // Return empty data with a message about missing backend implementation
      return {
        notifications: [],
        unreadCount: 0,
        totalCount: 0,
        message: "Notification system is not implemented in the backend. Please check miss.md for details."
      };
    }
  },

  /**
   * Mark a notification as read
   */
  markAsRead: async (notificationId: string): Promise<Notification> => {
    try {
      const response = await apiClient.put(`/api/notifications/${notificationId}/read`, {
        isRead: true
      } as UpdateNotificationRequest);
      return response.data.notification;
    } catch (error) {
      console.error(`Error marking notification ${notificationId} as read:`, error);
      throw new Error("Notification system is not implemented in the backend. Please check miss.md for details.");
    }
  },

  /**
   * Delete a notification
   */
  deleteNotification: async (notificationId: string): Promise<void> => {
    try {
      await apiClient.delete(`/api/notifications/${notificationId}`);
    } catch (error) {
      console.error(`Error deleting notification ${notificationId}:`, error);
      throw new Error("Notification system is not implemented in the backend. Please check miss.md for details.");
    }
  },

  /**
   * Create a new notification
   */
  createNotification: async (notification: CreateNotificationRequest): Promise<Notification> => {
    try {
      const response = await apiClient.post('/api/notifications', notification);
      return response.data.notification;
    } catch (error) {
      console.error('Error creating notification:', error);
      throw new Error("Notification system is not implemented in the backend. Please check miss.md for details.");
    }
  }
};

// Custom hooks
export const useNotifications = () => {
  return useQuery({
    queryKey: ['notifications'],
    queryFn: () => notificationApi.getNotifications(),
    // Add retry and stale time options to handle backend unavailability
    retry: 1,
    staleTime: 60000 // 1 minute
  });
};

export const useMarkNotificationAsRead = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (notificationId: string) => notificationApi.markAsRead(notificationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
};

export const useDeleteNotification = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (notificationId: string) => notificationApi.deleteNotification(notificationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
};

export const useCreateNotification = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (notification: CreateNotificationRequest) => notificationApi.createNotification(notification),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
}; 