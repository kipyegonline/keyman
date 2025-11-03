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

// Notification type definition
export interface Notification {
  id: string;
  user_id: string;
  type: string; // 'order', 'quote', 'message', 'system', 'contract', 'delivery'
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

interface NotificationMenuProps {
  notifications: Notification[];
  unreadCount: number;
  onMarkAsRead: (notificationId: string) => void;
  onMarkAllAsRead: () => void;
}

// Helper function to get icon based on notification type
const getNotificationIcon = (type: string) => {
  const iconProps = { size: 18 };

  switch (type.toLowerCase()) {
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
    case "system":
      return <Bell {...iconProps} />;
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
  switch (type.toLowerCase()) {
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
  onMarkAsRead: (id: string) => void;
}> = ({ notification, onMarkAsRead }) => {
  const router = useRouter();
  const isUnread = notification.read_at === null;

  const handleClick = () => {
    if (isUnread) {
      onMarkAsRead(notification.id);
    }

    if (notification.data.link) {
      router.push(notification.data.link);
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
              {notification.data.title}
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
            {notification.data.description}
          </Text>

          <Text size="xs" c="dimmed" fw={500}>
            {formatTimestamp(notification.created_at)}
          </Text>
        </Box>
      </Group>
    </UnstyledButton>
  );
};

// Main Notification Menu Component
export const NotificationMenu: React.FC<NotificationMenuProps> = ({
  notifications,
  unreadCount,
  onMarkAsRead,
  onMarkAllAsRead,
}) => {
  const hasNotifications = notifications.length > 0;

  return (
    <Menu.Dropdown p={0} style={{ overflow: "hidden", maxWidth: "100vw" }}>
      {/* Header */}
      <Box px="sm" py="sm" style={{ backgroundColor: "#f8f9fa" }}>
        <Group justify="space-between" wrap="nowrap" gap="xs">
          <Text size="lg" fw={600} c="#3D6B2C">
            Notifications
          </Text>
          {unreadCount > 0 && (
            <UnstyledButton onClick={onMarkAllAsRead}>
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

      {/* Notifications List */}
      {hasNotifications ? (
        <ScrollArea h={400} type="auto" style={{ maxHeight: "400px" }}>
          {notifications.map((notification) => (
            <NotificationItem
              key={notification.id}
              notification={notification}
              onMarkAsRead={onMarkAsRead}
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
