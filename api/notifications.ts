import AxiosClient from "@/config/axios";
import { AxiosError } from "axios";

/**
 * Notification type definition
 */
export interface NotificationData {
  id: string;
  user_id: string;
  type: string;
  notification_key: string;
  data: {
    title: string;
    description: string;
    link?: string;
    avatar?: string;
  };
  read_at: Date | null;
  created_at: Date;
}

/**
 * Get all notifications for the current user
 * @returns List of notifications
 */
export const getNotifications = async (): Promise<{
  notifications: NotificationData[];
  unread_count: number;
  status: boolean;
}> => {
  try {
    const response = await AxiosClient.get("/notifications");
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      return (
        error.response?.data || {
          notifications: [],
          unread_count: 0,
          status: false,
          message: "Failed to fetch notifications",
        }
      );
    } else {
      console.error("Unexpected error:", error);
      return {
        notifications: [],
        unread_count: 0,
        status: false,
      };
    }
  }
};

/**
 * Mark a single notification as read
 * @param notificationId - ID of the notification to mark as read
 */
export const markNotificationAsRead = async (
  notificationId: string
): Promise<{ status: boolean; message: string }> => {
  try {
    const response = await AxiosClient.put(
      `/notifications/${notificationId}/read`
    );
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      return (
        error.response?.data || {
          status: false,
          message: "Failed to mark notification as read",
        }
      );
    } else {
      console.error("Unexpected error:", error);
      return {
        status: false,
        message: "An unexpected error occurred",
      };
    }
  }
};

/**
 * Mark all notifications as read
 */
export const markAllNotificationsAsRead = async (): Promise<{
  status: boolean;
  message: string;
}> => {
  try {
    const response = await AxiosClient.put("/notifications/read-all");
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      return (
        error.response?.data || {
          status: false,
          message: "Failed to mark all notifications as read",
        }
      );
    } else {
      console.error("Unexpected error:", error);
      return {
        status: false,
        message: "An unexpected error occurred",
      };
    }
  }
};

/**
 * Delete a notification
 * @param notificationId - ID of the notification to delete
 */
export const deleteNotification = async (
  notificationId: string
): Promise<{ status: boolean; message: string }> => {
  try {
    const response = await AxiosClient.delete(
      `/notifications/${notificationId}`
    );
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      return (
        error.response?.data || {
          status: false,
          message: "Failed to delete notification",
        }
      );
    } else {
      console.error("Unexpected error:", error);
      return {
        status: false,
        message: "An unexpected error occurred",
      };
    }
  }
};

// Mock data for development/testing
export const mockNotifications: NotificationData[] = [
  {
    id: "1",
    user_id: "user123",
    type: "order",
    notification_key: "order_created",
    data: {
      title: "New Order Placed",
      description: "Your order #ORD-2024-001 has been successfully placed.",
      link: "/keyman/dashboard/orders/1",
    },
    read_at: null,
    created_at: new Date(Date.now() - 1000 * 60 * 5), // 5 minutes ago
  },
  {
    id: "2",
    user_id: "user123",
    type: "quote",
    notification_key: "quote_received",
    data: {
      title: "New Quote Received",
      description:
        "You have received a new quote for Request #REQ-2024-045 from BuildMart Suppliers.",
      link: "/keyman/dashboard/requests/req123",
    },
    read_at: null,
    created_at: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
  },
  {
    id: "3",
    user_id: "user123",
    type: "delivery",
    notification_key: "delivery_update",
    data: {
      title: "Order Out for Delivery",
      description: "Your order #ORD-2024-001 is out for delivery.",
      link: "/keyman/dashboard/orders/1",
    },
    read_at: new Date(),
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
  },
  {
    id: "4",
    user_id: "user123",
    type: "message",
    notification_key: "new_message",
    data: {
      title: "New Message from Supplier",
      description: "BuildMart Suppliers sent you a message about your request.",
      link: "/keyman/dashboard/messages",
    },
    read_at: null,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 5), // 5 hours ago
  },
  {
    id: "5",
    user_id: "user123",
    type: "contract",
    notification_key: "contract_signed",
    data: {
      title: "Contract Ready for Review",
      description: "A new contract is ready for your review and signature.",
      link: "/keyman/dashboard/contracts",
    },
    read_at: new Date(),
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
  },
  {
    id: "6",
    user_id: "user123",
    type: "success",
    notification_key: "order_completed",
    data: {
      title: "Order Completed",
      description: "Your order #ORD-2024-001 has been successfully delivered.",
      link: "/keyman/dashboard/orders/1",
    },
    read_at: new Date(),
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2), // 2 days ago
  },
  {
    id: "7",
    user_id: "user123",
    type: "system",
    notification_key: "system_update",
    data: {
      title: "System Update",
      description: "New features have been added to improve your experience.",
      link: "/keyman/dashboard",
    },
    read_at: new Date(),
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3), // 3 days ago
  },
];
