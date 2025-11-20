"use client";
import React, { useState, useCallback } from "react";
import {
  Card,
  Text,
  Badge,
  Button,
  Group,
  ActionIcon,
  Title,
  Paper,
  Stack,
  Tooltip,
  Transition,
  Box,
  Flex,
  Avatar,
  Divider,
  Alert,
  Pagination,
  Loader,
  Image,
  TextInput,
  Select,
} from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import { useForm } from "@mantine/form";
import { toDataUrlFromFile, DataURIToBlob } from "@/lib/FileHandlers";
import {
  Edit3,
  Search,
  Filter,
  Plus,
  TrendingUp,
  CheckCircle2,
  Coins,
  //Delete,
  Trash2,
  ShoppingCart,
  Store,
  Weight,
} from "lucide-react";
import { updateSupplierPriceList } from "@/api/supplier";
import { notify } from "@/lib/notifications";
import { createItem, deleteItem } from "@/api/items";
import { ICartItem, ICartState, useCart } from "@/providers/CartContext";

import { getProjects } from "@/api/projects";
import { useQuery } from "@tanstack/react-query";
import { Project } from "@/types";
import { CreateRequestPayload } from "@/types/requests";
import { createRequest } from "@/api/requests";
import { AddItemModal } from "./AddItemModal";
import { EditItemModal } from "./EditItemModal";
import { CartModal as CartModalComponent } from "./CartModal";

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
  attachment_url?: string[];

  added_by_supplier_id?: string;
  stock?: string;
  metrics?: string;
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

const transportationFilterOptions = [
  { value: "TUKTUK", label: "🛺 TukTuk" },
  { value: "PICKUP", label: "🚛 Pickup" },
  { value: "LORRY", label: "🚚 Lorry" },
];

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
  refetchPricelist,
}: {
  handleSearch: (val: string) => void;
  isPending: boolean;
  prices: WholePriceList[];
  refetchPricelist: () => void;
}) {
  /*eslint-disable*/
  const isMobile = useMediaQuery("(max-width: 768px)");
  const [selectedItem, setSelectedItem] = useState<Pricelist | null>(null);
  const [modalOpened, setModalOpened] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [current, setCurrent] = useState(0);

  // Add Item Modal States
  const [addModalOpened, setAddModalOpened] = useState(false);
  const [file, setfile] = useState<File | null>(null);
  const [addLoading, setAddLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [location, setLocation] = useState("");
  const [date, setDate] = useState("");
  const [description, setDescription] = useState("");

  // Use Mantine form for optimized performance and validation (Add Form)
  const addForm = useForm<Pricelist>({
    initialValues: {
      description: "",
      name: "",
      price: 0,
      swahili_name: "",
      transportation_type: "TUKTUK",
      type: "Select Type",
      weight_in_kgs: 0,
      image: null,
      metrics: "",
      stock: "",
    },
    validate: {
      name: (value) =>
        !value || value.trim().length === 0 ? "Item name is required" : null,
      description: (value) =>
        !value || value.trim().length === 0 ? "Description is required" : null,
      type: (value) =>
        value === "Select Type" ? "Item type is required" : null,
      price: (value) =>
        !value || value <= 0 ? "Price must be greater than 0" : null,
      /* metrics: (value) =>
        !value || value.trim().length === 0 ? "Metrics is required" : null,
      weight_in_kgs: (value) =>
        value === undefined || value < 0 ? "Weight must be 0 or greater" : null,*/
      transportation_type: (value) =>
        !value ? "Transportation type is required" : null,
    },
  });

  // Use Mantine form for edit modal (optimized performance and validation)
  const editForm = useForm<Pricelist>({
    initialValues: {
      description: "",
      name: "",
      price: 0,
      swahili_name: "",
      transportation_type: "TUKTUK",
      type: "goods",
      weight_in_kgs: 0,
      image: null,
      metrics: "",
      stock: "",
      item_id: "",
    },
    validate: {
      price: (value) =>
        !value || value <= 0 ? "Price must be greater than 0" : null,
      description: (value) =>
        !value || value.trim().length === 0 ? "Description is required" : null,
    },
  });

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

  // Memoized handlers to prevent re-renders
  const handleAddCart = useCallback(
    (item: ICartItem) => {
      addToCart(item);
    },
    [addToCart]
  );
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

  const handleEditClick = useCallback(
    (item: Pricelist) => {
      setSelectedItem(item);
      editForm.setValues({
        ...item,
        price: item.price || 0,
        description: item.description || "",
        metrics: item.metrics || "",
        stock: item.stock || "",
        transportation_type: item.transportation_type || "TUKTUK",
        weight_in_kgs: item.weight_in_kgs || 0,
      });
      setModalOpened(true);
    },
    [editForm]
  );
  const handleDeleteClick = useCallback(
    async (item: Pricelist) => {
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
    },
    [refetchPricelist]
  );

  const handleSavePrice = async () => {
    if (!selectedItem) return;

    // Validate form
    if (editForm.validate().hasErrors) {
      return;
    }

    const values = editForm.values;
    const formdata = new FormData();
    formdata.append("items[1][item_id]", values.item_id as string);
    formdata.append("items[1][price]", values.price.toString());
    formdata.append("items[1][stock]", values.stock || "");
    formdata.append("items[1][description]", values.description);
    formdata.append("items[1][metrics]", values.metrics || "");
    if (file) {
      const file64 = await toDataUrlFromFile(file);

      const file_ = DataURIToBlob(file64 as string);
      formdata.append("items[1][image]", file_, file.name);
    }

    /*
    formData.append("item_id", editForm?.item_id as string);
    formData.append("price", editForm?.price.toString() as string);
    formData.append("description", editForm?.description as string);
    formData.append("stock", editForm?.stock as string);
    formData.append("metrics", editForm?.metrics as string);

    // Append image if it exists
    if (file) {
      const file64 = await toDataUrlFromFile(file);

      const file_ = DataURIToBlob(file64 as string);

      formData.append("image", file_, file.name);
    }*/
    /*
    const payload: [{ item_id: string; price: number }] = [
      {
        item_id: editForm?.item_id as string,
        price: +editForm?.price as number,
      },
    ];*/

    setIsLoading(true);

    const response = await updateSupplierPriceList(
      supplierId as string,
      formdata
    );

    setIsLoading(false);
    if (response.status) {
      notify.success(`Price updated for ${values.name}`);
      setfile(null);
      editForm.reset();
      setTimeout(() => {
        setSuccessMessage("");
        setModalOpened(false);
      }, 2000);
      setSuccessMessage(`Price updated for ${values.name}`);
      refetchPricelist();
    } else notify.error(response.message);
  };

  const handleAddItem = async () => {
    // Validate form using Mantine's built-in validation
    if (addForm.validate().hasErrors) {
      return;
    }

    setAddLoading(true);

    try {
      // Create FormData object
      const formData = new FormData();
      const values = addForm.values;

      // Append all form fields
      formData.append("supplier_detail_id", supplierId as string);
      formData.append("name", values.name);
      formData.append(
        "swahili_name",
        values.swahili_name.trim().length === 0
          ? values.name
          : values.swahili_name
      );
      formData.append("description", values.description);
      formData.append("type", values.type);
      formData.append("price", values.price.toString());
      formData.append("weight_in_kgs", values.weight_in_kgs.toString());
      formData.append("transportation_type", values.transportation_type);

      // Append image if it exists
      if (file) {
        const file64 = await toDataUrlFromFile(file);

        const file_ = DataURIToBlob(file64 as string);

        formData.append("image", file_, file.name);
      }

      // Send the request
      const response = await createItem(formData);

      if (response.status) {
        setSuccessMessage(`New item "${values.name}" added successfully`);
        setAddModalOpened(false);
        addForm.reset();
        setfile(null);

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

  const handleAddModalClose = useCallback(() => {
    setAddModalOpened(false);
    addForm.reset();
    setfile(null);
  }, [addForm]);
  const filteredItems = React.useMemo(() => {
    let filtered = items || [];

    if (searchTerm.length > 2) {
      filtered = filtered.filter(
        (item) =>
          item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.swahili_name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterType) {
      filtered = filtered.filter(
        (item) => item.transportation_type === filterType
      );
    }

    return filtered;
  }, [items, searchTerm, filterType]);

  const perPage = 25;

  const total = Math.ceil(filteredItems?.length / perPage);
  const resetState = () => {
    setLocation("");
    setDate("");
    clearCart();
  };
  const handleEditModalClose = useCallback(() => {
    setModalOpened(false);
    setfile(null);
    editForm.reset();
  }, [editForm]);

  const handleCheckout = useCallback(async () => {
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
  }, [locations, date, location, cart.items, clearCart, setCartModalOpened]);

  // Memoized callback factories to prevent inline function creation in map
  const createDeleteHandler = useCallback(
    (item: Pricelist) => () => handleDeleteClick(item),
    [handleDeleteClick]
  );

  const createEditHandler = useCallback(
    (item: Pricelist) => () => handleEditClick(item),
    [handleEditClick]
  );

  const createAddCartHandler = useCallback(
    (item: ICartItem & WholePriceList) => () => handleAddCart(item),
    [handleAddCart]
  );

  return (
    <section>
      {/* Modals */}
      <AddItemModal
        opened={addModalOpened}
        onClose={handleAddModalClose}
        addForm={addForm}
        file={file}
        setFile={setfile}
        onSubmit={handleAddItem}
        loading={addLoading}
      />

      <EditItemModal
        opened={modalOpened}
        onClose={handleEditModalClose}
        editForm={editForm}
        file={file}
        setFile={setfile}
        onSubmit={handleSavePrice}
        loading={isLoading}
        selectedItem={selectedItem}
        getItemEmoji={getItemEmoji}
      />

      <CartModalComponent
        opened={cartModalOpened}
        onClose={() => setCartModalOpened(false)}
        cart={cart}
        updateQuantity={updateQuantity}
        removeFromCart={removeFromCart}
        clearCart={clearCart}
        onCheckout={handleCheckout}
        cartSpinner={cartSpinner}
        getItemEmoji={getItemEmoji}
        locations={locations?.projects}
        location={location}
        setLocation={setLocation}
        date={date}
        setDate={setDate}
        refreshLocation={refreshLocation}
      />
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
            {isMobile ? (
              <select
                value={filterType || ""}
                onChange={(e) => setFilterType(e.target.value || null)}
                style={{
                  padding: "10px 16px",
                  fontSize: "14px",
                  border: "1px solid #dee2e6",
                  borderRadius: "20px",
                  backgroundColor: "white",
                  color: "#495057",
                  cursor: "pointer",
                  outline: "none",
                  minWidth: "180px",
                  WebkitAppearance: "none",
                  MozAppearance: "none",
                  appearance: "none",
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23495057' d='M6 9L1 4h10z'/%3E%3C/svg%3E")`,
                  backgroundRepeat: "no-repeat",
                  backgroundPosition: "right 12px center",
                  paddingRight: "36px",
                }}
              >
                <option value="">Filter by transport</option>
                {transportationFilterOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            ) : (
              <Select
                placeholder="Filter by transport"
                leftSection={<Filter size={16} />}
                data={transportationFilterOptions}
                value={filterType}
                onChange={setFilterType}
                clearable
                radius="xl"
              />
            )}
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
              handleDeleteClick={createDeleteHandler(item)}
              handleEditClick={createEditHandler(item)}
              handleAddCart={createAddCartHandler(
                item as ICartItem & WholePriceList
              )}
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
    </section>
  );
}

interface PricelistItemProps {
  item: WholePriceList;
  index: number;
  handleEditClick: () => void;
  handleDeleteClick: () => void;
  handleAddCart: () => void;
  hideControls?: boolean;
  isInCart?: boolean;
  cartQuantity?: number;
  cardSize?: string;
}

export const PricelistItem = React.memo<PricelistItemProps>(
  ({
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
    const getRightImage = (item: WholePriceList | Pricelist) => {
      if (isuserOwned) {
        if (
          "attachment_url" in item &&
          item?.attachment_url &&
          item?.attachment_url?.length > 0
        )
          return item?.attachment_url.at(-1);
        //@ts-ignore
        else return item?.photo?.[0];
      } else {
        if (
          "attachment_url" in item &&
          item?.attachment_url &&
          item["attachment_url"].length > 0
        )
          return item?.attachment_url.at(-1);
        //@ts-ignore
        else return item?.item?.photo?.[0];
      }
    };
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

                  <Box className="w-full md:w-24 h-auto md:h-24 mt-2 overflow-hidden rounded-lg">
                    <Image
                      src={getRightImage(item)}
                      alt={`${item.name} image`}
                      fit="cover"
                      radius="lg"
                      className="h-full w-full object-cover"
                      style={{
                        aspectRatio: "1/1",
                        maxWidth: "100%",
                        maxHeight: "100%",
                      }}
                    />
                  </Box>
                </Box>
              </Flex>

              <Divider />

              {/* Price Section */}
              {item.price && (
                <Paper
                  p="md"
                  radius="lg"
                  style={{ backgroundColor: "#f8f9fa" }}
                >
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

                <Group gap="xs" display="none">
                  <Weight size={14} />
                  <Text size="sm" c="dimmed">
                    {item.weight_in_kgs}kg
                  </Text>
                </Group>

                {item?.stock && +item?.stock > 1 && (
                  <Group gap="xs">
                    <Store size={14} />
                    <Badge
                      variant="light"
                      color="#3D6B2C"
                      size="md"
                      radius="xl"
                    >
                      {item?.stock}in stock
                    </Badge>
                  </Group>
                )}

                {item?.metrics && (
                  <Group gap="xs">
                    <Badge
                      variant="light"
                      color="#3D6B2C"
                      size="md"
                      radius="xl"
                    >
                      {item?.metrics}
                    </Badge>
                  </Group>
                )}
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
  }
);

PricelistItem.displayName = "PricelistItem";

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
