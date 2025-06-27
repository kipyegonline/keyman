"use client";
import {
  Badge,
  Box,
  Text,
  Group,
  Paper,
  Tooltip,
  Grid,
  Card,
  Stack,
  Avatar,
  ThemeIcon,
  Button,
} from "@mantine/core";
import {
  Calendar,
  MapPin,
  Package,
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  PlayCircle,
  Award,
  Send,
  Eye,
  Truck,
  Weight,
  Building2,
  Hash,
  Navigation,
} from "lucide-react";
import { RequestDeliveryItem } from "@/types";

const getStatusConfig = (status: RequestDeliveryItem["status"]) => {
  const configs = {
    SUBMITTED: {
      color: "#3D6B2C",
      bg: "rgba(61, 107, 44, 0.1)",
      icon: Send,
      label: "Submitted",
    },
    PENDING: {
      color: "#F08C23",
      bg: "rgba(240, 140, 35, 0.1)",
      icon: Clock,
      label: "Pending",
    },
    IN_PROGRESS: {
      color: "#388E3C",
      bg: "rgba(56, 142, 60, 0.1)",
      icon: PlayCircle,
      label: "In Progress",
    },
    COMPLETED: {
      color: "#388E3C",
      bg: "rgba(56, 142, 60, 0.1)",
      icon: CheckCircle,
      label: "Completed",
    },
    CANCELLED: {
      color: "#d32f2f",
      bg: "rgba(211, 47, 47, 0.1)",
      icon: XCircle,
      label: "Cancelled",
    },
    awarded: {
      color: "#F08C23",
      bg: "rgba(240, 140, 35, 0.1)",
      icon: Award,
      label: "Awarded",
    },
  };
  return configs[status];
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};
const openGoogleMaps = (lat: number, long: number) => {
  if (lat && long) {
    window.open(`https://maps.google.com/?q=${long},${lat}`, "_blank");
  }
};

const RequestDetail: React.FC<{ request: RequestDeliveryItem }> = ({
  request: selectedRequest,
}) => {
  const StatusBadge: React.FC<{ status: RequestDeliveryItem["status"] }> = ({
    status,
  }) => {
    const config = getStatusConfig(status);

    const IconComponent = config?.icon;
    if (!config) return null;

    return (
      <Badge
        variant="light"
        style={{
          backgroundColor: config.bg,
          color: config.color,
          border: `1px solid ${config.color}20`,
          fontWeight: 600,
          transition: "all 0.2s ease",
        }}
        leftSection={<IconComponent size={12} />}
      >
        {config.label}
      </Badge>
    );
  };

  return (
    <Box>
      {selectedRequest && (
        <Stack gap="xl">
          {/* Header Information */}
          <Grid>
            <Grid.Col span={{ base: 12, md: 6 }}>
              <Card shadow="sm" padding="lg" radius="md" className="h-full">
                <Group gap="xs" mb="md">
                  <ThemeIcon
                    size="lg"
                    style={{ backgroundColor: "#3D6B2C15" }}
                    variant="light"
                  >
                    <Building2 size={20} style={{ color: "#3D6B2C" }} />
                  </ThemeIcon>
                  <Text fw={600} size="sm" className="text-gray-700">
                    📋 Request Information
                  </Text>
                </Group>
                <Stack gap="sm">
                  <Group justify="space-between">
                    <Text size="sm" c="dimmed">
                      Request Code
                    </Text>
                    <Badge
                      variant="light"
                      size="lg"
                      className="py-2"
                      style={{ backgroundColor: "#3D6B2C15", color: "#3D6B2C" }}
                    >
                      <Hash size={12} className="mr-2 inline-block" />
                      {selectedRequest?.code}
                    </Badge>
                  </Group>
                  <Group justify="space-between">
                    <Text size="sm" c="dimmed">
                      Status
                    </Text>
                    <StatusBadge status={selectedRequest?.status} />
                  </Group>
                  <Group justify="space-between">
                    <Text size="sm" c="dimmed">
                      Created From
                    </Text>
                    <Text size="sm" fw={500} className="text-gray-800">
                      {selectedRequest?.created_from}
                    </Text>
                  </Group>
                </Stack>
              </Card>
            </Grid.Col>

            <Grid.Col span={{ base: 12, md: 6 }}>
              <Card shadow="sm" padding="lg" radius="md" className="h-full">
                <Group gap="xs" mb="md">
                  <ThemeIcon
                    size="lg"
                    style={{ backgroundColor: "#F08C2315" }}
                    variant="light"
                  >
                    <Calendar size={20} style={{ color: "#F08C23" }} />
                  </ThemeIcon>
                  <Text fw={600} size="sm" className="text-gray-700">
                    📅 Timeline
                  </Text>
                </Group>
                <Stack gap="sm">
                  <Group justify="space-between">
                    <Text size="sm" c="dimmed">
                      Created
                    </Text>
                    <Text size="sm" fw={500}>
                      {formatDate(selectedRequest?.created_at)}
                    </Text>
                  </Group>
                  <Group justify="space-between">
                    <Text size="sm" c="dimmed">
                      Delivery Date
                    </Text>
                    <Badge
                      variant="light"
                      style={{ backgroundColor: "#F08C2315", color: "#F08C23" }}
                    >
                      {formatDate(selectedRequest?.delivery_date)}
                    </Badge>
                  </Group>
                  <Group justify="space-between">
                    <Text size="sm" c="dimmed">
                      Last Updated
                    </Text>
                    <Text size="sm" fw={500}>
                      {formatDate(selectedRequest?.updated_at)}
                    </Text>
                  </Group>
                </Stack>
              </Card>
            </Grid.Col>
          </Grid>

          {/* Location Information */}
          <Card shadow="sm" padding="lg" radius="md">
            <Group gap="xs" mb="md">
              <Button
                leftSection={<Navigation size={16} />}
                variant="light"
                color="green"
                onClick={() =>
                  openGoogleMaps(
                    selectedRequest.location.coordinates[0],
                    selectedRequest.location.coordinates[1]
                  )
                }
                className="transition-transform hover:scale-105"
              >
                View Location 📍
              </Button>
            </Group>
          </Card>

          {/* Items List */}
          <Card shadow="sm" padding="lg" radius="md">
            <Group gap="xs" mb="md">
              <ThemeIcon
                size="lg"
                style={{ backgroundColor: "#3D6B2C15" }}
                variant="light"
              >
                <Package size={20} style={{ color: "#3D6B2C" }} />
              </ThemeIcon>
              <Text fw={600} size="sm" className="text-gray-700">
                📦 Requested Items ({selectedRequest?.items?.length})
              </Text>
            </Group>
            <Stack gap="sm">
              {selectedRequest?.items?.map((item, index) => (
                <Paper
                  key={index}
                  p="md"
                  className="border border-gray-200 transition-all duration-200 hover:shadow-md"
                >
                  <Group justify="space-between" mb="xs">
                    <Group gap="sm">
                      <Avatar
                        size="sm"
                        style={{ backgroundColor: "#3D6B2C15" }}
                        variant="light"
                      >
                        <Package size={16} style={{ color: "#3D6B2C" }} />
                      </Avatar>
                      <div>
                        <Text fw={600} size="sm">
                          {item.name}
                        </Text>

                        <Text size="md" c="dimmed">
                          Quantity: {"      "}
                          {item?.quantity ? parseInt(item?.quantity) : 0}
                        </Text>
                      </div>
                    </Group>
                    <Group gap="xs">
                      <Badge
                        variant="light"
                        style={{
                          backgroundColor: "#F08C2315",
                          color: "#F08C23",
                        }}
                      >
                        {item?.quantity ? parseInt(item?.quantity) : 0}
                      </Badge>
                      {item?.visual_confirmation_required === 1 && (
                        <Tooltip label="Visual confirmation required">
                          <ThemeIcon
                            size="sm"
                            style={{ backgroundColor: "#388E3C15" }}
                            variant="light"
                          >
                            <Eye size={12} style={{ color: "#388E3C" }} />
                          </ThemeIcon>
                        </Tooltip>
                      )}
                    </Group>
                  </Group>
                  <Text size="sm" c="dimmed" className="pl-10">
                    {item?.description}
                  </Text>
                </Paper>
              ))}
            </Stack>
          </Card>

          {/* Orders Information */}
          {selectedRequest?.orders?.length > 0 && (
            <Card shadow="sm" padding="lg" radius="md">
              <Group gap="xs" mb="md">
                <ThemeIcon
                  size="lg"
                  style={{ backgroundColor: "#F08C2315" }}
                  variant="light"
                >
                  <FileText size={20} style={{ color: "#F08C23" }} />
                </ThemeIcon>
                <Text fw={600} size="sm" className="text-gray-700">
                  💼 Related Orders ({selectedRequest.orders.length})
                </Text>
              </Group>
              <Stack gap="sm">
                {selectedRequest?.orders.map((order, index) => (
                  <Paper key={index} p="md" className="border border-gray-200">
                    <Group justify="space-between">
                      <div>
                        <Text fw={600} size="sm">
                          {order.order_id as string}
                        </Text>
                        <Text size="sm" c="dimmed">
                          {order.supplier as string}
                        </Text>
                      </div>
                      <Group gap="md">
                        <Text fw={600} size="sm" style={{ color: "#3D6B2C" }}>
                          ${order.amount as number}
                        </Text>
                        <Badge
                          variant="light"
                          style={{
                            backgroundColor:
                              order.status === "confirmed"
                                ? "#388E3C15"
                                : "#F08C2315",
                            color:
                              order.status === "confirmed"
                                ? "#388E3C"
                                : "#F08C23",
                          }}
                        >
                          {order?.status as string}
                        </Badge>
                      </Group>
                    </Group>
                  </Paper>
                ))}
              </Stack>
            </Card>
          )}

          {/* Transport Information */}
          {selectedRequest?.transports?.length > 0 && (
            <Card shadow="sm" padding="lg" radius="md">
              <Group gap="xs" mb="md">
                <ThemeIcon
                  size="lg"
                  style={{ backgroundColor: "#388E3C15" }}
                  variant="light"
                >
                  <Truck size={20} style={{ color: "#388E3C" }} />
                </ThemeIcon>
                <Text fw={600} size="sm" className="text-gray-700">
                  🚛 Transportation Details
                </Text>
              </Group>
              <Stack gap="sm">
                {selectedRequest.transports.map((transport, index) => (
                  <Paper key={index} p="md" className="border border-gray-200">
                    <Grid>
                      <Grid.Col span={6}>
                        <Stack gap="xs">
                          <Group gap="xs">
                            <Truck size={14} style={{ color: "#388E3C" }} />
                            <Text size="sm" fw={600}>
                              {transport.transportation_vehicle}
                            </Text>
                          </Group>
                          <Text size="xs" c="dimmed">
                            Type: {transport.transport_type}
                          </Text>
                        </Stack>
                      </Grid.Col>
                      <Grid.Col span={6}>
                        <Group justify="flex-end" gap="md">
                          <Group gap="xs">
                            <Weight size={14} style={{ color: "#F08C23" }} />
                            <Text size="sm" fw={500}>
                              {transport.total_weight}
                            </Text>
                          </Group>
                        </Group>
                      </Grid.Col>
                    </Grid>
                  </Paper>
                ))}
              </Stack>
            </Card>
          )}

          {/* Action Buttons */}
          <Group justify="center" mt="xl">
            <Button
              variant="light"
              style={{ backgroundColor: "#3D6B2C15", color: "#3D6B2C" }}
              leftSection={<FileText size={16} />}
            >
              📋 Generate Report
            </Button>
            <Button
              variant="light"
              style={{ backgroundColor: "#F08C2315", color: "#F08C23" }}
              leftSection={<MapPin size={16} />}
            >
              📍 Track Delivery
            </Button>
            <Button
              variant="light"
              style={{ backgroundColor: "#388E3C15", color: "#388E3C" }}
              leftSection={<CheckCircle size={16} />}
            >
              ✅ Mark Complete
            </Button>
          </Group>
        </Stack>
      )}
    </Box>
  );
};

export default RequestDetail;
