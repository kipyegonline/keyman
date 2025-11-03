import AxiosClient from "@/config/axios";
import { AxiosError } from "axios";

/**
 * Notification type definition
 */
export interface NotificationData {
  id: number;
  type: string;
  title: string;
  body: string;
  data: {
    body: string;
    meta: unknown[];
    phone?: string;
    email?: string;
    title: string;
    source: string;
    channels: string[];
  };
  read_at: string | null;
  is_read: boolean;
  created_at: string;
  updated_at: string;
}

export interface NotificationResponse {
  status: boolean;
  notifications: NotificationData[];
  pagination: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number;
    to: number;
  };
}

/**
 * Get all notifications for the current user
 * @returns List of notifications with pagination
 */
export const getNotifications = async (): Promise<NotificationResponse> => {
  try {
    const response = await AxiosClient.get("/notifications");
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      return (
        error.response?.data || {
          status: false,
          notifications: [],
          pagination: {
            current_page: 1,
            last_page: 1,
            per_page: 15,
            total: 0,
            from: 0,
            to: 0,
          },
        }
      );
    } else {
      console.error("Unexpected error:", error);
      return {
        status: false,
        notifications: [],
        pagination: {
          current_page: 1,
          last_page: 1,
          per_page: 15,
          total: 0,
          from: 0,
          to: 0,
        },
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
    id: 16,
    type: "SystemNotificationSender",
    title: "System notification",
    body: "You have been selected as a potential service provider for the contract KMC073. Please follow the link to view the contract: https://www.keymanstores.com/keyman/dashboard/key-contract/KMC073",
    data: {
      body: "You have been selected as a potential service provider for the contract KMC073. Please follow the link to view the contract: https://www.keymanstores.com/keyman/dashboard/key-contract/KMC073",
      meta: [],
      phone: "0727500128",
      title: "System notification",
      source: "notifications.sendSMS",
      channels: ["sms"],
    },
    read_at: null,
    is_read: false,
    created_at: "2025-11-03T17:15:36+03:00",
    updated_at: "2025-11-03T17:15:36+03:00",
  },
  {
    id: 14,
    type: "SystemNotificationSender",
    title: "[KMC073] Potential Service Provider Notification",
    body: "You have been selected as a potential service provider for the contract KMC073. Please follow the link to view the contract: https://www.keymanstores.com/keyman/dashboard/key-contract/KMC073",
    data: {
      body: "You have been selected as a potential service provider for the contract KMC073. Please follow the link to view the contract: https://www.keymanstores.com/keyman/dashboard/key-contract/KMC073",
      meta: [],
      email: "david.kimari@outlook.com",
      title: "[KMC073] Potential Service Provider Notification",
      source: "notifications.sendEmail",
      channels: ["email"],
    },
    read_at: null,
    is_read: false,
    created_at: "2025-11-03T17:15:35+03:00",
    updated_at: "2025-11-03T17:15:35+03:00",
  },
  {
    id: 12,
    type: "SystemNotificationSender",
    title: "System notification",
    body: "There are changes to the contract that have been made. Please review the changes. Please follow the link to view the changes: https://www.keymanstores.com/keyman/dashboard/key-contract/KMC073",
    data: {
      body: "There are changes to the contract that have been made. Please review the changes. Please follow the link to view the changes: https://www.keymanstores.com/keyman/dashboard/key-contract/KMC073",
      meta: [],
      phone: "0727500128",
      title: "System notification",
      source: "notifications.sendSMS",
      channels: ["sms"],
    },
    read_at: null,
    is_read: false,
    created_at: "2025-11-03T17:15:34+03:00",
    updated_at: "2025-11-03T17:15:34+03:00",
  },
  {
    id: 10,
    type: "SystemNotificationSender",
    title: "[KMC073] Contract Changes Notification",
    body: "There are changes to the contract that have been made. Please review the changes. Please follow the link to view the changes: https://www.keymanstores.com/keyman/dashboard/key-contract/KMC073",
    data: {
      body: "There are changes to the contract that have been made. Please review the changes. Please follow the link to view the changes: https://www.keymanstores.com/keyman/dashboard/key-contract/KMC073",
      meta: [],
      email: "david.kimari@outlook.com",
      title: "[KMC073] Contract Changes Notification",
      source: "notifications.sendEmail",
      channels: ["email"],
    },
    read_at: null,
    is_read: false,
    created_at: "2025-11-03T17:15:33+03:00",
    updated_at: "2025-11-03T17:15:33+03:00",
  },
];
