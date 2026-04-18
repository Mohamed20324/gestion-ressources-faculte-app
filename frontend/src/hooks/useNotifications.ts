import { useState, useCallback } from 'react';
import type { NotificationType } from '../components/Notification';

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<Array<{ id: string; type: NotificationType; message: string }>>([]);

  const showNotification = useCallback((type: NotificationType, message: string) => {
    const id = Math.random().toString(36).substring(2, 9);
    setNotifications((prev) => [...prev, { id, type, message }]);
  }, []);

  const removeNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  return {
    notifications,
    showNotification,
    removeNotification
  };
};
