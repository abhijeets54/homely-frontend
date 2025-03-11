'use client';

import React from 'react';
import { useNotifications, useMarkNotificationAsRead, useDeleteNotification } from '@/lib/api';
import { Notification, NotificationType } from '@/lib/types/notification';
import { formatDistanceToNow } from 'date-fns';
import { Bell, ShoppingBag, CreditCard, Truck, Info, X, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';

export interface NotificationsListProps {
  maxItems?: number;
  showHeader?: boolean;
  onClose?: () => void;
}

export const NotificationsList = ({
  maxItems,
  showHeader = true,
  onClose,
}: NotificationsListProps) => {
  const { data, isLoading, error } = useNotifications();
  const markAsRead = useMarkNotificationAsRead();
  const deleteNotification = useDeleteNotification();

  const handleMarkAsRead = (notificationId: string) => {
    markAsRead.mutate(notificationId);
  };

  const handleDelete = (notificationId: string) => {
    deleteNotification.mutate(notificationId);
  };

  const getNotificationIcon = (type: NotificationType) => {
    switch (type) {
      case NotificationType.ORDER:
        return <ShoppingBag className="h-5 w-5 text-blue-500" />;
      case NotificationType.PAYMENT:
        return <CreditCard className="h-5 w-5 text-green-500" />;
      case NotificationType.DELIVERY:
        return <Truck className="h-5 w-5 text-yellow-500" />;
      case NotificationType.SYSTEM:
      default:
        return <Info className="h-5 w-5 text-gray-500" />;
    }
  };

  if (isLoading) {
    return (
      <Card className="w-full max-w-md">
        {showHeader && (
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg font-medium">Notifications</CardTitle>
            {onClose && (
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            )}
          </CardHeader>
        )}
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-start gap-4">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-3 w-3/4" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="w-full max-w-md">
        {showHeader && (
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg font-medium">Notifications</CardTitle>
            {onClose && (
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            )}
          </CardHeader>
        )}
        <CardContent>
          <div className="p-4 bg-red-50 border border-red-200 rounded-md">
            <h3 className="font-medium text-red-800 mb-2">Backend Implementation Missing</h3>
            <p className="text-sm text-red-700 mb-4">
              The notification system is not implemented in the backend. This feature requires backend endpoints to store and retrieve notifications.
            </p>
            <p className="text-xs text-red-600">
              Please check miss.md for implementation details.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (data?.message) {
    return (
      <Card className="w-full max-w-md">
        {showHeader && (
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg font-medium">Notifications</CardTitle>
            {onClose && (
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            )}
          </CardHeader>
        )}
        <CardContent>
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-md">
            <h3 className="font-medium text-amber-800 mb-2">Backend Implementation Missing</h3>
            <p className="text-sm text-amber-700 mb-4">
              {data.message}
            </p>
            <p className="text-xs text-amber-600">
              Required endpoints:
              <ul className="list-disc pl-5 mt-2">
                <li>GET /api/notifications</li>
                <li>PUT /api/notifications/:id/read</li>
                <li>DELETE /api/notifications/:id</li>
                <li>POST /api/notifications</li>
              </ul>
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const notifications = data?.notifications || [];
  const displayNotifications = maxItems ? notifications.slice(0, maxItems) : notifications;

  if (displayNotifications.length === 0) {
    return (
      <Card className="w-full max-w-md">
        {showHeader && (
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg font-medium">Notifications</CardTitle>
            {onClose && (
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            )}
          </CardHeader>
        )}
        <CardContent>
          <div className="flex flex-col items-center justify-center py-6">
            <Bell className="h-12 w-12 text-gray-300 mb-2" />
            <p className="text-gray-500">No notifications yet</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md">
      {showHeader && (
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div className="flex items-center gap-2">
            <CardTitle className="text-lg font-medium">Notifications</CardTitle>
            {data?.unreadCount > 0 && (
              <Badge variant="secondary" className="ml-2">
                {data.unreadCount} new
              </Badge>
            )}
          </div>
          {onClose && (
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          )}
        </CardHeader>
      )}
      <CardContent>
        <div className="space-y-4">
          {displayNotifications.map((notification: Notification) => (
            <div
              key={notification.id}
              className={`flex items-start gap-4 p-3 rounded-lg ${
                !notification.isRead ? 'bg-gray-50' : ''
              }`}
            >
              <div className="flex-shrink-0">
                {getNotificationIcon(notification.type)}
              </div>
              <div className="flex-1">
                <p className={`text-sm ${!notification.isRead ? 'font-medium' : ''}`}>
                  {notification.message}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                </p>
              </div>
              <div className="flex flex-col gap-2">
                {!notification.isRead && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={() => handleMarkAsRead(notification.id)}
                  >
                    <Check className="h-4 w-4" />
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={() => handleDelete(notification.id)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default NotificationsList; 