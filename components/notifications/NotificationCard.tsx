"use client";
import React, { useState } from "react";
import { Box, Group, Text, Badge, Avatar, UnstyledButton } from "@mantine/core";
import {
  Package,
  FileText,
  MessageSquare,
  Bell,
  ShoppingCart,
  AlertCircle,
  CheckCircle,
  ExternalLink,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { markNotificationAsRead } from "@/api/notifications";
import { NotificationData } from "@/api/notifications";
import { COLOUR } from "@/CONSTANTS/color";

interface NotificationCardProps {
  notification: NotificationData;
}

// Helper function to get icon based on notification type
const getNotificationIcon = (type: string) => {
  const iconProps = { size: 20 };
  const lowerType = type.toLowerCase();

  if (lowerType.includes("system")) return <Bell {...iconProps} />;

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

  if (lowerType.includes("system")) return COLOUR.accent;

  switch (lowerType) {
    case "order":
      return COLOUR.primary;
    case "quote":
      return COLOUR.accent;
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

export const NotificationCard: React.FC<NotificationCardProps> = ({
  notification,
}) => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isHovered, setIsHovered] = useState(false);
  const isUnread = !notification.is_read;

  // Mutation for marking as read
  const markAsReadMutation = useMutation({
    mutationFn: (notificationId: string) =>
      markNotificationAsRead(notificationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["unreadNotificationCount"] });
    },
  });

  // Extract URL from body if present
  const extractUrl = (text: string): string | null => {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const match = text.match(urlRegex);
    return match ? match[0] : null;
  };

  const url = extractUrl(notification.body);
  const hasLink = !!url;

  const handleClick = () => {
    if (isUnread) {
      markAsReadMutation.mutate(notification.id.toString());
    }

    if (url) {
      // Check if it's an internal URL
      if (url.includes("keymanstores.com")) {
        const path = url.split("keymanstores.com")[1];
        router.push(path);
      } else {
        window.open(url, "_blank");
      }
    }
  };

  const notificationColor = getNotificationColor(notification.type);

  return (
    <UnstyledButton
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      disabled={!hasLink && isUnread === false}
      style={{
        width: "100%",
        cursor: hasLink || isUnread ? "pointer" : "default",
      }}
    >
      <Box
        style={{
          backgroundColor: "white",
          borderRadius: "12px",
          padding: "20px",
          marginBottom: "12px",
          border: `2px solid ${
            isUnread ? notificationColor + "40" : "#e9ecef"
          }`,
          boxShadow: isHovered
            ? `0 8px 24px ${notificationColor}20`
            : "0 2px 8px rgba(0, 0, 0, 0.04)",
          transform: isHovered
            ? "translateY(-4px) scale(1.01)"
            : "translateY(0) scale(1)",
          transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Unread indicator bar */}
        {isUnread && (
          <Box
            style={{
              position: "absolute",
              left: 0,
              top: 0,
              bottom: 0,
              width: "4px",
              background: `linear-gradient(180deg, ${notificationColor}, ${notificationColor}80)`,
              animation: "pulse 2s ease-in-out infinite",
            }}
          />
        )}

        <Group wrap="nowrap" align="flex-start" gap="md">
          {/* Icon Avatar */}
          <Box
            style={{
              position: "relative",
            }}
          >
            <Avatar
              size="lg"
              radius="md"
              style={{
                backgroundColor: `${notificationColor}15`,
                color: notificationColor,
                flexShrink: 0,
                transform: isHovered
                  ? "rotate(10deg) scale(1.1)"
                  : "rotate(0) scale(1)",
                transition: "all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)",
              }}
            >
              {getNotificationIcon(notification.type)}
            </Avatar>
            {isUnread && (
              <Box
                style={{
                  position: "absolute",
                  top: -4,
                  right: -4,
                  width: "12px",
                  height: "12px",
                  backgroundColor: COLOUR.accent,
                  borderRadius: "50%",
                  border: "2px solid white",
                  animation: "ping 2s cubic-bezier(0, 0, 0.2, 1) infinite",
                }}
              />
            )}
          </Box>

          {/* Content */}
          <Box style={{ flex: 1, minWidth: 0 }}>
            <Group justify="space-between" wrap="nowrap" mb={8} gap="xs">
              <Text
                size="md"
                fw={isUnread ? 700 : 600}
                style={{
                  color: isUnread ? "#1a1a1a" : "#4a4a4a",
                  lineHeight: 1.4,
                }}
              >
                {notification.title}
              </Text>
              {isUnread && (
                <Badge
                  size="sm"
                  radius="sm"
                  style={{
                    background: `linear-gradient(135deg, ${COLOUR.accent}, ${COLOUR.primary})`,
                    flexShrink: 0,
                    animation: "fadeIn 0.5s ease-in-out",
                  }}
                >
                  New
                </Badge>
              )}
            </Group>

            <Text
              size="sm"
              c="dimmed"
              mb={12}
              style={{
                lineHeight: 1.6,
                maxWidth: "100%",
                wordBreak: "break-word",
              }}
            >
              {notification.body}
            </Text>

            <Group justify="space-between" wrap="wrap" gap="xs">
              <Group gap="xs">
                <Badge
                  size="xs"
                  variant="dot"
                  color={notificationColor}
                  style={{
                    textTransform: "capitalize",
                  }}
                >
                  {notification.type}
                </Badge>
                <Text size="xs" c="dimmed" fw={500}>
                  {formatTimestamp(new Date(notification.created_at))}
                </Text>
              </Group>

              {hasLink && (
                <Group
                  gap={4}
                  style={{
                    color: notificationColor,
                    transition: "all 0.3s ease",
                    transform: isHovered ? "translateX(4px)" : "translateX(0)",
                  }}
                >
                  <Text size="xs" fw={600}>
                    View Details
                  </Text>
                  <ExternalLink size={14} />
                </Group>
              )}
            </Group>
          </Box>
        </Group>

        <style jsx global>{`
          @keyframes fadeIn {
            from {
              opacity: 0;
              transform: scale(0.8);
            }
            to {
              opacity: 1;
              transform: scale(1);
            }
          }

          @keyframes ping {
            0%,
            100% {
              opacity: 1;
            }
            50% {
              opacity: 0.5;
              transform: scale(1.5);
            }
          }

          @keyframes pulse {
            0%,
            100% {
              opacity: 1;
            }
            50% {
              opacity: 0.6;
            }
          }
        `}</style>
      </Box>
    </UnstyledButton>
  );
};
