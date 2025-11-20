import React from "react";
import {
  Modal,
  Group,
  Avatar,
  Text,
  Stack,
  Paper,
  Flex,
  Box,
  ActionIcon,
  Button,
  Divider,
} from "@mantine/core";
import { ShoppingCart, Minus, Plus, Trash2, CheckCircle2 } from "lucide-react";
import { ICartState } from "@/providers/CartContext";
import { DeliveryDate, DeliveryLocation } from "../keyman-bot/DeliveryLocation";
import { Project } from "@/types";

interface CartModalProps {
  opened: boolean;
  onClose: () => void;
  cart: ICartState;
  updateQuantity: (id: string, quantity: number) => void;
  removeFromCart: (id: string) => void;
  clearCart: () => void;
  onCheckout: () => void;
  cartSpinner: boolean;
  getItemEmoji: (type: string, name: string) => string;
  locations: Project[] | undefined;
  location: string;
  setLocation: (location: string) => void;
  date: string;
  setDate: (date: string) => void;
  refreshLocation: () => void;
}

export const CartModal = React.memo<CartModalProps>(
  ({
    opened,
    onClose,
    cart,
    updateQuantity,
    removeFromCart,
    clearCart,
    onCheckout,
    cartSpinner,
    getItemEmoji,
    locations,
    location,
    setLocation,
    date,
    setDate,
    refreshLocation,
  }) => {
    return (
      <Modal
        opened={opened}
        onClose={onClose}
        title={
          <Group>
            <Avatar
              size="sm"
              radius="xl"
              style={{ backgroundColor: "#3D6B2C" }}
            >
              <ShoppingCart size={16} color="white" />
            </Avatar>
            <Text fw={600}>Shopping Cart ({cart.itemCount} items)</Text>
          </Group>
        }
        size="lg"
        radius="lg"
        centered
      >
        <Stack gap="md">
          {cart.items.length === 0 ? (
            <Paper
              p="xl"
              radius="lg"
              style={{ backgroundColor: "#f8f9fa", textAlign: "center" }}
            >
              <ShoppingCart
                size={48}
                style={{ margin: "0 auto 16px", opacity: 0.3 }}
              />
              <Text size="lg" c="dimmed" fw={500}>
                Your cart is empty
              </Text>
              <Text size="sm" c="dimmed">
                Add some items to get started!
              </Text>
            </Paper>
          ) : (
            <>
              {/* Cart Items */}
              <Stack gap="sm" style={{ maxHeight: "400px", overflowY: "auto" }}>
                {cart.items.map((item) => (
                  <Paper
                    key={item.id}
                    p="md"
                    radius="lg"
                    style={{ border: "1px solid #e9ecef" }}
                  >
                    <Flex align="center" justify="space-between" gap="md">
                      <Flex align="center" gap="md" style={{ flex: 1 }}>
                        <Avatar
                          size="lg"
                          radius="md"
                          style={{ backgroundColor: "#f8f9fa" }}
                        >
                          {getItemEmoji(item.type, item.name)}
                        </Avatar>
                        <Box style={{ flex: 1 }}>
                          <Text fw={600} size="sm" lineClamp={1}>
                            {item.name}
                          </Text>
                          <Text size="xs" c="dimmed" lineClamp={1}>
                            {item.swahili_name}
                          </Text>
                          <Text size="sm" fw={500} c="#3D6B2C" mt="xs">
                            KES {Number(item.price).toLocaleString()}
                          </Text>
                        </Box>
                      </Flex>

                      <Group gap="xs">
                        {/* Quantity Controls */}
                        <Group
                          gap="xs"
                          style={{
                            border: "1px solid #e9ecef",
                            borderRadius: "8px",
                            padding: "4px",
                          }}
                        >
                          <ActionIcon
                            variant="light"
                            color="gray"
                            size="sm"
                            onClick={() =>
                              updateQuantity(item.id!, item.quantity - 1)
                            }
                          >
                            <Minus size={14} />
                          </ActionIcon>

                          <Text
                            size="sm"
                            fw={600}
                            style={{ minWidth: "20px", textAlign: "center" }}
                          >
                            {item.quantity}
                          </Text>

                          <ActionIcon
                            variant="light"
                            color="#3D6B2C"
                            size="sm"
                            onClick={() =>
                              updateQuantity(item.id!, item.quantity + 1)
                            }
                          >
                            <Plus size={14} />
                          </ActionIcon>
                        </Group>

                        {/* Remove Button */}
                        <ActionIcon
                          variant="light"
                          color="red"
                          size="sm"
                          onClick={() => removeFromCart(item.id!)}
                        >
                          <Trash2 size={14} />
                        </ActionIcon>
                      </Group>
                    </Flex>

                    {/* Item Total */}
                    <Flex justify="flex-end" mt="xs">
                      <Text size="sm" fw={600} c="#3D6B2C">
                        Subtotal: KES{" "}
                        {(item.price * item.quantity).toLocaleString()}
                      </Text>
                    </Flex>
                  </Paper>
                ))}
              </Stack>

              <Divider />

              <Paper>
                <div className="py-2 mb-2">
                  <DeliveryDate date={date} sendDate={setDate} />
                </div>
                <div>
                  <DeliveryLocation
                    locations={locations ?? []}
                    sendLocation={setLocation}
                    config={{ refresh: refreshLocation, location }}
                  />
                </div>

                <Divider />
              </Paper>

              {/* Cart Summary */}
              <Paper
                p="md"
                radius="lg"
                style={{ backgroundColor: "#f8f9fa" }}
                display="none"
              >
                <Flex justify="space-between" align="center">
                  <Text size="lg" fw={600}>
                    Total Amount:
                  </Text>
                  <Text size="xl" fw={700} c="#3D6B2C">
                    KES {cart.total.toLocaleString()}
                  </Text>
                </Flex>
              </Paper>

              {/* Action Buttons */}
              <Group justify="space-between" mt="md">
                <Button
                  variant="light"
                  color="red"
                  leftSection={<Trash2 size={16} />}
                  onClick={() => {
                    if (confirm("Clear cart")) clearCart();
                  }}
                  radius="xl"
                >
                  Clear Cart
                </Button>

                <Button
                  color="#3D6B2C"
                  leftSection={<CheckCircle2 size={16} />}
                  onClick={onCheckout}
                  radius="xl"
                  size="lg"
                  loading={cartSpinner}
                >
                  Checkout
                </Button>
              </Group>
            </>
          )}
        </Stack>
      </Modal>
    );
  }
);

CartModal.displayName = "CartModal";
