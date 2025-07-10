import React, { useState } from "react";
import {
  Table,
  Box,
  Badge,
  Text,
  Group,
  ActionIcon,
  Paper,
  Title,
  TextInput,
  Select,
  Stack,
  Card,
  Avatar,
  Tooltip,
  ScrollArea,
  Container,
  NumberFormatter,
} from "@mantine/core";
import {
  Search,
  Filter,
  Eye,
  Calendar,
  Package,
  //DollarSign,
  Clock,
  Star,
  ChevronRight,
  Building2,
  Phone,
  HandCoins,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { navigateTo } from "@/lib/helpers";

// Your provided interface
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
  items: Array<Record<string, string>>;
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
}

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
      return <Clock size={14} />;
    case "PENDING":
      return <Clock size={14} />;
    case "IN_PROGRESS":
      return <Package size={14} />;
    case "COMPLETED":
      return <Star size={14} />;
    case "CANCELLED":
      return <Package size={14} />;
    case "awarded":
      return <Star size={14} />;
    default:
      return <Clock size={14} />;
  }
};
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

type Props = { orders: Order[]; isSupplier: boolean };
const OrdersTable: React.FC<Props> = ({ orders: _orders, isSupplier }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const router = useRouter();
  //const [orders] = useState<Order[]>(sampleOrders);

  let filteredOrders = _orders;
  /*orders.filter(order => {
    const matchesSearch = order.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.detail.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.request.code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !statusFilter || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });
*/
  const searchItem = React.useCallback(() => {
    return _orders.filter((order) => {
      const matchesSearch =
        order.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.detail.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.request.code.toLowerCase().includes(searchTerm.toLowerCase());

      // return matchesSearch && matchesStatus;
      return matchesSearch;
    });
  }, [searchTerm]);
  const searchByStatus = () => {
    const orders = _orders.filter(
      (order) => order.status.toLowerCase() === statusFilter?.toLowerCase()
    );

    return orders;
  };

  React.useEffect(() => {
    if (searchItem.length > 2) {
      filteredOrders = searchItem();
    }
  }, [searchItem]);

  React.useEffect(() => {
    if (statusFilter) {
      filteredOrders = searchByStatus();
    }
  }, [statusFilter]);

  const handleOrder = (id: string) => {
    navigateTo();
    if (isSupplier) router.push(`/keyman/supplier/orders/${id}`);
    else router.push(`/keyman/dashboard/orders/${id}`);
  };
  const rows = filteredOrders.toReversed().map((order, index) => (
    <Table.Tr
      key={order.id}
      style={{
        transition: "all 0.2s ease",
        cursor: "pointer",
      }}
      className="hover:bg-gray-50 hover:scale-[1.001] hover:shadow-sm"
    >
      <Table.Td>{index + 1}</Table.Td>
      <Table.Td>
        <Group gap="sm">
          <Box>
            <Text fw={600} size="sm" c="#3D6B2C">
              {order.code}
            </Text>
            <Text size="xs" c="dimmed">
              {formatDate(order.created_at)}
            </Text>
          </Box>
        </Group>
      </Table.Td>

      <Table.Td>
        <Group gap="xs">
          <Calendar size={14} color="#F08C23" />
          <Text size="sm">{formatDate(order.delivery_date)}</Text>
        </Group>
      </Table.Td>

      <Table.Td>
        <Group gap="xs">
          <Package size={14} color="#388E3C" />
          <Badge
            variant="light"
            color="green"
            size="sm"
            style={{ backgroundColor: "#388E3C15" }}
          >
            {order.items.length} items
          </Badge>
        </Group>
      </Table.Td>

      <Table.Td>
        <Group gap="xs">
          <HandCoins size={14} color="#3D6B2C" />

          <Text fw={600} size="sm" c="#3D6B2C">
            <NumberFormatter
              value={order.total}
              prefix="KSh "
              thousandSeparator=","
            />
          </Text>
        </Group>
      </Table.Td>

      <Table.Td>
        <Badge
          variant="filled"
          size="md"
          style={{
            backgroundColor: getStatusColor(order.status),
            color: "white",
            textTransform: "capitalize",
            fontWeight: 500,
          }}
          leftSection={getStatusIcon(order.status)}
        >
          {order.status.replace("_", " ").toLowerCase()}
        </Badge>
      </Table.Td>

      <Table.Td>
        <Text size="sm" fw={500} c="#3D6B2C">
          {order.request.code}
        </Text>
      </Table.Td>

      <Table.Td>
        <Group gap="sm">
          <Avatar size="sm" color="#3D6B2C">
            <Building2 size={16} />
          </Avatar>
          <Box>
            <Text size="sm" fw={500}>
              {order.detail.name}
            </Text>
            <Group gap={4}>
              <Phone size={12} color="#F08C23" />
              <Text size="xs" c="dimmed">
                {order.detail.phone}
              </Text>
            </Group>
          </Box>
        </Group>
      </Table.Td>

      <Table.Td>
        <Group gap="xs">
          <Tooltip label="View Order Details">
            <ActionIcon
              variant="light"
              color="green"
              size="sm"
              style={{
                backgroundColor: "#3D6B2C15",
                transition: "all 0.2s ease",
              }}
              className="hover:scale-110 hover:bg-green-100"
              onClick={() => handleOrder(order.id)}
            >
              <Eye size={16} />
            </ActionIcon>
          </Tooltip>
          <ChevronRight size={16} color="#6b7280" />
        </Group>
      </Table.Td>
    </Table.Tr>
  ));

  return (
    <Container size="xl" py="md">
      <Card
        shadow="sm"
        padding="lg"
        radius="md"
        style={{
          background: "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)",
          border: "1px solid #e2e8f0",
        }}
      >
        <Stack gap="lg">
          {/* Header */}
          <Group justify="space-between" align="center">
            <Box>
              <Title order={2} c="#3D6B2C" fw={700}>
                Orders Management
              </Title>
              <Text size="sm" c="dimmed" mt={4}>
                Track and manage your construction orders
              </Text>
            </Box>
            <Badge
              size="lg"
              variant="light"
              color="green"
              style={{ backgroundColor: "#3D6B2C15" }}
            >
              {filteredOrders.length} Orders
            </Badge>
          </Group>

          {/* Filters */}
          <Card
            padding="md"
            radius="md"
            style={{ backgroundColor: "#f8fafc", border: "1px solid #e2e8f0" }}
          >
            <Group gap="md" align="end">
              <TextInput
                placeholder="Search orders, suppliers, or request codes..."
                leftSection={<Search size={16} />}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.currentTarget.value)}
                style={{ flex: 1 }}
                styles={{
                  input: {
                    borderColor: "#3D6B2C30",
                    "&:focus": {
                      borderColor: "#3D6B2C",
                      boxShadow: "0 0 0 2px #3D6B2C20",
                    },
                  },
                }}
              />
              <Select
                placeholder="Filter by status"
                leftSection={<Filter size={16} />}
                data={[
                  { value: "SUBMITTED", label: "Submitted" },
                  { value: "PENDING", label: "Pending" },
                  { value: "IN_PROGRESS", label: "In Progress" },
                  { value: "COMPLETED", label: "Completed" },
                  { value: "CANCELLED", label: "Cancelled" },
                  { value: "awarded", label: "Awarded" },
                ]}
                value={statusFilter}
                onChange={setStatusFilter}
                clearable
                style={{ minWidth: 180 }}
                styles={{
                  input: {
                    borderColor: "#3D6B2C30",
                    "&:focus": {
                      borderColor: "#3D6B2C",
                      boxShadow: "0 0 0 2px #3D6B2C20",
                    },
                  },
                }}
              />
            </Group>
          </Card>

          {/* Table */}
          <Paper
            shadow="xs"
            radius="md"
            style={{
              overflow: "hidden",
              border: "1px solid #e2e8f0",
            }}
          >
            <ScrollArea>
              <Table
                highlightOnHover
                verticalSpacing="md"
                horizontalSpacing="lg"
                style={{ minWidth: 1200 }}
              >
                <Table.Thead
                  style={{
                    backgroundColor: "#3D6B2C",
                    color: "white",
                  }}
                >
                  <Table.Tr>
                    <Table.Th style={{ color: "white", fontWeight: 600 }}>
                      #
                    </Table.Th>
                    <Table.Th style={{ color: "white", fontWeight: 600 }}>
                      Order Code
                    </Table.Th>
                    <Table.Th style={{ color: "white", fontWeight: 600 }}>
                      Delivery Date
                    </Table.Th>
                    <Table.Th style={{ color: "white", fontWeight: 600 }}>
                      Items
                    </Table.Th>
                    <Table.Th style={{ color: "white", fontWeight: 600 }}>
                      Total
                    </Table.Th>
                    <Table.Th style={{ color: "white", fontWeight: 600 }}>
                      Status
                    </Table.Th>
                    <Table.Th style={{ color: "white", fontWeight: 600 }}>
                      Request Code
                    </Table.Th>
                    <Table.Th style={{ color: "white", fontWeight: 600 }}>
                      Supplier
                    </Table.Th>
                    <Table.Th style={{ color: "white", fontWeight: 600 }}>
                      Actions
                    </Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>{rows}</Table.Tbody>
              </Table>
            </ScrollArea>
          </Paper>

          {/* Empty State */}
          {filteredOrders.length === 0 && (
            <Paper
              p="xl"
              ta="center"
              style={{
                backgroundColor: "#f8fafc",
                border: "2px dashed #e2e8f0",
              }}
            >
              <Package
                size={48}
                color="#9ca3af"
                style={{ margin: "0 auto 16px" }}
              />
              <Title order={4} c="dimmed" mb="xs">
                No orders found
              </Title>
              <Text c="dimmed" size="sm">
                Try adjusting your search or filter criteria
              </Text>
            </Paper>
          )}
        </Stack>
      </Card>
    </Container>
  );
};

export default OrdersTable;
