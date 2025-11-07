import AxiosClient from "@/config/axios";
import { AxiosError } from "axios";
import { ENDPOINTS } from "@/lib/endpoints";
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
    const response = await AxiosClient.get(
      ENDPOINTS.notifications.GET_ALL_NOTIFICATIONS
    );
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
 * Get only unread notifications
 * @returns List of unread notifications with pagination
 */
export const getUnreadNotifications =
  async (): Promise<NotificationResponse> => {
    try {
      const response = await AxiosClient.get(
        ENDPOINTS.notifications.GET_UNREAD_NOTIFICATIONS
      );
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
 * Get notifications by type
 * @param type - Type of notifications to retrieve
 * @returns List of notifications of the specified type with pagination
 */
export const getNotificationsByType = async (
  type: string
): Promise<NotificationResponse> => {
  try {
    const response = await AxiosClient.get(
      ENDPOINTS.notifications.GET_NOTIFICATIONS_BY_TYPE(type)
    );
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
 * Get unread notification count
 * @returns Count of unread notifications
 */
export const getUnreadNotificationCount = async (): Promise<{
  status: boolean;
  unread_count: number;
}> => {
  try {
    const response = await AxiosClient.get(
      ENDPOINTS.notifications.GET_UNREAD_COUNT
    );
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      return (
        error.response?.data || {
          status: false,
          unread_count: 0,
        }
      );
    } else {
      console.error("Unexpected error:", error);
      return {
        status: false,
        unread_count: 0,
      };
    }
  }
};

/**
 * Get a single notification by ID
 * @param notificationId - ID of the notification to retrieve
 * @returns Single notification data
 */
export const getSingleNotification = async (
  notificationId: number
): Promise<{ status: boolean; notification: NotificationData }> => {
  try {
    const response = await AxiosClient.get(
      ENDPOINTS.notifications.GET_SINGLE_NOTIFICATION(notificationId)
    );
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      return (
        error.response?.data || {
          status: false,
          notification: {} as NotificationData,
        }
      );
    } else {
      console.error("Unexpected error:", error);
      return {
        status: false,
        notification: {} as NotificationData,
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
    const response = await AxiosClient.post(
      ENDPOINTS.notifications.MARK_NOTIFICATION_AS_READ(Number(notificationId))
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
    const response = await AxiosClient.post(
      ENDPOINTS.notifications.MARK_ALL_NOTIFICATIONS_AS_READ
    );
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
      ENDPOINTS.notifications.DELETE_NOTIFICATION(Number(notificationId))
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
