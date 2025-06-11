import { notifications } from '@mantine/notifications';
import { Check, X, Info, AlertTriangle } from 'lucide-react';

// Custom notification styles
const customStyles = {
  root: {
    backgroundColor: '#F08C23',
    borderLeft: `4px solid #3D6B2C`,
    color: 'white',
    '&::before': {
      backgroundColor: '#3D6B2C',
    },
  },
  title: {
    color: 'white',
    fontWeight: 600,
  },
  description: {
    color: 'white',
    opacity: 0.9,
  },
  closeButton: {
    color: 'white',
    '&:hover': {
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
    },
  },
  icon: {
    backgroundColor: '#3D6B2C',
    color: 'white',
  },
};

export interface NotificationOptions {
  title?: string;
  message: string;
  type?: 'success' | 'error' | 'info' | 'warning';
  autoClose?: boolean | number;
  withCloseButton?: boolean;
  position?: 'top-left' | 'top-right' | 'top-center' | 'bottom-left' | 'bottom-right' | 'bottom-center';
}

// Custom notification function
export const showNotification = ({
  title,
  message,
  type = 'info',
  autoClose = 4000,
  withCloseButton = true,
  position = 'top-right'
}: NotificationOptions) => {
  
  // Icon mapping based on type
  const getIcon = () => {
    switch (type) {
      case 'success':
        return Check;
      case 'error':
        return X;
      case 'warning':
        return AlertTriangle;
      default:
        return Info;
    }
  };

  const Icon = getIcon();

  notifications.show({
    title,
    message,
    color: '#3D6B2C', // Primary color for the notification system
    icon: <Icon size={18} />,
    autoClose,
    withCloseButton,
    position,
    styles: customStyles,
    classNames: {
      root: 'notification-custom-root',
      title: 'notification-custom-title',
      description: 'notification-custom-description',
      closeButton: 'notification-custom-close',
      icon: 'notification-custom-icon',
    },
  });
};

// Convenience methods for different types
export const notify = {
  success: (message: string, title?: string, options?: Partial<NotificationOptions>) =>
    showNotification({ message, title, type: 'success', ...options }),
    
  error: (message: string, title?: string, options?: Partial<NotificationOptions>) =>
    showNotification({ message, title, type: 'error', ...options }),
    
  warning: (message: string, title?: string, options?: Partial<NotificationOptions>) =>
    showNotification({ message, title, type: 'warning', ...options }),
    
  info: (message: string, title?: string, options?: Partial<NotificationOptions>) =>
    showNotification({ message, title, type: 'info', ...options }),
};

