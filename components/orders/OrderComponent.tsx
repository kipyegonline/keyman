import React, { useState } from "react";
import {
  Container,
  Card,
  Group,
  Text,
  Badge,
  Title,
  Stack,
  Grid,
  Avatar,
  Button,
  Divider,
  ActionIcon,
  Paper,
  Box,
  Timeline,
  Rating,
  Textarea,
  Modal,
  NumberFormatter,
  Table,
  Progress,
  ScrollArea,
} from "@mantine/core";
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Phone,
  Star,
  Package,
  Clock,
  Building2,
  FileText,
  Edit,
  Download,
  Share2,
  CheckCircle,
  AlertCircle,
  XCircle,
  Truck,
  Calculator,
  MessageSquare,
  Eye,
  Camera,
  Map,
} from "lucide-react";
import OrderCompletionSection from "./OrderCompletion";
import OrderCompletionSectionClient from "./OrderCompletionClient";
interface OrderItem {
  amounts: {
    ordered: number;
    pending: {
      release: number;
      receive: number;
    };
    received: number;
    released: number;
  };
  created_at: string;
  id: string;
  item_id: string;
  name: string;
  quantity: string;
  request_item_id: string;
  supplier_order_id: string;
  unit_price: string;
  updated_at: string;
}

// Order interface from your previous message
interface Order {
  code: string;
  comments: string | null;
  created_at: string;
  delivery_date: string;
  detail: {
    id: string;
    name: string;
    phone: string;
    photo: string[];
    media: string[];
  };
  id: string;
  items: Array<OrderItem>;
  rating: number;
  request: {
    id: string;
    code: string;
    location: {
      type: string;
      coordinates: [number, number];
    };
    delivery_date: string;
    status: string;
  };
  request_id: string;
  status:
    | "SUBMITTED"
    | "PENDING"
    | "IN_PROGRESS"
    | "COMPLETED"
    | "CANCELLED"
    | "awarded";
  supplier_detail_id: string;
  total: number;
  updated_at: string;
  order_completion?: {
    receive: boolean;
    release: boolean;
  };
}

interface OrderDetailsProps {
  order: Order;
  onBack?: () => void;
  refreshOrder: () => void;
  isSupplier: boolean;
}

const OrderDetails: React.FC<OrderDetailsProps> = ({
  order,
  onBack,
  refreshOrder,
  isSupplier,
}) => {
  const [commentModalOpen, setCommentModalOpen] = useState(false);
  const [newComment, setNewComment] = useState("");

  const getStatusColor = (status: Order["status"]) => {
    const colors = {
      SUBMITTED: "#F08C23",
      PENDING: "#fbbf24",
      IN_PROGRESS: "#3D6B2C",
      COMPLETED: "#388E3C",
      CANCELLED: "#ef4444",
      awarded: "#8b5cf6",
    };
    return colors[status] || "#6b7280";
  };

  const getStatusIcon = (status: Order["status"]) => {
    switch (status) {
      case "SUBMITTED":
        return <Clock size={16} />;
      case "PENDING":
        return <AlertCircle size={16} />;
      case "IN_PROGRESS":
        return <Truck size={16} />;
      case "COMPLETED":
        return <CheckCircle size={16} />;
      case "CANCELLED":
        return <XCircle size={16} />;
      case "awarded":
        return <Star size={16} />;
      default:
        return <Clock size={16} />;
    }
  };

  const getStatusProgress = (status: Order["status"]) => {
    const progress = {
      SUBMITTED: 20,
      PENDING: 40,
      IN_PROGRESS: 70,
      COMPLETED: 100,
      CANCELLED: 0,
      awarded: 100,
    };
    return progress[status] || 0;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      //hour: "2-digit",
      //minute: "2-digit",
    });
  };
  /*
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES'
    }).format(amount);
  };*/
  const getEstimatecost = (quantity: string, unit_price: string) => {
    const q = Number.isNaN(Number(quantity)) ? 0 : Number(quantity);
    const p = Number.isNaN(Number(unit_price)) ? 0 : Number(unit_price);
    if (q > 0 && p > 0) {
      return (q * p).toFixed(2);
    }
    return;
  };

  return (
    <Container size="xl" py="md">
      <div className="animate-in slide-in-from-bottom-4 duration-500">
        {/* Header */}
        <Card
          shadow="sm"
          padding="lg"
          radius="md"
          mb="md"
          style={{
            background: "linear-gradient(135deg, #3D6B2C 0%, #388E3C 100%)",
            color: "white",
          }}
          className="hover:shadow-lg transition-all duration-300"
        >
          <Group justify="space-between" align="center">
            <Group gap="md">
              <ActionIcon
                variant="white"
                color="green"
                size="lg"
                onClick={onBack}
                className="hover:scale-110 transition-transform duration-200"
              >
                <ArrowLeft size={20} />
              </ActionIcon>
              <Box>
                <Title order={2} c="white" fw={700}>
                  {order.code}
                </Title>
                <Text size="sm" c="white" opacity={0.9}>
                  Order Details & Management
                </Text>
              </Box>
            </Group>
            <Group gap="sm">
              <ActionIcon
                variant="white"
                color="green"
                size="lg"
                className="hover:scale-110 transition-transform duration-200"
              >
                <Download size={18} />
              </ActionIcon>
              <ActionIcon
                variant="white"
                color="green"
                size="lg"
                className="hover:scale-110 transition-transform duration-200"
              >
                <Share2 size={18} />
              </ActionIcon>
            </Group>
          </Group>
        </Card>

        <Grid gutter="md">
          {/* Left Column */}
          <Grid.Col span={{ base: 12, md: 8 }}>
            <Stack gap="md">
              {/* Status & Progress */}
              <Card
                shadow="sm"
                padding="lg"
                radius="md"
                className="hover:shadow-md transition-all duration-300 animate-in fade-in-50 slide-in-from-left-4"
                style={{ animationDelay: "100ms" }}
              >
                <Group justify="space-between" mb="md">
                  <Group gap="sm">
                    {getStatusIcon(order.status)}
                    <Text fw={600} size="lg">
                      Order Status
                    </Text>
                  </Group>
                  <Badge
                    size="lg"
                    variant="filled"
                    style={{
                      backgroundColor: getStatusColor(order.status),
                      color: "white",
                    }}
                    leftSection={getStatusIcon(order.status)}
                  >
                    {order.status.replace("_", " ")}
                  </Badge>
                </Group>
                <Progress
                  value={getStatusProgress(order.status)}
                  color={getStatusColor(order.status)}
                  size="lg"
                  radius="xl"
                  className="transition-all duration-1000"
                  style={{
                    background: `${getStatusColor(order.status)}20`,
                  }}
                />
                <Text size="sm" c="dimmed" mt="xs">
                  {getStatusProgress(order.status)}% Complete
                </Text>
              </Card>

              {/* Order Items */}
              <Card
                shadow="sm"
                padding="lg"
                radius="md"
                className="hover:shadow-md transition-all duration-300 animate-in fade-in-50 slide-in-from-left-4"
                style={{ animationDelay: "200ms" }}
              >
                <Group justify="space-between" mb="md">
                  <Group gap="sm">
                    <Package size={20} color="#3D6B2C" />
                    <Text fw={600} size="lg">
                      Order Items
                    </Text>
                  </Group>
                  <Badge variant="light" color="green" size="md">
                    {order.items.length} items
                  </Badge>
                </Group>

                <ScrollArea>
                  <Table verticalSpacing="sm">
                    <Table.Thead>
                      <Table.Tr>
                        <Table.Th>Item</Table.Th>
                        <Table.Th>Quantity</Table.Th>
                        <Table.Th>Unit</Table.Th>
                        <Table.Th>Estimated Cost</Table.Th>
                      </Table.Tr>
                    </Table.Thead>
                    <Table.Tbody>
                      {order.items.map((item, index) => (
                        <Table.Tr
                          key={item.id}
                          className="hover:bg-gray-50 transition-colors duration-200"
                        >
                          <Table.Td>
                            <Text fw={500}>
                              {item.name || `Item ${index + 1}`}
                            </Text>
                          </Table.Td>
                          <Table.Td>
                            <Text>{item.quantity || "N/A"}</Text>
                          </Table.Td>
                          <Table.Td>
                            <Badge variant="light" size="sm">
                              {item.quantity || "units"}
                            </Badge>
                          </Table.Td>
                          <Table.Td>
                            <Text fw={500} c="#3D6B2C">
                              <NumberFormatter
                                value={getEstimatecost(
                                  item?.quantity,
                                  item?.unit_price
                                )}
                                prefix="KSh "
                                thousandSeparator=","
                              />
                            </Text>
                          </Table.Td>
                        </Table.Tr>
                      ))}
                    </Table.Tbody>
                  </Table>
                </ScrollArea>
              </Card>

              {isSupplier ? (
                <OrderCompletionSection
                  orderCompletion={order?.order_completion}
                  items={order?.items}
                  orderId={order.id}
                  onRelease={() => {
                    refreshOrder();
                  }}
                />
              ) : (
                <OrderCompletionSectionClient
                  orderCompletion={order?.order_completion}
                  items={order?.items}
                  orderId={order.id}
                  onReceive={() => {
                    refreshOrder();
                  }}
                />
              )}

              {/* Timeline */}
              <Card
                shadow="sm"
                padding="lg"
                radius="md"
                className="hover:shadow-md transition-all border-keymanOrange duration-300 animate-in fade-in-50 slide-in-from-left-4"
                style={{ animationDelay: "300ms" }}
              >
                <Group gap="sm" mb="md">
                  <Clock size={20} color="#F08C23" />
                  <Text fw={600} size="lg">
                    Order Timeline
                  </Text>
                </Group>

                <Timeline
                  active={getStatusProgress(order.status) / 25}
                  bulletSize={24}
                  lineWidth={2}
                  color="#3D6B2C"
                >
                  <Timeline.Item
                    bullet={<FileText size={12} />}
                    title="Order Submitted"
                  >
                    <Text c="dimmed" size="sm">
                      {formatDate(order.created_at)}
                    </Text>
                  </Timeline.Item>
                  <Timeline.Item
                    bullet={<Eye size={12} />}
                    title="Under Review"
                  >
                    <Text c="dimmed" size="sm">
                      Order being processed by supplier
                    </Text>
                  </Timeline.Item>
                  <Timeline.Item
                    bullet={<Truck size={12} />}
                    title="In Progress"
                  >
                    <Text c="dimmed" size="sm">
                      Items being prepared for delivery
                    </Text>
                  </Timeline.Item>
                  <Timeline.Item
                    bullet={<CheckCircle size={12} />}
                    title="Completed"
                  >
                    <Text c="dimmed" size="sm">
                      Expected: {formatDate(order.delivery_date)}
                    </Text>
                  </Timeline.Item>
                </Timeline>
              </Card>

              {/* Comments Section */}
              <Card
                shadow="sm"
                padding="lg"
                radius="md"
                className="hover:shadow-md transition-all duration-300 animate-in fade-in-50 slide-in-from-left-4"
                style={{ animationDelay: "400ms" }}
              >
                <Group justify="space-between" mb="md">
                  <Group gap="sm">
                    <MessageSquare size={20} color="#F08C23" />
                    <Text fw={600} size="lg">
                      Comments & Notes
                    </Text>
                  </Group>
                  <Button
                    variant="light"
                    color="orange"
                    size="sm"
                    leftSection={<Edit size={16} />}
                    onClick={() => setCommentModalOpen(true)}
                    className="hover:scale-105 transition-transform duration-200"
                  >
                    Add Comment
                  </Button>
                </Group>

                {order.comments ? (
                  <Paper p="md" bg="#f8fafc" radius="md">
                    <Text size="sm">{order.comments}</Text>
                  </Paper>
                ) : (
                  <Paper
                    p="md"
                    bg="#f8fafc"
                    radius="md"
                    style={{
                      borderStyle: "dashed",
                      borderWidth: 2,
                      borderColor: "#e2e8f0",
                    }}
                  >
                    <Text size="sm" c="dimmed" ta="center">
                      No comments added yet
                    </Text>
                  </Paper>
                )}
              </Card>
            </Stack>
          </Grid.Col>

          {/* Right Column */}
          <Grid.Col span={{ base: 12, md: 4 }}>
            <Stack gap="md">
              {/* Order Summary */}
              <Card
                shadow="sm"
                padding="lg"
                radius="md"
                className="hover:shadow-md transition-all duration-300 animate-in fade-in-50 slide-in-from-right-4"
                style={{ animationDelay: "100ms" }}
              >
                <Group gap="sm" mb="md">
                  <Calculator size={20} color="#3D6B2C" />
                  <Text fw={600} size="lg">
                    Order Summary
                  </Text>
                </Group>

                <Stack gap="sm">
                  <Group justify="space-between">
                    <Text size="sm" c="dimmed">
                      Order Code:
                    </Text>
                    <Text fw={500}>{order.code}</Text>
                  </Group>
                  <Group justify="space-between">
                    <Text size="sm" c="dimmed">
                      Items Count:
                    </Text>
                    <Badge variant="light" color="green">
                      {order.items.length}
                    </Badge>
                  </Group>
                  <Group justify="space-between">
                    <Text size="sm" c="dimmed">
                      Request Code:
                    </Text>
                    <Text fw={500} c="#3D6B2C">
                      {order.request.code}
                    </Text>
                  </Group>
                  <Divider />
                  <Group justify="space-between">
                    <Text fw={600} c="#3D6B2C">
                      Total Amount:
                    </Text>
                    <Text fw={700} size="lg" c="#3D6B2C">
                      <NumberFormatter
                        value={order.total}
                        prefix="KSh "
                        thousandSeparator=","
                      />
                    </Text>
                  </Group>
                </Stack>
              </Card>

              {/* Supplier Information */}
              <Card
                shadow="sm"
                padding="lg"
                radius="md"
                className="hover:shadow-md transition-all duration-300 animate-in fade-in-50 slide-in-from-right-4"
                style={{ animationDelay: "200ms" }}
              >
                <Group gap="sm" mb="md">
                  <Building2 size={20} color="#F08C23" />
                  <Text fw={600} size="lg">
                    Supplier Details
                  </Text>
                </Group>

                <Group gap="md" mb="md">
                  <Avatar
                    size="lg"
                    color="#3D6B2C"
                    className="hover:scale-110 transition-transform duration-200"
                  >
                    <Building2 size={24} />
                  </Avatar>
                  <Box flex={1}>
                    <Text fw={600} size="md">
                      {order.detail.name}
                    </Text>
                    <Group gap="xs" mt={4}>
                      <Phone size={12} color="#F08C23" />
                      <Text size="sm" c="dimmed">
                        {order.detail.phone}
                      </Text>
                    </Group>
                  </Box>
                </Group>

                <Group gap="sm" mb="md">
                  <Star size={16} color="#F08C23" />
                  <Rating value={order.rating} readOnly size="sm" />
                  <Text size="sm" c="dimmed">
                    ({order.rating}/5)
                  </Text>
                </Group>

                <Group gap="sm">
                  <Button
                    variant="light"
                    color="green"
                    size="sm"
                    leftSection={<Phone size={16} />}
                    fullWidth
                    className="hover:scale-105 transition-transform duration-200"
                  >
                    Call Supplier
                  </Button>
                </Group>
              </Card>

              {/* Delivery Information */}
              <Card
                shadow="sm"
                padding="lg"
                radius="md"
                className="hover:shadow-md transition-all duration-300 animate-in fade-in-50 slide-in-from-right-4"
                style={{ animationDelay: "300ms" }}
              >
                <Group gap="sm" mb="md">
                  <Truck size={20} color="#388E3C" />
                  <Text fw={600} size="lg">
                    Delivery Info
                  </Text>
                </Group>

                <Stack gap="sm">
                  <Group gap="sm">
                    <Calendar size={16} color="#F08C23" />
                    <Box>
                      <Text size="sm" c="dimmed">
                        Delivery Date
                      </Text>
                      <Text fw={500}>{formatDate(order.delivery_date)}</Text>
                    </Box>
                  </Group>

                  <Group gap="sm" align="flex-start">
                    <MapPin size={16} color="#F08C23" />
                    <Box>
                      <Text size="sm" c="dimmed">
                        Location
                      </Text>
                      <Text fw={500}>
                        {/*order.request.location.coordinates[0].toFixed(4)*/},{" "}
                        {/*order.request.location.coordinates[1].toFixed(4)*/}
                      </Text>
                      <Button
                        variant="subtle"
                        size="xs"
                        leftSection={<Map size={12} />}
                        mt="xs"
                        className="hover:scale-105 transition-transform duration-200"
                      >
                        View on Map
                      </Button>
                    </Box>
                  </Group>
                </Stack>
              </Card>

              {/* Media Section */}
              {(order.detail.photo.length > 0 ||
                order.detail.media.length > 0) && (
                <Card
                  shadow="sm"
                  padding="lg"
                  radius="md"
                  className="hover:shadow-md transition-all duration-300 animate-in fade-in-50 slide-in-from-right-4"
                  style={{ animationDelay: "400ms" }}
                >
                  <Group gap="sm" mb="md">
                    <Camera size={20} color="#F08C23" />
                    <Text fw={600} size="lg">
                      Media
                    </Text>
                  </Group>

                  <Text size="sm" c="dimmed">
                    {order.detail.photo.length + order.detail.media.length}{" "}
                    files attached
                  </Text>

                  <Button
                    variant="light"
                    color="orange"
                    size="sm"
                    leftSection={<Eye size={16} />}
                    mt="sm"
                    fullWidth
                    className="hover:scale-105 transition-transform duration-200"
                  >
                    View All Media
                  </Button>
                </Card>
              )}
            </Stack>
          </Grid.Col>
        </Grid>
      </div>

      {/* Comment Modal */}
      <Modal
        opened={commentModalOpen}
        onClose={() => setCommentModalOpen(false)}
        title="Add Comment"
        centered
      >
        <Stack gap="md">
          <Textarea
            placeholder="Add your comment or note here..."
            value={newComment}
            onChange={(e) => setNewComment(e.currentTarget.value)}
            minRows={4}
            autosize
          />
          <Group justify="end" gap="sm">
            <Button variant="light" onClick={() => setCommentModalOpen(false)}>
              Cancel
            </Button>
            <Button
              color="green"
              onClick={() => {
                // Handle comment submission
                setCommentModalOpen(false);
                setNewComment("");
              }}
            >
              Add Comment
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Container>
  );
};

export default OrderDetails;
