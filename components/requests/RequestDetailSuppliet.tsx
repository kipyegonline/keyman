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
  Center,
} from "@mantine/core";
import {
  Calendar,
  MapPin,
  Package,
  FileText,
  CheckCircle,
  Eye,
  Truck,
  Weight,
  Building2,
  Hash,
  Navigation,
} from "lucide-react";
import { RequestDeliveryItem } from "@/types";
import React from "react";

import { notify } from "@/lib/notifications";
import PricingComponent from "./SupplierPricingComponent";
import { useQuery } from "@tanstack/react-query";
import { getBalance } from "@/api/coin";
type PricingProps = { id: string; price: number; quantity: number };
type PricedRequestItem = RequestDeliveryItem["items"][0] & {
  price?: number;
  quan?: number;
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const RequestDetailSuplier: React.FC<{ request: RequestDeliveryItem }> = ({
  request: selectedRequest,
}) => {
  const [orderItems, setOrderItems] = React.useState<PricedRequestItem[]>(
    selectedRequest?.items
  );

  const supplierId = localStorage.getItem("supplier_id") as string;

  const { data: balance } = useQuery({
    queryFn: async () => await getBalance(supplierId),
    queryKey: ["balance", supplierId],
    enabled: !!supplierId,
  });
  const _balance = React.useMemo(() => {
    if (balance?.balance) return balance?.balance?.total;
    return 0;
  }, [balance]);

  const openGoogleMaps = (lat: number, long: number) => {
    if (lat && long) {
      window.open(`https://maps.google.com/?q=${long},${lat}`, "_blank");
    }
  };
  const handleItemUpdate = (_item: PricingProps) => {
    const updatedItems = orderItems.map((item) =>
      item.id === _item.id
        ? { ...item, price: _item.price, quan: _item.quantity }
        : item
    );

    setOrderItems(updatedItems);
  };
  const getValuation = (totalAmount: number, balance: number) => {
    return balance > (2 / 100) * (totalAmount / 20);
  };
  const getTotalAmount = (orderItems: PricedRequestItem[]) => {
    return orderItems.reduce((total, item) => {
      return total + (item?.price || 0) * (item?.quan || 0);
    }, 0);
  };
  const gettotalWeight = (selectedRequest: RequestDeliveryItem) => {
    return selectedRequest?.items.reduce((total, _item) => {
      const weight = Number(_item?.item?.weight_in_kgs);
      return total + weight;
    }, 0);
  };

  const handleSubmit = async () => {
    const notQuoted = orderItems.some(
      (item) =>
        typeof item.price === "undefined" || typeof item.quan === "undefined"
    );

    if (notQuoted) {
      notify.error("Kindly add unit price and quantity to all fields");
      return;
    }
    const hasInvalidValues = orderItems.some(
      (item) => (item.quan ?? 0) <= 0 || (item.price ?? 0) <= 0
    );

    if (hasInvalidValues) {
      notify.error("Quantity and Unit price must be greater than zero.");
      return;
    }

    const totalCost = getTotalAmount(orderItems);
    const totalWeight = gettotalWeight(selectedRequest);
    const eligible = getValuation(totalCost, _balance);
    console.log(eligible);
    console.log({ totalCost, orderItems, totalWeight }, "submitting quote");
    //send to server
    const items = orderItems.map((item) => ({
      request_item_id: item.id,
      quantity: item.quan,
      price: item.price,
      total_price: totalCost,
      total_weight: totalWeight,
    }));
    const transport = {
      type: "SUPPLIER_DELIVERY",
      vehicle: "tultuk",
      weight: 150,
      distance: 2.5,
      cost: 1000,
    };

    const payload = {
      supplier_detail_id: supplierId,
      request_id: selectedRequest.id,
      items,
      transport,
      minimum_order_quantity: 0,
      partial_delivery: 1,
      payment_type: "Guaranteed Pay",
      update_pricelist: 0,
    };
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
                View Location
              </Button>
            </Group>
            <Group gap="md" display="none">
              <Badge
                variant="light"
                style={{ backgroundColor: "#388E3C15", color: "#388E3C" }}
              >
                <MapPin size={12} className="mr-1 inline-block py-2" />
                {selectedRequest.location.coordinates[1]},{"  "}{" "}
                {selectedRequest.location.coordinates[0]}
              </Badge>
              <Text size="sm" c="dimmed">
                Delivery coordinates for precise location tracking
              </Text>
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
              {orderItems.map((item, index) => (
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

                      <PricingComponent
                        item={item}
                        updateItemPrices={handleItemUpdate}
                      />
                    </Group>
                  </Group>
                  <Text size="sm" c="dimmed" className="pl-10">
                    {item?.description}
                  </Text>
                </Paper>
              ))}
              <Center>
                <Button onClick={handleSubmit}>Submit Quote</Button>
              </Center>
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

export default RequestDetailSuplier;
