import { ICartState, useCart } from "@/providers/CartContext";
import {
  Modal,
  Group,
  Avatar,
  Text,
  Flex,
  Box,
  Stack,
  Paper,
  Divider,
  Button,
  ActionIcon,
  TextInput,
} from "@mantine/core";
import { ShoppingCart, Minus, Plus, Trash2, CheckCircle2 } from "lucide-react";
import { getItemEmoji } from "./priceListItem";
import { DeliveryDate, DeliveryLocation } from "../keyman-bot/DeliveryLocation";
import { Project } from "@/types";
import { useState } from "react";

type Props = {
  cartModalOpened: boolean;
  setCartModalOpened: () => void;
  cart: ICartState;
  cartSpinner: boolean;
  handleCheckout: () => void;
  projects: Project[];
  refreshLocation: () => void;
  date: string;
  setDate: (date: string) => void;
  location: string;
  setLocation: (location: string) => void;
  isGuest: boolean;
  email: string;
  setEmail: (email: string) => void;
  phone: string;
  setPhone: (phone: string) => void;
};

export const CartModal = ({
  cartModalOpened,
  setCartModalOpened,
  cart,
  cartSpinner,
  handleCheckout,
  projects,
  refreshLocation,
  date,
  setDate,
  location,
  setLocation,
  email,
  setEmail,
  phone,
  setPhone,
  isGuest,
}: Props) => {
  const { updateQuantity, removeFromCart, clearCart } = useCart();
  const [hasChecked, setChecked] = useState(false);
  const [steps, setSteps] = useState(0);
  const onCheckout = () => {
    if (hasChecked) {
      if (steps === 2) {
        handleCheckout();
      } else {
        //setSteps(2);
      }
    } else {
      setChecked(true);
      setSteps(1);
    }
  };

  return (
    <Modal
      opened={cartModalOpened}
      onClose={setCartModalOpened}
      title={
        <Group>
          <Avatar size="sm" radius="xl" style={{ backgroundColor: "#3D6B2C" }}>
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
            {hasChecked && steps === 1 ? (
              isGuest ? (
                <Box p="lg">
                  <Text>Looks like you are not signed in....</Text>
                  <Flex
                    gap="md"
                    mt="md"
                    direction={{ base: "column", md: "row" }}
                  >
                    <Button>Sign in</Button>
                    <Button variant="outline" onClick={() => setSteps(2)}>
                      Continue as guest
                    </Button>
                  </Flex>
                </Box>
              ) : (
                <Paper>
                  <div className="py-2 mb-2">
                    <DeliveryDate
                      date={date}
                      sendDate={(date) => setDate(date)}
                    />
                  </div>

                  <div>
                    <DeliveryLocation
                      locations={projects ?? []}
                      sendLocation={(location) => setLocation(location)}
                      config={{ refresh: () => refreshLocation(), location }}
                    />
                  </div>

                  <Divider />
                </Paper>
              )
            ) : null}
            {hasChecked && steps === 2 ? (
              <Paper>
                <div className="py-2 mb-2">
                  <DeliveryDate
                    date={date}
                    sendDate={(date) => setDate(date)}
                  />
                </div>
                <div className="mt-2">
                  <TextInput
                    type="email"
                    label="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email"
                    required
                  />
                </div>
                <div className="mt-2">
                  <TextInput
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    label="Phone"
                    placeholder="Phone"
                    required
                  />
                </div>
                <Divider />
              </Paper>
            ) : null}

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
                  if (confirm("Clear cark")) clearCart();
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
};
