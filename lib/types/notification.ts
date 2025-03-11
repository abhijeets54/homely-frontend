/**
 * Notification Types
 */

/**
 * Notification type enum
 */
export enum NotificationType {
  ORDER = 'order',
  PAYMENT = 'payment',
  DELIVERY = 'delivery',
  SYSTEM = 'system',
}

/**
 * Notification model
 */
export interface Notification {
  id: string;
  userId: string;
  message: string;
  type: NotificationType;
  isRead: boolean;
  createdAt: string;
  updatedAt: string;
  relatedId?: string; // ID of related entity (order, payment, etc.)
  metadata?: Record<string, any>; // Additional data related to the notification
}

/**
 * Create notification request
 */
export interface CreateNotificationRequest {
  userId: string;
  message: string;
  type: NotificationType;
  relatedId?: string;
  metadata?: Record<string, any>;
}

/**
 * Update notification request
 */
export interface UpdateNotificationRequest {
  isRead?: boolean;
}

/**
 * Notification response
 */
export interface NotificationResponse {
  notification: Notification;
}

/**
 * Notifications list response
 */
export interface NotificationsListResponse {
  notifications: Notification[];
  unreadCount: number;
  totalCount: number;
} 