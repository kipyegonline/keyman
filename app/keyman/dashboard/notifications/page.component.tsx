"use client";
import React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Container,
  Box,
  Title,
  Text,
  Group,
  Button,
  Loader,
} from "@mantine/core";
import {
  getNotifications,
  markAllNotificationsAsRead,
} from "@/api/notifications";
import { NotificationList } from "@/components/notifications";
import { CheckCircle } from "lucide-react";
import { COLOUR } from "@/CONSTANTS/color";

const NotificationsPage = () => {
  const queryClient = useQueryClient();

  // Fetch notifications
  const { data: notificationsData, isLoading } = useQuery({
    queryKey: ["notifications"],
    queryFn: getNotifications,
    refetchInterval: 60000, // Poll every 5 minutes
    staleTime: 60000,
  });

  // Mutation for marking all as read
  const markAllAsReadMutation = useMutation({
    mutationFn: markAllNotificationsAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["unreadNotificationCount"] });
    },
  });

  const notifications = React.useMemo(() => {
    if (notificationsData?.status) {
      return notificationsData.notifications;
    }
    return [];
  }, [notificationsData]);

  const unreadCount = React.useMemo(() => {
    return notifications.filter((n) => !n.is_read).length;
  }, [notifications]);

  const handleMarkAllAsRead = () => {
    markAllAsReadMutation.mutate();
  };

  return (
    <Box
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)",
        paddingTop: "24px",
        paddingBottom: "80px",
      }}
    >
      <Container size="lg">
        {/* Header */}
        <Box
          style={{
            backgroundColor: "white",
            borderRadius: "16px",
            padding: "24px",
            marginBottom: "24px",
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.05)",
            border: "1px solid #e9ecef",
          }}
        >
          <Group justify="space-between" wrap="wrap" gap="md">
            <Box>
              <Title
                order={1}
                size="h2"
                style={{
                  color: COLOUR.primary,
                  marginBottom: "8px",
                }}
              >
                Notifications
              </Title>
              <Text size="sm" c="dimmed">
                {unreadCount > 0
                  ? `You have ${unreadCount} unread notification${
                      unreadCount !== 1 ? "s" : ""
                    }`
                  : "All caught up! No unread notifications"}
              </Text>
            </Box>

            {unreadCount > 0 && (
              <Button
                leftSection={<CheckCircle size={18} />}
                onClick={handleMarkAllAsRead}
                loading={markAllAsReadMutation.isPending}
                style={{
                  backgroundColor: COLOUR.accent,
                  transition: "all 0.3s ease",
                }}
                className="hover:scale-105"
                radius="md"
              >
                Mark All as Read
              </Button>
            )}
          </Group>
        </Box>

        {/* Loading State */}
        {isLoading ? (
          <Box
            style={{
              backgroundColor: "white",
              borderRadius: "16px",
              padding: "80px 24px",
              textAlign: "center",
              boxShadow: "0 4px 12px rgba(0, 0, 0, 0.05)",
            }}
          >
            <Loader
              size="lg"
              color={COLOUR.primary}
              style={{ margin: "0 auto" }}
            />
            <Text size="sm" c="dimmed" mt="lg">
              Loading your notifications...
            </Text>
          </Box>
        ) : (
          <NotificationList notifications={notifications} />
        )}
      </Container>
    </Box>
  );
};

export default NotificationsPage;
