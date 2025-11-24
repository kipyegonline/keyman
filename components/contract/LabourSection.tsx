"use client";
import React, { useState } from "react";
import { Stack, Group, Button, Title, Text, Paper, Box } from "@mantine/core";
import { Plus, Trash2 } from "lucide-react";
import AddLabourModal from "./AddLabourModal";

interface LabourItem {
  id: string;
  name: string;
  description: string;
  amount: number;
}

interface LabourSectionProps {
  phaseName?: string;
  onLabourChange?: (items: LabourItem[], total: number) => void;
}

const LabourSection: React.FC<LabourSectionProps> = ({
  phaseName = "Phase 1",
  onLabourChange,
}) => {
  const [labourItems, setLabourItems] = useState<LabourItem[]>([]);
  const [labourModalOpened, setLabourModalOpened] = useState(false);

  const handleAddLabour = (labour: Omit<LabourItem, "id">) => {
    const newLabour: LabourItem = {
      ...labour,
      id: Date.now().toString(),
    };
    const updatedItems = [...labourItems, newLabour];
    setLabourItems(updatedItems);

    // Notify parent of changes
    if (onLabourChange) {
      const total = updatedItems.reduce((sum, item) => sum + item.amount, 0);
      onLabourChange(updatedItems, total);
    }
  };

  const handleRemoveLabour = (id: string) => {
    const updatedItems = labourItems.filter((item) => item.id !== id);
    setLabourItems(updatedItems);

    // Notify parent of changes
    if (onLabourChange) {
      const total = updatedItems.reduce((sum, item) => sum + item.amount, 0);
      onLabourChange(updatedItems, total);
    }
  };

  const totalLabourAmount = labourItems.reduce(
    (sum, item) => sum + item.amount,
    0
  );

  return (
    <>
      <Paper p="lg" radius="md" withBorder>
        <Stack gap="md">
          <Group justify="space-between" align="center">
            <Title order={3}>{phaseName}</Title>
            <Text size="sm" c="dimmed">
              Labor
            </Text>
          </Group>

          {/* Labour Items List */}
          {labourItems.length > 0 ? (
            <Stack gap="sm">
              <Text size="sm" fw={500}>
                Labour Items ({labourItems.length})
              </Text>
              {labourItems.map((labour) => (
                <Paper key={labour.id} p="md" radius="md" withBorder>
                  <Group justify="space-between" align="flex-start">
                    <Box style={{ flex: 1 }}>
                      <Text size="sm" fw={600} mb="xs">
                        {labour.name}
                      </Text>
                      <Text size="xs" c="dimmed" lineClamp={2}>
                        {labour.description}
                      </Text>
                    </Box>
                    <Group gap="sm" wrap="nowrap">
                      <Text size="sm" fw={600} c="green.7">
                        Ksh {labour.amount.toLocaleString()}
                      </Text>
                      <Button
                        variant="subtle"
                        color="red"
                        size="xs"
                        onClick={() => handleRemoveLabour(labour.id)}
                      >
                        <Trash2 size={14} />
                      </Button>
                    </Group>
                  </Group>
                </Paper>
              ))}
            </Stack>
          ) : (
            <Box>
              <Text size="sm" fw={500} mb="xs">
                Deliverables
              </Text>
              <Text size="sm" c="dimmed">
                No labour items added yet
              </Text>
            </Box>
          )}

          <Group justify="space-between">
            <Box>
              <Text size="sm" c="dimmed">
                Amount
              </Text>
              <Text size="lg" fw={600}>
                Ksh {totalLabourAmount.toLocaleString()}
              </Text>
            </Box>
            <Box>
              <Text size="sm" c="dimmed">
                Duration
              </Text>
              <Text size="lg" fw={600}>
                1 day
              </Text>
            </Box>
          </Group>

          <Group gap="sm" mt="md">
            <Button
              variant="light"
              color="green.7"
              leftSection={<Plus size={16} />}
              fullWidth
              onClick={() => setLabourModalOpened(true)}
            >
              Add Labour
            </Button>
          </Group>
        </Stack>
      </Paper>

      {/* Add Labour Modal */}
      <AddLabourModal
        opened={labourModalOpened}
        onClose={() => setLabourModalOpened(false)}
        onSave={handleAddLabour}
      />
    </>
  );
};

export default LabourSection;
