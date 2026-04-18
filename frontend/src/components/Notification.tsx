import React, { useEffect } from 'react';
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react';

export type NotificationType = 'success' | 'error' | 'warning' | 'info';

interface NotificationProps {
  id: string;
  type: NotificationType;
  message: string;
  onClose: (id: string) => void;
}

const Notification: React.FC<NotificationProps> = ({ id, type, message, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose(id);
    }, 5000);
    return () => clearTimeout(timer);
  }, [id, onClose]);

  const icons = {
    success: <CheckCircle className="text-green-500" size={20} />,
    error: <XCircle className="text-red-500" size={20} />,
    warning: <AlertCircle className="text-yellow-500" size={20} />,
    info: <Info className="text-blue-500" size={20} />,
  };

  const bgColors = {
    success: 'bg-green-50 border-green-100',
    error: 'bg-red-50 border-red-100',
    warning: 'bg-yellow-50 border-yellow-100',
    info: 'bg-blue-50 border-blue-100',
  };

  return (
    <div className={`flex items-center gap-3 px-4 py-3 rounded-2xl border shadow-lg animate-in slide-in-from-right-full duration-300 mb-3 ${bgColors[type]}`}>
      {icons[type]}
      <p className="text-sm font-medium text-gray-800 flex-1">{message}</p>
      <button 
        onClick={() => onClose(id)}
        className="text-gray-400 hover:text-gray-600 transition-colors"
      >
        <X size={16} />
      </button>
    </div>
  );
};

interface NotificationContainerProps {
  notifications: Array<{ id: string; type: NotificationType; message: string }>;
  removeNotification: (id: string) => void;
}

export const NotificationContainer: React.FC<NotificationContainerProps> = ({ notifications, removeNotification }) => {
  return (
    <div className="fixed top-6 right-6 z-[100] flex flex-col items-end w-full max-w-sm pointer-events-none">
      <div className="pointer-events-auto">
        {notifications.map((n) => (
          <Notification 
            key={n.id}
            id={n.id}
            type={n.type}
            message={n.message}
            onClose={removeNotification}
          />
        ))}
      </div>
    </div>
  );
};
