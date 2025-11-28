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
} from "@mantine/core";
import { Trash2 } from "lucide-react";

export interface LabourItem {
  id: string;
  name: string;
  description: string;
  amount: number;
  quantity: number;
}

interface LabourSectionProps {
  labourItems: LabourItem[];
  onRemoveLabour: (id: string) => void;
  title?: string;
}

const LabourSection: React.FC<LabourSectionProps> = ({
  labourItems,
  onRemoveLabour,
  title = "Services / Labour",
}) => {
  const totalLabourAmount = labourItems.reduce(
    (sum, item) => sum + Number(item.amount) * Number(item.quantity),
    0
  );

  if (labourItems.length === 0) {
    return null;
  }

  return (
    <Paper p="md" radius="md" withBorder>
      <Group justify="space-between" mb="sm">
        <Text fw={600}>{title}</Text>
        <Badge color="orange" variant="light">
          {labourItems.length} item{labourItems.length !== 1 ? "s" : ""}
        </Badge>
      </Group>
      <Stack gap="xs" pl="md">
        {labourItems.map((labour) => (
          <Group key={labour.id} justify="space-between">
            <Box style={{ flex: 1 }}>
              <Group gap="xs">
                <Text size="sm" c="dimmed">
                  • {labour.name}
                </Text>
                <Badge size="xs" variant="light" color="orange">
                  labour
                </Badge>
                {labour.quantity > 0 && (
                  <Badge size="xs" variant="outline">
                    Qty: {labour.quantity}
                  </Badge>
                )}
              </Group>
              {labour.description && (
                <Text size="xs" c="dimmed" pl="md" lineClamp={1}>
                  {labour.description}
                </Text>
              )}
            </Box>
            <Group gap="md">
              <Text size="sm" fw={500}>
                Ksh{" "}
                {(
                  Number(labour.amount) * Number(labour.quantity)
                ).toLocaleString()}
              </Text>
              <ActionIcon
                onClick={() => onRemoveLabour(labour.id)}
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
          Ksh {totalLabourAmount.toLocaleString()}
        </Text>
      </Group>
    </Paper>
  );
};

export default LabourSection;
