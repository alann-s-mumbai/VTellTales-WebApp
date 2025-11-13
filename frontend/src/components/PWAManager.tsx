import React, { useEffect, useState } from 'react';
import { Download, Wifi, WifiOff, RefreshCw, X } from 'lucide-react';

interface PWANotificationProps {
  type: 'install' | 'update' | 'offline' | 'online';
  onAction?: () => void;
  onDismiss?: () => void;
}

const PWANotification: React.FC<PWANotificationProps> = ({ type, onAction, onDismiss }) => {
  const getNotificationConfig = () => {
    switch (type) {
      case 'install':
        return {
          icon: <Download className="h-5 w-5 text-blue-600" />,
          title: 'Install VTellTales App',
          message: 'Add VTellTales to your home screen for a better experience!',
          actionText: 'Install',
          bgColor: 'bg-blue-50 border-blue-200',
          actionColor: 'bg-blue-600 hover:bg-blue-700'
        };
      case 'update':
        return {
          icon: <RefreshCw className="h-5 w-5 text-green-600" />,
          title: 'App Update Available',
          message: 'A new version of VTellTales is available. Refresh to update.',
          actionText: 'Update',
          bgColor: 'bg-green-50 border-green-200',
          actionColor: 'bg-green-600 hover:bg-green-700'
        };
      case 'offline':
        return {
          icon: <WifiOff className="h-5 w-5 text-amber-600" />,
          title: 'You\'re Offline',
          message: 'You can still browse and create stories. They\'ll sync when you\'re back online.',
          actionText: null,
          bgColor: 'bg-amber-50 border-amber-200',
          actionColor: ''
        };
      case 'online':
        return {
          icon: <Wifi className="h-5 w-5 text-green-600" />,
          title: 'Back Online',
          message: 'Your connection is restored. Syncing your offline changes...',
          actionText: null,
          bgColor: 'bg-green-50 border-green-200',
          actionColor: ''
        };
      default:
        return {
          icon: null,
          title: '',
          message: '',
          actionText: null,
          bgColor: '',
          actionColor: ''
        };
    }
  };

  const config = getNotificationConfig();

  return (
    <div className={`fixed top-4 right-4 max-w-sm w-full z-50 border rounded-lg p-4 shadow-lg ${config.bgColor} animate-in slide-in-from-right duration-300`}>
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3 flex-1">
          {config.icon && (
            <div className="flex-shrink-0 mt-0.5">
              {config.icon}
            </div>
          )}
          <div className="flex-1">
            <h4 className="text-sm font-semibold text-gray-900 mb-1">
              {config.title}
            </h4>
            <p className="text-sm text-gray-600">
              {config.message}
            </p>
            {config.actionText && (
              <button
                onClick={onAction}
                className={`mt-3 px-3 py-1.5 text-sm font-medium text-white rounded-md transition-colors ${config.actionColor}`}
              >
                {config.actionText}
              </button>
            )}
          </div>
        </div>
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="flex-shrink-0 ml-2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
};

const PWAManager: React.FC = () => {
  const [notifications, setNotifications] = useState<Array<{
    id: string;
    type: 'install' | 'update' | 'offline' | 'online';
    timestamp: number;
  }>>([]);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const addNotification = (type: 'install' | 'update' | 'offline' | 'online') => {
      const id = Date.now().toString();
      setNotifications(prev => [
        ...prev.filter(n => n.type !== type), // Remove existing notifications of same type
        { id, type, timestamp: Date.now() }
      ]);

      // Auto-remove some notifications
      if (type === 'online' || type === 'offline') {
        setTimeout(() => {
          setNotifications(prev => prev.filter(n => n.id !== id));
        }, 3000);
      }
    };

    const handlePWAInstallAvailable = () => addNotification('install');
    const handlePWAUpdateAvailable = () => addNotification('update');
    const handleNetworkOffline = () => {
      setIsOnline(false);
      addNotification('offline');
    };
    const handleNetworkOnline = () => {
      setIsOnline(true);
      addNotification('online');
    };
    const handlePWAInstallCompleted = () => {
      setNotifications(prev => prev.filter(n => n.type !== 'install'));
    };

    // Listen for PWA events
    window.addEventListener('pwa-install-available', handlePWAInstallAvailable);
    window.addEventListener('pwa-update-available', handlePWAUpdateAvailable);
    window.addEventListener('pwa-install-completed', handlePWAInstallCompleted);
    window.addEventListener('network-offline', handleNetworkOffline);
    window.addEventListener('network-online', handleNetworkOnline);

    // Listen for native online/offline events
    window.addEventListener('online', handleNetworkOnline);
    window.addEventListener('offline', handleNetworkOffline);

    return () => {
      window.removeEventListener('pwa-install-available', handlePWAInstallAvailable);
      window.removeEventListener('pwa-update-available', handlePWAUpdateAvailable);
      window.removeEventListener('pwa-install-completed', handlePWAInstallCompleted);
      window.removeEventListener('network-offline', handleNetworkOffline);
      window.removeEventListener('network-online', handleNetworkOnline);
      window.removeEventListener('online', handleNetworkOnline);
      window.removeEventListener('offline', handleNetworkOffline);
    };
  }, []);

  const handleInstallAction = async () => {
    const { PWAService } = await import('../services/PWAService');
    const pwa = PWAService.getInstance();
    const installed = await pwa.showInstallPrompt();
    
    if (installed) {
      setNotifications(prev => prev.filter(n => n.type !== 'install'));
    }
  };

  const handleUpdateAction = () => {
    window.location.reload();
  };

  const dismissNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  return (
    <>
      {notifications.map(notification => (
        <PWANotification
          key={notification.id}
          type={notification.type}
          onAction={
            notification.type === 'install' ? handleInstallAction :
            notification.type === 'update' ? handleUpdateAction :
            undefined
          }
          onDismiss={
            notification.type === 'install' || notification.type === 'update'
              ? () => dismissNotification(notification.id)
              : undefined
          }
        />
      ))}
      
      {/* Network Status Indicator */}
      <div className="fixed bottom-4 right-4 z-40">
        {!isOnline && (
          <div className="bg-amber-500 text-white px-3 py-2 rounded-lg shadow-lg flex items-center space-x-2">
            <WifiOff className="h-4 w-4" />
            <span className="text-sm font-medium">Offline Mode</span>
          </div>
        )}
      </div>
    </>
  );
};

export default PWAManager;