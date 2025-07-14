"use client";
import React, { useState } from "react";
import {
  Table,
  Badge,
  Box,
  Text,
  Group,
  ActionIcon,
  Paper,
  Title,
  Tooltip,
  Container,
  Flex,
  Button,
  ScrollArea,
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
  PlusIcon,
  LucideProps,
} from "lucide-react";
import { navigateTo } from "@/lib/helpers";
import { useRouter } from "next/navigation";

interface RequestDelivery {
  code: string;
  created_at: string;
  created_from: string;
  delivery_date: string;
  id: string;
  items_count: number;
  ks_number: null;
  location: {
    type: string;
    coordinates: [number, number];
  };
  quotes_count: number;
  status:
    | "SUBMITTED"
    | "PENDING"
    | "IN_PROGRESS"
    | "COMPLETED"
    | "CANCELLED"
    | "awarded";
  updated_at: string;
}

type StatusConfig = {
  color: string;
  bg: string;
  icon: React.ComponentType<LucideProps>;
  label: string;
};

const getStatusConfig = (
  status: RequestDelivery["status"]
): StatusConfig | undefined => {
  const configs: Record<string, StatusConfig> = {
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

const RequestsTable: React.FC<{ requests: RequestDelivery[] }> = ({
  requests,
}) => {
  const [hoveredRow, setHoveredRow] = useState<string | null>(null);

  const router = useRouter();
  const handleRequestClick = (id: string) => {
    navigateTo();
    const url = `/keyman/dashboard/requests/${id}`;
    router.push(url);
  };

  const StatusBadge: React.FC<{ status: RequestDelivery["status"] }> = ({
    status,
  }) => {
    const config = getStatusConfig(status);

    if (!config) return null;
    const IconComponent = config.icon;
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
  const createRequest = () => {
    navigateTo();
    router.push("/keyman/dashboard/requests/create-request");
  };

  const rows = requests?.map((request, index) => (
    <Table.Tr
      key={request.id}
      className={`transition-all duration-300 ease-in-out cursor-pointer ${
        hoveredRow === request.id
          ? "bg-gradient-to-r from-green-50 to-orange-50 transform scale-[1.002] shadow-md"
          : "hover:bg-gray-50"
      }`}
      onMouseEnter={() => setHoveredRow(request.id)}
      onMouseLeave={() => setHoveredRow(null)}
    >
      <Table.Td>{index + 1}</Table.Td>
      <Table.Td>
        <Group gap="xs">
          <Box
            className="w-2 h-8 rounded-full transition-all duration-300"
            style={{
              backgroundColor: getStatusConfig(request.status)?.color,
              transform:
                hoveredRow === request.id ? "scaleY(1.2)" : "scaleY(1)",
            }}
          />
          <Box>
            <Text fw={600} size="sm" className="text-gray-800">
              {request.code}
            </Text>
          </Box>
        </Group>
      </Table.Td>

      <Table.Td>
        <Group gap="xs">
          <Calendar size={14} className="text-gray-500" />
          <Text size="sm" className="text-gray-700">
            {formatDate(request.created_at)}
          </Text>
        </Group>
      </Table.Td>

      <Table.Td>
        <Group gap="xs">
          <Calendar size={14} className="text-orange-500" />
          <Text size="sm" className="text-gray-700">
            {formatDate(request.delivery_date)}
          </Text>
        </Group>
      </Table.Td>

      <Table.Td>
        <Group gap="xs">
          <MapPin size={14} className="text-green-600" />
          <Text size="sm" className="text-gray-700" truncate>
            {request.created_from}
          </Text>
        </Group>
      </Table.Td>

      <Table.Td>
        <Group gap="xs">
          <Box
            className="flex items-center justify-center w-8 h-8 rounded-full transition-all duration-300"
            style={{
              backgroundColor: "#F08C2315",
              border: "2px solid #F08C2330",
              transform:
                hoveredRow === request.id
                  ? "rotate(5deg) scale(1.1)"
                  : "rotate(0deg) scale(1)",
            }}
          >
            <FileText size={14} style={{ color: "#F08C23" }} />
          </Box>
          <Text fw={600} size="sm" style={{ color: "#F08C23" }}>
            {request.quotes_count}
          </Text>
        </Group>
      </Table.Td>

      <Table.Td>
        <Group gap="xs">
          <Box
            className="flex items-center justify-center w-8 h-8 rounded-full transition-all duration-300"
            style={{
              backgroundColor: "#3D6B2C15",
              border: "2px solid #3D6B2C30",
              transform:
                hoveredRow === request.id
                  ? "rotate(-5deg) scale(1.1)"
                  : "rotate(0deg) scale(1)",
            }}
          >
            <Package size={14} style={{ color: "#3D6B2C" }} />
          </Box>
          <Text fw={600} size="sm" style={{ color: "#3D6B2C" }}>
            {request.items_count}
          </Text>
        </Group>
      </Table.Td>

      <Table.Td>
        <StatusBadge status={request.status} />
      </Table.Td>

      <Table.Td>
        <Tooltip label="View Details" position="left">
          <ActionIcon
            variant="subtle"
            className={`transition-all duration-300 ${
              hoveredRow === request.id
                ? "bg-gradient-to-r from-green-100 to-orange-100 transform rotate-12 scale-110"
                : "hover:bg-gray-100"
            }`}
            style={{ color: hoveredRow === request.id ? "#3D6B2C" : "#666" }}
            onClick={() => handleRequestClick(request.id)}
          >
            <Eye size={16} />
          </ActionIcon>
        </Tooltip>
      </Table.Td>
    </Table.Tr>
  ));
  const RequestIndicators = (
    <Flex justify="space-between" align="center" mt="md" p="sm">
      <Text size="sm" c="dimmed">
        Showing {requests?.length} requests
      </Text>
      <Group gap="xs">
        <Box
          className="w-3 h-3 rounded-full"
          style={{ backgroundColor: "#3D6B2C" }}
        />
        <Text size="xs" c="dimmed">
          Active
        </Text>
        <Box
          className="w-3 h-3 rounded-full"
          style={{ backgroundColor: "#F08C23" }}
        />
        <Text size="xs" c="dimmed">
          Pending
        </Text>
        <Box
          className="w-3 h-3 rounded-full"
          style={{ backgroundColor: "#388E3C" }}
        />
        <Text size="xs" c="dimmed">
          Completed
        </Text>
      </Group>
    </Flex>
  );

  return (
    <Container
      size="xl"
      py={{ base: "xs", md: "xl" }}
      px={{ base: "xs", md: "xl" }}
    >
      <Box mb="xl">
        <Group gap="md" mb="md">
          <Box
          // className="w-1 h-8 rounded-full bg-gradient-to-b"
          //style={{ background: 'linear-gradient(to bottom, #3D6B2C, #F08C23)' }}
          />
          <Flex
            direction={{ base: "column", sm: "row" }}
            align="center"
            className=" w-full "
            justify={"space-between"}
          >
            <Title order={2} className="text-gray-800 font-bold">
              Your Requests
            </Title>

            <Button
              radius={"md"}
              onClick={createRequest}
              leftSection={<PlusIcon size={16} />}
            >
              Create New Request
            </Button>
          </Flex>
        </Group>
        <Text c="dimmed" size="sm">
          Manage and track your construction material requests and quotes
        </Text>
      </Box>

      <Paper
        shadow="xs"
        radius="lg"
        className="overflow-hidden border border-gray-200 transition-all duration-300 hover:shadow-lg"
      >
        {RequestIndicators}
        <Box
          className="h-2 bg-gradient-to-r"
          style={{
            background: "linear-gradient(to right, #3D6B2C, #388E3C, #F08C23)",
          }}
        />
        <ScrollArea>
          <Table highlightOnHover className="table-auto">
            <Table.Thead>
              <Table.Tr className="bg-gradient-to-r from-gray-50 to-gray-100">
                <Table.Th className="font-semibold text-gray-700">#</Table.Th>
                <Table.Th className="font-semibold text-gray-700">
                  Request Code
                </Table.Th>
                <Table.Th className="font-semibold text-gray-700">
                  Created
                </Table.Th>
                <Table.Th className="font-semibold text-gray-700">
                  Delivery Date
                </Table.Th>
                <Table.Th className="font-semibold text-gray-700">
                  Created From
                </Table.Th>
                <Table.Th className="font-semibold text-gray-700 text-center">
                  Quotes
                </Table.Th>
                <Table.Th className="font-semibold text-gray-700 text-center">
                  Items
                </Table.Th>
                <Table.Th className="font-semibold text-gray-700">
                  Status
                </Table.Th>
                <Table.Th className="font-semibold text-gray-700 text-center">
                  Actions
                </Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>{rows}</Table.Tbody>
          </Table>
        </ScrollArea>
      </Paper>

      {RequestIndicators}
    </Container>
  );
};

export default RequestsTable;
