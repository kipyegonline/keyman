"use client";
import React, { useState, useMemo, useCallback, memo } from "react";
import {
  Stepper,
  Button,
  Group,
  TextInput,
  Select,
  Card,
  Text,
  Checkbox,
  ActionIcon,
  Alert,
  Badge,
  Container,
  Title,
  Paper,
  Divider,
  Pagination,
  Loader,
  Center,
  Grid,
  Flex,
} from "@mantine/core";
import { DatePickerInput as DateInput } from "@mantine/dates";
import { useForm, UseFormReturnType } from "@mantine/form";
import { useDebouncedValue } from "@mantine/hooks";
import {
  Calendar,
  MapPin,
  Package,
  Mic,
  ImageIcon,
  Search,
  Plus,
  Trash2,
  Eye,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  ExternalLink,
  Minus,
} from "lucide-react";
/*eslint-disable*/
import { useQuery } from "@tanstack/react-query";
import { getItems } from "@/api/items";
import { KeymanItem } from "@/types/requests";
import Link from "next/link";
import { notify } from "@/lib/notifications";
import { createRequest } from "@/api/requests";
import { Project } from "@/types";

// Types
interface DeliveryLocation {
  id: string;
  name: string;
  latitude: string;
  longitude: string;
}

interface RequestForm {
  delivery_date: Date | null;
  location_id: string;
  created_from: string;
  items: KeymanItem[];
  ks_number?: string;
}

// Mock data for locations
const mockLocations: DeliveryLocation[] = [
  {
    id: "1",
    name: "Main Construction Site",
    latitude: "40.7128",
    longitude: "-74.0060",
  },
  {
    id: "2",
    name: "Warehouse District",
    latitude: "40.7589",
    longitude: "-73.9851",
  },
  {
    id: "3",
    name: "Downtown Office",
    latitude: "40.7505",
    longitude: "-73.9934",
  },
];

// Optimized Search Input Component
const DebouncedSearchInput = memo<{
  onSearch: (query: string) => void;
  isLoading: boolean;
}>(({ onSearch, isLoading }) => {
  const [searchValue, setSearchValue] = useState("");
  const [debouncedSearch] = useDebouncedValue(searchValue, 500);

  React.useEffect(() => {
    if (debouncedSearch.length >= 3) {
      onSearch(debouncedSearch);
    } else if (debouncedSearch.length === 0) {
      onSearch("");
    }
  }, [debouncedSearch, onSearch]);

  return (
    <TextInput
      placeholder="Search for items... (minimum 3 characters)"
      value={searchValue}
      onChange={(e) => setSearchValue(e.target.value)}
      leftSection={isLoading ? <Loader size={16} /> : <Search size={16} />}
      className="transition-all duration-200 hover:scale-[1.02]"
    />
  );
});

DebouncedSearchInput.displayName = "DebouncedSearchInput";

// Optimized Item List Component
const ItemsList = memo<{
  items: KeymanItem[];
  onAddItem: (item: KeymanItem) => void;
  onRemoveItem: (itemId: string) => void;
  selectedItems: KeymanItem[];
  activePage: number;
  onPageChange: (page: number) => void;
  totalPages: number;
  isLoading: boolean;
  searchQuery: string;
}>(
  ({
    items,
    onAddItem,
    onRemoveItem,
    selectedItems,
    activePage,
    onPageChange,
    totalPages,
    isLoading,
    searchQuery,
  }) => {
    const perPage = 25;
    const startIndex = (activePage - 1) * perPage;
    const endIndex = startIndex + perPage;

    const paginatedItems = useMemo(() => {
      return items.slice(startIndex, endIndex);
    }, [items, startIndex, endIndex]);

    const getItemQuantity = useCallback(
      (itemId: string) => {
        const selectedItem = selectedItems.find((item) => item.id === itemId);
        return selectedItem?.quantity || 0;
      },
      [selectedItems]
    );

    if (isLoading) {
      return (
        <Center p="md">
          <Loader />
        </Center>
      );
    }

    if (items.length === 0 && searchQuery.length >= 3) {
      return (
        <Text size="sm" c="dimmed" ta="center" p="md">
          No items found for "{searchQuery}". Try a different search term.
        </Text>
      );
    }

    if (searchQuery.length > 0 && searchQuery.length < 3) {
      return (
        <Text size="sm" c="dimmed" ta="center" p="md">
          Please enter at least 3 characters to search for items.
        </Text>
      );
    }

    if (items.length === 0 && searchQuery.length === 0) {
      return (
        <Text size="sm" c="dimmed" ta="center" p="md">
          Start typing to search for items...
        </Text>
      );
    }

    return (
      <>
        <Card className="p-4 !overflow-y-scroll max-h-[600px]">
          <Text size="sm" c="dimmed">
            Showing {Math.min(perPage, items.length)} items of {items.length}{" "}
            items
          </Text>
          <div className="space-y-2">
            {paginatedItems.map((item: KeymanItem) => {
              const quantity = getItemQuantity(item.id);
              return (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors"
                >
                  <div>
                    <Text size="sm" fw={500}>
                      {item.name}
                    </Text>
                    <Text size="xs" c="dimmed">
                      {item.description}
                    </Text>
                  </div>
                  <div className="flex items-center gap-2">
                    <ActionIcon
                      onClick={() => onAddItem(item)}
                      color="green"
                      variant="light"
                    >
                      <Plus size={16} />
                    </ActionIcon>
                    {quantity > 0 && (
                      <>
                        <Text size="sm" fw={500}>
                          {quantity}
                        </Text>
                        <ActionIcon
                          onClick={() => onRemoveItem(item.id)}
                          color="red"
                          variant="light"
                        >
                          <Minus size={16} />
                        </ActionIcon>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
        {totalPages > 1 && (
          <Pagination
            total={totalPages}
            value={activePage}
            onChange={onPageChange}
            size="sm"
          />
        )}
      </>
    );
  }
);

ItemsList.displayName = "ItemsList";

// Optimized Selected Items Component
const SelectedItemsList = memo<{
  items: KeymanItem[];
  onUpdateItem: (index: number, field: keyof KeymanItem, value: any) => void;
  onDeleteItem: (itemId: string) => void;
  onNext: () => void;
}>(({ items, onUpdateItem, onDeleteItem, onNext }) => {
  if (items.length === 0) return null;

  return (
    <Card className="p-4 mt-10">
      <Text size="sm" fw={500} className="mb-4">
        Selected Items ({items.length})
      </Text>
      {items.map((item, i) => (
        <div
          key={item.id}
          className="flex relative mb-2 border-green items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors"
        >
          <div className="flex-1">
            <Text size="sm" fw={500}>
              {item.name}
            </Text>
            <Text size="xs" c="dimmed">
              {item.description}
            </Text>
            <Text size="xs" fw={600} c="dimmed">
              Quantity{" "}
              <Badge color="green" size="md" variant="light" className="ml-4">
                {item.quantity}
              </Badge>
            </Text>
            <Text size="xs" fw={600} c="dimmed" className="w-full">
              Require visual images?
              <Checkbox
                className="inline-block ml-2 relative top-1"
                checked={!!item.visual_confirmation_required}
                onChange={(e) =>
                  onUpdateItem(
                    i,
                    "visual_confirmation_required",
                    e.target.checked
                  )
                }
              />
            </Text>
          </div>
          <ActionIcon
            color="red"
            variant="subtle"
            className="!absolute bottom-0 right-2"
            onClick={() => onDeleteItem(item.id)}
          >
            <Trash2 size={16} />
          </ActionIcon>
        </div>
      ))}
      <Button onClick={onNext} className="bg-[#3D6B2C] hover:bg-[#388E3C] mt-4">
        Next
      </Button>
    </Card>
  );
});

SelectedItemsList.displayName = "SelectedItemsList";

// Request Type Selector Component
const CreatedFromSelector = memo<{
  form: UseFormReturnType<RequestForm>;
}>(({ form }) => {
  const options = [
    { value: "items", label: "Items", icon: Package, color: "#3D6B2C" },
    { value: "image", label: "Image", icon: ImageIcon, color: "#F08C23" },
    { value: "voice_note", label: "Voice Note", icon: Mic, color: "#388E3C" },
  ];

  return (
    <div className="space-y-4">
      <Text className="text-sm font-medium text-gray-700">Request Type</Text>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {options.map((option) => {
          const Icon = option.icon;
          return (
            <Card
              key={option.value}
              className={`p-4 cursor-pointer border-2 transition-all duration-300 hover:scale-105 ${
                form.values.created_from === option.value
                  ? "border-[#3D6B2C] bg-green-50"
                  : "border-gray-200 hover:border-gray-300"
              }`}
              onClick={() => form.setFieldValue("created_from", option.value)}
            >
              <div className="text-center">
                <Icon
                  size={32}
                  className="mx-auto mb-2"
                  style={{
                    color:
                      form.values.created_from === option.value
                        ? option.color
                        : "#6b7280",
                  }}
                />
                <Text size="sm" fw={500}>
                  {option.label}
                </Text>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
});

CreatedFromSelector.displayName = "CreatedFromSelector";

// Items Search and Selection Component
const ItemsSearchComponent = memo<{
  selectedItems: KeymanItem[];
  onAddItem: (item: KeymanItem) => void;
  onRemoveItem: (itemId: string) => void;
  onUpdateItem: (index: number, field: keyof KeymanItem, value: any) => void;
  onDeleteItem: (itemId: string) => void;
  onNext: () => void;
}>(
  ({
    selectedItems,
    onAddItem,
    onRemoveItem,
    onUpdateItem,
    onDeleteItem,
    onNext,
  }) => {
    const [searchQuery, setSearchQuery] = useState("");
    const [activePage, setActivePage] = useState(1);

    // Debounced search query for API calls
    const { data: items, isLoading } = useQuery({
      queryKey: ["items", searchQuery],
      enabled: searchQuery.length >= 3,
      queryFn: async () => {
        return await getItems(searchQuery);
      },
      staleTime: 5 * 60 * 1000, // 5 minutes
    });

    const filteredItems = useMemo(() => {
      return items?.items || [];
    }, [items]);

    const totalPages = useMemo(() => {
      return Math.ceil(filteredItems.length / 25);
    }, [filteredItems.length]);

    const handleSearch = useCallback((query: string) => {
      setSearchQuery(query);
      setActivePage(1); // Reset to first page on new search
    }, []);

    return (
      <div className="space-y-6">
        <Grid>
          <Grid.Col span={{ base: 12, md: 6 }}>
            <div className="space-y-4">
              <DebouncedSearchInput
                onSearch={handleSearch}
                isLoading={isLoading}
              />

              <ItemsList
                items={filteredItems}
                onAddItem={onAddItem}
                onRemoveItem={onRemoveItem}
                selectedItems={selectedItems}
                activePage={activePage}
                onPageChange={setActivePage}
                totalPages={totalPages}
                isLoading={isLoading}
                searchQuery={searchQuery}
              />
            </div>
          </Grid.Col>
          <Grid.Col span={{ base: 12, md: 6 }}>
            <SelectedItemsList
              items={selectedItems}
              onUpdateItem={onUpdateItem}
              onDeleteItem={onDeleteItem}
              onNext={onNext}
            />
          </Grid.Col>
        </Grid>
      </div>
    );
  }
);

ItemsSearchComponent.displayName = "ItemsSearchComponent";

// Step 1: Delivery Details Component
const DeliveryDetailsStep: React.FC<{
  form: UseFormReturnType<RequestForm>;
  locations: Project[];
}> = ({ form, locations }) => {
  if (locations.length === 0) {
    return (
      <Card className="p-6 bg-gradient-to-br from-orange-50 to-yellow-50 border border-orange-200">
        <div className="text-center">
          <MapPin className="mx-auto mb-4 text-orange-500" size={48} />
          <Title order={3} className="mb-2 text-gray-700">
            No Delivery Locations Found
          </Title>
          <Text className="mb-4 text-gray-600">
            You need to add delivery locations before creating a request.
          </Text>
          <Link
            href="/keyman/dashboard/delivery?return=true"
            className="inline-flex items-center gap-2 text-[#3D6B2C] hover:text-[#388E3C] font-medium"
          >
            Add Delivery Location <ExternalLink size={16} />
          </Link>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
            <Calendar size={16} className="text-[#3D6B2C]" />
            Delivery Date
          </label>
          <DateInput
            placeholder="Select delivery date"
            minDate={new Date()}
            className="transition-all duration-200 hover:scale-[1.02]"
            {...form.getInputProps("delivery_date")}
          />
        </div>

        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
            <MapPin size={16} className="text-[#3D6B2C]" />
            Delivery Location
          </label>
          <Select
            placeholder="Choose delivery location"
            data={locations.map((loc) => ({ value: loc.id, label: loc.name }))}
            className="transition-all duration-200 hover:scale-[1.02]"
            {...form.getInputProps("location_id")}
          />
        </div>
        <div className="space-y-2">
          <TextInput
            label="KS number (optional)"
            placeholder="Enter a KS number"
            className="transition-all duration-200 hover:scale-[1.02]"
            {...form.getInputProps("ks_number")}
          />
        </div>
      </div>
    </div>
  );
};

// Step 2: Request Source Component
const RequestSourceStep: React.FC<{
  form: UseFormReturnType<RequestForm>;
  onItemsChange: (items: KeymanItem[]) => void;
  selectedItems: KeymanItem[];
  nextStep: () => void;
}> = memo(({ form, onItemsChange, selectedItems, nextStep }) => {
  // Optimized item management functions
  const handleAddItem = useCallback(
    (item: KeymanItem) => {
      const existingItemIndex = selectedItems.findIndex(
        (_item) => _item.id === item.id
      );

      let updatedItems: KeymanItem[];
      if (existingItemIndex > -1) {
        updatedItems = selectedItems.map((_item, index) => {
          if (index === existingItemIndex) {
            const newQuantity = Number(_item.quantity || "0") + 1;
            return { ..._item, quantity: newQuantity };
          }
          return _item;
        });
      } else {
        updatedItems = [
          { ...item, quantity: 1, item_id: item.id },
          ...selectedItems,
        ];
      }
      onItemsChange(updatedItems);
    },
    [selectedItems, onItemsChange]
  );

  const handleRemoveItem = useCallback(
    (itemId: string) => {
      const existingItemIndex = selectedItems.findIndex(
        (_item) => _item.id === itemId
      );

      if (existingItemIndex > -1) {
        const currentQuantity = Number(
          selectedItems[existingItemIndex].quantity || "0"
        );
        let updatedItems: KeymanItem[];

        if (currentQuantity > 1) {
          updatedItems = selectedItems.map((_item, index) =>
            index === existingItemIndex
              ? { ..._item, quantity: currentQuantity - 1 }
              : _item
          );
        } else {
          updatedItems = selectedItems.filter((item) => item.id !== itemId);
        }
        onItemsChange(updatedItems);
      }
    },
    [selectedItems, onItemsChange]
  );

  const handleDeleteItem = useCallback(
    (itemId: string) => {
      if (confirm("Delete item?")) {
        const updatedItems = selectedItems.filter((item) => item.id !== itemId);
        onItemsChange(updatedItems);
      }
    },
    [selectedItems, onItemsChange]
  );

  const handleUpdateItem = useCallback(
    (
      index: number,
      field: keyof KeymanItem,
      value: string | number | boolean
    ) => {
      const updatedItems = [...selectedItems];
      updatedItems[index] = { ...updatedItems[index], [field]: value };
      onItemsChange(updatedItems);
    },
    [selectedItems, onItemsChange]
  );

  return (
    <div className="space-y-6">
      <CreatedFromSelector form={form} />

      {form.values.created_from === "items" && (
        <ItemsSearchComponent
          selectedItems={selectedItems}
          onAddItem={handleAddItem}
          onRemoveItem={handleRemoveItem}
          onUpdateItem={handleUpdateItem}
          onDeleteItem={handleDeleteItem}
          onNext={nextStep}
        />
      )}

      {form.values.created_from === "image" && (
        <Alert icon={<ImageIcon size={16} />} color="orange">
          Image upload feature is currently unavailable.
        </Alert>
      )}

      {form.values.created_from === "voice_note" && (
        <Alert icon={<Mic size={16} />} color="green">
          Voice note recording feature is currently unavailable.
        </Alert>
      )}
    </div>
  );
});

RequestSourceStep.displayName = "RequestSourceStep";

// Step 3: Preview Component
const PreviewStep: React.FC<{
  form: UseFormReturnType<RequestForm>;
  locations: Project[];
  items: KeymanItem[];
}> = ({ form, locations, items }) => {
  const selectedLocation = locations.find(
    (loc) => loc.id === form.values.location_id
  );

  return (
    <div className="space-y-6">
      <Card className="p-6 bg-gradient-to-br from-green-50 to-blue-50">
        <Title order={3} className="mb-4 text-gray-800">
          Request Preview
        </Title>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Calendar className="text-[#3D6B2C]" size={20} />
              <div>
                <Text size="sm" color="dimmed">
                  Delivery Date
                </Text>
                <Text fw={500}>
                  {form.values.delivery_date
                    ? form.values.delivery_date.toLocaleDateString()
                    : "Not selected"}
                </Text>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <MapPin className="text-[#3D6B2C]" size={20} />
              <div>
                <Text size="sm" color="dimmed">
                  Delivery Location
                </Text>
                <Text fw={500}>{selectedLocation?.name || "Not selected"}</Text>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Package className="text-[#3D6B2C]" size={20} />
              <div>
                <Text size="sm" color="dimmed">
                  Request Type
                </Text>
                <Badge color="green" variant="light">
                  {form.values.created_from?.toUpperCase() || "Not selected"}
                </Badge>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Eye className="text-[#3D6B2C]" size={20} />
              <div>
                <Text size="sm" color="dimmed">
                  Items Count
                </Text>
                <Text fw={500}>{items.length} items</Text>
              </div>
            </div>
          </div>
        </div>

        {items.length > 0 && (
          <div className="mt-6">
            <Divider className="mb-4" />
            <Text size="sm" fw={500} className="mb-3">
              Items Summary
            </Text>
            <div className="space-y-2">
              {items.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-white rounded-lg border"
                >
                  <div className="flex-1">
                    <Text size="sm" fw={500}>
                      {item.name}
                    </Text>
                    <Text size="xs" color="dimmed">
                      Qty: {item.quantity}
                    </Text>
                  </div>
                  {item.visual_confirmation_required && (
                    <Badge size="sm" color="blue" variant="light">
                      Visual Required
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};

// Main Component
const RequestCreator: React.FC<{ locations: Project[] }> = ({ locations }) => {
  const [active, setActive] = useState(0);
  const [items, setItems] = useState<KeymanItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<RequestForm>({
    initialValues: {
      delivery_date: null,
      location_id: "",
      created_from: "",
      ks_number: "",
      items: [],
    },
    validate: {
      delivery_date: (value) => (value ? null : "Delivery date is required"),
      location_id: (value) => (value ? null : "Delivery location is required"),
      created_from: (value) => (value ? null : "Request type is required"),
    },
  });

  const nextStep = useCallback(() => {
    if (active === 0) {
      if (Object.keys(form.errors).length > 1) return;
      setActive(1);
      return;
    }

    if (active === 1 && form.values.created_from === "items") {
      if (items.length === 0) {
        setError("Please add at least one item");
        return;
      }
      const quantityNotAdded = items.some((item) => !("quantity" in item));
      if (quantityNotAdded) {
        const message = "Please add quantity to all selected items";
        setError(message);
        notify.error(message);
        return;
      }
    } else if (active === 1) {
      setError("Please select a request type");
      return;
    }

    setActive((current) => Math.min(current + 1, 2));
    setError(null);
  }, [active, form.errors, form.values.created_from, items]);

  const prevStep = useCallback(() => {
    setActive((current) => Math.max(current - 1, 0));
  }, []);

  const handleSubmit = async () => {
    const selectedLocation = locations.find(
      (loc) => loc.id === form.values.location_id
    );
    if (!selectedLocation) {
      notify.error("Looks like you did not add a delivery location");
      return;
    }

    const [lng, ltd] = selectedLocation?.location?.coordinates;
    const processedItems = items.map((item) => {
      const newItem = { ...item };
      if ("photo" in newItem) delete newItem["photo"];
      newItem.visual_confirmation_required =
        newItem.visual_confirmation_required ? 1 : 0;
      return newItem;
    });

    const payload = {
      status: "SUBMITTED",
      delivery_date: form.values.delivery_date?.toISOString() ?? "",
      latitude: ltd,
      longitude: lng,
      ks_number: form.values.ks_number,
      created_from: form.values.created_from,
      items: processedItems,
    };

    setLoading(true);
    setError(null);
    try {
      const response = await createRequest(payload);

      if (response.status) {
        setSuccess(true);
        form.reset();
        setItems([]);
      } else {
        notify.error("Something went wrong. Try again later.");
      }
    } catch (err) {
      setError("Failed to submit request. Please try again.");
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <Container size="md" className="py-8">
        <Card className="p-8 text-center bg-gradient-to-br from-green-50 to-blue-50">
          <CheckCircle className="mx-auto mb-4 text-green-500" size={64} />
          <Title order={2} className="mb-4 text-gray-800">
            Request Submitted Successfully!
          </Title>
          <Text className="mb-6 text-gray-600">
            Your request has been submitted and will be reviewed by suppliers.
          </Text>
          <Flex
            gap="md"
            direction={{ base: "column", md: "row" }}
            justify={"center"}
            align={"center"}
            pt="md"
          >
            <Button
              onClick={() => window.location.reload()}
              className="bg-[#3D6B2C] hover:bg-[#388E3C]"
            >
              Create Another Request
            </Button>
            <Button
              onClick={() => (window.location.href = "/keyman/dashboard")}
              variant="outline"
              className="bg-[#3D6B2C] hover:bg-[#388E3C]"
            >
              Return to Dashboard
            </Button>
          </Flex>
        </Card>
      </Container>
    );
  }

  return (
    <Container size="lg" className="py-8">
      <Paper className="p-6 shadow-lg">
        <Title order={1} className="mb-6 text-center text-gray-800">
          Create New Request
        </Title>

        <Stepper active={active} className="mb-8">
          <Stepper.Step
            label="Delivery Details"
            description="Date and location"
            icon={<Calendar size={18} />}
          />
          <Stepper.Step
            label="Request Details"
            description="Items or services"
            icon={<Package size={18} />}
          />
          <Stepper.Step
            label="Review"
            description="Confirm and submit"
            icon={<Eye size={18} />}
          />
        </Stepper>

        {error && (
          <Alert
            icon={<AlertCircle size={16} />}
            color="red"
            className="mb-6"
            onClose={() => setError(null)}
            withCloseButton
          >
            {error}
          </Alert>
        )}

        <div className="min-h-[400px] mb-8">
          {active === 0 && (
            <DeliveryDetailsStep form={form} locations={locations} />
          )}
          {active === 1 && (
            <RequestSourceStep
              form={form}
              onItemsChange={setItems}
              selectedItems={items}
              nextStep={nextStep}
            />
          )}
          {active === 2 && (
            <PreviewStep form={form} locations={locations} items={items} />
          )}
        </div>

        <Group justify="space-between">
          <Button
            variant="outline"
            onClick={prevStep}
            disabled={active === 0}
            leftSection={<ArrowLeft size={16} />}
          >
            Previous
          </Button>

          {active < 2 ? (
            <Button
              onClick={nextStep}
              className="bg-[#3D6B2C] hover:bg-[#388E3C]"
              rightSection={<ArrowRight size={16} />}
            >
              Next
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              loading={loading}
              className="bg-[#F08C23] hover:bg-[#e67e1a]"
              rightSection={!loading && <CheckCircle size={16} />}
            >
              {loading ? "Submitting..." : "Submit Request"}
            </Button>
          )}
        </Group>
      </Paper>
    </Container>
  );
};

export default RequestCreator;
