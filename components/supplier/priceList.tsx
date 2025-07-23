"use client";
import React, { useState } from "react";
import {
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
  Textarea,
  FileInput,
  Loader,
  Image,
} from "@mantine/core";
import { toDataUrlFromFile, DataURIToBlob } from "@/lib/FileHandlers";
import {
  Edit3,
  Weight,
  Save,
  X,
  Search,
  Filter,
  Plus,
  TrendingUp,
  CheckCircle2,
  HandCoins,
  Coins,
  Package,
  AlertCircle,
  //Delete,
  Trash2,
  ImageIcon,
  Upload,
  ShoppingCart,
  Minus,
} from "lucide-react";
import { updateSupplierPriceList } from "@/api/supplier";
import { notify } from "@/lib/notifications";
import { createItem, deleteItem } from "@/api/items";
import { ICartItem, ICartState, useCart } from "@/providers/CartContext";
import { DeliveryDate, DeliveryLocation } from "../keyman-bot/DeliveryLocation";
import { getProjects } from "@/api/projects";
import { useQuery } from "@tanstack/react-query";
import { Project } from "@/types";
import { CreateRequestPayload } from "@/types/requests";
import { createRequest } from "@/api/requests";

export interface Pricelist {
  id?: string;
  description: string;
  name: string;
  price: number;
  swahili_name: string;
  transportation_type: "TUKTUK" | "PICKUP" | "LORRY";
  type: "goods" | "services" | "professional_services" | "Select Type";
  weight_in_kgs: number;
  image?: File | null;
  item_id?: string;

  added_by_supplier_id?: string;
}
interface Photo {
  photo: [string];
  isUserOwned: boolean;
}
export interface PhotoArray {
  item: { photo: [string] };
}
export type PublicPriceList = Pricelist & PhotoArray;
type Picha = Photo | PhotoArray;
export type WholePriceList = Pricelist & Picha;

/* disable-eslint */

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
const services = [
  { label: "Goods", value: "goods" },
  { label: "Services", value: "services" },
  { label: "Professional Services", value: "professional_services" },
];

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
  refetchPricelist,
}: {
  handleSearch: (val: string) => void;
  isPending: boolean;
  prices: WholePriceList[];
  refetchPricelist: () => void;
}) {
  /*eslint-disable*/
  const [selectedItem, setSelectedItem] = useState<Pricelist | null>(null);
  const [modalOpened, setModalOpened] = useState(false);
  const [editForm, setEditForm] = useState<Pricelist | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [current, setCurrent] = useState(0);

  // Edit Modal States

  // Add Item Modal States
  const [addModalOpened, setAddModalOpened] = useState(false);
  const [file, setfile] = useState<File | null>(null);
  const [addForm, setAddForm] = useState<Pricelist>({
    description: "",
    name: "",
    price: 0,
    swahili_name: "",
    transportation_type: "TUKTUK",
    type: "Select Type",
    weight_in_kgs: 0,
    image: null,
  });
  const [addLoading, setAddLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [location, setLocation] = useState("");
  const [date, setDate] = useState("");

  const [cartSpinner, setCartSpinner] = useState(false);

  const { data: locations, refetch: refreshLocation } = useQuery({
    queryKey: ["locations"],
    queryFn: async () => await getProjects(),
  });

  const supplierId = globalThis?.window?.localStorage.getItem("supplier_id");
  const {
    addToCart,
    cart,
    removeFromCart,
    updateQuantity,
    clearCart,
    isItemInCart,
    modalOpen: cartModalOpened,
    setModalOpen: setCartModalOpened,
  } = useCart();

  // Update the handleAddCart function
  const handleAddCart = async (item: ICartItem) => {
    addToCart(item);
  };
  React.useEffect(() => {
    if (deleting) {
      setTimeout(() => {
        const loader = document.getElementById("header");
        if (loader) loader.scrollIntoView({ behavior: "smooth" });
      }, 1000);
    }
  }, [deleting]);

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
  const handleDeleteClick = async (item: Pricelist) => {
    if (confirm("Delete " + item.name + "?")) {
      setDeleting(true);
      const response = await deleteItem(item?.id as string);

      setDeleting(false);
      if (response.status) {
        setTimeout(() => {
          setSuccessMessage("");
        }, 3000);
        setSuccessMessage(` ${item.name} deleted successfully `);
        refetchPricelist();
      } else notify.error(response.message);
    }
  };

  const handleSavePrice = async () => {
    if (!editForm || !selectedItem) return;

    const payload: [{ item_id: string; price: number }] = [
      {
        item_id: editForm?.item_id as string,
        price: +editForm?.price as number,
      },
    ];
    if (payload.length === 1) {
      setIsLoading(true);

      const response = await updateSupplierPriceList(
        supplierId as string,
        payload
      );

      setIsLoading(false);
      if (response.status) {
        notify.success(`Price updated for ${editForm.name}`);
        setTimeout(() => {
          setSuccessMessage("");
          setModalOpened(false);
        }, 2000);
        setSuccessMessage(`Price updated for ${editForm.name}`);
        refetchPricelist();
      } else notify.error(response.message);
    }
  };

  // Add Item Functions
  const validateAddForm = (): boolean => {
    const errors: string[] = [];

    if (!addForm.name.trim()) {
      errors.push("Item name is required");
    }

    /*if (!addForm.swahili_name.trim()) {
      errors.push("Swahili name is required");
    }*/

    if (!addForm.description.trim()) {
      errors.push("Description is required");
    }

    if (!addForm.type.trim() || addForm.type === "Select Type") {
      errors.push("Item type is required");
    }

    if (!addForm.price || Number(addForm.price) <= 0) {
      errors.push("Price must be greater than 0");
    }

    if (!addForm.weight_in_kgs || Number(addForm.weight_in_kgs) <= 0) {
      errors.push("Weight must be greater than 0");
    }

    if (!addForm.transportation_type) {
      errors.push("Transportation type is required");
    }

    // Image validation (optional but with size check)
    if (addForm.image) {
      const maxSizeInMB = 5;
      const maxSizeInBytes = maxSizeInMB * 1024 * 1024;

      if (addForm.image.size > maxSizeInBytes) {
        errors.push(`Image size must be less than ${maxSizeInMB}MB`);
      }

      const allowedTypes = [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/webp",
      ];
      if (!allowedTypes.includes(addForm.image.type)) {
        errors.push("Image must be in JPEG, PNG, or WebP format");
      }
    }

    setValidationErrors(errors);
    return errors.length === 0;
  };

  const handleAddItem = async () => {
    if (!validateAddForm()) {
      return;
    }

    setAddLoading(true);

    try {
      // Create FormData object
      const formData = new FormData();

      // Append all form fields
      formData.append("supplier_detail_id", supplierId as string);
      formData.append("name", addForm.name);
      formData.append(
        "swahili_name",
        addForm.swahili_name.trim().length === 0
          ? addForm.name
          : addForm.swahili_name
      );
      formData.append("description", addForm.description);
      formData.append("type", addForm.type);
      formData.append("price", addForm.price.toString());
      formData.append("weight_in_kgs", addForm.weight_in_kgs.toString());
      formData.append("transportation_type", addForm.transportation_type);

      // Append image if it exists
      if (file) {
        const file64 = await toDataUrlFromFile(file);

        const file_ = DataURIToBlob(file64 as string);

        formData.append("image", file_, file.name);
      }

      // Send the request
      const response = await createItem(formData);

      if (response.status) {
        setSuccessMessage(`New item "${addForm.name}" added successfully`);
        setAddModalOpened(false);
        setAddForm({
          description: "",
          name: "",
          price: 0,
          swahili_name: "",
          transportation_type: "TUKTUK",
          type: "Select Type",
          weight_in_kgs: 0,
          image: null,
        });
        setValidationErrors([]);

        // Optional: Refresh the items list
        refetchPricelist();

        setTimeout(() => {
          setSuccessMessage("");
        }, 3000);
      } else {
        notify.error("Something went wrong, try again later");
        console.log(response);
      }
    } catch (error) {
      console.error("Error adding item:", error);
      notify.error("Failed to add item. Please try again.");
    } finally {
      setAddLoading(false);
    }
  };

  const handleAddModalClose = () => {
    setAddModalOpened(false);
    setValidationErrors([]);
    setAddForm({
      description: "",
      name: "",
      price: 0,
      swahili_name: "",
      transportation_type: "TUKTUK",
      type: "Select Type",
      weight_in_kgs: 0,
      image: null,
    });
  };

  const perPage = 25;
  const filteredItems = items;
  const total = Math.ceil(filteredItems?.length / perPage);
  const resetState = () => {
    setLocation("");
    setDate("");
    clearCart();
  };
  const handleCheckout = async () => {
    const selectedLocation = locations?.projects?.find(
      (loc: Project) => loc.id === location
    );
    const items = cart.items.map((cartItem) => ({
      ...cartItem,
      item_id: cartItem.item_id,
      description: "",
      visual_confirmation_required: 0,
    }));

    if (!selectedLocation) {
      notify.error("Looks like you did not add a delivery location ");
      return;
    }
    if (!date) {
      notify.error("Looks like you did not add a delivery date ");
      return;
    }

    const [lng, ltd] = selectedLocation?.location?.coordinates;

    for (const item of items) {
      if ("photo" in item) {
        //@ts-ignore
        delete item?.["photo"];
      }
    }
    const payload: CreateRequestPayload = {
      status: "SUBMITTED",
      delivery_date: date ?? "",
      latitude: ltd,
      longitude: lng,
      ks_number: "",
      created_from: "items",
      //@ts-expect-error
      items,
    };

    setCartSpinner(true);
    try {
      const response = await createRequest(payload);

      if (response.status) {
        notify.success("Request created successfully");
        resetState();
        setTimeout(() => {
          setCartModalOpened(false);
        }, 3000);
        setSuccessMessage(`Request created successfully`);
        setTimeout(() => setSuccessMessage(""), 3000);
      } else {
        notify.error("Something went wrong. Try again later.");
      }
    } catch (err) {
      notify.error("Failed to submit request. Please try again.");
      console.log(err);
    } finally {
      setCartSpinner(!true);
    }
  };
  // Cart Modal Component

  const CartModal = () => (
    <Modal
      opened={cartModalOpened}
      onClose={() => setCartModalOpened(false)}
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

            <Paper>
              <div className="py-2 mb-2">
                <DeliveryDate date={date} sendDate={(date) => setDate(date)} />
              </div>
              <div>
                <DeliveryLocation
                  locations={locations?.projects ?? []}
                  sendLocation={(location) => setLocation(location)}
                  config={{ refresh: () => refreshLocation(), location }}
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
                  if (confirm("Clear cark")) clearCart();
                }}
                radius="xl"
              >
                Clear Cart
              </Button>

              <Button
                color="#3D6B2C"
                leftSection={<CheckCircle2 size={16} />}
                onClick={handleCheckout}
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

  return (
    <section>
      <CartModal />
      {/* Header Section */}
      <Paper
        p={{ base: "sm", md: "xl" }}
        mb="xl"
        style={{
          background: "linear-gradient(135deg, #3D6B2C 0%, #388E3C 100%)",
          borderRadius: "20px",
        }}
      >
        <Flex
          justify="space-between"
          align="center"
          direction={{ base: "column", md: "row" }}
          wrap="wrap"
          gap="md"
        >
          <Box id="header">
            <Title order={1} c="white" mb="xs">
              <Flex
                align="center"
                direction={{ base: "column", md: "row" }}
                gap="md"
              >
                <Avatar
                  size="lg"
                  radius="xl"
                  style={{ backgroundColor: "rgba(255,255,255,0.2)" }}
                >
                  💰
                </Avatar>
                Store Management Dashboard
              </Flex>
            </Title>
            <Text c="rgba(255,255,255,0.8)" size="lg">
              Manage and update construction item prices with ease
            </Text>
          </Box>
          <Group justify="center">
            <Paper
              p="md"
              radius="md"
              style={{ backgroundColor: "rgba(255,255,255,0.15)" }}
            >
              <Text c="white" size="sm" fw={500}>
                Total Items
              </Text>
              <Text c="white" size="xl" fw={700}>
                {items?.length}
              </Text>
            </Paper>
            <Button
              leftSection={<Plus size={18} />}
              variant="filled"
              color="white"
              c="#3D6B2C"
              size="lg"
              radius="xl"
              onClick={() => setAddModalOpened(true)}
            >
              Add New Item
            </Button>
          </Group>
        </Flex>
      </Paper>
      {/* Deleting loader */}
      <Transition mounted={deleting} transition="slide-down">
        {(styles) => <Loader mb="xl" style={styles} id="loader" />}
      </Transition>

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
      <Flex wrap={"wrap"} gap={"md"}>
        {filteredItems
          ?.slice(current * perPage, (current + 1) * perPage)
          .map((item, index) => (
            <PricelistItem
              key={item.id}
              item={item}
              index={index}
              cartQuantity={cart.itemCount}
              isInCart={isItemInCart(item?.id as string)}
              handleDeleteClick={() => handleDeleteClick(item)}
              handleEditClick={() => handleEditClick(item)}
              handleAddCart={() =>
                handleAddCart(item as ICartItem & WholePriceList)
              }
            />
          ))}
      </Flex>

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
              value={Number(editForm.price || 0)}
              onChange={(value) => setEditForm({ ...editForm, price: +value })}
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
                  transportation_type:
                    (value as Pricelist["transportation_type"]) || "TUKTUK",
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
              value={Number(editForm.weight_in_kgs || 0)}
              onChange={(value) =>
                setEditForm({
                  ...editForm,
                  weight_in_kgs: +value || 0,
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

      {/* Add Item Modal */}
      <Modal
        opened={addModalOpened}
        onClose={handleAddModalClose}
        title={
          <Group>
            <Avatar
              size="sm"
              radius="xl"
              style={{ backgroundColor: "#3D6B2C" }}
            >
              <Plus size={16} color="white" />
            </Avatar>
            <Text fw={600}>Add New Item</Text>
          </Group>
        }
        size="lg"
        radius="lg"
        centered
      >
        <Stack gap="md">
          {/* Validation Errors */}
          {validationErrors.length > 0 && (
            <Alert
              icon={<AlertCircle size={16} />}
              title="Please fix the following errors:"
              color="red"
              variant="light"
            >
              <ul style={{ margin: 0, paddingLeft: 20 }}>
                {validationErrors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </Alert>
          )}

          {/* Item Name */}
          <TextInput
            label="Item Name"
            placeholder="Enter item name"
            value={addForm.name}
            onChange={(e) => setAddForm({ ...addForm, name: e.target.value })}
            leftSection={<Package size={16} />}
            size="lg"
            required
            radius="md"
            maxLength={20}
            error={validationErrors.some((error) =>
              error.includes("Item name")
            )}
          />

          {/* Swahili Name */}
          <TextInput
            label="Swahili Name"
            placeholder="Enter Swahili name"
            value={addForm.swahili_name}
            onChange={(e) =>
              setAddForm({ ...addForm, swahili_name: e.target.value })
            }
            leftSection={<Package size={16} />}
            size="lg"
            radius="md"
            maxLength={20}
            error={validationErrors.some((error) =>
              error.includes("Swahili name")
            )}
          />

          {/* Description */}
          <Textarea
            label="Description"
            placeholder="Enter item description"
            value={addForm.description}
            onChange={(e) =>
              setAddForm({ ...addForm, description: e.target.value })
            }
            size="lg"
            radius="md"
            minRows={3}
            error={validationErrors.some((error) =>
              error.includes("Description")
            )}
            maxLength={50}
          />

          {/* Item Type */}
          <Select
            label="Item Type"
            value={addForm.type}
            onChange={(value) =>
              setAddForm({
                ...addForm,
                type: (value as Pricelist["type"]) || "SELECT Type",
              })
            }
            leftSection={<Package size={16} />}
            data={services}
            size="lg"
            required
            radius="md"
            error={validationErrors.some((error) =>
              error.includes("Item type")
            )}
          />

          {/* Price */}
          <NumberInput
            label="Price (KES)"
            placeholder="Enter price"
            value={Number(addForm.price || 0)}
            onChange={(value) => setAddForm({ ...addForm, price: +value || 0 })}
            leftSection={<HandCoins size={16} />}
            thousandSeparator=","
            decimalScale={2}
            size="lg"
            required
            radius="md"
            min={0}
            error={validationErrors.some((error) => error.includes("Price"))}
          />

          {/* Weight */}
          <NumberInput
            label="Weight (kg)"
            placeholder="Enter weight"
            value={Number(addForm.weight_in_kgs || 0)}
            onChange={(value) =>
              setAddForm({
                ...addForm,
                weight_in_kgs: +value || 0,
              })
            }
            leftSection={<Weight size={16} />}
            decimalScale={2}
            size="lg"
            required
            radius="md"
            min={0}
            error={validationErrors.some((error) => error.includes("Weight"))}
          />

          {/* Transportation Type */}
          <Select
            label="Transportation Type"
            value={addForm.transportation_type}
            onChange={(value) =>
              setAddForm({
                ...addForm,
                transportation_type:
                  (value as Pricelist["transportation_type"]) || "TUKTUK",
              })
            }
            data={[
              { value: "TUKTUK", label: "🛺 TukTuk" },
              { value: "PICKUP", label: "🚛 Pickup" },
              { value: "LORRY", label: "🚚 Lorry" },
            ]}
            size="lg"
            required
            radius="md"
            error={validationErrors.some((error) =>
              error.includes("Transportation type")
            )}
          />

          {/* Image Upload */}
          <FileInput
            label="Item Image (Optional)"
            description="Upload an image of the item (Max 5MB, JPEG/PNG/WebP)"
            placeholder="Choose image file"
            value={file}
            onChange={setfile}
            leftSection={<ImageIcon size={16} />}
            accept="image/jpeg,image/jpg,image/png,image/webp"
            size="lg"
            radius="md"
            clearable
            error={validationErrors.some(
              (error) => error.includes("Image") || error.includes("format")
            )}
            styles={{
              input: {
                cursor: "pointer",
                "&::placeholder": {
                  color: "#868e96",
                },
              },
            }}
          />

          {/* Image Preview */}
          {file && (
            <Paper p="md" radius="lg" style={{ backgroundColor: "#f8f9fa" }}>
              <Group>
                <Avatar
                  size="lg"
                  radius="md"
                  src={URL.createObjectURL(file)}
                  alt="Item preview"
                >
                  <ImageIcon size={24} />
                </Avatar>
                <Box style={{ flex: 1 }}>
                  <Text size="sm" fw={500}>
                    {file.name}
                  </Text>
                  <Text size="xs" c="dimmed">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </Text>
                </Box>
                <ActionIcon
                  variant="light"
                  color="red"
                  onClick={() => setfile(null)}
                >
                  <X size={16} />
                </ActionIcon>
              </Group>
            </Paper>
          )}

          <Group justify="flex-end" mt="xl">
            <Button
              variant="light"
              color="gray"
              leftSection={<X size={16} />}
              onClick={handleAddModalClose}
              radius="xl"
            >
              Cancel
            </Button>
            <Button
              color="#3D6B2C"
              leftSection={<Upload size={16} />}
              onClick={handleAddItem}
              loading={addLoading}
              radius="xl"
            >
              Add Item
            </Button>
          </Group>
        </Stack>
      </Modal>
    </section>
  );
}

export const PricelistItem: React.FC<{
  item: WholePriceList;
  index: number;
  handleEditClick: () => void;
  handleDeleteClick: () => void;
  handleAddCart: () => void;
  hideControls?: boolean;
  isInCart?: boolean;
  cartQuantity?: number;
  cardSize?: string;
}> = ({
  item,
  index,
  handleEditClick,
  hideControls,
  handleDeleteClick,
  handleAddCart,
  isInCart = false,
  cartQuantity = 0,
  cardSize = "",
}) => {
  const isuserOwned = "isUserOwned" in item;
  return (
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
          radius="md"
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
          //className={cardSize}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "translateY(-8px)";
            e.currentTarget.style.boxShadow =
              "0 20px 40px rgba(61, 107, 44, 0.15)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.boxShadow = "0 2px 8px rgba(0, 0, 0, 0.1)";
          }}
          className="hover:translate-y-[-8px] hover:shadow-[0_20px_40px_rgba(61,107,44,0.15)]"
          w={{
            base: "100%", // Mobile: 1 card per row (full width)
            sm: "calc(50% - 8px)", // Medium: 2 cards per row
            lg: "calc(33.333% - 12px)", // Large: 3 cards per row
          }}
          maw="100%" // Ensure it never exceeds container width
        >
          {isInCart && (
            <Badge
              variant="filled"
              color="#3D6B2C"
              size="sm"
              style={{
                position: "absolute",
                top: 10,
                left: 10,
                zIndex: 1,
              }}
            >
              In Cart ({cartQuantity})
            </Badge>
          )}
          <Flex justify={"flex-end"}>
            {hideControls ? null : (
              <div className="flex gap-x-4 items-center">
                <Tooltip label="Edit Price">
                  <ActionIcon
                    variant="light"
                    color="#3D6B2C"
                    size="lg"
                    radius="xl"
                    onClick={handleEditClick}
                  >
                    <Edit3 size={18} />
                  </ActionIcon>
                </Tooltip>
                {isuserOwned ? null : (
                  <Tooltip label="Delete Item">
                    <ActionIcon
                      variant="light"
                      color="red"
                      size="lg"
                      radius="xl"
                      onClick={handleDeleteClick}
                    >
                      <Trash2 size={18} />
                    </ActionIcon>
                  </Tooltip>
                )}
                {isuserOwned ? null : (
                  <Tooltip label="Add to cart">
                    <ActionIcon
                      variant="light"
                      color="orange"
                      size="lg"
                      radius="xl"
                      onClick={handleAddCart}
                    >
                      {isInCart ? (
                        <CheckCircle2 size={18} />
                      ) : (
                        <ShoppingCart size={18} />
                      )}
                    </ActionIcon>
                  </Tooltip>
                )}
              </div>
            )}
          </Flex>
          <Stack gap="md">
            {/* Item Header */}
            <Flex justify="space-between" align="flex-start">
              <Box
                style={{ flexGrow: 1 }}
                className="flex flex-col md:flex-row justify-between items-center"
              >
                <Box>
                  {" "}
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

                <Box className="w-full md:w-24 h-auto md:h-24 mt-2">
                  <Image
                    src={
                      isuserOwned ? item?.photo?.[0] : item?.item?.photo?.[0]
                    }
                    alt={""}
                    height={100}
                    width={100}
                    className="h-full w-full"
                  />
                </Box>
              </Box>
            </Flex>

            <Divider />

            {/* Price Section */}
            {item.price && (
              <Paper p="md" radius="lg" style={{ backgroundColor: "#f8f9fa" }}>
                <Flex align="center" justify="space-between">
                  <Box>
                    <Text size="xs" c="dimmed" mb={2}>
                      Current Price
                    </Text>
                    <Text size="xl" fw={700} c="#3D6B2C">
                      KES {Number(item.price).toLocaleString()}
                    </Text>
                  </Box>
                  <Avatar
                    size="md"
                    radius="xl"
                    style={{ backgroundColor: "#3D6B2C" }}
                  >
                    <Coins size={20} color="white" />
                  </Avatar>
                </Flex>
              </Paper>
            )}

            {/* Item Details */}
            <Group justify="space-between">
              <Badge
                variant="light"
                color={getTransportationColor(item.transportation_type)}
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
            {hideControls ? null : (
              <Button
                fullWidth
                variant="light"
                color="#3D6B2C"
                leftSection={<TrendingUp size={16} />}
                radius="xl"
                onClick={handleEditClick}
              >
                Update Price
              </Button>
            )}
          </Stack>
        </Card>
      )}
    </Transition>
  );
};
// Add this cart button component to your header section
type CartButtonProps = {
  cart: ICartState;
  setCartModalOpened: (a: boolean) => void;
};
export const CartButton = ({ setCartModalOpened, cart }: CartButtonProps) => (
  <Button
    leftSection={<ShoppingCart size={18} />}
    variant="filled"
    //color="rgba(255,255,255,0.2)"
    c="white"
    size="xs"
    radius="xl"
    onClick={() => setCartModalOpened(true)}
    style={{ position: "relative" }}
  >
    {cart.itemCount > 0 && (
      <Badge
        size="sm"
        variant="filled"
        color="red"
        style={{
          position: "absolute",
          top: 0,
          right: 0,
          minWidth: 20,
          height: 20,
          borderRadius: "50%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "11px",
          fontWeight: "bold",
        }}
      >
        {cart.itemCount}
      </Badge>
    )}
  </Button>
);
