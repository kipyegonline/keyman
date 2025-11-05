"use client";
import React from "react";
import {
  Menu,
  ScrollArea,
  Group,
  Text,
  Badge,
  Avatar,
  Box,
  UnstyledButton,
  Divider,
  Loader,
} from "@mantine/core";
import {
  Package,
  FileText,
  MessageSquare,
  Bell,
  ShoppingCart,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getNotifications,
  getUnreadNotificationCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  NotificationData,
} from "@/api/notifications";

// Use NotificationData from API
export type Notification = NotificationData;

interface NotificationMenuProps {
  onClose?: () => void;
}

// Helper function to get icon based on notification type
const getNotificationIcon = (type: string) => {
  const iconProps = { size: 18 };

  const lowerType = type.toLowerCase();

  // Handle SystemNotificationSender or check title/body for context
  if (lowerType.includes("system")) {
    return <Bell {...iconProps} />;
  }

  switch (lowerType) {
    case "order":
      return <Package {...iconProps} />;
    case "quote":
      return <FileText {...iconProps} />;
    case "message":
      return <MessageSquare {...iconProps} />;
    case "contract":
      return <FileText {...iconProps} />;
    case "delivery":
      return <ShoppingCart {...iconProps} />;
    case "success":
      return <CheckCircle {...iconProps} />;
    case "alert":
      return <AlertCircle {...iconProps} />;
    default:
      return <Bell {...iconProps} />;
  }
};

// Helper function to get icon color based on notification type
const getNotificationColor = (type: string): string => {
  const lowerType = type.toLowerCase();

  // Handle SystemNotificationSender with brand color
  if (lowerType.includes("system")) {
    return "#F08C23";
  }

  switch (lowerType) {
    case "order":
      return "#3D6B2C";
    case "quote":
      return "#F08C23";
    case "message":
      return "#3b82f6";
    case "contract":
      return "#8b5cf6";
    case "delivery":
      return "#388E3C";
    case "success":
      return "#10b981";
    case "alert":
      return "#ef4444";
    default:
      return "#6b7280";
  }
};

// Helper function to format timestamp
const formatTimestamp = (date: Date): string => {
  const now = new Date();
  const diff = now.getTime() - new Date(date).getTime();
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (seconds < 60) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;

  return new Date(date).toLocaleDateString();
};

// Individual Notification Item Component
const NotificationItem: React.FC<{
  notification: Notification;
  onMarkAsRead: (id: number) => void;
  onClose?: () => void;
}> = ({ notification, onMarkAsRead, onClose }) => {
  const router = useRouter();
  const isUnread = !notification.is_read;

  // Extract URL from body if present
  const extractUrl = (text: string): string | null => {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const match = text.match(urlRegex);
    return match ? match[0] : null;
  };

  const handleClick = () => {
    if (isUnread) {
      onMarkAsRead(notification.id);
    }

    const url = extractUrl(notification.body);
    if (url) {
      // Check if it's an internal URL
      if (url.includes("keymanstores.com")) {
        const path = url.split("keymanstores.com")[1];
        router.push(path);
      } else {
        window.open(url, "_blank");
      }
    }

    // Close the menu after a smooth transition delay
    if (onClose) {
      setTimeout(() => {
        onClose();
      }, 200);
    }
  };

  return (
    <UnstyledButton
      onClick={handleClick}
      style={{
        padding: "8px 12px",
        width: "100%",
        backgroundColor: isUnread ? "#fff7ed" : "transparent",
        borderLeft: isUnread ? "3px solid #F08C23" : "3px solid transparent",
        transition: "all 0.2s ease",
      }}
      className="hover:bg-gray-50"
    >
      <Group wrap="nowrap" align="flex-start" gap="xs">
        <Avatar
          size="md"
          radius="md"
          style={{
            backgroundColor: `${getNotificationColor(notification.type)}15`,
            color: getNotificationColor(notification.type),
            flexShrink: 0,
          }}
        >
          {getNotificationIcon(notification.type)}
        </Avatar>

        <Box style={{ flex: 1, minWidth: 0 }}>
          <Group justify="space-between" wrap="nowrap" mb={4} gap="xs">
            <Text size="sm" fw={isUnread ? 600 : 500} lineClamp={1}>
              {notification.title}
            </Text>
            {isUnread && (
              <Badge
                size="xs"
                color="orange"
                variant="filled"
                style={{
                  flexShrink: 0,
                  backgroundColor: "#F08C23",
                }}
              >
                New
              </Badge>
            )}
          </Group>

          <Text size="xs" c="dimmed" lineClamp={2} mb={4}>
            {notification.body}
          </Text>

          <Text size="xs" c="dimmed" fw={500}>
            {formatTimestamp(new Date(notification.created_at))}
          </Text>
        </Box>
      </Group>
    </UnstyledButton>
  );
};

// Main Notification Menu Component
export const NotificationMenu: React.FC<NotificationMenuProps> = ({
  onClose,
}) => {
  const queryClient = useQueryClient();

  // Fetch notifications
  const { data: notificationsData, isLoading } = useQuery({
    queryKey: ["notifications"],
    queryFn: getNotifications,
    refetchInterval: 30000, // Poll every 30 seconds
    staleTime: 25000, // Consider data stale after 25 seconds
  });

  // Fetch unread count
  const { data: unreadCountData } = useQuery({
    queryKey: ["unreadNotificationCount"],
    queryFn: getUnreadNotificationCount,
    refetchInterval: 30000,
    staleTime: 25000,
  });

  // Mutation for marking a notification as read
  const markAsReadMutation = useMutation({
    mutationFn: (notificationId: string) =>
      markNotificationAsRead(notificationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["unreadNotificationCount"] });
    },
  });

  // Mutation for marking all notifications as read
  const markAllAsReadMutation = useMutation({
    mutationFn: markAllNotificationsAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["unreadNotificationCount"] });
    },
  });
  console.log(unreadCountData, "NDI");
  const notifications = React.useMemo(() => {
    if (notificationsData?.status) {
      return notificationsData.notifications;
    } else return [];
  }, [notificationsData]);
  const unreadCount = React.useMemo(() => {
    if (unreadCountData?.status) return unreadCountData?.unread_count;
    else return 0;
  }, [unreadCountData]);
  const hasNotifications = notifications.length > 0;

  const handleMarkAsRead = (notificationId: number) => {
    markAsReadMutation.mutate(notificationId.toString());
  };

  const handleMarkAllAsRead = () => {
    markAllAsReadMutation.mutate();
  };

  return (
    <Menu.Dropdown p={0} style={{ overflow: "hidden", maxWidth: "100vw" }}>
      {/* Header */}
      <Box px="sm" py="sm" style={{ backgroundColor: "#f8f9fa" }}>
        <Group justify="space-between" wrap="nowrap" gap="xs">
          <Text size="lg" fw={600} c="#3D6B2C">
            Notifications
          </Text>
          {unreadCount > 0 && (
            <UnstyledButton onClick={handleMarkAllAsRead}>
              <Text
                size="xs"
                c="#F08C23"
                fw={500}
                className="hover:underline"
                style={{ cursor: "pointer", whiteSpace: "nowrap" }}
              >
                Mark all as read
              </Text>
            </UnstyledButton>
          )}
        </Group>
        {unreadCount > 0 && (
          <Text size="xs" c="dimmed" mt={4}>
            You have {unreadCount} unread notification
            {unreadCount !== 1 ? "s" : ""}
          </Text>
        )}
      </Box>

      <Divider />

      {/* Loading State */}
      {isLoading ? (
        <Box p="xl" style={{ textAlign: "center" }}>
          <Loader size="md" color="#3D6B2C" style={{ margin: "0 auto" }} />
          <Text size="sm" c="dimmed" mt="md">
            Loading notifications...
          </Text>
        </Box>
      ) : hasNotifications ? (
        // Notifications List
        <ScrollArea h={400} type="auto" style={{ maxHeight: "400px" }}>
          {notifications.map((notification) => (
            <NotificationItem
              key={notification.id}
              notification={notification}
              onMarkAsRead={handleMarkAsRead}
              onClose={onClose}
            />
          ))}
        </ScrollArea>
      ) : (
        // Empty State
        <Box p="xl" style={{ textAlign: "center" }}>
          <Bell size={48} color="#9ca3af" style={{ margin: "0 auto 16px" }} />
          <Text size="sm" fw={500} c="dimmed" mb={4}>
            No notifications yet
          </Text>
          <Text size="xs" c="dimmed">
            We&apos;ll notify you when something important happens
          </Text>
        </Box>
      )}

      {/* Footer */}
      {hasNotifications && (
        <>
          <Divider />
          <Box p="sm">
            <UnstyledButton
              component={Link}
              href="/keyman/dashboard/notifications"
              style={{
                width: "100%",
                padding: "8px 12px",
                textAlign: "center",
                borderRadius: "4px",
                transition: "all 0.2s ease",
              }}
              className="hover:bg-gray-100"
            >
              <Text size="sm" fw={500} c="#3D6B2C">
                View All Notifications
              </Text>
            </UnstyledButton>
          </Box>
        </>
      )}
    </Menu.Dropdown>
  );
};

export default NotificationMenu;
