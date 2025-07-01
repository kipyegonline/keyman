"use client";
import React, { useState } from "react";
import {
  Grid,
  Card,
  Text,
  Badge,
  Button,
  Modal,
  TextInput,
  Select,
  Group,
  ActionIcon,
  Title,
  Paper,
  Stack,
  NumberInput,
  Tooltip,
  Transition,
  Box,
  Flex,
  Avatar,
  Divider,
  Alert,
  Pagination,
} from "@mantine/core";
import {
  Edit3,
  //Package,
  //Truck,
  Weight,
  DollarSign,
  Save,
  X,
  Search,
  Filter,
  Plus,
  TrendingUp,
  //Zap,
  CheckCircle2,
  HandCoins,
} from "lucide-react";
import { updateSupplierPriceList } from "@/api/supplier";

import { notify } from "@/lib/notifications";

export interface Pricelist {
  id?: string;
  description: string;
  name: string;
  price: string;
  swahili_name: string;
  transportation_type: string;
  type: string;
  weight_in_kgs: string;
}

const getItemEmoji = (type: string, name: string): string => {
  if (name.toLowerCase().includes("tile")) return "🏺";
  if (name.toLowerCase().includes("cement")) return "🏗️";
  if (
    name.toLowerCase().includes("steel") ||
    name.toLowerCase().includes("iron")
  )
    return "🔩";
  if (name.toLowerCase().includes("paint")) return "🎨";
  if (name.toLowerCase().includes("roof")) return "🏠";
  return "📦";
};

const getTransportationIcon = (type: string) => {
  switch (type.toLowerCase()) {
    case "tuktuk":
      return "🛺";
    case "pickup":
      return "🚛";
    case "lorry":
      return "🚚";
    default:
      return "🚚";
  }
};

const getTransportationColor = (type: string) => {
  switch (type.toLowerCase()) {
    case "tuktuk":
      return "#F08C23";
    case "pickup":
      return "#388E3C";
    case "lorry":
      return "#3D6B2C";
    default:
      return "#3D6B2C";
  }
};
let wordCount = 0;
export default function PricelistDashboard({
  handleSearch,
  isPending,
  prices: items,
}: {
  handleSearch: (val: string) => void;
  isPending: boolean;
  prices: Pricelist[];
}) {
  const [selectedItem, setSelectedItem] = useState<Pricelist | null>(null);
  const [modalOpened, setModalOpened] = useState(false);
  const [editForm, setEditForm] = useState<Pricelist | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [current, setCurrent] = useState(0);

  const supplierId = localStorage.getItem("supplier_id");

  const handleSearchQuery = (value: string) => {
    if (searchTerm.length > 2) {
      if (value.length > wordCount) {
        handleSearch(value);
      }
    }

    if (value.length < wordCount) wordCount--;
    else wordCount++;
  };
  const handleEditClick = (item: Pricelist) => {
    setSelectedItem(item);
    setEditForm({ ...item });
    setModalOpened(true);
  };

  const handleSavePrice = async () => {
    if (!editForm || !selectedItem) return;

    const payload: [{ item_id: string; price: number }] = [
      { item_id: editForm?.id as string, price: +editForm?.price as number },
    ];
    if (payload.length === 1) {
      setIsLoading(true);
      const response = await updateSupplierPriceList(
        supplierId as string,
        payload
      );

      setIsLoading(false);
      if (response.status) {
        setTimeout(() => {
          setSuccessMessage("");
          setModalOpened(false);
        }, 3000);
        setSuccessMessage(`Price updated for ${editForm.name}`);
      } else notify.error(response.message);
    }
  };
  const perPage = 25;

  const filteredItems = items;
  const total = Math.ceil(filteredItems?.length / perPage);

  return (
    <section>
      {/* Header Section */}
      <Paper
        p={{ base: "sm", md: "xl" }}
        mb="xl"
        style={{
          background: "linear-gradient(135deg, #3D6B2C 0%, #388E3C 100%)",
          borderRadius: "20px",
        }}
      >
        <Flex justify="space-between" align="center" wrap="wrap" gap="md">
          <Box>
            <Title order={1} c="white" mb="xs">
              <Flex align="center" gap="md">
                <Avatar
                  size="lg"
                  radius="xl"
                  style={{ backgroundColor: "rgba(255,255,255,0.2)" }}
                >
                  💰
                </Avatar>
                Price Management Dashboard
              </Flex>
            </Title>
            <Text c="rgba(255,255,255,0.8)" size="lg">
              Manage and update construction item prices with ease
            </Text>
          </Box>
          <Group className="!hidden">
            <Paper
              p="md"
              radius="md"
              style={{ backgroundColor: "rgba(255,255,255,0.15)" }}
            >
              <Text c="white" size="sm" fw={500}>
                {" "}
                Total Items
              </Text>
              <Text c="white" size="xl" fw={700}>
                {items?.length}
              </Text>
            </Paper>
            <Button
              leftSection={<Plus size={18} />}
              variant="filled"
              color="#3D6B2C"
              size="lg"
              radius="xl"
            >
              Add New Item
            </Button>
          </Group>
        </Flex>
      </Paper>

      {/* Success Alert */}
      <Transition mounted={!!successMessage} transition="slide-down">
        {(styles) => (
          <Alert
            icon={<CheckCircle2 size={16} />}
            title="Success!"
            color="green"
            mb="xl"
            style={styles}
          >
            {successMessage}
          </Alert>
        )}
      </Transition>

      {/* Search and Filter Section */}
      <Paper p="md" mb="xl" radius="lg" shadow="sm">
        {isPending && <p>Loading...</p>}
        <Group justify="space-between">
          <TextInput
            placeholder="Search items..."
            leftSection={<Search size={16} />}
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              handleSearchQuery(e.target.value);
            }}
            style={{ flexGrow: 1, maxWidth: 400 }}
            radius="xl"
          />
          <Group>
            <Select
              placeholder="Filter by transport"
              leftSection={<Filter size={16} />}
              data={[
                { value: "TUKTUK", label: "🛺 TukTuk" },
                { value: "PICKUP", label: "🚛 Pickup" },
                { value: "LORRY", label: "🚚 Lorry" },
              ]}
              value={filterType}
              onChange={setFilterType}
              clearable
              radius="xl"
            />
          </Group>
        </Group>
      </Paper>

      {/* Items Grid */}
      <Grid>
        {filteredItems
          ?.slice(current * perPage, (current + 1) * perPage)
          .map((item, index) => (
            <Grid.Col key={item.id} span={{ base: 12, sm: 6, lg: 4 }}>
              <Transition
                mounted={true}
                transition="scale"
                duration={300}
                timingFunction="ease-out"
                enterDelay={index * 100}
              >
                {(styles) => (
                  <Card
                    shadow="md"
                    padding="lg"
                    radius="xl"
                    style={{
                      ...styles,
                      cursor: "pointer",
                      transition: "all 0.3s ease",
                      border: "1px solid #f0f0f0",
                      "&:hover": {
                        transform: "translateY(-8px)",
                        boxShadow: "0 20px 40px rgba(61, 107, 44, 0.15)",
                      },
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = "translateY(-8px)";
                      e.currentTarget.style.boxShadow =
                        "0 20px 40px rgba(61, 107, 44, 0.15)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = "translateY(0)";
                      e.currentTarget.style.boxShadow =
                        "0 2px 8px rgba(0, 0, 0, 0.1)";
                    }}
                  >
                    <Stack gap="md">
                      {/* Item Header */}
                      <Flex justify="space-between" align="flex-start">
                        <Box style={{ flexGrow: 1 }}>
                          <Text size="xl" mb="xs">
                            {getItemEmoji(item.type, item.name)}
                          </Text>
                          <Text fw={600} size="md" lineClamp={2} mb="xs">
                            {item.name}
                          </Text>
                          <Text size="sm" c="dimmed" lineClamp={1}>
                            {item.swahili_name}
                          </Text>
                        </Box>

                        <Tooltip label="Edit Price">
                          <ActionIcon
                            variant="light"
                            color="#3D6B2C"
                            size="lg"
                            radius="xl"
                            onClick={() => handleEditClick(item)}
                          >
                            <Edit3 size={18} />
                          </ActionIcon>
                        </Tooltip>
                      </Flex>

                      <Divider />

                      {/* Price Section */}
                      <Paper
                        p="md"
                        radius="lg"
                        style={{ backgroundColor: "#f8f9fa" }}
                      >
                        <Flex
                          align="center"
                          justify="space-between"
                          display="none"
                        >
                          <Box display="none">
                            <Text size="xs" c="dimmed" mb={2}>
                              Current Price
                            </Text>
                            <Text size="xl" fw={700} c="#3D6B2C">
                              KES {parseFloat(item.price).toLocaleString()}
                            </Text>
                          </Box>
                          <Avatar
                            size="md"
                            radius="xl"
                            style={{ backgroundColor: "#3D6B2C" }}
                          >
                            <DollarSign size={20} color="white" />
                          </Avatar>
                        </Flex>
                      </Paper>

                      {/* Item Details */}
                      <Group justify="space-between">
                        <Badge
                          variant="light"
                          color={getTransportationColor(
                            item.transportation_type
                          )}
                          size="md"
                          radius="xl"
                        >
                          {getTransportationIcon(item.transportation_type)}{" "}
                          {item.transportation_type}
                        </Badge>

                        <Group gap="xs">
                          <Weight size={14} />
                          <Text size="sm" c="dimmed">
                            {item.weight_in_kgs}kg
                          </Text>
                        </Group>
                      </Group>

                      {/* Edit Button */}
                      <Button
                        fullWidth
                        variant="light"
                        color="#3D6B2C"
                        leftSection={<TrendingUp size={16} />}
                        radius="xl"
                        onClick={() => handleEditClick(item)}
                      >
                        Add Price
                      </Button>
                    </Stack>
                  </Card>
                )}
              </Transition>
            </Grid.Col>
          ))}
      </Grid>
      <Box my="md">
        {filteredItems.length > perPage && (
          <Pagination
            total={total}
            onChange={(num) => setCurrent(num - 1)}
            value={current + 1}
          />
        )}
      </Box>

      {/* Edit Modal */}
      <Modal
        opened={modalOpened}
        onClose={() => setModalOpened(false)}
        title={
          <Group>
            <Avatar
              size="sm"
              radius="xl"
              style={{ backgroundColor: "#3D6B2C" }}
            >
              <Edit3 size={16} color="white" />
            </Avatar>
            <Text fw={600}>Update Item Price</Text>
          </Group>
        }
        size="md"
        radius="lg"
        centered
      >
        {editForm && (
          <Stack gap="md">
            <Paper p="md" radius="lg" style={{ backgroundColor: "#f8f9fa" }}>
              <Text size="lg" fw={600} mb="xs">
                {getItemEmoji(editForm.type, editForm.name)} {editForm.name}
              </Text>
              <Text size="sm" c="dimmed">
                {editForm.swahili_name}
              </Text>
            </Paper>

            <NumberInput
              label="Price (KES)"
              placeholder="Enter new price"
              value={parseFloat(editForm.price || "0")}
              onChange={(value) =>
                setEditForm({ ...editForm, price: value?.toString() || "0" })
              }
              leftSection={<HandCoins size={16} />}
              thousandSeparator=","
              decimalScale={2}
              size="lg"
              required
              radius="md"
            />

            <Select
              label="Transportation Type"
              value={editForm.transportation_type}
              onChange={(value) =>
                setEditForm({
                  ...editForm,
                  transportation_type: value || "TUKTUK",
                })
              }
              data={[
                { value: "TUKTUK", label: "🛺 TukTuk" },
                { value: "PICKUP", label: "🚛 Pickup" },
                { value: "LORRY", label: "🚚 Lorry" },
              ]}
              display="none"
              size="lg"
              radius="md"
            />

            <NumberInput
              label="Weight (kg)"
              value={parseFloat(editForm.weight_in_kgs || "0")}
              onChange={(value) =>
                setEditForm({
                  ...editForm,
                  weight_in_kgs: value?.toString() || "0",
                })
              }
              leftSection={<Weight size={16} />}
              decimalScale={2}
              size="lg"
              display="none"
              radius="md"
            />

            <Group justify="flex-end" mt="xl">
              <Button
                variant="light"
                color="gray"
                leftSection={<X size={16} />}
                onClick={() => setModalOpened(false)}
                radius="xl"
              >
                Cancel
              </Button>
              <Button
                color="#3D6B2C"
                leftSection={<Save size={16} />}
                onClick={handleSavePrice}
                loading={isLoading}
                radius="xl"
              >
                Save Changes
              </Button>
            </Group>
          </Stack>
        )}
      </Modal>
    </section>
  );
}
