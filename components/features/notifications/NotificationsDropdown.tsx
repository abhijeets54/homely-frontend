'use client';

import React, { useState } from 'react';
import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { useNotifications } from '@/lib/api';
import { Badge } from '@/components/ui/badge';
import NotificationsList from './NotificationsList';

export interface NotificationsDropdownProps {
  maxItems?: number;
}

export const NotificationsDropdown = ({ maxItems = 5 }: NotificationsDropdownProps) => {
  const [open, setOpen] = useState(false);
  const { data } = useNotifications();
  const unreadCount = data?.unreadCount || 0;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <NotificationsList 
          maxItems={maxItems} 
          onClose={() => setOpen(false)} 
        />
      </PopoverContent>
    </Popover>
  );
};

export default NotificationsDropdown; 