"use client";
import React, { useState, useMemo } from "react";
import {
  Box,
  TextInput,
  SegmentedControl,
  Stack,
  Text,
  Group,
  Badge,
  Center,
} from "@mantine/core";
import { Search, Bell, Filter } from "lucide-react";
import { NotificationCard } from "./NotificationCard";
import { NotificationData } from "@/api/notifications";
import { COLOUR } from "@/CONSTANTS/color";

interface NotificationListProps {
  notifications: NotificationData[];
}

export const NotificationList: React.FC<NotificationListProps> = ({
  notifications,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<string>("all");

  // Filter and search notifications
  const filteredNotifications = useMemo(() => {
    let filtered = notifications;

    // Filter by type
    if (filterType !== "all") {
      if (filterType === "unread") {
        filtered = filtered.filter((n) => !n.is_read);
      } else if (filterType === "read") {
        filtered = filtered.filter((n) => n.is_read);
      } else {
        filtered = filtered.filter(
          (n) => n.type.toLowerCase() === filterType.toLowerCase()
        );
      }
    }

    // Search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (n) =>
          n.title.toLowerCase().includes(query) ||
          n.body.toLowerCase().includes(query) ||
          n.type.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [notifications, filterType, searchQuery]);

  // Count notifications by status
  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.is_read).length,
    [notifications]
  );

  const readCount = useMemo(
    () => notifications.filter((n) => n.is_read).length,
    [notifications]
  );

  // Get unique notification types
  const notificationTypes = useMemo(() => {
    const types = new Set(notifications.map((n) => n.type.toLowerCase()));
    return Array.from(types);
  }, [notifications]);

  return (
    <Box>
      {/* Filters and Search */}
      <Box
        style={{
          backgroundColor: "white",
          borderRadius: "16px",
          padding: "20px",
          marginBottom: "24px",
          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.05)",
          border: "1px solid #e9ecef",
        }}
      >
        <Stack gap="md">
          {/* Search */}
          <TextInput
            placeholder="Search notifications..."
            leftSection={<Search size={18} style={{ color: "#9ca3af" }} />}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            size="md"
            radius="md"
            styles={{
              input: {
                transition: "all 0.3s ease",
                "&:focus": {
                  borderColor: COLOUR.primary,
                  boxShadow: `0 0 0 3px ${COLOUR.primary}15`,
                },
              },
            }}
          />

          {/* Filter Tabs */}
          <Box>
            <Group gap="xs" mb="sm">
              <Filter size={16} style={{ color: "#6b7280" }} />
              <Text size="sm" fw={500} c="dimmed">
                Filter by:
              </Text>
            </Group>

            <SegmentedControl
              value={filterType}
              onChange={setFilterType}
              fullWidth
              radius="md"
              size="sm"
              data={[
                {
                  label: (
                    <Group gap="xs" justify="center">
                      <Text size="sm">All</Text>
                      <Badge size="xs" circle>
                        {notifications.length}
                      </Badge>
                    </Group>
                  ),
                  value: "all",
                },
                {
                  label: (
                    <Group gap="xs" justify="center">
                      <Text size="sm">Unread</Text>
                      {unreadCount > 0 && (
                        <Badge size="xs" circle color="orange">
                          {unreadCount}
                        </Badge>
                      )}
                    </Group>
                  ),
                  value: "unread",
                },
                {
                  label: (
                    <Group gap="xs" justify="center">
                      <Text size="sm">Read</Text>
                      {readCount > 0 && (
                        <Badge size="xs" circle variant="light">
                          {readCount}
                        </Badge>
                      )}
                    </Group>
                  ),
                  value: "read",
                },
                ...notificationTypes.map((type) => ({
                  label: (
                    <Text size="sm" tt="capitalize">
                      {type}
                    </Text>
                  ),
                  value: type,
                })),
              ]}
              styles={{
                root: {
                  backgroundColor: "#f8f9fa",
                },
                indicator: {
                  background: `linear-gradient(135deg, ${COLOUR.primary}, ${COLOUR.accent})`,
                },
                label: {
                  transition: "all 0.2s ease",
                  "&[data-active]": {
                    color: "white",
                  },
                },
              }}
            />
          </Box>
        </Stack>
      </Box>

      {/* Results count */}
      {searchQuery && (
        <Box
          mb="md"
          style={{
            animation: "slideIn 0.3s ease-out",
          }}
        >
          <Text size="sm" c="dimmed">
            Found {filteredNotifications.length} notification
            {filteredNotifications.length !== 1 ? "s" : ""}
            {searchQuery && ` matching "${searchQuery}"`}
          </Text>
        </Box>
      )}

      {/* Notifications List */}
      {filteredNotifications.length > 0 ? (
        <Box
          style={{
            animation: "fadeIn 0.5s ease-out",
          }}
        >
          {filteredNotifications.map((notification, index) => (
            <Box
              key={notification.id}
              style={{
                animation: `slideIn 0.3s ease-out ${index * 0.05}s both`,
              }}
            >
              <NotificationCard notification={notification} />
            </Box>
          ))}
        </Box>
      ) : (
        // Empty State
        <Box
          style={{
            backgroundColor: "white",
            borderRadius: "16px",
            padding: "80px 24px",
            textAlign: "center",
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.05)",
            animation: "fadeIn 0.5s ease-out",
          }}
        >
          <Center>
            <Box
              style={{
                width: "80px",
                height: "80px",
                borderRadius: "50%",
                backgroundColor: `${COLOUR.primary}10`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: "16px",
                animation: "bounce 2s ease-in-out infinite",
              }}
            >
              <Bell size={40} color={COLOUR.primary} />
            </Box>
          </Center>
          <Text size="lg" fw={600} c={COLOUR.primary} mb={8}>
            No notifications found
          </Text>
          <Text size="sm" c="dimmed">
            {searchQuery
              ? `No notifications match "${searchQuery}"`
              : filterType === "unread"
              ? "All caught up! You have no unread notifications."
              : `No ${filterType} notifications at the moment.`}
          </Text>
        </Box>
      )}

      <style jsx global>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes bounce {
          0%,
          100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10px);
          }
        }
      `}</style>
    </Box>
  );
};
