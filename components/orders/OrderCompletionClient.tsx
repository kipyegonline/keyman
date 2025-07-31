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
  Rating,
  Textarea,
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
  Star,
  MessageSquare,
  ClipboardCheck,
  UserCheck,
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
  onReceive: () => void;
  orderId: string;
}

const OrderCompletionSection: React.FC<OrderCompletionProps> = ({
  orderCompletion,
  items,
  onReceive,
  orderId,
}) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [isReceiving, setIsReceiving] = useState(false);
  const [receiveSuccess, setReceiveSuccess] = useState(false);
  const [rating, setRating] = useState(5);
  const [comments, setComments] = useState("");
  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set());

  const handleReceive = async () => {
    if (confirm("Confirm receipt of items?")) {
      setIsReceiving(true);
      try {
        const coords = await getCurrentLocation();
        let payLoaditems: ReleaseItem["items"] = [];
        items?.forEach((item) => {
          const payloadItem = {} as ReleaseItem["items"][0];

          payloadItem["supplier_order_item_id"] = item.id;
          payloadItem["quantity"] = item.quantity;
          payloadItem["confirmation_type"] = "CLIENT";
          payloadItem["latitude"] = coords.lat;
          payloadItem["longitude"] = coords.lng;
          payloadItem["comments"] = "";

          payLoaditems = [payloadItem, ...payLoaditems];
        });

        const payload = { items: payLoaditems, comments, rating };
        const result = await confirmItemReceipt(orderId, payload);

        if (result.status) {
          setReceiveSuccess(true);
          onReceive();
          setTimeout(() => {
            setModalOpen(false);
            setReceiveSuccess(false);
            setCheckedItems(new Set());
          }, 1500);
        }
      } catch (error) {
        console.error("Failed to confirm receipt:", error);
      } finally {
        setIsReceiving(false);
      }
    }
  };

  const toggleItemCheck = (itemId: string) => {
    const newCheckedItems = new Set(checkedItems);
    if (newCheckedItems.has(itemId)) {
      newCheckedItems.delete(itemId);
    } else {
      newCheckedItems.add(itemId);
    }
    setCheckedItems(newCheckedItems);
  };

  const allItemsChecked = items?.length === checkedItems.size;

  const getCompletionProgress = () => {
    if (orderCompletion?.receive) return 100;
    if (orderCompletion?.release) return 50;
    return 25;
  };

  const getStatusMessage = () => {
    if (orderCompletion?.receive) return "Order Complete";
    if (orderCompletion?.release) return "Ready for Collection";
    return "Awaiting Supplier";
  };

  return (
    <>
      {/* Order Completion Card */}
      <Card
        shadow="sm"
        padding="lg"
        radius="md"
        className="hover:shadow-md transition-all  duration-300 animate-in fade-in-50 slide-in-from-left-4"
        style={{ animationDelay: "250ms" }}
      >
        <Group justify="space-between" mb="md">
          <Group gap="sm">
            <PackageCheck size={20} color="#388E3C" />
            <Text fw={600} size="lg">
              Delivery Status
            </Text>
          </Group>
          <Badge
            variant="light"
            color={
              getCompletionProgress() === 100
                ? "green"
                : getCompletionProgress() === 50
                ? "blue"
                : "orange"
            }
            size="md"
          >
            {getStatusMessage()}
          </Badge>
        </Group>

        <Progress
          value={getCompletionProgress()}
          color={
            getCompletionProgress() === 100
              ? "green"
              : getCompletionProgress() === 50
              ? "blue"
              : "orange"
          }
          size="sm"
          radius="xl"
          mb="lg"
          className="transition-all duration-1000"
        />

        <Stack gap="md">
          {/* Conditional rendering based on order status */}
          {!orderCompletion?.release ? (
            // Awaiting Supplier Release
            <Transition
              mounted={true}
              transition="slide-up"
              duration={400}
              timingFunction="ease"
            >
              {(styles) => (
                <div style={styles}>
                  <Alert
                    variant="light"
                    color="orange"
                    radius="md"
                    icon={<Clock size={20} />}
                    className="animate-in fade-in-50 slide-in-from-bottom-2"
                    styles={{
                      root: {
                        background:
                          "linear-gradient(135deg, #fff5f0 0%, #ffe8de 100%)",
                        border: "1px solid #ffddcc",
                      },
                    }}
                  >
                    <Group justify="space-between" align="center">
                      <Box>
                        <Text fw={600} size="md" c="#F08C23">
                          Awaiting Supplier Action
                        </Text>
                        <Text size="sm" c="dimmed">
                          The supplier is preparing your items for release
                        </Text>
                      </Box>
                      <Box className="animate-pulse">
                        <Lock size={24} color="#F08C23" />
                      </Box>
                    </Group>
                  </Alert>
                </div>
              )}
            </Transition>
          ) : !orderCompletion?.receive ? (
            // Ready for Client Receipt
            <Transition
              mounted={true}
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
                      background: "green",
                      //"linear-gradient(135deg, #e3f2fd 0%, #cce5ff 100%)",
                      border: "1px solid #90caf9",
                    }}
                    className="hover:shadow-sm transition-all duration-300"
                  >
                    <Group justify="space-between" align="center">
                      <Group gap="md">
                        <Box
                          p="xs"
                          style={{
                            background: "green",
                            borderRadius: "50%",
                            color: "white",
                          }}
                          className="animate-pulse"
                        >
                          <Truck size={20} />
                        </Box>
                        <Box>
                          <Text fw={600} size="md" c="white">
                            Items Ready for Collection
                          </Text>
                          <Text size="sm" c="dimmed">
                            {items?.length} items released by supplier
                          </Text>
                        </Box>
                      </Group>
                      <Button
                        variant="filled"
                        color="green"
                        size="sm"
                        leftSection={<ClipboardCheck size={16} />}
                        rightSection={<ArrowRight size={16} />}
                        onClick={() => setModalOpen(true)}
                        className="hover:scale-105 hover:shadow-md  !border-keyman-accent transition-all duration-200"
                        styles={{
                          root: {
                            background: "green",
                            //"linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)",
                          },
                        }}
                      >
                        Confirm Receipt
                      </Button>
                    </Group>
                  </Paper>
                </div>
              )}
            </Transition>
          ) : (
            // Order Completed
            <Transition
              mounted={true}
              transition="slide-up"
              duration={400}
              timingFunction="ease"
            >
              {(styles) => (
                <div style={styles}>
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
                          Order Successfully Completed
                        </Text>
                        <Text size="sm" opacity={0.9}>
                          All items have been received and confirmed
                        </Text>
                      </Box>
                      <Badge
                        variant="white"
                        color="green"
                        size="lg"
                        leftSection={<Check size={16} />}
                      >
                        Delivered
                      </Badge>
                    </Group>
                  </Alert>
                </div>
              )}
            </Transition>
          )}

          {/* Status Timeline */}
          <Group gap="xs" justify="center" mt="sm">
            <Tooltip label="Order Placed" position="top">
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
              label={
                orderCompletion?.release ? "Items Released" : "Awaiting Release"
              }
              position="top"
            >
              <Box
                p="xs"
                style={{
                  background: orderCompletion?.release ? "#1976d2" : "#e0e0e0",
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
              label={
                orderCompletion?.receive ? "Delivered" : "Pending Delivery"
              }
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
                <UserCheck size={16} />
              </Box>
            </Tooltip>
          </Group>
        </Stack>
      </Card>

      {/* Receipt Confirmation Modal */}
      <Modal
        opened={modalOpen}
        onClose={() => !isReceiving && setModalOpen(false)}
        title={
          <Group gap="sm">
            <ClipboardCheck size={20} color="#1976d2" />
            <Text fw={600} size="lg">
              Confirm Item Receipt
            </Text>
          </Group>
        }
        centered
        size="lg"
        radius="md"
        closeOnClickOutside={!isReceiving}
        closeOnEscape={!isReceiving}
        overlayProps={{
          opacity: 0.55,
          blur: 3,
        }}
      >
        <Stack gap="md">
          <Alert
            variant="light"
            color="blue"
            icon={<Info size={16} />}
            radius="md"
          >
            <Text size="sm">
              Please verify each item before confirming receipt. Check the boxes
              next to items you have received in good condition.
            </Text>
          </Alert>

          <ScrollArea h={250} offsetScrollbars>
            <Stack gap="sm">
              {items &&
                items?.length > 0 &&
                items?.map((item, index) => (
                  <Paper
                    key={item.id}
                    p="md"
                    radius="md"
                    withBorder
                    className={`hover:shadow-sm transition-all duration-200 cursor-pointer ${
                      checkedItems.has(item.id)
                        ? "border-green-400 bg-green-50"
                        : "hover:border-green-300"
                    }`}
                    onClick={() => toggleItemCheck(item.id)}
                    style={{
                      animation: `slideIn 0.3s ease-out ${index * 0.1}s both`,
                    }}
                  >
                    <Group justify="space-between" align="center">
                      <Group gap="md">
                        <Box
                          p="xs"
                          bg={checkedItems.has(item.id) ? "#e3f2fd" : "#f8fafc"}
                          style={{ borderRadius: "8px" }}
                        >
                          {checkedItems.has(item.id) ? (
                            <CheckCircle size={20} color="#1976d2" />
                          ) : (
                            <Package size={20} color="#64748b" />
                          )}
                        </Box>
                        <Box>
                          <Text fw={600} size="md">
                            {item.name}
                          </Text>
                          <Stack gap={4} mt={6}>
                            <Group gap="xs">
                              <Tooltip
                                label="Quantity to receive"
                                position="top"
                              >
                                <Badge
                                  variant="filled"
                                  color="green"
                                  size="sm"
                                  leftSection={<Package size={12} />}
                                >
                                  Qty: {item.quantity}
                                </Badge>
                              </Tooltip>
                              <Tooltip label="Total ordered" position="top">
                                <Badge
                                  variant="light"
                                  color="gray"
                                  size="sm"
                                  leftSection={<CheckCircle size={12} />}
                                >
                                  Total:{" "}
                                  {item.amounts?.ordered || item.quantity}
                                </Badge>
                              </Tooltip>
                              {item.unit_price && (
                                <Badge variant="light" color="green" size="sm">
                                  KSh{" "}
                                  {Number(item.quantity) *
                                    Number(item.unit_price)}
                                </Badge>
                              )}
                            </Group>
                          </Stack>
                        </Box>
                      </Group>
                      <Transition
                        mounted={checkedItems.has(item.id)}
                        transition="scale"
                        duration={200}
                        timingFunction="ease"
                      >
                        {(styles) => (
                          <Box style={styles}>
                            <CheckCircle size={24} color="#1976d2" />
                          </Box>
                        )}
                      </Transition>
                    </Group>
                  </Paper>
                ))}
            </Stack>
          </ScrollArea>

          <Divider />

          {/* Rating Section */}
          <Box>
            <Group gap="sm" mb="xs">
              <Star size={16} color="#F08C23" />
              <Text size="sm" fw={500}>
                Rate this delivery
              </Text>
            </Group>
            <Group justify="center">
              <Rating
                value={rating}
                onChange={setRating}
                size="lg"
                color="orange"
              />
            </Group>
          </Box>

          {/* Comments Section */}
          <Box>
            <Group gap="sm" mb="xs">
              <MessageSquare size={16} color="#1976d2" />
              <Text size="sm" fw={500}>
                Additional comments (optional)
              </Text>
            </Group>
            <Textarea
              placeholder="Share your experience or report any issues..."
              value={comments}
              onChange={(e) => setComments(e.currentTarget.value)}
              minRows={2}
              autosize
              maxRows={4}
            />
          </Box>

          <Divider />

          <Group justify="space-between" align="center">
            <Stack gap={2}>
              <Text size="sm" c="dimmed">
                Checked:{" "}
                <strong>
                  {checkedItems.size}/{items?.length}
                </strong>
              </Text>
              {!allItemsChecked && (
                <Text size="xs" c="orange">
                  Please check all items to proceed
                </Text>
              )}
            </Stack>
            <Group gap="sm">
              <Button
                variant="light"
                onClick={() => setModalOpen(false)}
                disabled={isReceiving}
              >
                Cancel
              </Button>
              <Button
                color="white"
                onClick={handleReceive}
                loading={isReceiving}
                disabled={receiveSuccess || !allItemsChecked}
                leftSection={
                  !isReceiving &&
                  !receiveSuccess && <ClipboardCheck size={16} />
                }
                rightSection={receiveSuccess && <Check size={16} />}
                className="hover:scale-105 transition-transform duration-200"
                styles={{
                  root: {
                    background: receiveSuccess
                      ? "linear-gradient(135deg, #388E3C 0%, #4caf50 100%)"
                      : "linear-gradient(135deg, #F08C23 0%, #ffb347 100%)",
                  },
                }}
              >
                {receiveSuccess
                  ? "Confirmed!"
                  : isReceiving
                  ? "Confirming..."
                  : "Confirm Receipt"}
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
