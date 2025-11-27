"use client";
import React, { useState, useMemo, useCallback } from "react";
import {
  Modal,
  Stack,
  TextInput,
  Button,
  Group,
  Text,
  Paper,
  Box,
  ActionIcon,
  Badge,
  ScrollArea,
  Divider,
  Image,
} from "@mantine/core";
import { Search, Plus, Minus, Trash2, X, ShoppingBag } from "lucide-react";
import { WholePriceList } from "../supplier/priceList";

interface MaterialItem {
  id: string;
  name: string;
  description: string;
  amount: number;
  quantity: number;
  unit_price: number;
}

interface AddMaterialsModalProps {
  opened: boolean;
  onClose: () => void;
  onSave: (materials: MaterialItem[]) => void;
  priceList: WholePriceList[];
}

const AddMaterialsModal: React.FC<AddMaterialsModalProps> = ({
  opened,
  onClose,
  onSave,
  priceList,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMaterials, setSelectedMaterials] = useState<MaterialItem[]>(
    []
  );

  // Filter items based on search
  const filteredItems = useMemo(() => {
    if (!searchQuery.trim()) return priceList;

    const query = searchQuery.toLowerCase();
    return priceList.filter(
      (item) =>
        item.name.toLowerCase().includes(query) ||
        (item.description && item.description.toLowerCase().includes(query)) ||
        (item.swahili_name && item.swahili_name.toLowerCase().includes(query))
    );
  }, [priceList, searchQuery]);

  // Get quantity of an item
  const getItemQuantity = useCallback(
    (itemId: string) => {
      const item = selectedMaterials.find((m) => m.id === itemId);
      return item?.quantity || 0;
    },
    [selectedMaterials]
  );

  // Add item or increase quantity
  const handleAddItem = useCallback(
    (item: WholePriceList) => {
      const existingIndex = selectedMaterials.findIndex(
        (m) => m.id === item.id
      );

      if (existingIndex > -1) {
        // Increase quantity
        const updated = [...selectedMaterials];
        const newQuantity = updated[existingIndex].quantity + 1;
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: newQuantity,
          amount: newQuantity * item.price,
        };
        setSelectedMaterials(updated);
      } else {
        // Add new item
        const newMaterial: MaterialItem = {
          id: item.id || Date.now().toString(),
          name: item.name,
          description: item.description,
          unit_price: item.price,
          quantity: 1,
          amount: item.price,
        };
        setSelectedMaterials([...selectedMaterials, newMaterial]);
      }
    },
    [selectedMaterials]
  );

  // Decrease quantity
  const handleRemoveItem = useCallback(
    (itemId: string) => {
      const existingIndex = selectedMaterials.findIndex((m) => m.id === itemId);

      if (existingIndex > -1) {
        const currentQuantity = selectedMaterials[existingIndex].quantity;

        if (currentQuantity > 1) {
          // Decrease quantity
          const updated = [...selectedMaterials];
          const newQuantity = currentQuantity - 1;
          const unitPrice = updated[existingIndex].unit_price;
          updated[existingIndex] = {
            ...updated[existingIndex],
            quantity: newQuantity,
            amount: newQuantity * unitPrice,
          };
          setSelectedMaterials(updated);
        } else {
          // Remove item
          setSelectedMaterials(
            selectedMaterials.filter((m) => m.id !== itemId)
          );
        }
      }
    },
    [selectedMaterials]
  );

  // Delete item completely
  const handleDeleteItem = useCallback(
    (itemId: string) => {
      setSelectedMaterials(selectedMaterials.filter((m) => m.id !== itemId));
    },
    [selectedMaterials]
  );

  // Calculate total
  const totalAmount = useMemo(() => {
    return selectedMaterials.reduce(
      (sum, item) => sum + Number(item.amount),
      0
    );
  }, [selectedMaterials]);

  // Handle save
  const handleSave = () => {
    if (selectedMaterials.length === 0) {
      return;
    }
    onSave(selectedMaterials);
    setSelectedMaterials([]);
    setSearchQuery("");
    onClose();
  };

  // Handle close
  const handleClose = () => {
    setSelectedMaterials([]);
    setSearchQuery("");
    onClose();
  };

  return (
    <Modal
      opened={opened}
      onClose={handleClose}
      title={
        <Group gap="xs">
          <ShoppingBag size={20} color="#3D6B2C" />
          <Text size="lg" fw={600}>
            Add Materials
          </Text>
        </Group>
      }
      size="xl"
      centered
      radius="lg"
    >
      <Stack gap="md">
        {/* Search Input */}
        <TextInput
          placeholder="Search materials..."
          leftSection={<Search size={16} />}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          rightSection={
            searchQuery && (
              <ActionIcon
                variant="subtle"
                onClick={() => setSearchQuery("")}
                size="sm"
              >
                <X size={14} />
              </ActionIcon>
            )
          }
        />

        {/* Two Column Layout */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "1rem",
          }}
        >
          {/* Left: Available Items */}
          <Box>
            <Text size="sm" fw={600} mb="xs" c="dimmed">
              Available Materials ({filteredItems.length})
            </Text>
            <ScrollArea h={400} type="auto">
              <Stack gap="xs">
                {filteredItems.length === 0 ? (
                  <Paper p="md" radius="md" withBorder>
                    <Text size="sm" c="dimmed" ta="center">
                      {searchQuery
                        ? "No materials found"
                        : "No materials available"}
                    </Text>
                  </Paper>
                ) : (
                  filteredItems.map((item) => {
                    const quantity = getItemQuantity(item.id || "");
                    return (
                      <Paper
                        key={item.id}
                        p="sm"
                        radius="md"
                        withBorder
                        style={{
                          cursor: "pointer",
                          transition: "all 0.2s",
                          backgroundColor: quantity > 0 ? "#f0fdf4" : "white",
                        }}
                      >
                        <Group
                          justify="space-between"
                          align="flex-start"
                          wrap="nowrap"
                          gap="xs"
                        >
                          <Box style={{ flex: 1, minWidth: 0 }}>
                            <Text size="sm" fw={600} lineClamp={1}>
                              {item.name}
                            </Text>
                            <Text size="xs" c="dimmed" lineClamp={1}>
                              {item.description}
                            </Text>
                            <Text size="sm" fw={600} c="green.7" mt={4}>
                              Ksh {item.price.toLocaleString()}
                            </Text>
                          </Box>
                          {/* Item Image */}
                          {item.attachment_url &&
                            item.attachment_url.length > 0 && (
                              <Box
                                style={{
                                  flexShrink: 0,
                                  width: 50,
                                  height: 50,
                                  overflow: "hidden",
                                  borderRadius: "8px",
                                }}
                              >
                                <Image
                                  src={item?.attachment_url?.[0]}
                                  alt={item.name}
                                  width={50}
                                  height={50}
                                  radius="md"
                                  fit="cover"
                                  fallbackSrc="https://placehold.co/50x50?text=No+Image"
                                />
                              </Box>
                            )}
                          <Group gap={4} wrap="nowrap">
                            {quantity > 0 && (
                              <>
                                <ActionIcon
                                  size="sm"
                                  variant="light"
                                  color="red"
                                  onClick={() =>
                                    handleRemoveItem(item.id || "")
                                  }
                                >
                                  <Minus size={14} />
                                </ActionIcon>
                              </>
                            )}
                            <ActionIcon
                              size="sm"
                              variant="light"
                              color="green"
                              onClick={() => handleAddItem(item)}
                            >
                              <Plus size={14} />
                            </ActionIcon>
                            {quantity > 0 && (
                              <Badge size="sm" color="green" variant="filled">
                                {quantity}
                              </Badge>
                            )}
                          </Group>
                        </Group>
                      </Paper>
                    );
                  })
                )}
              </Stack>
            </ScrollArea>
          </Box>

          {/* Right: Selected Items */}
          <Box>
            <Text size="sm" fw={600} mb="xs" c="dimmed">
              Selected Materials ({selectedMaterials.length})
            </Text>
            <ScrollArea h={400} type="auto">
              <Stack gap="xs">
                {selectedMaterials.length === 0 ? (
                  <Paper p="xl" radius="md" withBorder>
                    <Text size="sm" c="dimmed" ta="center">
                      No materials selected
                    </Text>
                  </Paper>
                ) : (
                  selectedMaterials.map((material) => (
                    <Paper
                      key={material.id}
                      p="sm"
                      radius="md"
                      withBorder
                      bg="green.0"
                    >
                      <Group justify="space-between" align="flex-start">
                        <Box style={{ flex: 1 }}>
                          <Group justify="space-between" mb={4}>
                            <Text size="sm" fw={600} lineClamp={1}>
                              {material.name}
                            </Text>
                            <ActionIcon
                              size="xs"
                              variant="subtle"
                              color="red"
                              onClick={() => handleDeleteItem(material.id)}
                            >
                              <Trash2 size={12} />
                            </ActionIcon>
                          </Group>
                          <Text size="xs" c="dimmed" lineClamp={1} mb={4}>
                            {material.description}
                          </Text>
                          <Group justify="space-between">
                            <Badge size="sm" variant="light" color="green">
                              Qty: {material.quantity}
                            </Badge>
                            <Text size="sm" fw={600} c="green.7">
                              Ksh {material.amount.toLocaleString()}
                            </Text>
                          </Group>
                        </Box>
                      </Group>
                    </Paper>
                  ))
                )}
              </Stack>
            </ScrollArea>
          </Box>
        </div>

        {/* Total and Actions */}
        {selectedMaterials.length > 0 && (
          <>
            <Divider />
            <Group justify="space-between">
              <Box>
                <Text size="xs" c="dimmed">
                  Total Amount
                </Text>
                <Text size="xl" fw={700} c="green.7">
                  Ksh {totalAmount.toLocaleString()}
                </Text>
              </Box>
              <Text size="sm" c="dimmed">
                {selectedMaterials.length} item
                {selectedMaterials.length !== 1 ? "s" : ""} selected
              </Text>
            </Group>
          </>
        )}

        {/* Action Buttons */}
        <Group justify="flex-end" mt="md">
          <Button
            variant="subtle"
            color="gray"
            onClick={handleClose}
            leftSection={<X size={16} />}
          >
            Cancel
          </Button>
          <Button
            color="green.7"
            onClick={handleSave}
            disabled={selectedMaterials.length === 0}
            leftSection={<Plus size={16} />}
          >
            Add Materials ({selectedMaterials.length})
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
};

export default AddMaterialsModal;
