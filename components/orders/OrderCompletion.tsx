import React, { useState } from "react";
import {
  Card,
  Group,
  Text,
  Button,
  Modal,
  Stack,
  Badge,
  Alert,
  Paper,
  Transition,
  Divider,
  ScrollArea,
  Box,
  Progress,
  Tooltip,
} from "@mantine/core";
import {
  Package,
  CheckCircle,
  Clock,
  Unlock,
  Lock,
  Truck,
  PackageCheck,
  ArrowRight,
  Info,
  Check,
} from "lucide-react";
import { confirmItemReceipt, ReleaseItem } from "@/api/orders";
import { getCurrentLocation } from "@/lib/geolocation";

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

interface OrderCompletionProps {
  orderCompletion?: {
    receive: boolean;
    release: boolean;
  };
  items?: Array<OrderItem>;
  onRelease: () => void;
  orderId: string;
}

const OrderCompletionSection: React.FC<OrderCompletionProps> = ({
  orderCompletion,
  items,
  onRelease,
  orderId,
}) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [isReleasing, setIsReleasing] = useState(false);
  const [releaseSuccess, setReleaseSuccess] = useState(false);

  const handleRelease = async () => {
    if (confirm("Release items?")) {
      setIsReleasing(true);
      try {
        // Call the API function
        if (true) {
          const coords = await getCurrentLocation();
          let payLoaditems: ReleaseItem["items"] = [];
          items?.forEach((item) => {
            const payloadItem = {} as ReleaseItem["items"][0];

            payloadItem["supplier_order_item_id"] = item.id;
            payloadItem["quantity"] = item.quantity;
            payloadItem["confirmation_type"] = "SUPPLIER";
            payloadItem["latitude"] = coords.lat;
            payloadItem["longitude"] = coords.lng;
            payloadItem["comments"] = "";

            payLoaditems = [payloadItem, ...payLoaditems];
          });
          const payload = { items: payLoaditems, comments: "", rating: 2 };
          const result = await confirmItemReceipt(orderId, payload);
          if (result.status) {
            setReleaseSuccess(true);
            onRelease();
            setTimeout(() => {
              setModalOpen(false);
              setReleaseSuccess(false);
            }, 1500);
          } else {
          }
        }
      } catch (error) {
        console.error("Failed to release items:", error);
      } finally {
        setIsReleasing(false);
      }
    }
  };

  const getCompletionProgress = () => {
    if (orderCompletion?.receive) return 100;
    if (orderCompletion?.release) return 50;
    return 0;
  };

  return (
    <>
      {/* Order Completion Card */}
      <Card
        shadow="sm"
        padding="lg"
        radius="md"
        className="hover:shadow-md transition-all duration-300 animate-in fade-in-50 slide-in-from-left-4"
        style={{ animationDelay: "250ms" }}
      >
        <Group justify="space-between" mb="md">
          <Group gap="sm">
            <PackageCheck size={20} color="#388E3C" />
            <Text fw={600} size="lg">
              Order Completion Status
            </Text>
          </Group>
          <Badge
            variant="light"
            color={getCompletionProgress() === 100 ? "green" : "orange"}
            size="md"
          >
            {getCompletionProgress()}% Complete
          </Badge>
        </Group>

        <Progress
          value={getCompletionProgress()}
          color={getCompletionProgress() === 100 ? "green" : "orange"}
          size="sm"
          radius="xl"
          mb="lg"
          className="transition-all duration-1000"
        />

        <Stack gap="md">
          {/* Release Status */}
          <Transition
            mounted={!orderCompletion?.release}
            transition="slide-up"
            duration={400}
            timingFunction="ease"
          >
            {(styles) => (
              <div style={styles}>
                <Paper
                  p="md"
                  radius="md"
                  style={{
                    background:
                      "linear-gradient(135deg, #fff5f0 0%, #ffe8de 100%)",
                    border: "1px solid #ffddcc",
                  }}
                  className="hover:shadow-sm transition-all duration-300"
                >
                  <Group justify="space-between" align="center">
                    <Group gap="md">
                      <Box
                        p="xs"
                        style={{
                          background: "#F08C23",
                          borderRadius: "50%",
                          color: "white",
                        }}
                        className="animate-pulse"
                      >
                        <Lock size={20} />
                      </Box>
                      <Box>
                        <Text fw={600} size="md" c="#F08C23">
                          Items Pending Release
                        </Text>
                        <Text size="sm" c="dimmed">
                          {items?.length} items ready for release
                        </Text>
                      </Box>
                    </Group>
                    <Button
                      variant="filled"
                      color="orange"
                      size="sm"
                      leftSection={<Unlock size={16} />}
                      rightSection={<ArrowRight size={16} />}
                      onClick={() => setModalOpen(true)}
                      className="hover:scale-105 hover:shadow-md transition-all duration-200"
                      styles={{
                        root: {
                          background:
                            "linear-gradient(135deg, #F08C23 0%, #ff9a3c 100%)",
                        },
                      }}
                    >
                      Release Items
                    </Button>
                  </Group>
                </Paper>
              </div>
            )}
          </Transition>

          {/* Receive Status Alert */}
          <Transition
            mounted={orderCompletion?.release ?? false}
            transition="slide-up"
            duration={400}
            timingFunction="ease"
          >
            {(styles) => (
              <div style={styles}>
                {orderCompletion?.receive ? (
                  <Alert
                    variant="filled"
                    color="green"
                    radius="md"
                    icon={<CheckCircle size={20} />}
                    className="animate-in fade-in-50 slide-in-from-bottom-2"
                    styles={{
                      root: {
                        background:
                          "linear-gradient(135deg, #3D6B2C 0%, #388E3C 100%)",
                      },
                    }}
                  >
                    <Group justify="space-between" align="center">
                      <Box>
                        <Text fw={600} size="md">
                          Order Successfully Received
                        </Text>
                        <Text size="sm" opacity={0.9}>
                          All items have been received by the client
                        </Text>
                      </Box>
                      <Badge
                        variant="white"
                        color="green"
                        size="lg"
                        leftSection={<Check size={16} />}
                      >
                        Completed
                      </Badge>
                    </Group>
                  </Alert>
                ) : (
                  <Alert
                    variant="light"
                    color="blue"
                    radius="md"
                    icon={<Clock size={20} />}
                    className="animate-in fade-in-50 slide-in-from-bottom-2"
                    styles={{
                      root: {
                        background:
                          "linear-gradient(135deg, #e3f2fd 0%, #cce5ff 100%)",
                        border: "1px solid #90caf9",
                      },
                    }}
                  >
                    <Group justify="space-between" align="center">
                      <Box>
                        <Text fw={600} size="md" c="#1976d2">
                          Awaiting Client Confirmation
                        </Text>
                        <Text size="sm" c="dimmed">
                          Items have been released and are pending client
                          receipt
                        </Text>
                      </Box>
                      <Box className="animate-pulse">
                        <Truck size={24} color="#1976d2" />
                      </Box>
                    </Group>
                  </Alert>
                )}
              </div>
            )}
          </Transition>

          {/* Status Timeline */}
          <Group gap="xs" justify="center" mt="sm">
            <Tooltip label="Items Prepared" position="top">
              <Box
                p="xs"
                style={{
                  background: "#3D6B2C",
                  borderRadius: "50%",
                  color: "white",
                }}
                className="transition-all duration-300"
              >
                <Package size={16} />
              </Box>
            </Tooltip>
            <Divider
              w={60}
              color={orderCompletion?.release ? "#3D6B2C" : "#e0e0e0"}
              size="md"
              className="transition-all duration-500"
            />
            <Tooltip
              label={orderCompletion?.release ? "Released" : "Pending Release"}
              position="top"
            >
              <Box
                p="xs"
                style={{
                  background: orderCompletion?.release ? "#F08C23" : "#e0e0e0",
                  borderRadius: "50%",
                  color: "white",
                }}
                className="transition-all duration-300"
              >
                <Unlock size={16} />
              </Box>
            </Tooltip>
            <Divider
              w={60}
              color={orderCompletion?.receive ? "#388E3C" : "#e0e0e0"}
              size="md"
              className="transition-all duration-500"
            />
            <Tooltip
              label={orderCompletion?.receive ? "Received" : "Awaiting Receipt"}
              position="top"
            >
              <Box
                p="xs"
                style={{
                  background: orderCompletion?.receive ? "#388E3C" : "#e0e0e0",
                  borderRadius: "50%",
                  color: "white",
                }}
                className="transition-all duration-300"
              >
                <CheckCircle size={16} />
              </Box>
            </Tooltip>
          </Group>
        </Stack>
      </Card>

      {/* Release Modal */}
      <Modal
        opened={modalOpen}
        onClose={() => !isReleasing && setModalOpen(false)}
        title={
          <Group gap="sm">
            <Package size={20} color="#F08C23" />
            <Text fw={600} size="lg">
              Release Order Items
            </Text>
          </Group>
        }
        centered
        size="lg"
        radius="md"
        closeOnClickOutside={!isReleasing}
        closeOnEscape={!isReleasing}
        overlayProps={{
          opacity: 0.55,
          blur: 3,
        }}
      >
        <Stack gap="md">
          <Alert
            variant="light"
            color="orange"
            icon={<Info size={16} />}
            radius="md"
          >
            <Text size="sm">
              Please review the items below before releasing them to the client.
              This action cannot be undone.
            </Text>
          </Alert>

          <ScrollArea h={300} offsetScrollbars>
            <Stack gap="sm">
              {items &&
                items?.length > 0 &&
                items?.map((item, index) => (
                  <Paper
                    key={item.id}
                    p="md"
                    radius="md"
                    withBorder
                    className="hover:shadow-sm transition-all duration-200 hover:border-orange-300"
                    style={{
                      animation: `slideIn 0.3s ease-out ${index * 0.1}s both`,
                    }}
                  >
                    <Group justify="space-between" align="center">
                      <Group gap="md">
                        <Box
                          p="xs"
                          bg="#fff5f0"
                          style={{ borderRadius: "8px" }}
                        >
                          <Package size={20} color="#F08C23" />
                        </Box>
                        <Box>
                          <Text fw={600} size="md">
                            {item.name}
                          </Text>
                          <Stack gap={4} mt={6}>
                            <Group gap="xs">
                              <Tooltip
                                label="Current quantity in this order"
                                position="top"
                              >
                                <Badge
                                  variant="filled"
                                  color="blue"
                                  size="sm"
                                  leftSection={<Package size={12} />}
                                >
                                  Order: {item.quantity}
                                </Badge>
                              </Tooltip>
                              <Tooltip
                                label="Total quantity ordered"
                                position="top"
                              >
                                <Badge
                                  variant="light"
                                  color="green"
                                  size="sm"
                                  leftSection={<CheckCircle size={12} />}
                                >
                                  Total:{" "}
                                  {item.amounts?.ordered || item.quantity}
                                </Badge>
                              </Tooltip>
                              {item.amounts &&
                                Number(item.quantity) !==
                                  Number(item.amounts.ordered) && (
                                  <Tooltip
                                    label="Quantity pending release"
                                    position="top"
                                  >
                                    <Badge
                                      variant="light"
                                      color="orange"
                                      size="sm"
                                      leftSection={<Clock size={12} />}
                                    >
                                      Pending:{" "}
                                      {Number(item.amounts.ordered) -
                                        Number(item.quantity)}
                                    </Badge>
                                  </Tooltip>
                                )}
                            </Group>
                            {item.unit_price && (
                              <Text size="xs" c="dimmed" ml={2}>
                                @ KSh {item.unit_price}/unit
                              </Text>
                            )}
                          </Stack>
                        </Box>
                      </Group>
                      <Transition
                        mounted={releaseSuccess}
                        transition="scale"
                        duration={300}
                        timingFunction="ease"
                      >
                        {(styles) => (
                          <Box style={styles}>
                            <CheckCircle size={24} color="#388E3C" />
                          </Box>
                        )}
                      </Transition>
                    </Group>
                  </Paper>
                ))}
            </Stack>
          </ScrollArea>

          <Divider />

          <Group justify="space-between" align="center">
            <Text size="sm" c="dimmed">
              Total Items: <strong>{items?.length}</strong>
            </Text>
            <Group gap="sm">
              <Button
                variant="light"
                onClick={() => setModalOpen(false)}
                disabled={isReleasing}
              >
                Cancel
              </Button>
              <Button
                color="orange"
                onClick={handleRelease}
                loading={isReleasing}
                disabled={releaseSuccess}
                leftSection={
                  !isReleasing && !releaseSuccess && <Unlock size={16} />
                }
                rightSection={releaseSuccess && <Check size={16} />}
                className="hover:scale-105 transition-transform duration-200"
                styles={{
                  root: {
                    background: releaseSuccess
                      ? "linear-gradient(135deg, #388E3C 0%, #4caf50 100%)"
                      : "linear-gradient(135deg, #F08C23 0%, #ff9a3c 100%)",
                  },
                }}
              >
                {releaseSuccess
                  ? "Released!"
                  : isReleasing
                  ? "Releasing..."
                  : "Release Items"}
              </Button>
            </Group>
          </Group>
        </Stack>
      </Modal>

      <style jsx>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </>
  );
};

export default OrderCompletionSection;
