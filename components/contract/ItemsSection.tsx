"use client";
import React from "react";
import {
  Stack,
  Group,
  Text,
  Paper,
  Box,
  Badge,
  ActionIcon,
  Image,
} from "@mantine/core";
import { Trash2 } from "lucide-react";

export interface MaterialItem {
  id: string;
  name: string;
  description?: string;
  amount: number;
  quantity: number;
  unit?: string;
  image?: string;
  supplier_name?: string;
}

interface ItemsSectionProps {
  items: MaterialItem[];
  onRemoveItem: (id: string) => void;
  title?: string;
}

const ItemsSection: React.FC<ItemsSectionProps> = ({
  items,
  onRemoveItem,
  title = "Materials",
}) => {
  const totalAmount = items.reduce(
    (sum, item) => sum + Number(item.amount) * Number(item.quantity),
    0
  );

  if (items.length === 0) {
    return null;
  }

  return (
    <Paper p="md" radius="md" withBorder>
      <Group justify="space-between" mb="sm">
        <Text fw={600}>{title}</Text>
        <Badge color="blue" variant="light">
          {items.length} item{items.length !== 1 ? "s" : ""}
        </Badge>
      </Group>
      <Stack gap="xs" pl="md">
        {items.map((item) => (
          <Group key={item.id} justify="space-between" wrap="nowrap">
            <Group gap="sm" style={{ flex: 1 }} wrap="nowrap">
              {item.image && (
                <Image
                  src={item.image}
                  alt={item.name}
                  w={40}
                  h={40}
                  radius="sm"
                  fit="cover"
                />
              )}
              <Box style={{ flex: 1, minWidth: 0 }}>
                <Group gap="xs" wrap="wrap">
                  <Text size="sm" c="dimmed" truncate>
                    • {item.name}
                  </Text>
                  <Badge size="xs" variant="light" color="blue">
                    materials
                  </Badge>
                  {item.quantity > 0 && (
                    <Badge size="xs" variant="outline">
                      Qty: {item.quantity} {item.unit || ""}
                    </Badge>
                  )}
                </Group>
                {item.supplier_name && (
                  <Text size="xs" c="dimmed" pl="md">
                    From: {item.supplier_name}
                  </Text>
                )}
              </Box>
            </Group>
            <Group gap="md" wrap="nowrap">
              <Text size="sm" fw={500} style={{ whiteSpace: "nowrap" }}>
                Ksh{" "}
                {(Number(item.amount) * Number(item.quantity)).toLocaleString()}
              </Text>
              <ActionIcon
                onClick={() => onRemoveItem(item.id)}
                color="red"
                variant="subtle"
                size="sm"
              >
                <Trash2 size={14} />
              </ActionIcon>
            </Group>
          </Group>
        ))}
      </Stack>
      <Group
        justify="flex-end"
        mt="md"
        pt="sm"
        style={{ borderTop: "1px solid var(--mantine-color-gray-3)" }}
      >
        <Text size="sm" c="dimmed">
          Total:
        </Text>
        <Text size="sm" fw={600} c="green.7">
          Ksh {totalAmount.toLocaleString()}
        </Text>
      </Group>
    </Paper>
  );
};

export default ItemsSection;
