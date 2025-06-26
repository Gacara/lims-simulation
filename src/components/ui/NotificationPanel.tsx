import React from 'react';
import { useGameStore } from '../../stores/gameStore';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';

export function NotificationPanel() {
  const { ui, markNotificationRead, clearNotifications } = useGameStore();
  const { notifications } = ui;

  const unreadNotifications = notifications.filter(n => !n.read);

  if (unreadNotifications.length === 0) {
    return null;
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle size={20} className="text-green-500" />;
      case 'error':
        return <AlertCircle size={20} className="text-red-500" />;
      case 'warning':
        return <AlertTriangle size={20} className="text-yellow-500" />;
      default:
        return <Info size={20} className="text-blue-500" />;
    }
  };

  return (
    <div className="absolute top-20 right-4 w-80 max-h-96 overflow-y-auto space-y-2 z-40 pointer-events-auto">
      {unreadNotifications.map((notification) => (
        <div
          key={notification.id}
          className="bg-white rounded-lg shadow-lg border border-gray-200 p-4 animate-slide-in-right"
        >
          <div className="flex items-start gap-3">
            {getNotificationIcon(notification.type)}
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-medium text-gray-800 mb-1">
                {notification.title}
              </h4>
              <p className="text-sm text-gray-600">
                {notification.message}
              </p>
              <div className="text-xs text-gray-400 mt-2">
                {notification.timestamp.toLocaleTimeString()}
              </div>
            </div>
            <button
              onClick={() => markNotificationRead(notification.id)}
              className="p-1 hover:bg-gray-100 rounded-full transition-colors flex-shrink-0"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      ))}
      
      {unreadNotifications.length > 1 && (
        <div className="text-center">
          <button
            onClick={clearNotifications}
            className="text-sm text-gray-500 hover:text-gray-700 underline"
          >
            Clear all notifications
          </button>
        </div>
      )}
    </div>
  );
}