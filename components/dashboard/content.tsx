"use client";
import React, { useState } from "react";
import {
  Container,
  Paper,
  TextInput,
  Button,
  Group,
  Card,
  Grid,
  Box,
  Title,
  Stack,
  Text,
  Badge,
  ActionIcon,
} from "@mantine/core";
import {
  ShoppingCart,
  ClipboardList,
  Coins,
  //Package,
  Plus,
  CreditCard,
  Search,
  Brain,
  Bot,
  ReceiptText,
} from "lucide-react";
import { useAppContext } from "@/providers/AppContext";
import { useRouter } from "next/navigation";
import { navigateTo } from "@/lib/helpers";
import PaymentModal from "../Tokens";
import { useQuery } from "@tanstack/react-query";
import { getBalance } from "@/api/coin";
import { notify } from "@/lib/notifications";
import { getOrders } from "@/api/orders";
import { getRequests } from "@/api/requests";

import { RequestDeliveryItem } from "@/types";
import Link from "next/link";
import { Order } from "@/types/orders";
import DashboardSearch from "../keyman-bot/DashboardSearch";
// Main Content Component
const MainContent: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const { darkMode: isDark, user } = useAppContext();
  const router = useRouter();
  const [isOpen, setOpen] = useState(false);
  const { data: balance, refetch } = useQuery({
    queryKey: ["balance"],
    queryFn: async () => getBalance(""),
    refetchOnWindowFocus: false,
  });

  const { data: orders } = useQuery({
    queryKey: ["orders"],
    queryFn: async () => getOrders(""),
  });

  const { data: requests } = useQuery({
    queryKey: ["customer requests"],
    queryFn: async () => await getRequests(),
  });

  //console.log(requests, "__customer requests__");
  const _requests = React.useMemo(() => {
    if (requests?.requests?.data?.length > 0) {
      return requests?.requests?.data;
    } else return [];
  }, [requests]);
  const _orders = React.useMemo(() => {
    if (orders?.orders?.length > 0) {
      return orders?.orders;
    } else return [];
  }, [orders]);
  const stats = [
    {
      label: "Active Orders",
      value: _orders?.length || 0,
      icon: ShoppingCart,
      color: "#3b82f6",
    },
    {
      label: "Pending Requests",
      value: _requests?.length || 0,
      icon: ClipboardList,
      color: "#F08C23",
    },
    {
      label: "Coins Balance",
      value: balance?.balance?.total || "0",
      icon: Coins,
      color: "#3D6B2C",
    },
    // { label: "Materials", value: "156", icon: Package, color: "#8b5cf6" },
  ];

  const handlePaymentSuccess = () => {
    notify.success(
      "Your payment will reflect on your account soon.",
      "Validating payment"
    );
    refetch();
  };
  const handlePaymentError = () => {};
  const handleBecomeSupplier = () => {
    navigateTo();
    router.push("/keyman/supplier/register");
  };
  const handleRequestItem = () => {
    navigateTo();
    router.push("/keyman/dashboard/requests/create-request");
  };
  const isSupplier = user && "supplier_details" in user;
  return (
    <Container
      fluid
      p={{ sm: "xs", md: "xl" }}
      className={isDark ? "bg-gray-900" : "bg-gray-50  "}
    >
      {!isSupplier && (
        <Box className=" hidden md:flex justify-end relative -top-2 left-4">
          {" "}
          <Button onClick={handleBecomeSupplier}>Become Supplier</Button>
        </Box>
      )}
      <PaymentModal
        isOpen={isOpen}
        onClose={() => setOpen(false)}
        type="user"
        typeId=""
        amount={0}
        description=""
        availablePaymentMethods={["mpesa", "airtel_money", "t_kash"]}
        onPaymentSuccess={handlePaymentSuccess}
        onPaymentError={handlePaymentError}
      />
      {/* AI Search Bar */}
      <Paper
        p={{ base: "sm", md: "lg" }}
        pb={{ base: "xl", md: "md" }}
        mb="xl"
        className="!shadow-lg max-w-[768px] mx-auto  w-full"
      >
        <DashboardSearch />
        <TextInput
          display={"none"}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.currentTarget.value)}
          placeholder="Ask Keyman  about materials, prices, or construction tips..."
          size="lg"
          radius="lg"
          leftSection={<Brain size={20} className="text-[#3D6B2C]" />}
          rightSection={
            <Button
              size="sm"
              className="bg-gradient-to-r from-[#3D6B2C] to-[#388E3C] hover:shadow-lg transition-all duration-200"
            >
              <Search size={18} />
            </Button>
          }
          styles={{
            input: {
              borderColor: "#3D6B2C",
              "&:focus": {
                borderColor: "#3D6B2C",
              },
            },
          }}
        />
      </Paper>

      {/* Quick Actions */}
      <Group mb="xl">
        <Button
          size="lg"
          onClick={handleRequestItem}
          leftSection={<Plus size={20} />}
          className="bg-gradient-to-r from-[#F08C23] to-[#3D6B2C] hover:shadow-lg transition-all duration-200 transform hover:scale-105"
        >
          Request Item
        </Button>
        <Button
          size="lg"
          variant="outline"
          onClick={() => setOpen(true)}
          leftSection={<CreditCard size={20} />}
          color="gray"
          className="hover:shadow-lg transition-all duration-200 transform hover:scale-105"
        >
          Top Up coins
        </Button>
        <Button
          size="lg"
          variant="light"
          onClick={() => null}
          leftSection={<ReceiptText size={20} />}
          color="gray"
          className="hover:shadow-lg transition-all duration-200 transform hover:scale-105"
        >
          Keyman Contract
        </Button>
      </Group>

      {/* Stats Grid */}
      <Grid mb="xl">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Grid.Col key={index} span={{ base: 12, sm: 6, lg: 3 }}>
              <Card
                shadow="sm"
                p="lg"
                className="hover:shadow-lg transition-all duration-200 transform hover:scale-105"
              >
                <Group>
                  <Box>
                    <Text size="sm" color="dimmed" fw={500}>
                      {stat.label}
                    </Text>
                    <Text size="xl" fw={700} mt={4}>
                      {stat.value}
                    </Text>
                  </Box>
                  <Box
                    className="w-12 h-12 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: stat.color }}
                  >
                    <Icon size={24} className="text-white" />
                  </Box>
                </Group>
              </Card>
            </Grid.Col>
          );
        })}
      </Grid>

      {/* Main Content Grid */}
      {_orders.length > 0 && (
        <Grid>
          {/* Recent Orders */}
          <Grid.Col span={{ base: 12, lg: 8 }}>
            <Card shadow="sm" p="lg">
              <Title order={3} mb="md">
                Recent Orders
              </Title>
              <Stack gap="md">
                {_orders?.slice(0, 10)?.map((order: Order, index: number) => (
                  <Link
                    key={order?.id ?? index}
                    href={`/keyman/dashboard/orders/${order?.id}`}
                  >
                    <Paper
                      p="md"
                      withBorder
                      className="hover:shadow-md transition-all duration-200"
                    >
                      <Group justify="space-between" align="center">
                        <Box>
                          <Text fw={600}>{order?.code}</Text>
                          <Text size="sm" color="dimmed">
                            • Qty {order?.items?.length ?? 0} •items{" "}
                            {order?.items.map((item) => item?.name).join(", ")}
                          </Text>
                        </Box>
                        <Box style={{ textAlign: "right" }}>
                          <Badge color={"orange"} variant="light" mb={4}>
                            {order?.status}
                          </Badge>
                          <Text size="sm" color="dimmed">
                            Created on:{" "}
                            {order?.created_at
                              ? new Date(order?.created_at).toDateString()
                              : ""}
                          </Text>
                        </Box>
                      </Group>
                    </Paper>
                  </Link>
                ))}
                {_orders?.length > 10 && (
                  <Link
                    href="/keyman/dashboard/orders"
                    className="text-keyman-orange text-sm ml-2 hover:underline"
                  >
                    View {orders?.length - 10} more orders
                  </Link>
                )}
              </Stack>
            </Card>
          </Grid.Col>

          {/* Ads Section */}
          <Grid.Col span={{ base: 12, lg: 4 }}>
            <Card shadow="sm" p="lg">
              <Title order={3} mb="md">
                Recommended for You
              </Title>
              <Stack gap="md">
                <Paper
                  p="md"
                  className="bg-gradient-to-br from-[#3D6B2C] to-[#388E3C] text-white rounded-lg"
                >
                  <Text fw={600} size="lg" mb={4}>
                    Premium Cement
                  </Text>
                  <Text size="sm" mb="md" opacity={0.9}>
                    50% off on bulk orders
                  </Text>
                  <Button size="xs" variant="white" color="dark">
                    View Deal
                  </Button>
                </Paper>

                <Paper
                  p="md"
                  className="bg-gradient-to-br from-[#F08C23] to-[#3D6B2C] text-white rounded-lg"
                >
                  <Text fw={600} size="lg" mb={4}>
                    Steel Rods
                  </Text>
                  <Text size="sm" mb="md" opacity={0.9}>
                    Quality assured materials
                  </Text>
                  <Button size="xs" variant="white" color="dark">
                    Order Now
                  </Button>
                </Paper>
              </Stack>
            </Card>
          </Grid.Col>
        </Grid>
      )}
      {_requests.length > 0 && (
        <Grid>
          {/* Recent requests */}
          <Grid.Col span={{ base: 12, lg: 8 }}>
            <Card shadow="sm" p="lg">
              <Title order={3} mb="md">
                Recent requests
              </Title>
              <Stack gap="md">
                {_requests
                  ?.slice(0, 10)
                  ?.map((request: RequestDeliveryItem, index: number) => (
                    <Link
                      key={request?.id ?? index}
                      href={`/keyman/dashboard/requests/${request?.id}`}
                    >
                      <Paper
                        p="md"
                        withBorder
                        className="hover:shadow-md transition-all duration-200"
                      >
                        <Group justify="space-between" align="center">
                          <Box>
                            <Text fw={600}>{request?.code}</Text>
                            <Text size="sm" color="dimmed">
                              Qty: {request?.items_count ?? 0} Quotes:{" "}
                              {request?.quotes_count ?? 0} •
                            </Text>
                          </Box>
                          <Box style={{ textAlign: "right" }}>
                            <Badge color={"green"} variant="light" mb={4}>
                              {request?.status}
                            </Badge>
                            <Text size="sm" color="dimmed">
                              {request?.created_at
                                ? new Date(request?.created_at).toDateString()
                                : ""}
                            </Text>
                          </Box>
                        </Group>
                      </Paper>
                    </Link>
                  ))}
                {_requests?.length > 10 && (
                  <Link
                    href="/keyman/dashboard/requests"
                    className="text-keyman-orange text-sm ml-2 hover:underline"
                  >
                    View {_requests?.length - 10} more requests
                  </Link>
                )}
              </Stack>
            </Card>
          </Grid.Col>

          {/* Ads Section */}
          <Grid.Col span={{ base: 12, lg: 4 }}>
            <Card shadow="sm" p="lg">
              <Title order={3} mb="md">
                Recommended for You
              </Title>
              <Stack gap="md">
                <Paper
                  p="md"
                  className="bg-gradient-to-br from-[#3D6B2C] to-[#388E3C] text-white rounded-lg"
                >
                  <Text fw={600} size="lg" mb={4}>
                    Premium Cement
                  </Text>
                  <Text size="sm" mb="md" opacity={0.9}>
                    50% off on bulk orders
                  </Text>
                  <Button size="xs" variant="white" color="dark">
                    View Deal
                  </Button>
                </Paper>

                <Paper
                  p="md"
                  className="bg-gradient-to-br from-[#F08C23] to-[#3D6B2C] text-white rounded-lg"
                >
                  <Text fw={600} size="lg" mb={4}>
                    Steel Rods
                  </Text>
                  <Text size="sm" mb="md" opacity={0.9}>
                    Quality assured materials
                  </Text>
                  <Button size="xs" variant="white" color="dark">
                    Order Now
                  </Button>
                </Paper>
              </Stack>
            </Card>
          </Grid.Col>
        </Grid>
      )}
      {/* Floating AI Chat Button */}
      <ActionIcon
        size={60}
        radius="xl"
        display="none"
        className="fixed  bottom-2 right-0 bg-gradient-to-br from-[#3D6B2C] to-[#388E3C] shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-110 z-50"
        variant="filled"
      >
        <Bot size={28} className="text-white" />
      </ActionIcon>
    </Container>
  );
};

export default MainContent;
